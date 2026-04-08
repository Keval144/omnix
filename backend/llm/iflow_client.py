import asyncio
import os

import httpx

from config import IFLOW_API_KEY, IFLOW_MODEL, IFLOW_API_URL

MAX_RETRIES = 3
RETRY_DELAYS = [1, 2, 4]


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

        last_error = None
        for attempt in range(MAX_RETRIES):
            try:
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

            except Exception as e:
                last_error = e
                if attempt < MAX_RETRIES - 1:
                    delay = RETRY_DELAYS[attempt]
                    import logging
                    logging.getLogger(__name__).warning(f"LLM request failed (attempt {attempt + 1}/{MAX_RETRIES}), retrying in {delay}s: {e}")
                    import time
                    time.sleep(delay)
                continue

        raise RuntimeError(f"LLM request failed after {MAX_RETRIES} retries: {last_error}")

    @staticmethod
    async def generate_async(prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
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
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.0
        }

        last_error = None
        async with httpx.AsyncClient(timeout=60.0, trust_env=use_env_proxy) as client:
            for attempt in range(MAX_RETRIES):
                try:
                    response = await client.post(
                        IFLOW_API_URL,
                        headers=headers,
                        json=payload,
                    )

                    if response.status_code != 200:
                        raise RuntimeError(f"LLM request failed: {response.text}")

                    result = response.json()

                    if isinstance(result, dict) and "choices" not in result:
                        error_message = result.get("msg") or result.get("message") or response.text
                        raise RuntimeError(f"LLM provider error: {error_message}")

                    message = result["choices"][0]["message"]
                    return message.get("content") or ""

                except Exception as e:
                    last_error = e
                    if attempt < MAX_RETRIES - 1:
                        delay = RETRY_DELAYS[attempt]
                        import logging
                        logging.getLogger(__name__).warning(f"LLM request failed (attempt {attempt + 1}/{MAX_RETRIES}), retrying in {delay}s: {e}")
                        await asyncio.sleep(delay)
                    continue

        raise RuntimeError(f"LLM request failed after {MAX_RETRIES} retries: {last_error}")

    @staticmethod
    async def generate_stream_async(
        prompt: str,
        system_prompt: str = "You are a helpful assistant.",
    ):
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
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.0,
            "stream": True
        }

        async with httpx.AsyncClient(timeout=60.0, trust_env=use_env_proxy) as client:
            async with client.stream("POST", IFLOW_API_URL, headers=headers, json=payload) as response:
                if response.status_code != 200:
                    raise RuntimeError(f"LLM request failed: {response.text}")

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            import json
                            chunk = json.loads(data)
                            if "choices" in chunk and chunk["choices"]:
                                delta = chunk["choices"][0].get("delta", {})
                                if "content" in delta:
                                    yield delta["content"]
                        except Exception:
                            continue
