"""
Human behavior patterns for ethical scheduling and activity timing.

Models natural posting cadence — irregular intervals, non-round times,
weekday preferences — without automating spam or policy-violating actions.
"""

import random
import math
from datetime import datetime, timedelta
from typing import Optional

# Typical human activity curve (hour -> relative activity 0-1)
DEFAULT_ACTIVITY_CURVE = {
    0: 0.15, 1: 0.08, 2: 0.05, 3: 0.04, 4: 0.05, 5: 0.12,
    6: 0.35, 7: 0.55, 8: 0.65, 9: 0.70, 10: 0.72, 11: 0.75,
    12: 0.80, 13: 0.70, 14: 0.65, 15: 0.68, 16: 0.72, 17: 0.78,
    18: 0.90, 19: 0.95, 20: 0.92, 21: 0.85, 22: 0.60, 23: 0.30,
}

# Day-of-week multipliers (0=Monday)
DAY_MULTIPLIERS = {
    0: 0.85,   # Monday — slower start
    1: 0.95,   # Tuesday
    2: 1.0,    # Wednesday — peak midweek
    3: 0.98,   # Thursday
    4: 0.80,   # Friday — people go out
    5: 0.70,   # Saturday
    6: 0.75,   # Sunday — planning mode
}


class HumanBehaviorEngine:
    """Generates human-like timing patterns for approved scheduling actions."""

    def get_optimal_posting_windows(
        self,
        timezone: str = "UTC",
        audience_hours: Optional[dict] = None,
        count: int = 5,
    ) -> list[dict]:
        """Return ranked posting windows with human-readable reasoning."""
        curve = self._merge_activity_curve(audience_hours)
        windows = []

        for hour, activity in sorted(curve.items(), key=lambda x: -x[1]):
            day_bonus = max(DAY_MULTIPLIERS.values())
            score = round(activity * day_bonus * 100, 1)

            # Humans post at odd minutes, not :00
            minute = self._human_minute()
            windows.append({
                "hour": hour,
                "minute": minute,
                "time": f"{hour:02d}:{minute:02d}",
                "score": score,
                "reason": self._window_reason(hour, activity),
            })

        return windows[:count]

    def schedule_next_action(
        self,
        base_delay_minutes: int = 60,
        user_timezone: str = "UTC",
        last_action_at: Optional[datetime] = None,
    ) -> datetime:
        """
        Compute next action time with human-like irregularity.
        Uses log-normal jitter — humans cluster around intervals but vary.
        """
        now = datetime.utcnow()

        # Log-normal jitter: most delays near base, some much longer
        jitter_factor = random.lognormvariate(math.log(1.0), 0.35)
        delay = base_delay_minutes * jitter_factor
        delay = max(15, min(delay, base_delay_minutes * 3))  # bounds

        target = now + timedelta(minutes=delay)

        # Snap to human activity window if outside active hours
        target = self._snap_to_active_window(target)

        # Avoid round minutes
        target = target.replace(
            minute=self._human_minute(target.minute),
            second=random.randint(3, 47),
            microsecond=0,
        )

        # Don't schedule too close to last action
        if last_action_at:
            min_gap = timedelta(minutes=random.randint(25, 55))
            if target - last_action_at < min_gap:
                target = last_action_at + min_gap

        return target

    def get_weekly_cadence(self, posts_per_week: int = 4) -> list[dict]:
        """
        Suggest a non-robotic weekly posting cadence.
        Real creators skip days and vary frequency.
        """
        days = list(range(7))
        random.shuffle(days)

        # Don't post every day — leave 2-3 rest days
        rest_days = random.sample(days, k=random.randint(2, 3))
        post_days = [d for d in days if d not in rest_days][:posts_per_week]

        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        cadence = []

        for day in sorted(post_days):
            hour = self._weighted_hour_pick()
            cadence.append({
                "day": day_names[day],
                "dayIndex": day,
                "hour": hour,
                "minute": self._human_minute(),
                "note": "organic slot" if random.random() > 0.3 else "peak audience window",
            })

        return cadence

    def activity_spread_score(self, action_times: list[datetime]) -> dict:
        """
        Score how naturally spread user activity is (higher = more human).
        Flags robotic patterns like exact intervals or round minutes.
        """
        if len(action_times) < 2:
            return {"score": 100, "flags": [], "verdict": "natural"}

        flags = []
        intervals = []
        for i in range(1, len(action_times)):
            delta = (action_times[i] - action_times[i - 1]).total_seconds() / 60
            intervals.append(delta)

        # Check for robotic equal intervals
        if intervals:
            avg = sum(intervals) / len(intervals)
            variance = sum((x - avg) ** 2 for x in intervals) / len(intervals)
            if variance < 5:
                flags.append("intervals_too_uniform")

        round_minutes = sum(1 for t in action_times if t.minute in (0, 15, 30, 45))
        if round_minutes > len(action_times) * 0.5:
            flags.append("too_many_round_minutes")

        score = max(0, 100 - len(flags) * 25 - round_minutes * 5)
        verdict = "natural" if score >= 70 else "needs_variation" if score >= 40 else "robotic_pattern"

        return {"score": score, "flags": flags, "verdict": verdict}

    def _merge_activity_curve(self, audience_hours: Optional[dict]) -> dict:
        if not audience_hours:
            return DEFAULT_ACTIVITY_CURVE.copy()

        merged = DEFAULT_ACTIVITY_CURVE.copy()
        max_val = max(float(v) for v in audience_hours.values()) if audience_hours else 1
        for hour_str, val in audience_hours.items():
            h = int(hour_str)
            if 0 <= h <= 23:
                merged[h] = (merged[h] + float(val) / max_val) / 2
        return merged

    def _human_minute(self, base: int = 0) -> int:
        """Pick minutes humans actually use — not :00 or :30."""
        human_minutes = [3, 7, 11, 14, 17, 19, 23, 27, 31, 37, 41, 43, 47, 52, 56]
        if base in (0, 15, 30, 45):
            return random.choice(human_minutes)
        return base if base not in (0, 15, 30, 45) else random.choice(human_minutes)

    def _weighted_hour_pick(self) -> int:
        curve = DEFAULT_ACTIVITY_CURVE
        hours = list(curve.keys())
        weights = [curve[h] for h in hours]
        return random.choices(hours, weights=weights, k=1)[0]

    def _snap_to_active_window(self, dt: datetime) -> datetime:
        hour = dt.hour
        if DEFAULT_ACTIVITY_CURVE.get(hour, 0) < 0.3:
            # Move to next active window
            for offset in range(1, 8):
                next_hour = (hour + offset) % 24
                if DEFAULT_ACTIVITY_CURVE.get(next_hour, 0) >= 0.6:
                    dt = dt.replace(hour=next_hour)
                    break
        return dt

    def _window_reason(self, hour: int, activity: float) -> str:
        if hour in (18, 19, 20, 21):
            return "Evening scroll peak — high organic reach"
        if hour in (7, 8, 12):
            return "Commute/lunch check-in window"
        if activity >= 0.8:
            return "Strong audience activity detected"
        return "Moderate engagement window"


human_behavior = HumanBehaviorEngine()
