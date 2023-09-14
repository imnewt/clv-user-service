import { Permission } from '../../models';
import { FilterDto } from '../../dtos';

export interface IPermissionService {
  getPermissions(
    filter: FilterDto,
  ): Promise<{ permissions: Permission[]; total: number }>;
}
export const IPermissionService = Symbol('IPermissionService');
