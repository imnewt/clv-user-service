import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PermissionsService } from './permissions.service';
import { Permission } from '@shared/entities';
import { FilterDto } from '@shared/dtos/filter.dto';

describe('PermissionsService', () => {
  let permissionsService: PermissionsService;
  let permissionRepository: Repository<Permission>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: getRepositoryToken(Permission),
          useClass: Repository,
        },
      ],
    }).compile();

    permissionsService = module.get<PermissionsService>(PermissionsService);
    permissionRepository = module.get<Repository<Permission>>(
      getRepositoryToken(Permission),
    );
  });

  describe('getAllPermissions', () => {
    it('should return an array of permissions and total count', async () => {
      const filter: FilterDto = {
        searchTerm: 'example',
        pageNumber: 1,
        pageSize: 10,
      };
      const permissions = [new Permission(), new Permission()];
      const total = 2;

      permissionRepository.findAndCount = jest
        .fn()
        .mockResolvedValue([permissions, total]);

      const result = await permissionsService.getPermissions(filter);

      expect(result.permissions).toBeInstanceOf(Array);
      expect(result.permissions.length).toBe(permissions.length);
      expect(result.total).toBe(total);
    });
  });

  describe('getPermissionsByIds', () => {
    it('should return permissions by ids', async () => {
      const permissionIds = ['permission_id_1', 'permission_id_2'];
      const permissions = [new Permission(), new Permission()];
      permissionRepository.find = jest.fn().mockResolvedValue(permissions);

      const result = await permissionsService.getPermissionsByIds(
        permissionIds,
      );

      expect(result).toBe(permissions);
    });
  });
});
