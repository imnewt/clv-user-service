import { Controller, Get, Query } from '@nestjs/common';

import { Permission } from 'src/decorators/permission.decorator';
import { PERMISSION } from 'src/utils/constants';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Permission(PERMISSION.READ_PERMISSION)
  @Get()
  getRoles(@Query() query) {
    const { searchTerm, pageNumber, pageSize } = query;
    return this.permissionService.getPermissions({
      searchTerm,
      pageNumber,
      pageSize,
    });
  }
}
