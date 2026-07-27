from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.openai_service import chat_completion

router = APIRouter()

class PostPerformanceRequest(BaseModel):
    postId: Optional[str] = None
    caption: Optional[str] = None
    metrics: Optional[dict] = None

@router.post("/post-performance")
async def analyze_post_performance(req: PostPerformanceRequest):
    prompt = f"""Analyze why this Instagram post performed the way it did:
Caption: {req.caption or 'N/A'}
Metrics: {req.metrics or {}}
Explain key factors: timing, content type, caption quality, hashtags, and audience fit.
Provide actionable insights for future posts."""
    result = await chat_completion(prompt)
    return {"analysis": result["content"], "tokensUsed": result["tokensUsed"], "cost": result["cost"]}
