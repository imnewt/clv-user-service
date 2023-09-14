import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';

import { Role } from '../entities';
import { IRoleRepository } from '@domain/use-cases/role';
import { FilterDto } from '@domain/dtos';

@Injectable()
export class TypeOrmRoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async getRoles(filter: FilterDto): Promise<{ roles: Role[]; total: number }> {
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

  async getRoleById(roleId: string): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { id: roleId },
      relations: {
        users: true,
        permissions: true,
      },
    });
  }

  async getRoleByName(roleName: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name: ILike(`%${roleName}%`) },
    });
  }

  async getRolesByIds(roleIds: string[]): Promise<Role[] | null> {
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

  async saveRole(role: Role): Promise<Role> {
    return this.roleRepository.save(role);
  }

  async deleteRole(role: Role): Promise<void> {
    await this.roleRepository.remove(role);
  }
}
