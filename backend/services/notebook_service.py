import os
import json
from pathlib import Path
from uuid import UUID

import nbformat

import os
from pathlib import Path
from uuid import UUID

NOTEBOOK_DIR = "storage/notebooks"

os.makedirs(NOTEBOOK_DIR, exist_ok=True)
from models.dataset import Dataset
from models.notebook import Notebook
from services.project_service import ProjectService
from services.dataset_analyzer import analyze_dataset_file
from services.rag_service import retrieve_ml_context
from utils.storage import (
    build_notebook_directory,
    build_public_storage_path,
    resolve_storage_path,
)
from llm.iflow_client import IFlowClient


def generate_notebook(dataset_path):

    nb = nbformat.v4.new_notebook()
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
    async def generate_notebook(self, project_id: UUID, user_id: str) -> Notebook:

        project = await self.project_service.get_project_for_user(project_id, user_id)

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )

        latest_dataset = await self.session.scalar(
            select(Dataset)
            .where(Dataset.project_id == project.project_id)
            .order_by(Dataset.uploaded_at.desc())
            .limit(1)
        )

        if not latest_dataset:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Upload a dataset before generating notebook",
            )

        next_version = (
            await self.session.scalar(
                select(func.coalesce(func.max(Notebook.version), 0)).where(
                    Notebook.project_id == project.project_id
                )
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

        public_path = build_public_storage_path(
            "notebooks", user_id, project.project_slug, filename
        )

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
    def _build_notebook(dataset_path: str):

        """
        Build notebook using:
        Dataset Analyzer + RAG + LLM
        """

        resolved_dataset_path = resolve_storage_path(dataset_path)
        dataset_info = analyze_dataset_file(resolved_dataset_path)

        rag_context = retrieve_ml_context(dataset_info)

        file_name = Path(resolved_dataset_path).name

        prompt = f"""
You are a senior machine learning engineer.

Generate a Kaggle-style machine learning notebook.

Machine Learning Knowledge:
{rag_context}

Dataset Information:
{dataset_info}

Dataset filename:
{file_name}

Return ONLY valid JSON with the following structure:

{{
"imports": "",
"data_loading": "",
"eda": "",
"preprocessing": "",
"feature_engineering": "",
"train_test_split": "",
"model_training": "",
"evaluation": "",
"visualization": ""
}}

Rules:
- Return JSON only
- Do not include explanations
- Only Python code inside the fields
"""

        try:
            response = IFlowClient.generate(prompt)
            sections = json.loads(response)
        except (RuntimeError, json.JSONDecodeError):
            sections = NotebookService._build_fallback_sections(
                resolved_dataset_path,
                dataset_info,
            )

        notebook = nbformat.v4.new_notebook()

        cells = []

        # Title
        cells.append(
            nbformat.v4.new_markdown_cell(
                f"# Omnix AI Generated Notebook\n\nDataset: **{file_name}**"
            )
        )

        # Imports
        cells.append(nbformat.v4.new_markdown_cell("## Import Libraries"))
        cells.append(nbformat.v4.new_code_cell(sections.get("imports", "")))

        # Data Loading
        cells.append(nbformat.v4.new_markdown_cell("## Load Dataset"))
        cells.append(nbformat.v4.new_code_cell(sections.get("data_loading", "")))

        # EDA
        cells.append(nbformat.v4.new_markdown_cell("## Exploratory Data Analysis"))
        cells.append(nbformat.v4.new_code_cell(sections.get("eda", "")))

        # Preprocessing
        cells.append(nbformat.v4.new_markdown_cell("## Data Preprocessing"))
        cells.append(nbformat.v4.new_code_cell(sections.get("preprocessing", "")))

        # Feature Engineering
        cells.append(nbformat.v4.new_markdown_cell("## Feature Engineering"))
        cells.append(nbformat.v4.new_code_cell(sections.get("feature_engineering", "")))

        # Train Test Split
        cells.append(nbformat.v4.new_markdown_cell("## Train Test Split"))
        cells.append(nbformat.v4.new_code_cell(sections.get("train_test_split", "")))

        # Model Training
        cells.append(nbformat.v4.new_markdown_cell("## Model Training"))
        cells.append(nbformat.v4.new_code_cell(sections.get("model_training", "")))

        # Evaluation
        cells.append(nbformat.v4.new_markdown_cell("## Model Evaluation"))
        cells.append(nbformat.v4.new_code_cell(sections.get("evaluation", "")))

        # Visualization
        cells.append(nbformat.v4.new_markdown_cell("## Visualization"))
        cells.append(nbformat.v4.new_code_cell(sections.get("visualization", "")))

        notebook["cells"] = cells

        return notebook

    @staticmethod
    def _build_fallback_sections(dataset_path: str, dataset_info: dict) -> dict[str, str]:
        file_name = Path(dataset_path).name
        target_column = dataset_info["column_names"][-1] if dataset_info.get("column_names") else None
        extension = Path(file_name).suffix.lower()
        reader = "pd.read_csv" if extension == ".csv" else "pd.read_excel"

        numeric_columns = [
            column
            for column, dtype in dataset_info.get("column_types", {}).items()
            if any(token in dtype.lower() for token in ("int", "float"))
        ]
        feature_columns = [column for column in dataset_info.get("column_names", []) if column != target_column]
        safe_feature_columns = repr(feature_columns)
        safe_numeric_columns = repr(numeric_columns)
        safe_target = repr(target_column) if target_column else "None"

        return {
            "imports": "\n".join(
                [
                    "import pandas as pd",
                    "from pathlib import Path",
                    "from sklearn.model_selection import train_test_split",
                    "from sklearn.compose import ColumnTransformer",
                    "from sklearn.impute import SimpleImputer",
                    "from sklearn.pipeline import Pipeline",
                    "from sklearn.preprocessing import OneHotEncoder",
                    "from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor",
                    "from sklearn.metrics import classification_report, mean_squared_error",
                ]
            ),
            "data_loading": "\n".join(
                [
                    f'dataset_path = Path("{dataset_path}")',
                    f'df = {reader}(dataset_path)',
                    "df.head()",
                ]
            ),
            "eda": "\n".join(
                [
                    "print(df.shape)",
                    "print(df.dtypes)",
                    "df.describe(include='all').transpose()",
                ]
            ),
            "preprocessing": "\n".join(
                [
                    f"target_column = {safe_target}",
                    "if target_column is None:",
                    "    raise ValueError('Target column could not be inferred from the dataset')",
                    f"feature_columns = {safe_feature_columns}",
                    "X = df[feature_columns].copy()",
                    "y = df[target_column].copy()",
                    f"numeric_features = [col for col in {safe_numeric_columns} if col in X.columns]",
                    "categorical_features = [col for col in X.columns if col not in numeric_features]",
                    "",
                    "preprocessor = ColumnTransformer(",
                    "    transformers=[",
                    "        ('num', Pipeline([('imputer', SimpleImputer(strategy='median'))]), numeric_features),",
                    "        (",
                    "            'cat',",
                    "            Pipeline([",
                    "                ('imputer', SimpleImputer(strategy='most_frequent')),",
                    "                ('encoder', OneHotEncoder(handle_unknown='ignore')),",
                    "            ]),",
                    "            categorical_features,",
                    "        ),",
                    "    ]",
                    ")",
                ]
            ),
            "feature_engineering": "# Add custom feature engineering here if needed.",
            "train_test_split": "\n".join(
                [
                    "X_train, X_test, y_train, y_test = train_test_split(",
                    "    X, y, test_size=0.2, random_state=42",
                    ")",
                ]
            ),
            "model_training": "\n".join(
                [
                    f"problem_type = {repr(dataset_info.get('problem_type', 'classification'))}",
                    "if problem_type == 'classification':",
                    "    model = Pipeline([",
                    "        ('preprocessor', preprocessor),",
                    "        ('model', RandomForestClassifier(random_state=42)),",
                    "    ])",
                    "else:",
                    "    model = Pipeline([",
                    "        ('preprocessor', preprocessor),",
                    "        ('model', RandomForestRegressor(random_state=42)),",
                    "    ])",
                    "",
                    "model.fit(X_train, y_train)",
                    "predictions = model.predict(X_test)",
                ]
            ),
            "evaluation": "\n".join(
                [
                    "if problem_type == 'classification':",
                    "    print(classification_report(y_test, predictions))",
                    "else:",
                    "    print('RMSE:', mean_squared_error(y_test, predictions) ** 0.5)",
                ]
            ),
            "visualization": "\n".join(
                [
                    "preview = pd.DataFrame({'actual': y_test}).reset_index(drop=True)",
                    "preview['predicted'] = predictions",
                    "preview.head(10)",
                ]
            ),
        }


async def generate_notebook(*args, **kwargs):
    raise RuntimeError(
        "Use NotebookService.generate_notebook with an async database session"
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
