import pytest
from app.services.humanizer import ContentHumanizer, content_humanizer
from app.services.human_behavior import HumanBehaviorEngine, human_behavior

@pytest.fixture
def humanizer():
    return ContentHumanizer()

def test_strip_ai_cliches(humanizer):
    text = "In today's fast-paced world, let's dive into this game-changer."
    result = humanizer.humanize_text(text, "casual")
    assert "dive into" not in result["text"].lower() or "get into" in result["text"].lower()
    assert result["humanScore"] < humanizer._ai_likelihood_score(text)

def test_human_score_lower_after_humanize(humanizer):
    ai_text = "Furthermore, it is important to note that this seamless solution will empower your journey."
    result = humanizer.humanize_text(ai_text, "casual")
    assert result["improvement"] > 0 or result["humanScore"] < 50

def test_hashtag_tier_mixing(humanizer):
    tags = ["love", "instagood", "photooftheday", "nichetopic", "microinfluencer", "creatorlife"]
    result = humanizer.humanize_hashtags(tags, niche="creatorlife")
    assert len(result) == len(tags)
    assert len(set(result)) == len(result)  # no dupes

def test_voice_profiles_exist():
    from app.services.humanizer import VOICE_PROFILES
    assert "casual" in VOICE_PROFILES
    assert "witty" in VOICE_PROFILES

def test_posting_windows_not_round_minutes():
    windows = human_behavior.get_optimal_posting_windows(count=3)
    for w in windows:
        assert w["minute"] not in (0, 15, 30, 45)

def test_schedule_has_irregular_seconds():
    scheduled = human_behavior.schedule_next_action(base_delay_minutes=60)
    assert scheduled.second not in (0, 30)

def test_activity_spread_detects_robotic_pattern():
    from datetime import datetime, timedelta
    base = datetime(2026, 1, 1, 18, 0, 0)
    robotic = [base + timedelta(hours=i) for i in range(5)]
    result = human_behavior.activity_spread_score(robotic)
    assert result["verdict"] in ("needs_variation", "robotic_pattern")

def test_activity_spread_natural_pattern():
    from datetime import datetime, timedelta
    import random
    random.seed(42)
    base = datetime(2026, 1, 1, 18, 7, 23)
    natural = [base + timedelta(minutes=random.randint(40, 180)) for _ in range(5)]
    result = human_behavior.activity_spread_score(natural)
    assert result["score"] >= 40

def test_weekly_cadence_has_rest_days():
    cadence = human_behavior.get_weekly_cadence(posts_per_week=4)
    assert len(cadence) == 4
    days = [c["dayIndex"] for c in cadence]
    assert len(set(days)) == 4  # no duplicate days

def test_writing_fingerprint():
    from app.services.ml_engine import recommendation_engine
    captions = [
        "ok so here's the thing... i've been thinking about this alot lol",
        "not me overthinking my morning routine again 😅",
        "anyone else or just me?? drop a comment",
    ]
    fp = recommendation_engine.analyze_writing_fingerprint(captions)
    assert fp["profile"] in ("casual", "witty", "warm")
    assert fp["confidence"] > 0.3
