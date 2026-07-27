import { Module } from '@nestjs/common';
import { SocialAccountsController } from './social-accounts.controller';
import { SocialAccountsService } from './social-accounts.service';
import { EncryptionService } from '../common/encryption.service';

@Module({
  controllers: [SocialAccountsController],
  providers: [SocialAccountsService, EncryptionService],
})
export class SocialAccountsModule {}
