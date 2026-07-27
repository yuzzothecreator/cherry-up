import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(userId: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { userId, isConnected: true },
      include: {
        posts: { orderBy: { postedAt: 'desc' }, take: 10 },
        audienceInsights: { orderBy: { createdAt: 'desc' }, take: 1 },
        recommendations: {
          where: { isRead: false },
          orderBy: { priority: 'desc' },
          take: 5,
        },
      },
    });

    if (!account) {
      return this.getEmptyDashboard();
    }

    const health = await this.prisma.accountHealth.findUnique({
      where: { socialAccountId: account.id },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPosts = await this.prisma.post.findMany({
      where: { socialAccountId: account.id, postedAt: { gte: thirtyDaysAgo } },
    });

    const totalEngagement = recentPosts.reduce(
      (sum, p) => sum + p.likes + p.comments + p.shares + p.saves,
      0,
    );
    const avgEngagementRate =
      recentPosts.length > 0
        ? recentPosts.reduce((sum, p) => sum + p.engagementRate, 0) / recentPosts.length
        : 0;

    const growthRate = this.calculateGrowthRate(account.followerCount, account.metadata);

    return {
      account: {
        username: account.username,
        displayName: account.displayName,
        followerCount: account.followerCount,
        followingCount: account.followingCount,
        postCount: account.postCount,
      },
      metrics: {
        totalFollowers: account.followerCount,
        growthRate,
        engagementRate: Math.round(avgEngagementRate * 100) / 100,
        totalEngagement,
        postsThisMonth: recentPosts.length,
      },
      accountHealth: health || {
        overallScore: 72,
        contentScore: 75,
        engagementScore: 68,
        growthScore: 70,
        consistencyScore: 74,
      },
      recentPosts: account.posts,
      audienceInsight: account.audienceInsights[0] || null,
      recommendations: account.recommendations,
    };
  }

  private calculateGrowthRate(current: number, metadata: unknown): number {
    const meta = metadata as Record<string, unknown>;
    const previous = (meta?.previousFollowerCount as number) || current * 0.95;
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 10000) / 100;
  }

  private getEmptyDashboard() {
    return {
      account: null,
      metrics: {
        totalFollowers: 0,
        growthRate: 0,
        engagementRate: 0,
        totalEngagement: 0,
        postsThisMonth: 0,
      },
      accountHealth: {
        overallScore: 0,
        contentScore: 0,
        engagementScore: 0,
        growthScore: 0,
        consistencyScore: 0,
      },
      recentPosts: [],
      audienceInsight: null,
      recommendations: [],
      message: 'Connect your Instagram account to see analytics',
    };
  }
}
