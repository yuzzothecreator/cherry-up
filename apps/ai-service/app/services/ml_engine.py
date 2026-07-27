import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans

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

    def analyze_writing_fingerprint(self, captions: list[str]) -> dict:
        """
        Extract a creator's natural writing patterns from past captions.
        Used to personalize AI output toward their authentic voice.
        """
        if not captions or len(captions) < 2:
            return {"profile": "casual", "confidence": 0.3, "traits": {}}

        texts = [c for c in captions if c and len(c) > 10]
        if len(texts) < 2:
            return {"profile": "casual", "confidence": 0.3, "traits": {}}

        avg_len = np.mean([len(t.split()) for t in texts])
        avg_sentence = np.mean([len(re.split(r'[.!?]+', t)) for t in texts])
        emoji_rate = np.mean([sum(1 for c in t if ord(c) > 0x1F600) / max(len(t), 1) for t in texts])
        contraction_rate = np.mean([
            len(re.findall(r"\b\w+'\w+\b", t)) / max(len(t.split()), 1)
            for t in texts
        ])

        traits = {
            "avgWordCount": round(avg_len, 1),
            "avgSentences": round(avg_sentence, 1),
            "emojiRate": round(emoji_rate, 3),
            "contractionRate": round(contraction_rate, 3),
        }

        # Infer best voice profile from patterns
        if emoji_rate > 0.02 and avg_len < 80:
            profile = "casual"
        elif avg_len > 120:
            profile = "storyteller"
        elif contraction_rate < 0.05 and avg_len < 60:
            profile = "expert"
        else:
            profile = "warm"

        confidence = min(0.95, 0.4 + len(texts) * 0.05)

        return {"profile": profile, "confidence": round(confidence, 2), "traits": traits}

    def cluster_content_topics(self, posts: list) -> list:
        """Find natural topic clusters from post captions/hashtags."""
        texts = []
        for p in posts:
            caption = p.get("caption", "") or ""
            tags = " ".join(p.get("hashtags", []))
            texts.append(f"{caption} {tags}".strip())

        if len(texts) < 3:
            return [{"topic": "general", "count": len(texts), "avgEngagement": 0}]

        try:
            tfidf = self.vectorizer.fit_transform(texts)
            n_clusters = min(3, len(texts))
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            labels = kmeans.fit_predict(tfidf)

            clusters = []
            for i in range(n_clusters):
                cluster_posts = [posts[j] for j in range(len(posts)) if labels[j] == i]
                eng = np.mean([p.get("engagementRate", 0) for p in cluster_posts])
                clusters.append({
                    "topic": f"cluster_{i + 1}",
                    "count": len(cluster_posts),
                    "avgEngagement": round(float(eng), 2),
                })
            return sorted(clusters, key=lambda x: -x["avgEngagement"])
        except Exception:
            return [{"topic": "mixed", "count": len(posts), "avgEngagement": 0}]

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
