import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getUsers(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user' })
  updateUser(@Param('id') id: string, @Body() data: { isActive?: boolean; role?: UserRole }) {
    return this.adminService.updateUser(id, data);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'List subscriptions' })
  getSubscriptions(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getSubscriptions(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get('analytics')
  @ApiOperation({ summary: 'System analytics' })
  getAnalytics() {
    return this.adminService.getSystemAnalytics();
  }

  @Get('ai-usage')
  @ApiOperation({ summary: 'AI usage monitoring' })
  getAiUsage(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAiUsage(
      parseInt(page || '1', 10),
      parseInt(limit || '50', 10),
    );
  }
}
