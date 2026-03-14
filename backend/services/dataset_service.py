import os
from pathlib import Path
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from constants import SUPPORTED_DATASET_EXTENSIONS
from models.dataset import Dataset
from services.dataset_analyzer import DatasetAnalyzer
from services.project_service import ProjectService
from utils.storage import build_dataset_directory, build_public_storage_path, save_upload_file


class DatasetService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.project_service = ProjectService(session)

    async def upload_dataset(self, project_id: UUID, user_id: str, upload_file: UploadFile) -> Dataset:
        project = await self.project_service.get_project_for_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        extension = Path(upload_file.filename or "").suffix.lower()
        if extension not in SUPPORTED_DATASET_EXTENSIONS:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported dataset type")

        target_dir = build_dataset_directory(user_id, project.project_slug)
        absolute_path, file_size = await save_upload_file(upload_file, target_dir)
        public_path = build_public_storage_path("datasets", user_id, project.project_slug, os.path.basename(absolute_path))
        summary = DatasetAnalyzer.analyze(absolute_path)

        dataset = Dataset(
            project_id=project.project_id,
            file_name=upload_file.filename or os.path.basename(absolute_path),
            file_path=public_path,
            file_size=file_size,
            file_type=extension.lstrip("."),
            summary=summary,
        )
        self.session.add(dataset)
        project.dataset_path = public_path
        await self.session.commit()
        await self.session.refresh(dataset)
        return dataset
