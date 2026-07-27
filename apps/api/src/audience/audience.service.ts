import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AudienceService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async getInsights(userId: string, accountId?: string) {
    const account = await this.getAccount(userId, accountId);
    return this.prisma.audienceInsight.findMany({
      where: { socialAccountId: account.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async calculateAudienceScore(userId: string, accountId?: string) {
    const account = await this.getAccount(userId, accountId);
    const posts = await this.prisma.post.findMany({
      where: { socialAccountId: account.id },
      take: 50,
      orderBy: { postedAt: 'desc' },
    });

    const aiResult = await this.ai.scoreAudience(userId, {
      username: account.username,
      followerCount: account.followerCount,
      posts: posts.map((p) => ({
        type: p.type,
        engagementRate: p.engagementRate,
        hashtags: p.hashtags,
      })),
    });

    const scores = aiResult.scores || {
      interestRelevance: 75,
      engagementActivity: 68,
      accountQuality: 82,
      nicheSimilarity: 71,
    };

    const audienceScore =
      (scores.interestRelevance +
        scores.engagementActivity +
        scores.accountQuality +
        scores.nicheSimilarity) /
      4;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const insight = await this.prisma.audienceInsight.create({
      data: {
        socialAccountId: account.id,
        interestRelevance: scores.interestRelevance,
        engagementActivity: scores.engagementActivity,
        accountQuality: scores.accountQuality,
        nicheSimilarity: scores.nicheSimilarity,
        audienceScore: Math.round(audienceScore * 100) / 100,
        topInterests: aiResult.topInterests || [],
        demographics: aiResult.demographics || {},
        activeHours: aiResult.activeHours || {},
        insights: aiResult.insights || {},
        periodStart: thirtyDaysAgo,
        periodEnd: now,
      },
    });

    return insight;
  }

  private async getAccount(userId: string, accountId?: string) {
    const account = accountId
      ? await this.prisma.socialAccount.findFirst({ where: { id: accountId, userId } })
      : await this.prisma.socialAccount.findFirst({ where: { userId, isConnected: true } });
    if (!account) throw new Error('No connected social account found');
    return account;
  }
}
