import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { FilterDto } from '@domain/dtos';
import { TypeOrmPermissionRepository } from '@infrastructure/database/repositories/permission.repository';
import { Permission } from '@infrastructure/database/entities/permission.entity';

describe('PermissionRepository', () => {
  let permissionRepository: TypeOrmPermissionRepository;
  let mockRepository: Repository<Permission>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmPermissionRepository,
        {
          provide: getRepositoryToken(Permission),
          useClass: Repository,
        },
      ],
    }).compile();

    permissionRepository = module.get<TypeOrmPermissionRepository>(
      TypeOrmPermissionRepository,
    );
    mockRepository = module.get<Repository<Permission>>(
      getRepositoryToken(Permission),
    );
  });

  describe('getPermissions', () => {
    it('should return an array of permissions and total count', async () => {
      const filter: FilterDto = {
        searchTerm: 'searchTerm',
        pageNumber: 1,
        pageSize: 10,
      };
      const permissions = [new Permission(), new Permission()];
      const total = permissions.length;

      jest
        .spyOn(mockRepository, 'findAndCount')
        .mockResolvedValueOnce([permissions, total]);

      const result = await permissionRepository.getPermissions(filter);

      expect(result.permissions).toBeInstanceOf(Array);
      expect(result.permissions.length).toBe(permissions.length);
      expect(result.total).toBe(total);
    });
  });

  describe('getRolesByIds', () => {
    it('should return permissions by permission ids', async () => {
      const permissionIds = ['some-id', 'another-id'];
      const mockPermissions = [new Permission(), new Permission()];

      jest.spyOn(mockRepository, 'find').mockResolvedValueOnce(mockPermissions);

      const result = await permissionRepository.getPermissionsByIds(
        permissionIds,
      );

      expect(result).toBe(mockPermissions);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          id: In(permissionIds),
        },
      });
    });
  });
});
