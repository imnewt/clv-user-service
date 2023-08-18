import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Permission as PermissionEntity } from 'src/typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  async getPermissions() {
    const permissions = await this.permissionRepository.find();
    return permissions;
  }

  async getPermissionsByIds(permissionIds: string[]) {
    const permissions = await this.permissionRepository.find({
      where: {
        id: In(permissionIds),
      },
    });
    return permissions;
  }
}
