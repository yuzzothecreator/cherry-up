import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { NotificationsService } from '../notifications/notifications.service';
import { AutomationStatus } from '@prisma/client';

@Injectable()
@Processor('automation')
export class AutomationProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {
    super();
  }

  async process(job: Job<{ actionId: string }>) {
    const action = await this.prisma.automationAction.findUnique({
      where: { id: job.data.actionId },
    });

    if (!action || action.status !== AutomationStatus.APPROVED) return;

    await this.prisma.automationAction.update({
      where: { id: action.id },
      data: { status: AutomationStatus.EXECUTED, executedAt: new Date() },
    });

    await this.notifications.create(
      action.userId,
      'DASHBOARD',
      'Automation Executed',
      `Your ${action.type.replace('_', ' ').toLowerCase()} action has been completed.`,
    );
  }
}
