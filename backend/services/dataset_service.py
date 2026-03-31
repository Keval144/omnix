import logging
import os
from pathlib import Path
from uuid import UUID

from fastapi import BackgroundTasks, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from constants import SUPPORTED_DATASET_EXTENSIONS
from models.dataset import Dataset, DatasetStatus
from services.dataset_analyzer import analyze_dataset_async
from services.project_service import ProjectService
from utils.storage import build_dataset_directory, build_public_storage_path, save_upload_file

logger = logging.getLogger(__name__)


async def analyze_dataset_background(dataset_id: UUID, absolute_path: str):
    from sqlalchemy import select
    from db.session import SessionLocal
    
    async with SessionLocal() as session:
        try:
            logger.info(f"Starting background analysis for dataset {dataset_id}")
            summary = await analyze_dataset_async(absolute_path)
            
            stmt = select(Dataset).where(Dataset.dataset_id == dataset_id)
            dataset = await session.scalar(stmt)
            if dataset:
                dataset.summary = summary
                dataset.status = DatasetStatus.READY
                await session.commit()
                logger.info(f"Dataset {dataset_id} analysis completed")
        except Exception as e:
            logger.error(f"Background analysis failed for dataset {dataset_id}: {e}")
            try:
                stmt = select(Dataset).where(Dataset.dataset_id == dataset_id)
                dataset = await session.scalar(stmt)
                if dataset:
                    dataset.status = DatasetStatus.FAILED
                    await session.commit()
            except Exception:
                pass


class DatasetService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.project_service = ProjectService(session)

    async def upload_dataset(
        self, 
        project_id: UUID, 
        user_id: str, 
        upload_file: UploadFile, 
        background_tasks: BackgroundTasks | None = None
    ) -> Dataset:
        logger.info(f"Starting dataset upload for project {project_id}, user {user_id}, file: {upload_file.filename}")

        project = await self.project_service.get_project_for_user(project_id, user_id)
        if not project:
            logger.warning(f"Project {project_id} not found for user {user_id}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        extension = Path(upload_file.filename or "").suffix.lower()
        logger.info(f"File extension: {extension}")
        
        if extension not in SUPPORTED_DATASET_EXTENSIONS:
            logger.warning(f"Unsupported file type: {extension}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Unsupported file type. Supported types: {', '.join(SUPPORTED_DATASET_EXTENSIONS)}"
            )

        try:
            target_dir = build_dataset_directory(user_id, project.project_slug)
            logger.info(f"Target directory: {target_dir}")
            
            absolute_path, file_size = await save_upload_file(upload_file, target_dir)
            logger.info(f"File saved to: {absolute_path}, size: {file_size}")

            public_path = build_public_storage_path("datasets", user_id, project.project_slug, os.path.basename(absolute_path))
            logger.info(f"Public path: {public_path}")

            dataset = Dataset(
                project_id=project.project_id,
                file_name=upload_file.filename or os.path.basename(absolute_path),
                file_path=public_path,
                file_size=file_size,
                file_type=extension.lstrip("."),
                status=DatasetStatus.PROCESSING,
            )
            self.session.add(dataset)
            project.dataset_path = public_path
            await self.session.commit()
            await self.session.refresh(dataset)
            
            logger.info(f"Dataset created with status PROCESSING: {dataset.dataset_id}")

            if background_tasks:
                background_tasks.add_task(
                    analyze_dataset_background,
                    dataset.dataset_id,
                    absolute_path
                )
            else:
                summary = await analyze_dataset_async(absolute_path)
                dataset.summary = summary
                dataset.status = DatasetStatus.READY
                await self.session.commit()
                logger.info(f"Dataset analyzed synchronously: {dataset.dataset_id}")
            
            return dataset
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during dataset upload: {str(e)}", exc_info=True)
            await self.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail=f"Failed to upload dataset: {str(e)}"
            )
