import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { AutomationActionType, AutomationStatus, AuditAction, Prisma } from '@prisma/client';
import { HumanScheduler } from './human-scheduler';

const RATE_LIMITS: Record<AutomationActionType, { maxPerHour: number; minIntervalMs: number }> = {
  SCHEDULE_POST: { maxPerHour: 3, minIntervalMs: 3600000 },
  DRAFT_CAPTION: { maxPerHour: 20, minIntervalMs: 60000 },
  SUGGEST_HASHTAGS: { maxPerHour: 30, minIntervalMs: 30000 },
  ANALYZE_CONTENT: { maxPerHour: 15, minIntervalMs: 120000 },
  COMPETITOR_SCAN: { maxPerHour: 5, minIntervalMs: 600000 },
};

const BLOCKED_ACTIONS = ['mass_follow', 'mass_unfollow', 'mass_dm', 'spam_comment', 'bot_like'];

@Injectable()
export class AutomationService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async createAction(
    userId: string,
    type: AutomationActionType,
    payload: Record<string, unknown>,
    socialAccountId?: string,
  ) {
    this.validatePayload(type, payload);

    const rateLimitKey = `${userId}:${type}`;
    await this.checkRateLimit(userId, type, rateLimitKey);

    const trustScore = await this.calculateTrustScore(userId);

    const lastAction = await this.prisma.automationAction.findFirst({
      where: { userId, type },
      orderBy: { createdAt: 'desc' },
    });

    const action = await this.prisma.automationAction.create({
      data: {
        userId,
        socialAccountId,
        type,
        status: AutomationStatus.PENDING_APPROVAL,
        payload: payload as Prisma.InputJsonValue,
        trustScore,
        rateLimitKey,
        scheduledFor: payload.scheduledFor
          ? new Date(payload.scheduledFor as string)
          : HumanScheduler.scheduleNext(this.getBaseDelay(type), lastAction?.createdAt),
      },
    });

    await this.audit.log({
      userId,
      action: AuditAction.CREATE,
      resource: 'automation_action',
      resourceId: action.id,
      details: { type, status: 'PENDING_APPROVAL' },
    });

    return action;
  }

  async approveAction(userId: string, actionId: string) {
    const action = await this.getActionForUser(userId, actionId);
    if (action.status !== AutomationStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Action is not pending approval');
    }

    if (action.trustScore < 50) {
      throw new ForbiddenException('Trust score too low for automated actions');
    }

    const updated = await this.prisma.automationAction.update({
      where: { id: actionId },
      data: {
        status: AutomationStatus.APPROVED,
        approvedAt: new Date(),
      },
    });

    await this.audit.log({
      userId,
      action: AuditAction.APPROVE,
      resource: 'automation_action',
      resourceId: actionId,
    });

    return updated;
  }

  async rejectAction(userId: string, actionId: string, reason?: string) {
    const action = await this.getActionForUser(userId, actionId);

    const updated = await this.prisma.automationAction.update({
      where: { id: actionId },
      data: {
        status: AutomationStatus.REJECTED,
        rejectedAt: new Date(),
        failureReason: reason,
      },
    });

    await this.audit.log({
      userId,
      action: AuditAction.REJECT,
      resource: 'automation_action',
      resourceId: actionId,
    });

    return updated;
  }

  async getActions(userId: string, status?: AutomationStatus) {
    return this.prisma.automationAction.findMany({
      where: { userId, ...(status && { status }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTrustScore(userId: string) {
    const trustScore = await this.calculateTrustScore(userId);
    const recentActions = await this.prisma.automationAction.findMany({
      where: { userId, scheduledFor: { not: null } },
      orderBy: { scheduledFor: 'desc' },
      take: 10,
      select: { scheduledFor: true },
    });

    const timestamps = recentActions
      .map((a) => a.scheduledFor)
      .filter((d): d is Date => d !== null);

    const naturalness = HumanScheduler.scoreActivitySpread(timestamps);

    return { trustScore, activityNaturalness: naturalness };
  }

  private validatePayload(type: AutomationActionType, payload: Record<string, unknown>) {
    const payloadStr = JSON.stringify(payload).toLowerCase();
    for (const blocked of BLOCKED_ACTIONS) {
      if (payloadStr.includes(blocked)) {
        throw new ForbiddenException('This action type violates platform policies');
      }
    }
  }

  private async checkRateLimit(userId: string, type: AutomationActionType, key: string) {
    const limits = RATE_LIMITS[type];
    const oneHourAgo = new Date(Date.now() - 3600000);

    const recentCount = await this.prisma.automationAction.count({
      where: { userId, type, createdAt: { gte: oneHourAgo } },
    });

    if (recentCount >= limits.maxPerHour) {
      throw new BadRequestException(`Rate limit exceeded: max ${limits.maxPerHour} ${type} actions per hour`);
    }

    const lastAction = await this.prisma.automationAction.findFirst({
      where: { rateLimitKey: key },
      orderBy: { createdAt: 'desc' },
    });

    if (lastAction && Date.now() - lastAction.createdAt.getTime() < limits.minIntervalMs) {
      throw new BadRequestException('Please wait before performing another action of this type');
    }
  }

  private async calculateTrustScore(userId: string): Promise<number> {
    const [approved, rejected, total] = await Promise.all([
      this.prisma.automationAction.count({
        where: { userId, status: AutomationStatus.APPROVED },
      }),
      this.prisma.automationAction.count({
        where: { userId, status: AutomationStatus.REJECTED },
      }),
      this.prisma.automationAction.count({ where: { userId } }),
    ]);

    if (total === 0) return 100;
    const approvalRate = approved / total;
    const rejectionPenalty = rejected * 5;
    return Math.max(0, Math.min(100, Math.round(approvalRate * 100 - rejectionPenalty)));
  }

  private getBaseDelay(type: AutomationActionType): number {
    const delays: Record<AutomationActionType, number> = {
      SCHEDULE_POST: 90,
      DRAFT_CAPTION: 20,
      SUGGEST_HASHTAGS: 15,
      ANALYZE_CONTENT: 45,
      COMPETITOR_SCAN: 120,
    };
    return delays[type];
  }

  private async getActionForUser(userId: string, actionId: string) {
    const action = await this.prisma.automationAction.findFirst({
      where: { id: actionId, userId },
    });
    if (!action) throw new BadRequestException('Action not found');
    return action;
  }
}
