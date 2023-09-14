import { Controller, Get, Inject, Query } from '@nestjs/common';

import { IPermissionService } from '@domain/use-cases/permission';
import { Permission } from '@domain/decorators/permission.decorator';
import { PERMISSION } from '@domain/utilities/constants';

@Controller('permissions')
export class PermissionController {
  constructor(
    @Inject(IPermissionService)
    private readonly permissionService: IPermissionService,
  ) {}

  @Permission(PERMISSION.READ_PERMISSION)
  @Get()
  getPermissions(
    @Query()
    query: {
      searchTerm: string;
      pageNumber: number;
      pageSize: number;
    },
  ) {
    const { searchTerm, pageNumber, pageSize } = query;
    return this.permissionService.getPermissions({
      searchTerm,
      pageNumber,
      pageSize,
    });
  }
}
