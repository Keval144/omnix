from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from constants import MAX_PROJECTS_PER_USER
from models.project import Project
from utils.slug_generator import generate_project_slug


class ProjectLimitExceededError(Exception):
    pass


class ProjectService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_project(self, user_id: str, metadata: dict | None = None) -> Project:
        project_count = await self.session.scalar(
            select(func.count(Project.project_id)).where(Project.user_id == user_id)
        )
        if (project_count or 0) >= MAX_PROJECTS_PER_USER:
            raise ProjectLimitExceededError(f"Each user can only create {MAX_PROJECTS_PER_USER} projects")

        project = Project(
            user_id=user_id,
            project_slug=await generate_project_slug(self.session),
            metadata_json=metadata,
        )
        self.session.add(project)
        await self.session.commit()
        await self.session.refresh(project)
        return project

    async def get_project_for_user(self, project_id, user_id: str) -> Project | None:
        result = await self.session.scalar(
            select(Project).where(Project.project_id == project_id, Project.user_id == user_id)
        )
        return result

    async def get_projects(self, user_id: str) -> list[Project]:
        result = await self.session.scalars(
            select(Project).where(Project.user_id == user_id).order_by(Project.created_at.desc())
        )
        return list(result.all())
