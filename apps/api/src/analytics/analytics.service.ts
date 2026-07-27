import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getPostPerformance(userId: string, accountId?: string) {
    const account = await this.getAccount(userId, accountId);
    const posts = await this.prisma.post.findMany({
      where: { socialAccountId: account.id },
      include: { contentAnalysis: true },
      orderBy: { engagementRate: 'desc' },
    });
    return { posts, summary: this.summarizePosts(posts) };
  }

  async compareContentTypes(userId: string, accountId?: string) {
    const account = await this.getAccount(userId, accountId);
    const posts = await this.prisma.post.findMany({
      where: { socialAccountId: account.id },
    });

    const byType = posts.reduce(
      (acc, post) => {
        const type = post.type;
        if (!acc[type]) acc[type] = { count: 0, totalEngagement: 0, totalReach: 0 };
        acc[type].count++;
        acc[type].totalEngagement += post.likes + post.comments + post.shares;
        acc[type].totalReach += post.reach;
        return acc;
      },
      {} as Record<string, { count: number; totalEngagement: number; totalReach: number }>,
    );

    return Object.entries(byType).map(([type, data]) => ({
      type,
      count: data.count,
      avgEngagement: data.count > 0 ? Math.round(data.totalEngagement / data.count) : 0,
      avgReach: data.count > 0 ? Math.round(data.totalReach / data.count) : 0,
    }));
  }

  async getTopTopics(userId: string, accountId?: string) {
    const account = await this.getAccount(userId, accountId);
    const analyses = await this.prisma.contentAnalysis.findMany({
      where: { post: { socialAccountId: account.id } },
      include: { post: true },
    });

    const topicScores: Record<string, { count: number; totalScore: number }> = {};
    for (const analysis of analyses) {
      for (const topic of analysis.topics) {
        if (!topicScores[topic]) topicScores[topic] = { count: 0, totalScore: 0 };
        topicScores[topic].count++;
        topicScores[topic].totalScore += analysis.performanceScore || 0;
      }
    }

    return Object.entries(topicScores)
      .map(([topic, data]) => ({
        topic,
        count: data.count,
        avgScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 20);
  }

  async generateReport(userId: string, startDate: Date, endDate: Date, title?: string) {
    const account = await this.getAccount(userId);
    const posts = await this.prisma.post.findMany({
      where: {
        socialAccountId: account.id,
        postedAt: { gte: startDate, lte: endDate },
      },
    });

    const contentTypes = await this.compareContentTypes(userId, account.id);
    const topTopics = await this.getTopTopics(userId, account.id);

    const report = await this.prisma.analyticsReport.create({
      data: {
        userId,
        title: title || `Analytics Report ${startDate.toISOString().split('T')[0]}`,
        reportType: 'PERFORMANCE',
        periodStart: startDate,
        periodEnd: endDate,
        data: { posts: posts.length, contentTypes, topTopics },
        summary: `Analyzed ${posts.length} posts from ${startDate.toDateString()} to ${endDate.toDateString()}`,
      },
    });

    return report;
  }

  async getReports(userId: string) {
    return this.prisma.analyticsReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getAccount(userId: string, accountId?: string) {
    const account = accountId
      ? await this.prisma.socialAccount.findFirst({ where: { id: accountId, userId } })
      : await this.prisma.socialAccount.findFirst({ where: { userId, isConnected: true } });

    if (!account) throw new Error('No connected social account found');
    return account;
  }

  private summarizePosts(posts: Array<{ likes: number; comments: number; engagementRate: number }>) {
    const total = posts.length;
    if (total === 0) return { totalPosts: 0, avgLikes: 0, avgComments: 0, avgEngagementRate: 0 };
    return {
      totalPosts: total,
      avgLikes: Math.round(posts.reduce((s, p) => s + p.likes, 0) / total),
      avgComments: Math.round(posts.reduce((s, p) => s + p.comments, 0) / total),
      avgEngagementRate:
        Math.round((posts.reduce((s, p) => s + p.engagementRate, 0) / total) * 100) / 100,
    };
  }
}
