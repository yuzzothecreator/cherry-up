import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AudienceService } from './audience.service';
import { CurrentUser, AuthUser } from '../common/current-user.decorator';

@ApiTags('audience')
@ApiBearerAuth()
@Controller('audience')
export class AudienceController {
  constructor(private audienceService: AudienceService) {}

  @Get('insights')
  @ApiOperation({ summary: 'Get audience insights' })
  getInsights(@CurrentUser() user: AuthUser, @Query('accountId') accountId?: string) {
    return this.audienceService.getInsights(user.id, accountId);
  }

  @Post('score')
  @ApiOperation({ summary: 'Calculate audience score' })
  calculateScore(@CurrentUser() user: AuthUser, @Query('accountId') accountId?: string) {
    return this.audienceService.calculateAudienceScore(user.id, accountId);
  }
}
