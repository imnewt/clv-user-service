import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { PermissionsController } from './permissions.controller';
import { PermissionsService } from '@permissions/services/permissions.service';
import { UsersService } from '@users/services/users.service';
import { RolesService } from '@roles/services/roles.service';
import { FilterDto } from '@shared/dtos/filter.dto';
import { User, Role, Permission } from '@shared/entities';
import { jwtConfig } from '@shared/configs/jwtConfig';

describe('PermissionsController', () => {
  let permissionsController: PermissionsController;
  let permissionRepository: Repository<Permission>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register(jwtConfig)],
      controllers: [PermissionsController],
      providers: [
        UsersService,
        RolesService,
        PermissionsService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Permission),
          useClass: Repository,
        },
      ],
    }).compile();

    permissionsController = module.get<PermissionsController>(
      PermissionsController,
    );
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

      const result = await permissionsController.getPermissions(filter);

      expect(result.permissions).toBeInstanceOf(Array);
      expect(result.permissions.length).toBe(permissions.length);
      expect(result.total).toBe(total);
    });
  });
});
