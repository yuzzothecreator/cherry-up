import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { AutomationActionType, AutomationStatus } from '@prisma/client';
import { AutomationService } from './automation.service';
import { CurrentUser, AuthUser } from '../common/current-user.decorator';

class CreateAutomationDto {
  @IsEnum(AutomationActionType)
  type: AutomationActionType;

  @IsObject()
  payload: Record<string, unknown>;

  @IsOptional()
  @IsString()
  socialAccountId?: string;
}

@ApiTags('automation')
@ApiBearerAuth()
@Controller('automation')
export class AutomationController {
  constructor(private automationService: AutomationService) {}

  @Post()
  @ApiOperation({ summary: 'Create automation action (requires approval)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAutomationDto) {
    return this.automationService.createAction(
      user.id,
      dto.type,
      dto.payload,
      dto.socialAccountId,
    );
  }

  @Get('trust-score')
  @ApiOperation({ summary: 'Get user trust score' })
  getTrustScore(@CurrentUser() user: AuthUser) {
    return this.automationService.getTrustScore(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List automation actions' })
  list(@CurrentUser() user: AuthUser, @Query('status') status?: AutomationStatus) {
    return this.automationService.getActions(user.id, status);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve automation action' })
  approve(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.automationService.approveAction(user.id, id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject automation action' })
  reject(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.automationService.rejectAction(user.id, id, reason);
  }

}
