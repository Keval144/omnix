import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from config import get_settings
from routers.chat_routes import router as chat_router
from routers.dataset_routes import router as dataset_router
from routers.notebook_routes import router as notebook_router
from routers.project_routes import router as project_router
from utils.session_cache import init_session_cache, shutdown_session_cache


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger = logging.getLogger(__name__)
    logger.info("Starting up Omnix Backend...")
    
    await init_session_cache()
    
    try:
        from rag.vector_store import _get_collection
        from config import BASE_DIR
        
        collection = _get_collection()
        if collection is not None:
            knowledge_dir = BASE_DIR / "knowledge"
            if knowledge_dir.exists():
                txt_files = list(knowledge_dir.glob("*.txt"))
                logger.info(f"Found {len(txt_files)} knowledge files to ingest")
                
                from rag.ingest_knowledge import ingest
                ingest()
                logger.info("Knowledge base initialized")
            else:
                logger.warning(f"Knowledge directory not found: {knowledge_dir}")
        else:
            logger.info("ChromaDB not available, using text fallback")
    except Exception as e:
        logger.warning(f"Could not initialize knowledge base: {e}")
    
    yield
    
    await shutdown_session_cache()
    logger.info("Shutting down Omnix Backend...")


settings = get_settings()
app = FastAPI(title=settings.app_name, lifespan=lifespan)

storage_path = settings.storage_root
app.mount("/storage/datasets", StaticFiles(directory=str(storage_path / "datasets")), name="datasets")


origin = os.getenv("CORS_ORIGIN")

if not origin:
    origin = "http://localhost:3000"

app.add_middleware(
    CORSMiddleware,
    allow_origins=origin,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(project_router, prefix=settings.api_v1_prefix)
app.include_router(dataset_router, prefix=settings.api_v1_prefix)
app.include_router(notebook_router, prefix=settings.api_v1_prefix)
app.include_router(chat_router, prefix=settings.api_v1_prefix)


@app.head("/")
async def root() -> dict[str, str]:
    return {"message": "Backend is running"}