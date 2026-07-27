import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RecommendationType } from '@prisma/client';
import { RecommendationsService } from './recommendations.service';
import { CurrentUser, AuthUser } from '../common/current-user.decorator';

@ApiTags('recommendations')
@ApiBearerAuth()
@Controller('recommendations')
export class RecommendationsController {
  constructor(private recommendationsService: RecommendationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get growth recommendations' })
  getAll(@CurrentUser() user: AuthUser, @Query('type') type?: RecommendationType) {
    return this.recommendationsService.getRecommendations(user.id, type);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate new AI recommendations' })
  generate(@CurrentUser() user: AuthUser) {
    return this.recommendationsService.generateRecommendations(user.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark recommendation as read' })
  markRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.recommendationsService.markAsRead(user.id, id);
  }
}
