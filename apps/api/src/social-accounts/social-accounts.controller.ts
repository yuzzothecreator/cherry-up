import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { SocialAccountsService } from './social-accounts.service';
import { CurrentUser, AuthUser } from '../common/current-user.decorator';

class ConnectAccountDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  accessToken?: string;
}

@ApiTags('social-accounts')
@ApiBearerAuth()
@Controller('social-accounts')
export class SocialAccountsController {
  constructor(private socialAccountsService: SocialAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List connected accounts' })
  list(@CurrentUser() user: AuthUser) {
    return this.socialAccountsService.getAccounts(user.id);
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect Instagram account' })
  connect(@CurrentUser() user: AuthUser, @Body() dto: ConnectAccountDto) {
    return this.socialAccountsService.connect(user.id, dto.username, dto.accessToken);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect account' })
  disconnect(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.socialAccountsService.disconnect(user.id, id);
  }
}
