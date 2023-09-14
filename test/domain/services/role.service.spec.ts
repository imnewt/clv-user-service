import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';

import { CreateRoleDto, UpdateRoleDto } from '@domain/dtos';
import {
  IPermissionRepository,
  IRoleRepository,
} from '@domain/interfaces/repositories';
import { BusinessException } from '@domain/exceptions/business.exception';
import { ADMIN_ROLE_ID, ERROR, MODULE } from '@domain/utilities/constants';
import { RoleService } from '@domain/services';
import { Role, User } from '@infrastructure/persistence/typeorm/entities';
import {
  TypeOrmPermissionRepository,
  TypeOrmRoleRepository,
} from '@infrastructure/persistence/typeorm/repositories';

describe('RoleService', () => {
  let roleService: RoleService;
  let roleRepository: IRoleRepository;
  let permissionRepository: IPermissionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: IRoleRepository,
          useValue: TypeOrmRoleRepository,
        },
        {
          provide: IPermissionRepository,
          useValue: TypeOrmPermissionRepository,
        },
      ],
    }).compile();

    roleService = module.get<RoleService>(RoleService);
    roleRepository = module.get<IRoleRepository>(IRoleRepository);
    permissionRepository = module.get<IPermissionRepository>(
      IPermissionRepository,
    );
  });

  describe('getRoles', () => {
    it('should return an array of roles and total count', async () => {
      const query = {
        searchTerm: 'search',
        pageNumber: 1,
        pageSize: 10,
      };
      const roles = [new Role(), new Role()];
      const total = 2;

      roleRepository.getRoles = jest.fn().mockResolvedValue({ roles, total });

      const result = await roleService.getRoles(query);

      expect(result.roles).toBeInstanceOf(Array);
      expect(result.roles.length).toBe(roles.length);
      expect(result.total).toBe(total);
    });
  });

  describe('getRoleById', () => {
    it('should return a role by ID', async () => {
      const roleId = '1';
      const role = new Role();

      roleRepository.getRoleById = jest.fn().mockResolvedValue(role);

      expect(await roleService.getRoleById(roleId)).toBe(role);
    });

    it('should throw exception if role does not exist', async () => {
      const roleId = 'non_existing_role_id';

      roleRepository.getRoleById = jest.fn().mockResolvedValue(null);

      await expect(roleService.getRoleById(roleId)).rejects.toThrow(
        new BusinessException(
          MODULE.ROLES,
          [ERROR.USER_NOT_FOUND],
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

      roleRepository.getRoleByName = jest.fn().mockResolvedValue(undefined);
      permissionRepository.getPermissionsByIds = jest
        .fn()
        .mockResolvedValue(addedPermissions);
      roleRepository.saveRole = jest.fn().mockReturnValue(new Role());

      const result = await roleService.createRole(createRoleDto);

      expect(result).toBeInstanceOf(Role);
    });

    it('should throw exception if role name has been used', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'used_role_name',
      } as CreateRoleDto;

      roleRepository.getRoleByName = jest.fn().mockResolvedValue(new Role());

      const result = roleService.createRole(createRoleDto);

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
      roleRepository.saveRole = jest.fn().mockResolvedValue(updatedRole);

      const result = await roleService.updateRole(roleId, updateRoleDto);

      expect(result).toBe(updatedRole);
    });

    it('should throw exception if role is system role', async () => {
      const roleId = ADMIN_ROLE_ID;
      const updateRoleDto: UpdateRoleDto = {
        name: 'new_rolename',
      } as UpdateRoleDto;

      const result = roleService.updateRole(roleId, updateRoleDto);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.ROLES,
          [ERROR.CAN_NOT_UPDATE_ROLE],
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw exception if role does not exist', async () => {
      const roleId = 'non_existing_role_id';
      const updateRoleDto: UpdateRoleDto = {
        name: 'new_rolename',
      } as UpdateRoleDto;

      roleRepository.getRoleById = jest.fn().mockResolvedValue(null);

      const result = roleService.updateRole(roleId, updateRoleDto);

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
      const role = new Role();
      role.users = [];

      roleService.getRoleById = jest.fn().mockResolvedValue(role);
      roleRepository.deleteRole = jest.fn().mockResolvedValue(undefined);

      const result = roleService.deleteRole(roleId);

      await expect(result).resolves.toBeUndefined();
    });

    it('should throw exception if role is system role', async () => {
      const roleId = ADMIN_ROLE_ID;

      const result = roleService.deleteRole(roleId);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.ROLES,
          [ERROR.CAN_NOT_DELETE_ROLE],
          HttpStatus.BAD_REQUEST,
        ),
      );
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

      const result = roleService.deleteRole(roleId);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.ROLES,
          [ERROR.ROLE_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw exception if role is being used', async () => {
      const roleId = 'being_used_role_id';
      const role = new Role();
      role.users = [new User()];

      roleService.getRoleById = jest.fn().mockResolvedValue(role);

      const result = roleService.deleteRole(roleId);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.ROLES,
          [ERROR.ROLE_IS_BEING_USED],
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});
