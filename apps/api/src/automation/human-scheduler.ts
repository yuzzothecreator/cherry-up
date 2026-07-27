/**
 * Human-like scheduling algorithms for approved automation actions.
 * Models natural timing patterns — irregular intervals, non-round minutes,
 * activity-window alignment. Does NOT automate spam or evade platform security.
 */

const ACTIVITY_CURVE: Record<number, number> = {
  0: 0.15, 6: 0.35, 7: 0.55, 8: 0.65, 9: 0.7, 10: 0.72, 11: 0.75,
  12: 0.8, 13: 0.7, 14: 0.65, 15: 0.68, 16: 0.72, 17: 0.78,
  18: 0.9, 19: 0.95, 20: 0.92, 21: 0.85, 22: 0.6, 23: 0.3,
};

const HUMAN_MINUTES = [3, 7, 11, 14, 17, 19, 23, 27, 31, 37, 41, 43, 47, 52, 56];

export class HumanScheduler {
  /** Compute next action time with log-normal jitter and activity-window snapping */
  static scheduleNext(baseDelayMinutes = 60, lastActionAt?: Date): Date {
    const now = new Date();
    const jitterFactor = this.logNormalSample(1.0, 0.35);
    let delay = baseDelayMinutes * jitterFactor;
    delay = Math.max(15, Math.min(delay, baseDelayMinutes * 3));

    let target = new Date(now.getTime() + delay * 60000);
    target = this.snapToActiveWindow(target);
    target = this.applyHumanMinute(target);

    if (lastActionAt) {
      const minGap = (25 + Math.floor(Math.random() * 30)) * 60000;
      if (target.getTime() - lastActionAt.getTime() < minGap) {
        target = new Date(lastActionAt.getTime() + minGap);
        target = this.applyHumanMinute(target);
      }
    }

    return target;
  }

  /** Score how naturally spread activity timestamps are */
  static scoreActivitySpread(timestamps: Date[]): {
    score: number;
    flags: string[];
    verdict: 'natural' | 'needs_variation' | 'robotic_pattern';
  } {
    if (timestamps.length < 2) {
      return { score: 100, flags: [], verdict: 'natural' };
    }

    const flags: string[] = [];
    const intervals: number[] = [];

    for (let i = 1; i < timestamps.length; i++) {
      intervals.push((timestamps[i].getTime() - timestamps[i - 1].getTime()) / 60000);
    }

    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((s, x) => s + (x - avg) ** 2, 0) / intervals.length;
    if (variance < 5) flags.push('intervals_too_uniform');

    const roundCount = timestamps.filter((t) => [0, 15, 30, 45].includes(t.getMinutes())).length;
    if (roundCount > timestamps.length * 0.5) flags.push('too_many_round_minutes');

    const score = Math.max(0, 100 - flags.length * 25 - roundCount * 5);
    const verdict =
      score >= 70 ? 'natural' : score >= 40 ? 'needs_variation' : 'robotic_pattern';

    return { score, flags, verdict };
  }

  private static logNormalSample(mean: number, sigma: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.exp(mean + sigma * z);
  }

  private static snapToActiveWindow(dt: Date): Date {
    const hour = dt.getHours();
    if ((ACTIVITY_CURVE[hour] ?? 0) >= 0.3) return dt;

    for (let offset = 1; offset <= 8; offset++) {
      const nextHour = (hour + offset) % 24;
      if ((ACTIVITY_CURVE[nextHour] ?? 0) >= 0.6) {
        const snapped = new Date(dt);
        snapped.setHours(nextHour);
        return snapped;
      }
    }
    return dt;
  }

  private static applyHumanMinute(dt: Date): Date {
    const result = new Date(dt);
    const minute = result.getMinutes();
    if ([0, 15, 30, 45].includes(minute)) {
      result.setMinutes(HUMAN_MINUTES[Math.floor(Math.random() * HUMAN_MINUTES.length)]);
    }
    result.setSeconds(3 + Math.floor(Math.random() * 44));
    result.setMilliseconds(0);
    return result;
  }
}
