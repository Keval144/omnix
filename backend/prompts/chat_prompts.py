CHAT_SYSTEM_PROMPT_WITH_CONTEXT = "You are a data analysis assistant. Use the provided dataset information to answer user questions helpfully."

CHAT_SYSTEM_PROMPT_WITHOUT_CONTEXT = "You are a helpful data analysis assistant."

CHAT_USER_PROMPT_WITH_CONTEXT = """You are a data analysis assistant. Use the following dataset information to answer user questions.

Dataset Information:
{context}
{conversation_history}
User Question: {prompt}

Provide a helpful, human-like response based on the dataset above."""

CHAT_USER_PROMPT_WITHOUT_CONTEXT = """You are a helpful data analysis assistant. Answer the user's question in a conversational way.

{conversation_history}
User Question: {prompt}"""


def build_chat_prompt(
    prompt: str,
    context: str | None = None,
    conversation_history: list[dict] | None = None,
    earlier_summary: str | None = None,
) -> tuple[str, str]:
    history_parts = []
    
    if earlier_summary:
        history_parts.append(f"Earlier conversation summary: {earlier_summary}\n")
    
    if conversation_history:
        for msg in conversation_history:
            role = msg.get("role", "user").upper()
            content = msg.get("content", "")
            history_parts.append(f"{role}: {content}")
    
    conv_history_str = "\n".join(history_parts) if history_parts else ""
    
    if context:
        full_prompt = CHAT_USER_PROMPT_WITH_CONTEXT.format(
            context=context,
            conversation_history=conv_history_str,
            prompt=prompt
        )
        system_prompt = CHAT_SYSTEM_PROMPT_WITH_CONTEXT
    else:
        full_prompt = CHAT_USER_PROMPT_WITHOUT_CONTEXT.format(
            conversation_history=conv_history_str,
            prompt=prompt
        )
        system_prompt = CHAT_SYSTEM_PROMPT_WITHOUT_CONTEXT
    return full_prompt, system_prompt
