import { Controller, Get } from '@nestjs/common';

import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Get()
  getRoles() {
    return this.permissionService.getPermissions();
  }
}
