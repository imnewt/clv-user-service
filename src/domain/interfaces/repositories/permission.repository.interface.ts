import { Permission } from '../../models';
import { FilterDto } from '../../dtos';

export interface IPermissionRepository {
  getPermissions(
    filter: FilterDto,
  ): Promise<{ permissions: Permission[]; total: number }>;
  getPermissionsByIds(permissionIds: string[]): Promise<Permission[] | null>;
}

export const IPermissionRepository = Symbol('IPermissionRepository');
