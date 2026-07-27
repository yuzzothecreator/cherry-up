"""
Humanization engine — makes AI-generated content sound authentically human.

Focuses on writing naturalness (burstiness, voice, anti-cliché filtering),
not on evading platform security or automating spam actions.
"""

import re
import random
from typing import Optional

# Phrases that commonly flag content as AI-generated
AI_CLICHE_PATTERNS = [
    r"\bin today'?s (fast[- ]paced |digital |modern )?world\b",
    r"\bdive (deep )?into\b",
    r"\bgame[- ]?changer\b",
    r"\blet'?s (unpack|dive|explore)\b",
    r"\bunlock (your|the) (potential|power)\b",
    r"\bhere'?s the thing\b",
    r"\bwithout further ado\b",
    r"\bin conclusion\b",
    r"\bfurthermore\b",
    r"\bmoreover\b",
    r"\bit'?s (important|worth) (to note|noting)\b",
    r"\bleverage\b",
    r"\brobust\b",
    r"\bseamless(ly)?\b",
    r"\bever[- ]changing landscape\b",
    r"\bnavigate the\b",
    r"\bempower\b",
    r"\bjourney\b",
    r"\bcurated\b",
    r"\bauthentic self\b",
    r"\b—",  # em-dash overuse
]

AI_CLICHE_REPLACEMENTS = {
    "dive into": "get into",
    "game-changer": "big deal",
    "game changer": "big deal",
    "leverage": "use",
    "robust": "solid",
    "seamlessly": "smoothly",
    "seamless": "smooth",
    "furthermore": "also",
    "moreover": "plus",
    "navigate": "handle",
    "empower": "help",
    "curated": "picked",
    "unlock your potential": "find your groove",
    "in today's world": "lately",
    "in today's fast-paced world": "these days",
}

VOICE_PROFILES = {
    "casual": {
        "instruction": "Write like texting a friend. Short sentences. Contractions. Maybe one rhetorical question.",
        "emoji_range": (1, 3),
        "max_formal_words": 2,
    },
    "storyteller": {
        "instruction": "Open with a micro-story or specific moment. Sensory detail. Build to a point.",
        "emoji_range": (0, 2),
        "max_formal_words": 1,
    },
    "expert": {
        "instruction": "Confident but not corporate. One clear insight. No jargon stacking.",
        "emoji_range": (0, 1),
        "max_formal_words": 3,
    },
    "witty": {
        "instruction": "Light humor or unexpected angle. Self-aware. Never try-hard.",
        "emoji_range": (1, 2),
        "max_formal_words": 1,
    },
    "warm": {
        "instruction": "Genuine and encouraging. Like a mentor who actually cares.",
        "emoji_range": (1, 2),
        "max_formal_words": 2,
    },
}

HUMAN_WRITING_RULES = """
CRITICAL — write like a real person, not an AI:
- Vary sentence length: mix 3-word punches with longer flowing lines
- Use contractions (you're, don't, it's) naturally
- Start some sentences with "And" or "But" or "So"
- One imperfect thought is fine — real people don't write essays
- NO bullet lists unless explicitly asked
- NO "In conclusion", "Furthermore", "It's important to note"
- NO em-dashes more than once
- Skip the corporate inspirational tone
- Sound like THIS specific creator, not a marketing team
"""


