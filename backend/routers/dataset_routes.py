import logging
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db_session
from schemas.dataset_schema import DatasetUploadResponse
from services.dataset_service import DatasetService
from utils.auth import AuthenticatedUser, get_current_user

router = APIRouter(prefix="/datasets", tags=["datasets"])
logger = logging.getLogger(__name__)


@router.post("/upload", response_model=DatasetUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    project_id: UUID = Form(...),
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_db_session),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> DatasetUploadResponse:
    logger.info(f"Upload request received: project_id={project_id}, filename={file.filename}, content_type={file.content_type}")
    
    if not file.filename:
        logger.warning("Upload request with empty filename")
        raise status.HTTP_400_BAD_REQUEST
    
    dataset = await DatasetService(session).upload_dataset(project_id, current_user.user_id, file)
    return DatasetUploadResponse.model_validate(dataset)
