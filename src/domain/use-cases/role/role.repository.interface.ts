import { Role } from '../../models';
import { FilterDto } from '../../dtos';

export interface IRoleRepository {
  getRoles(filter: FilterDto): Promise<{ roles: Role[]; total: number }>;
  getRoleById(roleId: string): Promise<Role | null>;
  getRoleByName(roleName: string): Promise<Role | null>;
  getRolesByIds(roleIds: string[]): Promise<Role[]>;
  saveRole(role: Role): Promise<Role>;
  deleteRole(role: Role): Promise<void>;
}

export const IRoleRepository = Symbol('IRoleRepository');
