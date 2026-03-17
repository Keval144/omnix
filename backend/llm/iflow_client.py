import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial

import httpx
from config import IFLOW_API_KEY, IFLOW_MODEL, IFLOW_API_URL

_executor = ThreadPoolExecutor(max_workers=4)


class IFlowClient:

    @staticmethod
    def generate(prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {IFLOW_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": IFLOW_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert machine learning engineer that generates Jupyter notebooks."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.0
        }

        with httpx.Client(timeout=60.0) as client:
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

        return result["choices"][0]["message"]["content"]


async def generate_async(prompt: str) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, partial(IFlowClient.generate, prompt))
