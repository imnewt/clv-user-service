import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';

import { Permission } from '@shared/entities';
import { FilterDto } from '@shared/dtos/filter.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async getPermissions(filter: FilterDto) {
    const { searchTerm, pageNumber, pageSize } = filter;
    const [permissions, total] = await this.permissionRepository.findAndCount({
      where: [
        {
          name: ILike(`%${searchTerm}%`),
        },
      ],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });
    return { permissions, total };
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
