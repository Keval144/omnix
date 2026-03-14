from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
from schemas.notebook_schema import NotebookGenerateRequest, NotebookResponse
from services.notebook_service import NotebookService
from utils.auth import AuthenticatedUser, get_current_user

router = APIRouter(prefix="/notebook", tags=["notebook"])


@router.post("/generate", response_model=NotebookResponse, status_code=status.HTTP_201_CREATED)
async def generate_notebook(
    payload: NotebookGenerateRequest,
    session: AsyncSession = Depends(get_db_session),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> NotebookResponse:
    notebook = await NotebookService(session).generate_notebook(payload.project_id, current_user.user_id)
    return NotebookResponse.model_validate(notebook)
