import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from dotenv import load_dotenv
import os

from config import get_settings
from routers.chat_routes import router as chat_router
from routers.dataset_routes import router as dataset_router
from routers.notebook_routes import router as notebook_router
from routers.project_routes import router as project_router
from routers.rag_routes import router as rag_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger = logging.getLogger(__name__)
    logger.info("Starting up Omnix Backend...")
    
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
    
    logger.info("Shutting down Omnix Backend...")


settings = get_settings()
app = FastAPI(title=settings.app_name, lifespan=lifespan)

storage_path = settings.storage_root
app.mount("/storage/datasets", StaticFiles(directory=str(storage_path / "datasets")), name="datasets")
app.mount("/storage/notebooks", StaticFiles(directory=str(storage_path / "notebooks")), name="notebooks")


BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent

CORS_ORIGINS = os.getenv("CORS_ORIGINS")

load_dotenv(BASE_DIR / ".env")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(project_router, prefix=settings.api_v1_prefix)
app.include_router(dataset_router, prefix=settings.api_v1_prefix)
app.include_router(notebook_router, prefix=settings.api_v1_prefix)
app.include_router(chat_router, prefix=settings.api_v1_prefix)
app.include_router(rag_router, prefix=settings.api_v1_prefix)


@app.head("/")
async def root() -> dict[str, str]:
    return {"message": "Backend is running"}


@app.get("/debug/storage")
async def debug_storage():
    from utils.storage import build_dataset_directory
    return {
        "storage_root": str(settings.storage_root),
        "data_storage_url_prefix": settings.data_storage_url_prefix,
        "example_dataset_path": build_dataset_directory("test-user", "test-project"),
    }
