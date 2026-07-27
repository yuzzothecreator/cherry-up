import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.module';

@Injectable()
export class AiService {
  private readonly baseUrl: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.baseUrl = this.config.get('AI_SERVICE_URL') || 'http://localhost:8001';
  }

  async generateCaption(userId: string, data: Record<string, unknown>) {
    return this.callAi(userId, '/content/caption', data);
  }

  async suggestHashtags(userId: string, data: Record<string, unknown>) {
    return this.callAi(userId, '/content/hashtags', data);
  }

  async analyzeContentIdea(userId: string, data: Record<string, unknown>) {
    return this.callAi(userId, '/content/analyze-idea', data);
  }

  async generateReelHook(userId: string, data: Record<string, unknown>) {
    return this.callAi(userId, '/content/reel-hook', data);
  }

  async recommendPostingTimes(userId: string, data: Record<string, unknown>) {
    return this.callAi(userId, '/recommendations/posting-times', data);
  }

  async analyzePostPerformance(userId: string, data: Record<string, unknown>) {
    return this.callAi(userId, '/analytics/post-performance', data);
  }

  async getContentRecommendations(userId: string, data: Record<string, unknown>) {
    return this.callAi(userId, '/recommendations/content', data);
  }

  async analyzeCompetitor(userId: string, data: Record<string, unknown>) {
    return this.callAi(userId, '/competitors/analyze', data);
  }

  async scoreAudience(userId: string, data: Record<string, unknown>) {
    return this.callAi(userId, '/audience/score', data);
  }

  private async callAi(userId: string, endpoint: string, data: Record<string, unknown>) {
    const response = await axios.post(`${this.baseUrl}/api/v1${endpoint}`, data, {
      timeout: 60000,
      headers: { 'X-User-Id': userId },
    });

    await this.prisma.aIUsage.create({
      data: {
        userId,
        service: 'openai',
        endpoint,
        tokensUsed: response.data?.tokensUsed || 0,
        cost: response.data?.cost || 0,
        requestData: data as Prisma.InputJsonValue,
        responseMeta: { status: response.status },
      },
    });

    return response.data;
  }
}
