import os
from pathlib import Path
from uuid import UUID

import nbformat
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.dataset import Dataset
from models.notebook import Notebook
from services.project_service import ProjectService
from utils.storage import build_notebook_directory, build_public_storage_path


class NotebookService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.project_service = ProjectService(session)

    async def generate_notebook(self, project_id: UUID, user_id: str) -> Notebook:
        project = await self.project_service.get_project_for_user(project_id, user_id)
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        latest_dataset = await self.session.scalar(
            select(Dataset).where(Dataset.project_id == project.project_id).order_by(Dataset.uploaded_at.desc()).limit(1)
        )
        if not latest_dataset:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Upload a dataset before generating notebook")

        next_version = (
            await self.session.scalar(
                select(func.coalesce(func.max(Notebook.version), 0)).where(Notebook.project_id == project.project_id)
            )
            or 0
        ) + 1

        notebook_dir = build_notebook_directory(user_id, project.project_slug)
        os.makedirs(notebook_dir, exist_ok=True)
        filename = f"notebook_v{next_version}.ipynb"
        absolute_path = os.path.join(notebook_dir, filename)

        notebook = self._build_notebook(latest_dataset.file_path)
        with open(absolute_path, "w", encoding="utf-8") as file_obj:
            nbformat.write(notebook, file_obj)

        public_path = build_public_storage_path("notebooks", user_id, project.project_slug, filename)
        notebook_record = Notebook(
            project_id=project.project_id,
            notebook_path=public_path,
            version=next_version,
            notebook_metadata={"source_dataset": latest_dataset.file_name},
        )
        self.session.add(notebook_record)
        project.notebook_path = public_path
        await self.session.commit()
        await self.session.refresh(notebook_record)
        return notebook_record

    @staticmethod
    def _build_notebook(dataset_public_path: str):
        notebook = nbformat.v4.new_notebook()
        file_name = Path(dataset_public_path).name
        notebook["cells"] = [
            nbformat.v4.new_markdown_cell("# Auto Generated Machine Learning Notebook"),
            nbformat.v4.new_markdown_cell("## Load Dataset"),
            nbformat.v4.new_code_cell(
                "import pandas as pd\n\n"
                f"df = pd.read_csv('{file_name}')\n"
                "df.head()"
            ),
            nbformat.v4.new_markdown_cell("## Train Baseline Model"),
            nbformat.v4.new_code_cell(
                "from sklearn.model_selection import train_test_split\n"
                "from sklearn.ensemble import RandomForestClassifier\n\n"
                "X = df.iloc[:, :-1]\n"
                "y = df.iloc[:, -1]\n\n"
                "X_train, X_test, y_train, y_test = train_test_split(\n"
                "    X, y, test_size=0.2, random_state=42\n"
                ")\n\n"
                "model = RandomForestClassifier()\n"
                "model.fit(X_train, y_train)\n"
                "print('Model trained successfully')"
            ),
        ]
        return notebook


async def generate_notebook(*args, **kwargs):
    raise RuntimeError("Use NotebookService.generate_notebook with an async database session")
