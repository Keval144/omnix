import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.chat import ChatMessage, ChatSession
from utils.token_counter import count_tokens

logger = logging.getLogger(__name__)

SUMMARY_SYSTEM_PROMPT = "You are a concise assistant that summarizes conversations."
SUMMARY_USER_PROMPT = """Summarize this conversation in 2-3 sentences. Focus on:
                        - The main topics discussed
                        - Any decisions or conclusions reached
                        - The user's goals or questions

                        Conversation:
                        {conversation}

                        Summary:
                      """


async def summarize_conversation(session_id: UUID, session: AsyncSession) -> str | None:
    try:
        from llm.iflow_client import generate_async

        stmt = (
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc())
        )
        messages = list((await session.scalars(stmt)).all())

        if not messages:
            return None

        conversation_text = "\n".join(
            f"{msg.role.value}: {msg.content}" for msg in messages
        )

        prompt = SUMMARY_USER_PROMPT.format(conversation=conversation_text)
        summary = await generate_async(prompt, SUMMARY_SYSTEM_PROMPT)

        tokens_used = count_tokens(prompt) + count_tokens(summary)
        logger.info(f"Summary generated for session {session_id}: {tokens_used} tokens")

        return summary.strip()
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        return None


def build_conversation_history(messages: list[ChatMessage]) -> list[dict]:
    history = []
    for msg in messages:
        history.append({
            "role": msg.role.value.lower(),
            "content": msg.content
        })
    return history
