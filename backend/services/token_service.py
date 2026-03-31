import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.token import TokenRequestType, TokenUsageLog, UserProjectToken
from utils.token_counter import count_tokens

logger = logging.getLogger(__name__)


class TokenService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def increment_tokens(
        self,
        user_id: str,
        project_id: UUID,
        tokens_used: int,
        request_type: TokenRequestType = TokenRequestType.CHAT,
    ) -> UserProjectToken:
        stmt = select(UserProjectToken).where(
            UserProjectToken.user_id == user_id,
            UserProjectToken.project_id == project_id,
        )
        token_record = await self.session.scalar(stmt)

        if token_record:
            token_record.total_tokens_used += tokens_used
        else:
            token_record = UserProjectToken(
                user_id=user_id,
                project_id=project_id,
                total_tokens_used=tokens_used,
            )
            self.session.add(token_record)

        log_entry = TokenUsageLog(
            user_id=user_id,
            project_id=project_id,
            request_type=request_type,
            tokens_used=tokens_used,
        )
        self.session.add(log_entry)

        await self.session.flush()

        logger.info(
            f"User {user_id} project {project_id}: +{tokens_used} tokens "
            f"({request_type.value}), total: {token_record.total_tokens_used}"
        )

        return token_record

    async def get_user_total(self, user_id: str) -> int:
        stmt = select(UserProjectToken).where(UserProjectToken.user_id == user_id)
        records = await self.session.scalars(stmt)
        return sum(r.total_tokens_used for r in records.all())

    async def get_project_tokens(self, user_id: str, project_id: UUID) -> int:
        stmt = select(UserProjectToken).where(
            UserProjectToken.user_id == user_id,
            UserProjectToken.project_id == project_id,
        )
        record = await self.session.scalar(stmt)
        return record.total_tokens_used if record else 0

    async def get_all_user_tokens(self, user_id: str) -> list[UserProjectToken]:
        stmt = select(UserProjectToken).where(UserProjectToken.user_id == user_id)
        return list((await self.session.scalars(stmt)).all())
