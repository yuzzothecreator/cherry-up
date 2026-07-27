import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AiService } from '../ai/ai.service';

@Injectable()
export class CompetitorsService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async addCompetitor(userId: string, username: string, accountId?: string) {
    const account = await this.getAccount(userId, accountId);
    return this.prisma.competitor.create({
      data: { socialAccountId: account.id, username: username.replace('@', '') },
    });
  }

  async getCompetitors(userId: string, accountId?: string) {
    const account = await this.getAccount(userId, accountId);
    return this.prisma.competitor.findMany({
      where: { socialAccountId: account.id },
      orderBy: { engagementRate: 'desc' },
    });
  }

  async analyzeCompetitor(userId: string, competitorId: string) {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id: competitorId },
      include: { socialAccount: true },
    });

    if (!competitor || competitor.socialAccount.userId !== userId) {
      throw new Error('Competitor not found');
    }

    const aiResult = await this.ai.analyzeCompetitor(userId, {
      username: competitor.username,
      followerCount: competitor.followerCount,
    });

    return this.prisma.competitor.update({
      where: { id: competitorId },
      data: {
        engagementRate: aiResult.engagementRate || competitor.engagementRate,
        postFrequency: aiResult.postFrequency || competitor.postFrequency,
        topTopics: aiResult.topTopics || [],
        contentPatterns: aiResult.contentPatterns || {},
        lastAnalyzedAt: new Date(),
      },
    });
  }

  async generateStrategyReport(userId: string, accountId?: string) {
    const account = await this.getAccount(userId, accountId);
    const competitors = await this.prisma.competitor.findMany({
      where: { socialAccountId: account.id },
    });

    const report = await this.prisma.analyticsReport.create({
      data: {
        userId,
        title: 'Competitor Strategy Report',
        reportType: 'COMPETITOR',
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(),
        data: { competitors, account: { username: account.username } },
        summary: `Analyzed ${competitors.length} competitors for @${account.username}`,
      },
    });

    return report;
  }

  private async getAccount(userId: string, accountId?: string) {
    const account = accountId
      ? await this.prisma.socialAccount.findFirst({ where: { id: accountId, userId } })
      : await this.prisma.socialAccount.findFirst({ where: { userId, isConnected: true } });
    if (!account) throw new Error('No connected social account found');
    return account;
  }
}
