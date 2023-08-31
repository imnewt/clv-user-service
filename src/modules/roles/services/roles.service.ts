import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, ILike, Repository } from 'typeorm';

import { PermissionsService } from '@permissions/services/permissions.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { FilterDto } from '@shared/dtos/filter.dto';
import {
  ADMIN_ROLE_ID,
  ERROR,
  MODULE,
  USER_ROLE_ID,
} from '@shared/utilities/constants';
import { Role } from '@shared/entities';
import { BusinessException } from '@shared/exceptions/business.exception';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly permissionService: PermissionsService,
  ) {}

  async getRoles(filter: FilterDto) {
    const { searchTerm, pageNumber, pageSize } = filter;
    const [roles, total] = await this.roleRepository.findAndCount({
      where: [
        {
          name: ILike(`%${searchTerm}%`),
        },
      ],
      relations: {
        permissions: true,
      },
      order: {
        createdAt: 'desc',
      },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });
    return { roles, total };
  }

  async getRolesByIds(roleIds: string[]) {
    const roles = await this.roleRepository.find({
      where: {
        id: In(roleIds),
      },
      relations: {
        permissions: true,
      },
    });
    return roles;
  }

  async getRoleById(roleId: string) {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: {
        users: true,
        permissions: true,
      },
    });
    if (!role) {
      throw new BusinessException(
        MODULE.ROLES,
        [ERROR.ROLE_NOT_FOUND],
        HttpStatus.NOT_FOUND,
      );
    }
    return role;
  }

  getRoleByName(roleName: string) {
    return this.roleRepository.findOne({
      where: { name: ILike(`%${roleName}%`) },
    });
  }

  async createRole(dto: CreateRoleDto) {
    const role = await this.getRoleByName(dto.name);
    if (role) {
      throw new BusinessException(
        MODULE.ROLES,
        [ERROR.ROLE_NAME_HAS_BEEN_USED],
        HttpStatus.BAD_REQUEST,
      );
    }
    const newRole = this.roleRepository.create(dto);
    const addedPermissions = await this.permissionService.getPermissionsByIds(
      dto.permissionIds,
    );
    return this.roleRepository.save({
      ...newRole,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: addedPermissions,
    });
  }

  async updateRole(roleId: string, updateRoleDto: UpdateRoleDto) {
    if ([ADMIN_ROLE_ID, USER_ROLE_ID].includes(roleId)) {
      throw new BusinessException(
        MODULE.ROLES,
        [ERROR.CAN_NOT_UPDATE_ROLE],
        HttpStatus.BAD_REQUEST,
      );
    }
    const role = await this.getRoleById(roleId);
    const updatedPermissions = await this.permissionService.getPermissionsByIds(
      updateRoleDto.permissionIds,
    );
    const updatedRole = {
      ...role,
      ...updateRoleDto,
      permissions: updatedPermissions,
      updatedAt: new Date(),
    };
    return await this.roleRepository.save(updatedRole);
  }

  async deleteRole(roleId: string) {
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
    return await this.roleRepository.remove(role);
  }
}
