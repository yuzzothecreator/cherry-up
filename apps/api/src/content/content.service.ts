import { Injectable } from '@nestjs/common';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AiService } from '../ai/ai.service';

export class GenerateCaptionDto {
  @ApiProperty()
  @IsString()
  topic: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niche?: string;

  @ApiProperty({ required: false, enum: ['casual', 'storyteller', 'expert', 'witty', 'warm'] })
  @IsOptional()
  @IsString()
  voiceProfile?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  humanize?: boolean;
}

export class SuggestHashtagsDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  niche?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  count?: number;
}

export class AnalyzeIdeaDto {
  @ApiProperty()
  @IsString()
  idea: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  targetAudience?: string;
}

export class ReelHookDto {
  @ApiProperty()
  @IsString()
  topic: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  style?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  voiceProfile?: string;
}

export class HumanizeTextDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  voiceProfile?: string;
}

@Injectable()
export class ContentService {
  constructor(private ai: AiService) {}

  generateCaption(userId: string, dto: GenerateCaptionDto) {
    return this.ai.generateCaption(userId, dto as unknown as Record<string, unknown>);
  }

  suggestHashtags(userId: string, dto: SuggestHashtagsDto) {
    return this.ai.suggestHashtags(userId, dto as unknown as Record<string, unknown>);
  }

  analyzeIdea(userId: string, dto: AnalyzeIdeaDto) {
    return this.ai.analyzeContentIdea(userId, dto as unknown as Record<string, unknown>);
  }

  generateReelHook(userId: string, dto: ReelHookDto) {
    return this.ai.generateReelHook(userId, dto as unknown as Record<string, unknown>);
  }

  humanizeText(userId: string, dto: HumanizeTextDto) {
    return this.ai.humanizeText(userId, dto as unknown as Record<string, unknown>);
  }

  getVoiceProfiles(userId: string) {
    return this.ai.getVoiceProfiles(userId);
  }

  async analyzePost(userId: string, postId: string) {
    return this.ai.analyzePostPerformance(userId, { postId });
  }
}
