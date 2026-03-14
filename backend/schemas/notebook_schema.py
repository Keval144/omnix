from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NotebookGenerateRequest(BaseModel):
    project_id: UUID


class NotebookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    notebook_id: UUID
    project_id: UUID
    notebook_path: str
    version: int
    created_at: datetime
