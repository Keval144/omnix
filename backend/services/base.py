from typing import Any, Generic, TypeVar
from uuid import UUID

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

ModelType = TypeVar("ModelType")


class BaseService(Generic[ModelType]):
    def __init__(self, session: AsyncSession, model_class: type[ModelType]):
        self.session = session
        self.model_class = model_class

    async def get_by_id(self, id: UUID) -> ModelType | None:
        return await self.session.scalar(
            select(self.model_class).where(self.model_class.id == id)
        )

    async def get_by_ids(self, ids: list[UUID]) -> list[ModelType]:
        result = await self.session.scalars(
            select(self.model_class).where(self.model_class.id.in_(ids))
        )
        return list(result.all())

    async def get_all(self, order_by: Any = None, limit: int | None = None) -> list[ModelType]:
        stmt = select(self.model_class)
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        if limit is not None:
            stmt = stmt.limit(limit)
        result = await self.session.scalars(stmt)
        return list(result.all())

    async def create(self, **kwargs) -> ModelType:
        instance = self.model_class(**kwargs)
        self.session.add(instance)
        await self.session.flush()
        return instance

    async def update(self, instance: ModelType, **kwargs) -> ModelType:
        for key, value in kwargs.items():
            setattr(instance, key, value)
        self.session.add(instance)
        await self.session.flush()
        return instance

    async def delete(self, instance: ModelType) -> None:
        await self.session.delete(instance)
        await self.session.flush()
