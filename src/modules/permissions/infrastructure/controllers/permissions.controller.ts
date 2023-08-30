import { Controller, Get, Query } from '@nestjs/common';

import { PermissionsService } from '@permissions/services/permissions.service';
import { Permission } from '@shared/decorators/permission.decorator';
import { PERMISSION } from '@shared/utilities/constants';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Permission(PERMISSION.READ_PERMISSION)
  @Get()
  getPermissions(@Query() query) {
    const { searchTerm, pageNumber, pageSize } = query;
    return this.permissionService.getPermissions({
      searchTerm,
      pageNumber,
      pageSize,
    });
  }
}
