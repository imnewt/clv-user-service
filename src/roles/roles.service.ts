import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Role as RoleEntity } from '../typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async getRoles() {
    const roles = await this.roleRepository.find();
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
}
