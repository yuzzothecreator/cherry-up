import pytest
from app.services.ml_engine import RecommendationEngine

def test_score_audience_empty():
    engine = RecommendationEngine()
    result = engine.score_audience([])
    assert "scores" in result
    assert result["scores"]["interestRelevance"] == 70

def test_recommend_content():
    engine = RecommendationEngine()
    posts = [
        {"type": "REEL", "engagementRate": 5.2},
        {"type": "IMAGE", "engagementRate": 2.1},
    ]
    recs = engine.recommend_content(posts)
    assert len(recs) >= 1
    assert recs[0]["type"] == "CONTENT"
