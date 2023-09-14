import { Inject, Injectable } from '@nestjs/common';

import { IPermissionService } from './permission.service.interface';
import { IPermissionRepository } from './permission.repository.interface';
import { Permission } from '@domain/models';
import { FilterDto } from '@domain/dtos';

@Injectable()
export class PermissionService implements IPermissionService {
  constructor(
    @Inject(IPermissionRepository)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async getPermissions(
    filter: FilterDto,
  ): Promise<{ permissions: Permission[]; total: number }> {
    return await this.permissionRepository.getPermissions(filter);
  }
}
