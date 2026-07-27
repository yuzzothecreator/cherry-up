import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  ContentService,
  GenerateCaptionDto,
  SuggestHashtagsDto,
  AnalyzeIdeaDto,
  ReelHookDto,
} from './content.service';
import { CurrentUser, AuthUser } from '../common/current-user.decorator';
import { AiService } from '../ai/ai.service';

@ApiTags('content')
@ApiBearerAuth()
@Controller('content')
export class ContentController {
  constructor(
    private contentService: ContentService,
    private ai: AiService,
  ) {}

  @Post('caption')
  @ApiOperation({ summary: 'Generate Instagram caption' })
  generateCaption(@CurrentUser() user: AuthUser, @Body() dto: GenerateCaptionDto) {
    return this.contentService.generateCaption(user.id, dto);
  }

  @Post('hashtags')
  @ApiOperation({ summary: 'Suggest hashtags' })
  suggestHashtags(@CurrentUser() user: AuthUser, @Body() dto: SuggestHashtagsDto) {
    return this.contentService.suggestHashtags(user.id, dto);
  }

  @Post('analyze-idea')
  @ApiOperation({ summary: 'Analyze content idea' })
  analyzeIdea(@CurrentUser() user: AuthUser, @Body() dto: AnalyzeIdeaDto) {
    return this.contentService.analyzeIdea(user.id, dto);
  }

  @Post('reel-hook')
  @ApiOperation({ summary: 'Generate Reel hook' })
  generateReelHook(@CurrentUser() user: AuthUser, @Body() dto: ReelHookDto) {
    return this.contentService.generateReelHook(user.id, dto);
  }

  @Get('posting-times')
  @ApiOperation({ summary: 'Recommend posting times' })
  recommendPostingTimes(@CurrentUser() user: AuthUser) {
    return this.ai.recommendPostingTimes(user.id, {});
  }

  @Post('analyze-post/:postId')
  @ApiOperation({ summary: 'Analyze why a post performed well' })
  analyzePost(@CurrentUser() user: AuthUser, @Param('postId') postId: string) {
    return this.contentService.analyzePost(user.id, postId);
  }
}
