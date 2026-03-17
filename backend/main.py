import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from config import get_settings
from routers.chat_routes import router as chat_router
from routers.dataset_routes import router as dataset_router
from routers.notebook_routes import router as notebook_router
from routers.project_routes import router as project_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

settings = get_settings()
app = FastAPI(title=settings.app_name)

storage_path = settings.storage_root
app.mount("/storage/datasets", StaticFiles(directory=str(storage_path / "datasets")), name="datasets")
app.mount("/storage/notebooks", StaticFiles(directory=str(storage_path / "notebooks")), name="notebooks")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # tighten to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],        # allows OPTIONS, GET, POST, PUT, DELETE …
    allow_headers=["*"],
)

app.include_router(project_router, prefix=settings.api_v1_prefix)
app.include_router(dataset_router, prefix=settings.api_v1_prefix)
app.include_router(notebook_router, prefix=settings.api_v1_prefix)
app.include_router(chat_router, prefix=settings.api_v1_prefix)


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
