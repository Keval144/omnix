CHAT_SYSTEM_PROMPT_WITH_CONTEXT = "You are a data analysis assistant. Use the provided dataset information to answer user questions helpfully."

CHAT_SYSTEM_PROMPT_WITHOUT_CONTEXT = "You are a helpful data analysis assistant."

CHAT_USER_PROMPT_WITH_CONTEXT = """You are a data analysis assistant. Use the following dataset information to answer user questions.

Dataset Information:
{context}
User Question: {prompt}

Provide a helpful, human-like response based on the dataset above."""

CHAT_USER_PROMPT_WITHOUT_CONTEXT = """You are a helpful data analysis assistant. Answer the user's question in a conversational way.

User Question: {prompt}"""


def build_chat_prompt(prompt: str, context: str | None = None) -> tuple[str, str]:
    if context:
        full_prompt = CHAT_USER_PROMPT_WITH_CONTEXT.format(context=context, prompt=prompt)
        system_prompt = CHAT_SYSTEM_PROMPT_WITH_CONTEXT
    else:
        full_prompt = CHAT_USER_PROMPT_WITHOUT_CONTEXT.format(prompt=prompt)
        system_prompt = CHAT_SYSTEM_PROMPT_WITHOUT_CONTEXT
    return full_prompt, system_prompt
