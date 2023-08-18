import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, ILike, Repository } from 'typeorm';

import { PermissionsService } from 'src/permissions/permissions.service';
import { Role as RoleEntity } from '../typeorm';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { ADMIN_ROLE_ID, USER_ROLE_ID } from 'src/utils/constants';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly permissionService: PermissionsService,
  ) {}

  async getRoles(searchTerm: string) {
    const roles = await this.roleRepository.find({
      where: [
        {
          name: ILike(`%${searchTerm}%`),
        },
      ],
      relations: {
        permissions: true,
      },
    });
    return roles;
  }

  async getRolesByIds(roleIds: string[]) {
    const roles = await this.roleRepository.find({
      where: {
        id: In(roleIds),
      },
    });
    return roles;
  }

  getRoleById(roleId: string) {
    return this.roleRepository.findOne({
      where: { id: roleId },
      relations: {
        permissions: true,
      },
    });
  }

  async createRole(dto: CreateRoleDto) {
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
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException('Role not found!');
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
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });
    if (!role) {
      throw new BadRequestException(`Role with id ${roleId} not found!`);
    }
    return await this.roleRepository.remove(role);
  }
}
