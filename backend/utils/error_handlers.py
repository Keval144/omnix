import logging
from enum import Enum

from fastapi import HTTPException, status

logger = logging.getLogger(__name__)


class ErrorType(Enum):
    LLM_TIMEOUT = "llm_timeout"
    LLM_RATE_LIMIT = "llm_rate_limit"
    LLM_AUTH = "llm_auth"
    LLM_INVALID_REQUEST = "llm_invalid_request"
    LLM_SERVER_ERROR = "llm_server_error"
    NETWORK_ERROR = "network_error"
    UNKNOWN = "unknown"


ERROR_MAPPING: dict[ErrorType, tuple[int, str]] = {
    ErrorType.LLM_TIMEOUT: (
        status.HTTP_504_GATEWAY_TIMEOUT,
        "LLM request timed out. Please try again.",
    ),
    ErrorType.LLM_RATE_LIMIT: (
        status.HTTP_429_TOO_MANY_REQUESTS,
        "LLM service rate limit exceeded. Please try again later.",
    ),
    ErrorType.LLM_AUTH: (
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "LLM service authentication failed. Please contact support.",
    ),
    ErrorType.LLM_INVALID_REQUEST: (
        status.HTTP_400_BAD_REQUEST,
        "Invalid request to LLM. Please check your input.",
    ),
    ErrorType.LLM_SERVER_ERROR: (
        status.HTTP_502_BAD_GATEWAY,
        "LLM service temporarily unavailable. Please try again.",
    ),
    ErrorType.NETWORK_ERROR: (
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "Unable to connect to LLM service. Check your network.",
    ),
    ErrorType.UNKNOWN: (
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        "An unexpected error occurred. Please try again.",
    ),
}


def classify_error(error: Exception) -> ErrorType:
    error_str = str(error).lower()

    if "timeout" in error_str or "timed out" in error_str:
        return ErrorType.LLM_TIMEOUT
    if "rate limit" in error_str or "too many requests" in error_str:
        return ErrorType.LLM_RATE_LIMIT
    if "auth" in error_str or "unauthorized" in error_str or "api key" in error_str:
        return ErrorType.LLM_AUTH
    if "invalid" in error_str or "bad request" in error_str or "400" in error_str:
        return ErrorType.LLM_INVALID_REQUEST
    if "502" in error_str or "500" in error_str or "server error" in error_str:
        return ErrorType.LLM_SERVER_ERROR
    if "connection" in error_str or "network" in error_str or "refused" in error_str:
        return ErrorType.NETWORK_ERROR

    return ErrorType.UNKNOWN


def raise_http_error(error: Exception) -> None:
    error_type = classify_error(error)
    status_code, detail = ERROR_MAPPING[error_type]

    logger.error(f"LLM error ({error_type.value}): {str(error)}", exc_info=True)

    raise HTTPException(status_code=status_code, detail=detail) from error


def safe_raise_llm_error(e: Exception) -> None:
    raise_http_error(e)