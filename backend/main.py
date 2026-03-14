from fastapi import FastAPI

from config import get_settings
from routers.chat_routes import router as chat_router
from routers.dataset_routes import router as dataset_router
from routers.notebook_routes import router as notebook_router
from routers.project_routes import router as project_router

settings = get_settings()
app = FastAPI(title=settings.app_name)
app.include_router(project_router, prefix=settings.api_v1_prefix)
app.include_router(dataset_router, prefix=settings.api_v1_prefix)
app.include_router(notebook_router, prefix=settings.api_v1_prefix)
app.include_router(chat_router, prefix=settings.api_v1_prefix)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Backend is running"}
