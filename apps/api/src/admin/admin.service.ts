import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers(page = 1, limit = 20) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          profile: true,
          subscription: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, limit };
  }

  async updateUser(userId: string, data: { isActive?: boolean; role?: UserRole }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async getSubscriptions(page = 1, limit = 20) {
    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count(),
    ]);
    return { subscriptions, total, page, limit };
  }

  async getSystemAnalytics() {
    const [totalUsers, activeUsers, totalPosts, aiUsage] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.post.count(),
      this.prisma.aIUsage.aggregate({
        _sum: { tokensUsed: true, cost: true },
        _count: true,
      }),
    ]);

    const planDistribution = await this.prisma.subscription.groupBy({
      by: ['plan'],
      _count: true,
    });

    return {
      totalUsers,
      activeUsers,
      totalPosts,
      aiUsage: {
        totalRequests: aiUsage._count,
        totalTokens: aiUsage._sum.tokensUsed || 0,
        totalCost: aiUsage._sum.cost || 0,
      },
      planDistribution,
    };
  }

  async getAiUsage(page = 1, limit = 50) {
    const [usage, total] = await Promise.all([
      this.prisma.aIUsage.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.aIUsage.count(),
    ]);
    return { usage, total, page, limit };
  }
}
