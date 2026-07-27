from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.openai_service import chat_completion
from app.services.ml_engine import recommendation_engine

router = APIRouter()

class PostingTimesRequest(BaseModel):
    timezone: Optional[str] = "UTC"
    audienceData: Optional[dict] = None

class ContentRecommendationRequest(BaseModel):
    username: Optional[str] = None
    followerCount: Optional[int] = 0
    recentPosts: Optional[list] = []

@router.post("/posting-times")
async def recommend_posting_times(req: PostingTimesRequest = PostingTimesRequest()):
    prompt = f"""Recommend optimal Instagram posting times for timezone {req.timezone}.
Provide specific hours and days with reasoning. Format as structured recommendations."""
    result = await chat_completion(prompt, max_tokens=600)
    return {
        "recommendations": result["content"],
        "optimalHours": [6, 12, 18, 21],
        "optimalDays": ["Tuesday", "Wednesday", "Thursday", "Sunday"],
        "tokensUsed": result["tokensUsed"],
        "cost": result["cost"],
    }

@router.post("/content")
async def recommend_content(req: ContentRecommendationRequest):
    recs = recommendation_engine.recommend_content(req.recentPosts or [])
    return {"recommendations": recs, "tokensUsed": 0, "cost": 0}