class ContentHumanizer:
    """Post-processes and guides AI output toward natural human writing."""

    def get_voice_instruction(self, profile: str = "casual") -> str:
        voice = VOICE_PROFILES.get(profile, VOICE_PROFILES["casual"])
        return f"{voice['instruction']}\n{HUMAN_WRITING_RULES}"

    def get_generation_temperature(self, profile: str = "casual") -> float:
        """Higher variance = less predictable = more human-like."""
        base = {"casual": 0.92, "storyteller": 0.88, "expert": 0.78, "witty": 0.95, "warm": 0.85}
        return base.get(profile, 0.88) + random.uniform(-0.05, 0.05)

    def humanize_text(self, text: str, profile: str = "casual") -> dict:
        """Apply rule-based humanization pass to generated content."""
        original = text
        score_before = self._ai_likelihood_score(text)

        text = self._strip_cliches(text)
        text = self._fix_burstiness(text)
        text = self._normalize_whitespace(text)
        text = self._add_natural_imperfections(text, profile)

        score_after = self._ai_likelihood_score(text)

        return {
            "text": text,
            "humanScore": round(score_after, 1),
            "improvement": round(score_before - score_after, 1),
            "wasModified": text != original,
        }

    def humanize_hashtags(self, tags: list[str], niche: Optional[str] = None) -> list[str]:
        """
        Mix hashtag tiers like a real creator — not all mega-popular tags.
        ~20% broad, ~50% mid-tier, ~30% niche/micro
        """
        cleaned = [t.strip().lstrip("#").lower().replace(" ", "") for t in tags if t.strip()]
        cleaned = list(dict.fromkeys(cleaned))  # dedupe preserving order

        if not cleaned:
            return []

        random.shuffle(cleaned)
        n = len(cleaned)
        broad_count = max(1, int(n * 0.2))
        niche_count = max(1, int(n * 0.3))
        mid_count = n - broad_count - niche_count

        # Simulate tier assignment (in production, use real hashtag volume data)
        broad = cleaned[:broad_count]
        mid = cleaned[broad_count : broad_count + mid_count]
        niche_tags = cleaned[broad_count + mid_count :]

        if niche and niche.lower().replace(" ", "") not in [t.lower() for t in niche_tags]:
            niche_tags.insert(0, niche.lower().replace(" ", ""))

        result = broad + mid + niche_tags
        # Real creators don't always use perfectly ordered blocks
        if random.random() > 0.5:
            random.shuffle(result[1:-1])  # keep first/last somewhat stable

        return result[:n]

    def _strip_cliches(self, text: str) -> str:
        result = text
        for pattern in AI_CLICHE_PATTERNS:
            result = re.sub(pattern, "", result, flags=re.IGNORECASE)

        for old, new in AI_CLICHE_REPLACEMENTS.items():
            result = re.sub(re.escape(old), new, result, flags=re.IGNORECASE)

        return result

    def _fix_burstiness(self, text: str) -> str:
        """Break overly uniform sentence lengths."""
        sentences = re.split(r"(?<=[.!?])\s+", text.strip())
        if len(sentences) < 3:
            return text

        lengths = [len(s.split()) for s in sentences]
        avg_len = sum(lengths) / len(lengths)

        # If too uniform (low variance), inject a short punch line
        variance = sum((l - avg_len) ** 2 for l in lengths) / len(lengths)
        if variance < 15 and len(sentences) >= 2:
            punch_lines = ["Honestly?", "Wild.", "Still thinking about this.", "Needed to share."]
            insert_at = random.randint(1, len(sentences) - 1)
            sentences.insert(insert_at, random.choice(punch_lines))

        return " ".join(sentences)

    def _add_natural_imperfections(self, text: str, profile: str) -> str:
        """Subtle human touches — not errors, just personality."""
        if profile in ("casual", "witty") and random.random() > 0.6:
            text = text.replace("you are", "you're").replace("do not", "don't")
            text = text.replace("it is", "it's").replace("cannot", "can't")

        # Occasional ellipsis instead of period (sparingly)
        if profile == "storyteller" and random.random() > 0.7:
            text = re.sub(r"\.\s+([A-Z])", r"... \1", text, count=1)

        return text

    def _normalize_whitespace(self, text: str) -> str:
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r" {2,}", " ", text)
        return text.strip()

    def _ai_likelihood_score(self, text: str) -> float:
        """
        Heuristic score 0-100 where lower = more human-like.
        Not a real AI detector — internal quality metric.
        """
        score = 0.0
        lower = text.lower()

        for pattern in AI_CLICHE_PATTERNS:
            if re.search(pattern, lower):
                score += 8

        for phrase in AI_CLICHE_REPLACEMENTS:
            if phrase in lower:
                score += 5

        sentences = re.split(r"[.!?]+", text)
        sentences = [s for s in sentences if s.strip()]
        if sentences:
            lengths = [len(s.split()) for s in sentences]
            variance = sum((l - sum(lengths) / len(lengths)) ** 2 for l in lengths) / len(lengths)
            if variance < 10:
                score += 15  # too uniform
            if all(10 < l < 25 for l in lengths):
                score += 10  # suspiciously consistent

        if text.count("—") > 1:
            score += 10
        if "•" in text or re.search(r"^\d+\.", text, re.MULTILINE):
            score += 12  # bullet lists
        if not re.search(r"\b(you're|don't|it's|can't|won't|i'm)\b", lower):
            score += 8  # no contractions

        return min(100, score)


content_humanizer = ContentHumanizer()
