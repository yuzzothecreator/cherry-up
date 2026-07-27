import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { EncryptionService } from '../common/encryption.service';

@Injectable()
export class SocialAccountsService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  async connect(userId: string, username: string, accessToken?: string) {
    const cleanUsername = username.replace('@', '');

    return this.prisma.socialAccount.upsert({
      where: {
        userId_platform_username: {
          userId,
          platform: 'INSTAGRAM',
          username: cleanUsername,
        },
      },
      create: {
        userId,
        username: cleanUsername,
        displayName: cleanUsername,
        isConnected: true,
        accessTokenEnc: accessToken ? this.encryption.encrypt(accessToken) : null,
        lastSyncedAt: new Date(),
        followerCount: 0,
      },
      update: {
        isConnected: true,
        accessTokenEnc: accessToken ? this.encryption.encrypt(accessToken) : undefined,
        lastSyncedAt: new Date(),
      },
    });
  }

  async getAccounts(userId: string) {
    return this.prisma.socialAccount.findMany({
      where: { userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        platform: true,
        isConnected: true,
        followerCount: true,
        followingCount: true,
        postCount: true,
        lastSyncedAt: true,
      },
    });
  }

  async disconnect(userId: string, accountId: string) {
    return this.prisma.socialAccount.updateMany({
      where: { id: accountId, userId },
      data: { isConnected: false, accessTokenEnc: null },
    });
  }
}
