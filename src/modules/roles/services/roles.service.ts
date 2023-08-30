import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, ILike, Repository } from 'typeorm';

import { PermissionsService } from '@permissions/services/permissions.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { FilterDto } from '@shared/dtos/filter.dto';
import { ADMIN_ROLE_ID, USER_ROLE_ID } from '@shared/utilities/constants';
import { Role } from '@shared/entities';

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

  getRoleById(roleId: string) {
    return this.roleRepository.findOne({
      where: { id: roleId },
      relations: {
        users: true,
        permissions: true,
      },
    });
  }

  getRoleByName(roleName: string) {
    return this.roleRepository.findOne({
      where: { name: roleName },
    });
  }

  async createRole(dto: CreateRoleDto) {
    const role = await this.getRoleByName(dto.name);
    if (role) {
      throw new BadRequestException('Role name has been used!');
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
      throw new BadRequestException('You can not update this role!');
    }
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with id ${roleId} not found!`);
    }
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
      throw new BadRequestException('You can not delete this role!');
    }
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new BadRequestException(`Role with id ${roleId} not found!`);
    }
    if (role.users.length) {
      throw new BadRequestException(
        'This role is being used. Please delete users who have this role first!',
      );
    }
    return await this.roleRepository.remove(role);
  }
}
