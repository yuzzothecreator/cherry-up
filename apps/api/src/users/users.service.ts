import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
        subscription: true,
        socialAccounts: {
          select: {
            id: true,
            username: true,
            platform: true,
            isConnected: true,
            followerCount: true,
          },
        },
      },
    });
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; timezone?: string; company?: string }) {
    return this.prisma.profile.update({
      where: { userId },
      data,
    });
  }
}
