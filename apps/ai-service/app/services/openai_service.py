import re
import random
from openai import OpenAI
from app.config import settings
from app.services.humanizer import content_humanizer, HUMAN_WRITING_RULES

client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

SYSTEM_PROMPT = """You are a ghostwriter for Instagram creators on Cherry-Up.
You write captions, hooks, and content that sounds 100% human — like the creator typed it on their phone.

Rules:
- NEVER sound like AI, a brand, or a marketing team
- NEVER use corporate buzzwords or inspirational poster language
- Write with personality, imperfection, and rhythm
- Ethical growth only — no spam, bots, or policy violations"""


async def chat_completion(
    prompt: str,
    max_tokens: int = 1000,
    voice_profile: str = "casual",
    humanize: bool = True,
) -> dict:
    voice_instruction = content_humanizer.get_voice_instruction(voice_profile)
    temperature = content_humanizer.get_generation_temperature(voice_profile)

    if not client:
        fallback = _fallback_response(prompt, voice_profile)
        humanized = content_humanizer.humanize_text(fallback, voice_profile) if humanize else {"text": fallback, "humanScore": 50}
        return {
            "content": humanized["text"],
            "tokensUsed": 0,
            "cost": 0,
            "humanScore": humanized.get("humanScore", 50),
            "voiceProfile": voice_profile,
        }

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{voice_instruction}\n{HUMAN_WRITING_RULES}"},
            {"role": "user", "content": prompt},
        ],
        max_tokens=max_tokens,
        temperature=temperature,
        presence_penalty=0.4,  # reduce repetitive phrasing
        frequency_penalty=0.3,
    )

    raw = response.choices[0].message.content or ""
    tokens = response.usage.total_tokens if response.usage else 0
    cost = tokens * 0.00001

    if humanize:
        result = content_humanizer.humanize_text(raw, voice_profile)
        content = result["text"]
        human_score = result["humanScore"]
    else:
        content = raw
        human_score = content_humanizer._ai_likelihood_score(raw)

    return {
        "content": content,
        "tokensUsed": tokens,
        "cost": cost,
        "humanScore": human_score,
        "voiceProfile": voice_profile,
    }


def _fallback_response(prompt: str, voice_profile: str) -> str:
    templates = {
        "casual": "ok so I've been thinking about this a lot lately...\n\n{topic}\n\nanyone else or just me? drop a comment 👇",
        "storyteller": "Last Tuesday changed how I see everything.\n\n{topic}\n\nStill processing it honestly.",
        "expert": "Here's what actually works:\n\n{topic}\n\nSave this if it helps.",
        "witty": "Not me turning {topic} into a whole personality trait 😅\n\nBut seriously — worth a try.",
        "warm": "Hey — if you're struggling with this, you're not alone.\n\n{topic}\n\nProud of you for showing up.",
    }
    topic_match = re.search(r"(?:topic|idea|content):\s*(.+?)(?:\n|$)", prompt, re.IGNORECASE)
    topic = topic_match.group(1).strip() if topic_match else "this"
    template = templates.get(voice_profile, templates["casual"])
    return template.format(topic=topic[:80])
