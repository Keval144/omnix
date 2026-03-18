import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from functools import partial

import httpx
from config import IFLOW_API_KEY, IFLOW_MODEL, IFLOW_API_URL

_executor = ThreadPoolExecutor(max_workers=4)


class IFlowClient:

    @staticmethod
    def generate(prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
        if not IFLOW_API_KEY:
            raise RuntimeError("IFLOW_API_KEY is not configured")

        use_env_proxy = os.getenv("IFLOW_USE_ENV_PROXY", "").lower() in {"1", "true", "yes"}

        headers = {
            "Authorization": f"Bearer {IFLOW_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": IFLOW_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.0
        }

        with httpx.Client(timeout=60.0, trust_env=use_env_proxy) as client:
            response = client.post(
                IFLOW_API_URL,
                headers=headers,
                json=payload,
            )

        if response.status_code != 200:
            raise RuntimeError(f"LLM request failed: {response.text}")

        try:
            result = response.json()
        except Exception as exc:
            raise RuntimeError(
                f"LLM returned a non-JSON response with status {response.status_code}"
            ) from exc

        if isinstance(result, dict) and "choices" not in result:
            error_message = result.get("msg") or result.get("message") or response.text
            raise RuntimeError(f"LLM provider error: {error_message}")

        try:
            message = result["choices"][0]["message"]
            return message.get("content") or ""
        except (KeyError, IndexError, TypeError) as exc:
            raise RuntimeError("LLM response did not contain a valid message") from exc


async def generate_async(prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, partial(IFlowClient.generate, prompt, system_prompt))
