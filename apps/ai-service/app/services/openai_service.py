from openai import OpenAI
from app.config import settings

client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

SYSTEM_PROMPT = """You are GrowthAI, the AI assistant for Cherry-Up — an ethical Instagram growth platform.
You help creators grow through analytics, content intelligence, and recommendations.
NEVER suggest spam, mass following, bot activity, or policy-violating actions.
Focus on authentic engagement, quality content, and data-driven growth strategies."""

async def chat_completion(prompt: str, max_tokens: int = 1000) -> dict:
    if not client:
        return {"content": _fallback_response(prompt), "tokensUsed": 0, "cost": 0}

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        max_tokens=max_tokens,
        temperature=0.7,
    )

    content = response.choices[0].message.content or ""
    tokens = response.usage.total_tokens if response.usage else 0
    cost = tokens * 0.00001

    return {"content": content, "tokensUsed": tokens, "cost": cost}

def _fallback_response(prompt: str) -> str:
    return (
        "AI service is running in demo mode. Configure OPENAI_API_KEY for full capabilities. "
        f"Request received: {prompt[:100]}..."
    )
