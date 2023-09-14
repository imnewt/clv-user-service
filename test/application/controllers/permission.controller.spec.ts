import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';

import { PermissionController } from '@application/controllers';
import { IUserService, UserService } from '@domain/use-cases/user';
import {
  IPermissionService,
  PermissionService,
} from '@domain/use-cases/permission';
import { jwtConfig } from '@domain/configs/jwt.config';
import { Permission } from '@infrastructure/database/entities';

describe('PermissionController', () => {
  let permissionController: PermissionController;
  let permissionService: IPermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register(jwtConfig)],
      controllers: [PermissionController],
      providers: [
        {
          provide: IUserService,
          useValue: UserService,
        },
        {
          provide: IPermissionService,
          useValue: PermissionService,
        },
      ],
    }).compile();

    permissionController =
      module.get<PermissionController>(PermissionController);
    permissionService = module.get<IPermissionService>(IPermissionService);
  });

  describe('getPermissions', () => {
    it('should return an array of permissions and total count', async () => {
      const query = {
        searchTerm: 'example',
        pageNumber: 1,
        pageSize: 10,
      };
      const permissions = [new Permission(), new Permission()];
      const total = 2;

      permissionService.getPermissions = jest
        .fn()
        .mockResolvedValue({ permissions, total });

      const result = await permissionController.getPermissions(query);

      expect(result).toEqual({ permissions, total });
    });
  });
});
