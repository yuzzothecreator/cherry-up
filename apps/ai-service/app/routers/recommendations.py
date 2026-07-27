from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.openai_service import chat_completion
from app.services.ml_engine import recommendation_engine
from app.services.human_behavior import human_behavior

router = APIRouter()

class PostingTimesRequest(BaseModel):
    timezone: Optional[str] = "UTC"
    audienceData: Optional[dict] = None

class ContentRecommendationRequest(BaseModel):
    username: Optional[str] = None
    followerCount: Optional[int] = 0
    recentPosts: Optional[list] = []

class CadenceRequest(BaseModel):
    postsPerWeek: Optional[int] = 4

@router.post("/posting-times")
async def recommend_posting_times(req: PostingTimesRequest = PostingTimesRequest()):
    audience_hours = None
    if req.audienceData and "activeHours" in req.audienceData:
        audience_hours = req.audienceData["activeHours"]

    windows = human_behavior.get_optimal_posting_windows(
        timezone=req.timezone or "UTC",
        audience_hours=audience_hours,
        count=5,
    )

    prompt = f"""Based on these optimal windows: {windows}
Timezone: {req.timezone}
Explain in 2-3 casual sentences why these times work. Sound human, not corporate."""
    result = await chat_completion(prompt, max_tokens=400, voice_profile="warm")

    return {
        "recommendations": result["content"],
        "windows": windows,
        "optimalHours": [w["hour"] for w in windows],
        "optimalDays": ["Tuesday", "Wednesday", "Thursday", "Sunday"],
        "humanScore": result["humanScore"],
        "tokensUsed": result["tokensUsed"],
        "cost": result["cost"],
    }

@router.post("/content")
async def recommend_content(req: ContentRecommendationRequest):
    recs = recommendation_engine.recommend_content(req.recentPosts or [])
    return {"recommendations": recs, "tokensUsed": 0, "cost": 0}

@router.post("/cadence")
async def suggest_cadence(req: CadenceRequest = CadenceRequest()):
    """Suggest a human-like weekly posting schedule with natural gaps."""
    cadence = human_behavior.get_weekly_cadence(req.postsPerWeek or 4)
    return {"cadence": cadence, "note": "Includes rest days and non-round posting times like real creators"}
