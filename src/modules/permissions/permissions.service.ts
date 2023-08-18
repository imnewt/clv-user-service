import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';

import { Permission as PermissionEntity } from 'src/typeorm';
import { FilterDto } from 'src/dtos/filter.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
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
