import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { AutomationProcessor } from './automation.processor';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

const skipBull = process.env.SKIP_BULLMQ === 'true';

@Module({
  imports: [
    AuditModule,
    NotificationsModule,
    ...(skipBull ? [] : [BullModule.registerQueue({ name: 'automation' })]),
  ],
  controllers: [AutomationController],
  providers: [AutomationService, ...(skipBull ? [] : [AutomationProcessor])],
})
export class AutomationModule {}
