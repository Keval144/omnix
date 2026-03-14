from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DatasetUploadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    dataset_id: UUID
    project_id: UUID
    file_name: str
    file_path: str
    file_size: int
    file_type: str
    uploaded_at: datetime
    summary: dict | None = None
