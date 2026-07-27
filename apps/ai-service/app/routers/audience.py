from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.ml_engine import recommendation_engine

router = APIRouter()

class AudienceScoreRequest(BaseModel):
    username: Optional[str] = None
    followerCount: Optional[int] = 0
    posts: Optional[list] = []

@router.post("/score")
async def score_audience(req: AudienceScoreRequest):
    result = recommendation_engine.score_audience(req.posts or [])
    return {**result, "tokensUsed": 0, "cost": 0}
