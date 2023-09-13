import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { CreateRoleDto, UpdateRoleDto, FilterDto } from '../dtos';
import { Role } from '../models';
import { IRoleService } from '../interfaces/services';
import {
  IRoleRepository,
  IPermissionRepository,
} from '../interfaces/repositories';
import { BusinessException } from '../exceptions/business.exception';
import {
  ADMIN_ROLE_ID,
  ERROR,
  MODULE,
  USER_ROLE_ID,
} from '../utilities/constants';

@Injectable()
export class RoleService implements IRoleService {
  constructor(
    @Inject(IRoleRepository)
    private readonly roleRepository: IRoleRepository,
    @Inject(IPermissionRepository)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async getRoles(filter: FilterDto): Promise<{ roles: Role[]; total: number }> {
    return await this.roleRepository.getRoles(filter);
  }

  async getRoleById(roleId: string): Promise<Role | null> {
    const role = await this.roleRepository.getRoleById(roleId);
    if (!role) {
      throw new BusinessException(
        MODULE.ROLES,
        [ERROR.ROLE_NOT_FOUND],
        HttpStatus.NOT_FOUND,
      );
    }
    return role;
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const existedRole = await this.roleRepository.getRoleByName(
      createRoleDto.name,
    );
    if (existedRole) {
      throw new BusinessException(
        MODULE.ROLES,
        [ERROR.ROLE_NAME_HAS_BEEN_USED],
        HttpStatus.BAD_REQUEST,
      );
    }
    const addedPermissions =
      await this.permissionRepository.getPermissionsByIds(
        createRoleDto.permissionIds,
      );
    const newRole = {
      ...createRoleDto,
      permissions: addedPermissions,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Role;
    return this.roleRepository.saveRole(newRole);
  }

  async updateRole(
    roleId: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    if ([ADMIN_ROLE_ID, USER_ROLE_ID].includes(roleId)) {
      throw new BusinessException(
        MODULE.ROLES,
        [ERROR.CAN_NOT_UPDATE_ROLE],
        HttpStatus.BAD_REQUEST,
      );
    }
    const existedRole = await this.getRoleById(roleId);
    const updatedPermissions =
      await this.permissionRepository.getPermissionsByIds(
        updateRoleDto.permissionIds,
      );
    const updatedRole = {
      ...existedRole,
      ...updateRoleDto,
      permissions: updatedPermissions,
      updatedAt: new Date(),
    };
    return this.roleRepository.saveRole(updatedRole);
  }

  async deleteRole(roleId: string): Promise<void> {
    if ([ADMIN_ROLE_ID, USER_ROLE_ID].includes(roleId)) {
      throw new BusinessException(
        MODULE.ROLES,
        [ERROR.CAN_NOT_DELETE_ROLE],
        HttpStatus.BAD_REQUEST,
      );
    }
    const role = await this.getRoleById(roleId);
    if (role.users.length) {
      throw new BusinessException(
        MODULE.ROLES,
        [ERROR.ROLE_IS_BEING_USED],
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.roleRepository.deleteRole(role);
  }
}
