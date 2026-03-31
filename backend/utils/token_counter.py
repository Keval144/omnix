import logging

logger = logging.getLogger(__name__)

_tokenizer = None

try:
    import tiktoken
    _tokenizer = tiktoken.get_encoding("cl100k_base")
except ImportError:
    logger.warning("tiktoken not installed, using character-based token estimation")


def count_tokens(text: str) -> int:
    if _tokenizer:
        return len(_tokenizer.encode(text))
    return len(text) // 4


def count_messages_tokens(messages: list[dict]) -> int:
    total = 0
    for msg in messages:
        content = msg.get("content", "")
        role = msg.get("role", "")
        total += count_tokens(content)
        total += count_tokens(role)
        total += 4
    return total


def estimate_response_tokens(usage: dict) -> int:
    if usage and "completion_tokens" in usage:
        return usage.get("completion_tokens", 0)
    return 0
