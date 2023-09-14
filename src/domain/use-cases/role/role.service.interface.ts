import { Role } from '../../models';
import { CreateRoleDto, UpdateRoleDto, FilterDto } from '../../dtos';

export interface IRoleService {
  getRoles(filter: FilterDto): Promise<{ roles: Role[]; total: number }>;
  getRoleById(roleId: string): Promise<Role | null>;
  createRole(createRoleDto: CreateRoleDto): Promise<Role>;
  updateRole(roleId: string, updateRoleDto: UpdateRoleDto): Promise<Role>;
  deleteRole(roleId: string): Promise<void>;
}
export const IRoleService = Symbol('IRoleService');
