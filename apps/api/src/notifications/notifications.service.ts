import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { NotificationType, Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly && { isRead: false }) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ) {
    return this.prisma.notification.create({
      data: { userId, type, title, message, data: (data || {}) as Prisma.InputJsonValue },
    });
  }

  async sendMilestone(userId: string, milestone: string, value: number) {
    return this.create(
      userId,
      NotificationType.MILESTONE,
      `Milestone Reached: ${milestone}`,
      `Congratulations! You've reached ${value.toLocaleString()} ${milestone}.`,
      { milestone, value },
    );
  }

  async sendWeeklyReport(userId: string, reportData: Record<string, unknown>) {
    return this.create(
      userId,
      NotificationType.WEEKLY_REPORT,
      'Your Weekly Growth Report',
      'Your weekly Instagram growth summary is ready.',
      reportData,
    );
  }
}
