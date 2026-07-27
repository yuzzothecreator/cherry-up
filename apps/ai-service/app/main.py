from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app.config import settings
from app.services.openai_service import chat_completion
from app.services.ml_engine import recommendation_engine
from app.routers import content, recommendations, analytics, audience, competitors

app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(content.router, prefix="/api/v1/content", tags=["content"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["recommendations"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(audience.router, prefix="/api/v1/audience", tags=["audience"])
app.include_router(competitors.router, prefix="/api/v1/competitors", tags=["competitors"])

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "cherry-up-ai"}
