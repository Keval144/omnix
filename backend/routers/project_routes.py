from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
from schemas.project_schema import ProjectCreate, ProjectResponse
from services.project_service import ProjectLimitExceededError, ProjectService
from utils.auth import AuthenticatedUser, get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> ProjectResponse:
    service = ProjectService(session)
    metadata = payload.metadata.model_dump(exclude_none=True) if payload.metadata else None
    try:
        project = await service.create_project(current_user.user_id, metadata)
    except ProjectLimitExceededError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return ProjectResponse.model_validate(project)
