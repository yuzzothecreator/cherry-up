from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from app.services.openai_service import chat_completion
from app.services.humanizer import content_humanizer

router = APIRouter()

class CaptionRequest(BaseModel):
    topic: str
    tone: Optional[str] = "engaging"
    niche: Optional[str] = None
    voiceProfile: Optional[str] = Field(default="casual", description="casual|storyteller|expert|witty|warm")
    humanize: Optional[bool] = True

class HashtagRequest(BaseModel):
    content: str
    niche: Optional[str] = None
    count: Optional[int] = 15
    voiceProfile: Optional[str] = "casual"

class IdeaRequest(BaseModel):
    idea: str
    targetAudience: Optional[str] = None
    voiceProfile: Optional[str] = "casual"

class ReelHookRequest(BaseModel):
    topic: str
    style: Optional[str] = "attention-grabbing"
    voiceProfile: Optional[str] = "witty"

class HumanizeRequest(BaseModel):
    text: str
    voiceProfile: Optional[str] = "casual"

@router.post("/caption")
async def generate_caption(req: CaptionRequest):
    profile = req.voiceProfile or "casual"
    prompt = f"""Write an Instagram caption a real person would post.

Topic: {req.topic}
Niche: {req.niche or 'general'}
Tone hint: {req.tone}

Write ONLY the caption. No labels, no "Caption:" prefix.
Under 2200 characters. Sound like a human typed this on their phone."""
    result = await chat_completion(prompt, voice_profile=profile, humanize=req.humanize)
    return {
        "caption": result["content"],
        "humanScore": result["humanScore"],
        "voiceProfile": profile,
        "tokensUsed": result["tokensUsed"],
        "cost": result["cost"],
    }

@router.post("/hashtags")
async def suggest_hashtags(req: HashtagRequest):
    profile = req.voiceProfile or "casual"
    prompt = f"""Suggest {req.count} Instagram hashtags a real creator would use.

Content: {req.content}
Niche: {req.niche or 'general'}

Mix: a few popular, mostly mid-tier, some niche-specific.
Return ONLY comma-separated hashtags without # symbols.
No explanations."""
    result = await chat_completion(prompt, max_tokens=500, voice_profile=profile, humanize=False)
    raw_tags = [t.strip().lstrip("#") for t in result["content"].split(",") if t.strip()]
    tags = content_humanizer.humanize_hashtags(raw_tags, req.niche)
    return {
        "hashtags": tags[:req.count],
        "humanScore": result["humanScore"],
        "tokensUsed": result["tokensUsed"],
        "cost": result["cost"],
    }

@router.post("/analyze-idea")
async def analyze_idea(req: IdeaRequest):
    prompt = f"""Analyze this Instagram content idea like a creator friend would — direct, no fluff.

Idea: {req.idea}
Audience: {req.targetAudience or 'general'}

Give: score (1-10), what works, what doesn't, one specific fix.
Write conversationally, not like a report."""
    result = await chat_completion(prompt, voice_profile=req.voiceProfile or "casual")
    return {
        "analysis": result["content"],
        "humanScore": result["humanScore"],
        "tokensUsed": result["tokensUsed"],
        "cost": result["cost"],
    }

@router.post("/reel-hook")
async def generate_reel_hook(req: ReelHookRequest):
    profile = req.voiceProfile or "witty"
    prompt = f"""Write 5 Reel opening hooks for: {req.topic}
Style: {req.style}

Rules: 1-2 sentences each. Sound spoken, not written.
No "Hey guys" or "In this video". Start mid-thought if it hits harder.
Number them 1-5."""
    result = await chat_completion(prompt, voice_profile=profile)
    return {
        "hooks": result["content"],
        "humanScore": result["humanScore"],
        "voiceProfile": profile,
        "tokensUsed": result["tokensUsed"],
        "cost": result["cost"],
    }

@router.post("/humanize")
async def humanize_content(req: HumanizeRequest):
    """Re-process existing text to sound more naturally human."""
    result = content_humanizer.humanize_text(req.text, req.voiceProfile or "casual")
    return {
        "text": result["text"],
        "humanScore": result["humanScore"],
        "improvement": result["improvement"],
        "wasModified": result["wasModified"],
    }

@router.get("/voice-profiles")
async def list_voice_profiles():
    from app.services.humanizer import VOICE_PROFILES
    return {
        "profiles": [
            {"id": k, "description": v["instruction"][:80]}
            for k, v in VOICE_PROFILES.items()
        ]
    }
