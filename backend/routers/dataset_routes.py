import logging
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
from schemas.dataset_schema import DatasetUploadResponse
from services.dataset_service import DatasetService
from utils.auth import AuthenticatedUser, get_current_user

router = APIRouter(prefix="/datasets", tags=["datasets"])
logger = logging.getLogger(__name__)


@router.post("/upload", response_model=DatasetUploadResponse, status_code=201)
async def upload_dataset(
    project_id: UUID = Form(...),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    session: AsyncSession = Depends(get_db_session),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> DatasetUploadResponse:
    logger.info(f"Upload request received: project_id={project_id}, filename={file.filename}, content_type={file.content_type}")
    
    if not file.filename:
        logger.warning("Upload request with empty filename")
        raise HTTPException(status_code=400, detail="Filename is required")
    
    dataset = await DatasetService(session).upload_dataset(project_id, current_user.user_id, file, background_tasks)
    return DatasetUploadResponse.model_validate(dataset)
