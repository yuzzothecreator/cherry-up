import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CompetitorsService } from './competitors.service';
import { CurrentUser, AuthUser } from '../common/current-user.decorator';

class AddCompetitorDto {
  @IsString()
  username: string;
}

@ApiTags('competitors')
@ApiBearerAuth()
@Controller('competitors')
export class CompetitorsController {
  constructor(private competitorsService: CompetitorsService) {}

  @Get()
  @ApiOperation({ summary: 'List tracked competitors' })
  list(@CurrentUser() user: AuthUser, @Query('accountId') accountId?: string) {
    return this.competitorsService.getCompetitors(user.id, accountId);
  }

  @Post()
  @ApiOperation({ summary: 'Add competitor to track' })
  add(
    @CurrentUser() user: AuthUser,
    @Body() dto: AddCompetitorDto,
    @Query('accountId') accountId?: string,
  ) {
    return this.competitorsService.addCompetitor(user.id, dto.username, accountId);
  }

  @Post(':id/analyze')
  @ApiOperation({ summary: 'Analyze competitor' })
  analyze(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.competitorsService.analyzeCompetitor(user.id, id);
  }

  @Post('strategy-report')
  @ApiOperation({ summary: 'Generate competitor strategy report' })
  strategyReport(@CurrentUser() user: AuthUser, @Query('accountId') accountId?: string) {
    return this.competitorsService.generateStrategyReport(user.id, accountId);
  }
}
