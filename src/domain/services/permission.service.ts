import { Inject, Injectable } from '@nestjs/common';

import { Permission } from '../models';
import { IPermissionService } from '../interfaces/services';
import { IPermissionRepository } from '../interfaces/repositories';
import { FilterDto } from '../dtos';

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
