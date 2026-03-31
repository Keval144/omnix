from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProjectMetadata(BaseModel):
    model_config = ConfigDict(
        extra="allow",
        json_schema_extra={
            "example": {
                "name": "Customer Churn Analysis",
                "description": "Workspace for uploading datasets and generating notebooks.",
                "tags": ["analytics", "churn"],
            }
        },
    )

    name: str | None = Field(default=None, examples=["Customer Churn Analysis"])
    description: str | None = Field(
        default=None,
        examples=["Workspace for uploading datasets and generating notebooks."],
    )
    tags: list[str] = Field(default_factory=list, examples=[["analytics", "churn"]])


class ProjectCreate(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "metadata": {
                    "name": "Customer Churn Analysis",
                    "description": "Workspace for uploading datasets and generating notebooks.",
                    "tags": ["analytics", "churn"],
                }
            }
        }
    )

    metadata: ProjectMetadata | None = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    project_id: UUID
    project_slug: str
    dataset_path: str | None = None
    notebook_path: str | None = None
    metadata: dict | None = Field(default=None, validation_alias="metadata_json")
    created_at: datetime
    updated_at: datetime
