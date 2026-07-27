from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.openai_service import chat_completion

router = APIRouter()

class CaptionRequest(BaseModel):
    topic: str
    tone: Optional[str] = "engaging"
    niche: Optional[str] = None

class HashtagRequest(BaseModel):
    content: str
    niche: Optional[str] = None
    count: Optional[int] = 15

class IdeaRequest(BaseModel):
    idea: str
    targetAudience: Optional[str] = None

class ReelHookRequest(BaseModel):
    topic: str
    style: Optional[str] = "attention-grabbing"

@router.post("/caption")
async def generate_caption(req: CaptionRequest):
    prompt = f"""Generate an Instagram caption for the following:
Topic: {req.topic}
Tone: {req.tone}
Niche: {req.niche or 'general'}
Include a call-to-action and 2-3 relevant emojis. Keep it under 2200 characters."""
    result = await chat_completion(prompt)
    return {"caption": result["content"], "tokensUsed": result["tokensUsed"], "cost": result["cost"]}

@router.post("/hashtags")
async def suggest_hashtags(req: HashtagRequest):
    prompt = f"""Suggest {req.count} Instagram hashtags for:
Content: {req.content}
Niche: {req.niche or 'general'}
Mix popular and niche hashtags. Return as a comma-separated list."""
    result = await chat_completion(prompt, max_tokens=500)
    tags = [t.strip().lstrip("#") for t in result["content"].split(",") if t.strip()]
    return {"hashtags": tags[:req.count], "tokensUsed": result["tokensUsed"], "cost": result["cost"]}

@router.post("/analyze-idea")
async def analyze_idea(req: IdeaRequest):
    prompt = f"""Analyze this Instagram content idea:
Idea: {req.idea}
Target Audience: {req.targetAudience or 'general'}
Provide: viability score (1-10), strengths, weaknesses, and improvement suggestions."""
    result = await chat_completion(prompt)
    return {"analysis": result["content"], "tokensUsed": result["tokensUsed"], "cost": result["cost"]}

@router.post("/reel-hook")
async def generate_reel_hook(req: ReelHookRequest):
    prompt = f"""Generate 5 {req.style} Reel hooks for the topic: {req.topic}
Each hook should be 1-2 sentences, designed to stop the scroll."""
    result = await chat_completion(prompt)
    return {"hooks": result["content"], "tokensUsed": result["tokensUsed"], "cost": result["cost"]}
