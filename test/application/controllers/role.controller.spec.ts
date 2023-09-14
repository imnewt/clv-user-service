import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { HttpStatus } from '@nestjs/common';

import { RoleController } from '@application/controllers';
import { IUserService, UserService } from '@domain/use-cases/user';
import { IRoleService, RoleService } from '@domain/use-cases/role';
import { IPermissionRepository } from '@domain/use-cases/permission';
import { CreateRoleDto, UpdateRoleDto } from '@domain/dtos';
import { jwtConfig } from '@domain/configs/jwtConfig';
import { BusinessException } from '@domain/exceptions/business.exception';
import { ERROR, MODULE } from '@domain/utilities/constants';
import { User, Role } from '@infrastructure/database/entities';
import { TypeOrmPermissionRepository } from '@infrastructure/database/repositories';

describe('RoleController', () => {
  let roleController: RoleController;
  let roleService: IRoleService;
  let permissionRepository: IPermissionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register(jwtConfig)],
      controllers: [RoleController],
      providers: [
        {
          provide: IUserService,
          useValue: UserService,
        },
        {
          provide: IRoleService,
          useValue: RoleService,
        },
        {
          provide: IPermissionRepository,
          useValue: TypeOrmPermissionRepository,
        },
      ],
    }).compile();

    roleController = module.get<RoleController>(RoleController);
    roleService = module.get<IRoleService>(IRoleService);
    permissionRepository = module.get<IPermissionRepository>(
      IPermissionRepository,
    );
  });

  describe('getRoles', () => {
    it('should return an array of roles and total count', async () => {
      const query = {
        searchTerm: 'example',
        pageNumber: 1,
        pageSize: 10,
      };
      const roles = [new Role(), new Role()];
      const total = 2;

      roleService.getRoles = jest.fn().mockResolvedValue({ roles, total });

      const result = await roleController.getRoles(query);

      expect(result).toEqual({ roles, total });
    });
  });

  describe('getRoleById', () => {
    it('should return a role by id', async () => {
      const roleId = 'role_id';
      const role = new User();

      roleService.getRoleById = jest.fn().mockResolvedValue(role);

      const result = await roleController.getRoleById(roleId);

      expect(result).toStrictEqual(role);
    });

    it('should throw exception if role does not exist', async () => {
      const roleId = 'non_existing_role_id';

      roleService.getRoleById = jest
        .fn()
        .mockRejectedValue(
          new BusinessException(
            MODULE.ROLES,
            [ERROR.ROLE_NOT_FOUND],
            HttpStatus.NOT_FOUND,
          ),
        );

      const result = roleController.getRoleById(roleId);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.ROLES,
          [ERROR.ROLE_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'role_name',
      } as CreateRoleDto;
      const addedPermissions = [{ id: 'permission_id' }];

      roleService.getRoleById = jest.fn().mockResolvedValue(undefined);
      permissionRepository.getPermissionsByIds = jest
        .fn()
        .mockResolvedValue(addedPermissions);
      roleService.createRole = jest.fn().mockReturnValue(new Role());

      const result = await roleController.createRole(createRoleDto);

      expect(result).toBeInstanceOf(Role);
    });

    it('should throw exception if role name has been used', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'used_role_name',
      } as CreateRoleDto;

      roleService.createRole = jest
        .fn()
        .mockRejectedValue(
          new BusinessException(
            MODULE.ROLES,
            [ERROR.ROLE_NAME_HAS_BEEN_USED],
            HttpStatus.BAD_REQUEST,
          ),
        );

      const result = roleController.createRole(createRoleDto);

      expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.ROLES,
          [ERROR.ROLE_NAME_HAS_BEEN_USED],
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('updateUser', () => {
    it('should update a role', async () => {
      const roleId = 'role_id';
      const updateRoleDto: UpdateRoleDto = {
        name: 'new_rolename',
      } as UpdateRoleDto;
      const updatedRole = new Role();

      roleService.getRoleById = jest.fn().mockResolvedValue(new Role());
      permissionRepository.getPermissionsByIds = jest
        .fn()
        .mockResolvedValue([]);
      roleService.updateRole = jest.fn().mockResolvedValue(updatedRole);

      const result = await roleController.updateRole(roleId, updateRoleDto);

      expect(result).toBe(updatedRole);
    });

    it('should throw exception if role does not exist', async () => {
      const roleId = 'non_existing_role_id';
      const updateRoleDto: UpdateRoleDto = {
        name: 'new_rolename',
      } as UpdateRoleDto;

      roleService.updateRole = jest
        .fn()
        .mockRejectedValue(
          new BusinessException(
            MODULE.ROLES,
            [ERROR.ROLE_NOT_FOUND],
            HttpStatus.NOT_FOUND,
          ),
        );

      const result = roleController.updateRole(roleId, updateRoleDto);

      expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.ROLES,
          [ERROR.ROLE_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      const roleId = 'role_id';

      roleService.getRoleById = jest.fn().mockResolvedValue(new Role());
      roleService.deleteRole = jest.fn().mockResolvedValue(undefined);

      const result = roleController.deleteRole(roleId);

      await expect(result).resolves.toBeUndefined();
    });

    it('should throw exception if role does not exist', async () => {
      const roleId = 'non_existing_role_id';

      roleService.deleteRole = jest
        .fn()
        .mockRejectedValue(
          new BusinessException(
            MODULE.ROLES,
            [ERROR.ROLE_NOT_FOUND],
            HttpStatus.NOT_FOUND,
          ),
        );

      const result = roleController.deleteRole(roleId);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.ROLES,
          [ERROR.ROLE_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });
});
