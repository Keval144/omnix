from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
from schemas.notebook_schema import NotebookGenerateRequest, NotebookResponse
from services.notebook_service import NotebookService
from utils.auth import AuthenticatedUser, get_current_user
from utils.storage import resolve_storage_path

router = APIRouter(prefix="/notebook", tags=["notebook"])


@router.post("/generate", response_model=NotebookResponse, status_code=status.HTTP_201_CREATED)
async def generate_notebook(
    payload: NotebookGenerateRequest,
    session: AsyncSession = Depends(get_db_session),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> NotebookResponse:
    notebook = await NotebookService(session).generate_notebook(payload.project_id, current_user.user_id)
    return NotebookResponse.model_validate(notebook)


@router.get("/download")
async def download_notebook(
    notebook_path: str,
) -> FileResponse:
    resolved_path = resolve_storage_path(notebook_path)
    from pathlib import Path
    path_obj = Path(resolved_path)
    if not path_obj.exists():
        raise HTTPException(status_code=404, detail="Notebook file not found")
    filename = path_obj.name
    return FileResponse(
        path=resolved_path,
        filename=filename,
        media_type="application/json",
    )
