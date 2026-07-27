import { HumanScheduler } from './human-scheduler';

describe('HumanScheduler', () => {
  it('should schedule with non-round minutes', () => {
    const scheduled = HumanScheduler.scheduleNext(60);
    expect([0, 15, 30, 45]).not.toContain(scheduled.getMinutes());
  });

  it('should detect robotic interval patterns', () => {
    const base = new Date('2026-01-01T18:00:00Z');
    const robotic = Array.from({ length: 5 }, (_, i) => new Date(base.getTime() + i * 3600000));
    const result = HumanScheduler.scoreActivitySpread(robotic);
    expect(result.flags).toContain('intervals_too_uniform');
  });

  it('should respect minimum gap from last action', () => {
    const lastAction = new Date(Date.now() - 5 * 60000);
    const scheduled = HumanScheduler.scheduleNext(20, lastAction);
    expect(scheduled.getTime() - lastAction.getTime()).toBeGreaterThanOrEqual(25 * 60000);
  });
});
