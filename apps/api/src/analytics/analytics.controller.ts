import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser, AuthUser } from '../common/current-user.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Track post performance' })
  getPostPerformance(@CurrentUser() user: AuthUser, @Query('accountId') accountId?: string) {
    return this.analyticsService.getPostPerformance(user.id, accountId);
  }

  @Get('content-types')
  @ApiOperation({ summary: 'Compare content types' })
  compareContentTypes(@CurrentUser() user: AuthUser, @Query('accountId') accountId?: string) {
    return this.analyticsService.compareContentTypes(user.id, accountId);
  }

  @Get('topics')
  @ApiOperation({ summary: 'Find best-performing topics' })
  getTopTopics(@CurrentUser() user: AuthUser, @Query('accountId') accountId?: string) {
    return this.analyticsService.getTopTopics(user.id, accountId);
  }

  @Post('reports')
  @ApiOperation({ summary: 'Generate analytics report' })
  generateReport(
    @CurrentUser() user: AuthUser,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('title') title?: string,
  ) {
    return this.analyticsService.generateReport(
      user.id,
      new Date(startDate),
      new Date(endDate),
      title,
    );
  }

  @Get('reports')
  @ApiOperation({ summary: 'List analytics reports' })
  getReports(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getReports(user.id);
  }
}
