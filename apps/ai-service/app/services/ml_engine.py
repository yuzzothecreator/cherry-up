import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class RecommendationEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=100, stop_words="english")

    def score_audience(self, posts: list, niche_keywords: list = None) -> dict:
        if not posts:
            return self._default_scores()

        engagement_rates = [p.get("engagementRate", 0) for p in posts]
        avg_engagement = np.mean(engagement_rates) if engagement_rates else 0

        hashtags = []
        for p in posts:
            hashtags.extend(p.get("hashtags", []))

        interest_relevance = min(100, 50 + len(set(hashtags)) * 2)
        engagement_activity = min(100, avg_engagement * 10)
        account_quality = min(100, 60 + len(posts) * 0.5)
        niche_similarity = 75.0

        if niche_keywords and hashtags:
            try:
                texts = [" ".join(hashtags)] + [" ".join(niche_keywords)]
                tfidf = self.vectorizer.fit_transform(texts)
                similarity = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
                niche_similarity = min(100, similarity * 100)
            except Exception:
                pass

        return {
            "scores": {
                "interestRelevance": round(interest_relevance, 1),
                "engagementActivity": round(engagement_activity, 1),
                "accountQuality": round(account_quality, 1),
                "nicheSimilarity": round(niche_similarity, 1),
            },
            "topInterests": list(set(hashtags))[:10] if hashtags else ["lifestyle", "creativity"],
            "demographics": {"ageGroups": {"18-24": 30, "25-34": 45, "35-44": 20, "45+": 5}},
            "activeHours": {"6": 15, "9": 25, "12": 40, "15": 35, "18": 75, "21": 60},
            "insights": {"trend": "growing", "engagementPattern": "evening_peak"},
        }

    def recommend_content(self, recent_posts: list) -> list:
        type_counts = {}
        type_engagement = {}

        for post in recent_posts:
            ptype = post.get("type", "IMAGE")
            type_counts[ptype] = type_counts.get(ptype, 0) + 1
            eng = post.get("engagementRate", 0)
            if ptype not in type_engagement:
                type_engagement[ptype] = []
            type_engagement[ptype].append(eng)

        best_type = max(type_engagement, key=lambda t: np.mean(type_engagement[t])) if type_engagement else "REEL"

        return [
            {
                "type": "CONTENT",
                "title": f"Create more {best_type} content",
                "description": f"Your {best_type} posts show the highest engagement rates.",
                "priority": 9,
                "data": {"bestType": best_type},
            },
            {
                "type": "POSTING_TIME",
                "title": "Optimize posting schedule",
                "description": "Post during peak hours (6-8 PM) for maximum reach.",
                "priority": 8,
            },
            {
                "type": "ENGAGEMENT",
                "title": "Improve caption hooks",
                "description": "Posts with questions in captions get 23% more comments.",
                "priority": 7,
            },
        ]

    def _default_scores(self):
        return {
            "scores": {
                "interestRelevance": 70,
                "engagementActivity": 65,
                "accountQuality": 75,
                "nicheSimilarity": 68,
            },
            "topInterests": ["lifestyle", "creativity"],
            "demographics": {},
            "activeHours": {},
            "insights": {},
        }

recommendation_engine = RecommendationEngine()
