import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { RolesController } from './roles.controller';
import { CreateRoleDto } from '@roles/dtos/create-role.dto';
import { UpdateRoleDto } from '@roles/dtos/update-role.dto';
import { RolesService } from '@roles/services/roles.service';
import { UsersService } from '@users/services/users.service';
import { PermissionsService } from '@permissions/services/permissions.service';
import { FilterDto } from '@shared/dtos/filter.dto';
import { Permission, Role, User } from '@shared/entities';
import { BusinessException } from '@shared/exceptions/business.exception';
import {
  ADMIN_ROLE_ID,
  ERROR,
  MODULE,
  USER_ROLE_ID,
} from '@shared/utilities/constants';
import { jwtConfig } from '@shared/configs/jwtConfig';

describe('RolesController', () => {
  let rolesController: RolesController;
  let roleRepository: Repository<Role>;
  let permissionsService: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register(jwtConfig)],
      controllers: [RolesController],
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

    rolesController = module.get<RolesController>(RolesController);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    permissionsService = module.get<PermissionsService>(PermissionsService);
  });

  describe('getAllRoles', () => {
    it('should return an array of roles and total count', async () => {
      const filter: FilterDto = {
        searchTerm: 'example',
        pageNumber: 1,
        pageSize: 10,
      };
      const roles = [new Role(), new Role()];
      const total = 2;

      roleRepository.findAndCount = jest.fn().mockResolvedValue([roles, total]);

      const result = await rolesController.getRoles(filter);

      expect(result.roles).toBeInstanceOf(Array);
      expect(result.roles.length).toBe(roles.length);
      expect(result.total).toBe(total);
    });
  });

  describe('getRoleById', () => {
    it('should return a role by id', async () => {
      const roleId = 'role_id';
      const role = new Role();
      roleRepository.findOne = jest.fn().mockResolvedValue(role);

      const result = await rolesController.getRoleById(roleId);

      expect(result).toBe(role);
    });

    it('should throw exception if role does not exist', async () => {
      const roleId = 'non_existing_role_id';
      roleRepository.findOne = jest.fn().mockResolvedValue(undefined);

      const result = rolesController.getRoleById(roleId);

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
        name: 'new_role_name',
      } as CreateRoleDto;
      const addedPermissions = [{ id: 'permission_id' }];

      roleRepository.findOne = jest.fn().mockResolvedValue(undefined);
      permissionsService.getPermissionsByIds = jest
        .fn()
        .mockResolvedValue(addedPermissions);
      roleRepository.create = jest.fn().mockReturnValue(new Role());
      roleRepository.save = jest.fn().mockReturnValue(new Role());

      const result = await rolesController.createRole(createRoleDto);

      expect(result).toBeInstanceOf(Role);
    });

    it('should throw exception if role name has been used', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'new_role_name',
      } as CreateRoleDto;
      const existedRole = new Role();

      roleRepository.findOne = jest.fn().mockResolvedValue(existedRole);

      const result = rolesController.createRole(createRoleDto);

      expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.ROLES,
          [ERROR.ROLE_NAME_HAS_BEEN_USED],
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('updateRole', () => {
    it('should update a role', async () => {
      const roleId = 'role_id';
      const updateRoleDto: UpdateRoleDto = {
        name: 'new_role_name',
      } as UpdateRoleDto;
      const updatedRole = new Role();

      roleRepository.findOne = jest.fn().mockResolvedValue(new Role());
      permissionsService.getPermissionsByIds = jest.fn().mockResolvedValue([]);
      roleRepository.save = jest.fn().mockResolvedValue(updatedRole);

      const result = await rolesController.updateRole(roleId, updateRoleDto);

      expect(result).toBe(updatedRole);
    });

    it('should throw exception if role is system role', async () => {
      const roleId = ADMIN_ROLE_ID || USER_ROLE_ID;
      const updateRoleDto: UpdateRoleDto = {
        name: 'new_role_name',
      } as UpdateRoleDto;

      const result = rolesController.updateRole(roleId, updateRoleDto);

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
      const updateRoleDto: UpdateRoleDto = {
        name: 'new_role_name',
      } as UpdateRoleDto;

      roleRepository.findOne = jest.fn().mockResolvedValue(undefined);

      const result = rolesController.updateRole(roleId, updateRoleDto);

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
      const role = {
        users: [],
      };
      roleRepository.findOne = jest.fn().mockResolvedValue(role);
      roleRepository.remove = jest.fn().mockResolvedValue(undefined);

      const result = rolesController.deleteRole(roleId);

      await expect(result).resolves.toBeUndefined();
    });

    it('should throw exception if role is system role', async () => {
      const roleId = ADMIN_ROLE_ID || USER_ROLE_ID;

      const result = rolesController.deleteRole(roleId);

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
      roleRepository.findOne = jest.fn().mockResolvedValue(undefined);

      const result = rolesController.deleteRole(roleId);

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
      const role = {
        users: [new User()],
      };
      roleRepository.findOne = jest.fn().mockResolvedValue(role);

      const result = rolesController.deleteRole(roleId);

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
