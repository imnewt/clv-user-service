import { Controller, Get, Query } from '@nestjs/common';

import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Get()
  getRoles(@Query() query) {
    const { search: searchTerm } = query;
    return this.permissionService.getPermissions(searchTerm);
  }
}
