import requests
from config import IFLOW_API_KEY, IFLOW_MODEL, IFLOW_API_URL


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
            "temperature": 0.3
        }

        response = requests.post(
            IFLOW_API_URL,
            headers=headers,
            json=payload,
            timeout=60,
        )

        if response.status_code != 200:
            raise RuntimeError(f"LLM request failed: {response.text}")

        try:
            result = response.json()
        except requests.exceptions.JSONDecodeError as exc:
            raise RuntimeError(
                f"LLM returned a non-JSON response with status {response.status_code}"
            ) from exc

        return result["choices"][0]["message"]["content"]
