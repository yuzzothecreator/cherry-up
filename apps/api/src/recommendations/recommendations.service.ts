import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AiService } from '../ai/ai.service';
import { RecommendationType } from '@prisma/client';

@Injectable()
export class RecommendationsService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  async getRecommendations(userId: string, type?: RecommendationType) {
    const account = await this.getAccount(userId);
    return this.prisma.recommendation.findMany({
      where: {
        socialAccountId: account.id,
        ...(type && { type }),
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async generateRecommendations(userId: string) {
    const account = await this.getAccount(userId);
    const posts = await this.prisma.post.findMany({
      where: { socialAccountId: account.id },
      take: 30,
      orderBy: { postedAt: 'desc' },
    });

    const aiResult = await this.ai.getContentRecommendations(userId, {
      username: account.username,
      followerCount: account.followerCount,
      recentPosts: posts,
    });

    const recommendations = [];
    const items = aiResult.recommendations || this.getDefaultRecommendations();

    for (const item of items) {
      const rec = await this.prisma.recommendation.create({
        data: {
          socialAccountId: account.id,
          type: item.type as RecommendationType,
          title: item.title,
          description: item.description,
          priority: item.priority || 5,
          data: item.data || {},
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      recommendations.push(rec);
    }

    return recommendations;
  }

  async markAsRead(userId: string, recommendationId: string) {
    const account = await this.getAccount(userId);
    return this.prisma.recommendation.updateMany({
      where: { id: recommendationId, socialAccountId: account.id },
      data: { isRead: true },
    });
  }

  private async getAccount(userId: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { userId, isConnected: true },
    });
    if (!account) throw new Error('No connected social account found');
    return account;
  }

  private getDefaultRecommendations() {
    return [
      {
        type: 'CONTENT',
        title: 'Create more Reels',
        description: 'Reels typically get 2x more reach than static posts in your niche.',
        priority: 8,
      },
      {
        type: 'POSTING_TIME',
        title: 'Post between 6-8 PM',
        description: 'Your audience is most active during evening hours on weekdays.',
        priority: 7,
      },
      {
        type: 'ENGAGEMENT',
        title: 'Reply to comments within 1 hour',
        description: 'Quick responses boost engagement signals and build community.',
        priority: 6,
      },
    ];
  }
}
