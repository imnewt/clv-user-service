import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';

import { Permission as PermissionEntity } from 'src/typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  async getPermissions(searchTerm: string) {
    const permissions = await this.permissionRepository.find({
      where: [
        {
          name: ILike(`%${searchTerm}%`),
        },
      ],
    });
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
