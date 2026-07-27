import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { AutomationProcessor } from './automation.processor';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    AuditModule,
    NotificationsModule,
    BullModule.registerQueue({ name: 'automation' }),
  ],
  controllers: [AutomationController],
  providers: [AutomationService, AutomationProcessor],
})
export class AutomationModule {}
