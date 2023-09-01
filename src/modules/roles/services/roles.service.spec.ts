import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RolesService } from './roles.service';
import { PermissionsService } from '@permissions/services/permissions.service';
import { CreateRoleDto } from '@roles/dtos/create-role.dto';
import { UpdateRoleDto } from '@roles/dtos/update-role.dto';
import { FilterDto } from '@shared/dtos/filter.dto';
import { Permission, Role, User } from '@shared/entities';
import { BusinessException } from '@shared/exceptions/business.exception';
import {
  ADMIN_ROLE_ID,
  ERROR,
  MODULE,
  USER_ROLE_ID,
} from '@shared/utilities/constants';

describe('RolesService', () => {
  let rolesService: RolesService;
  let roleRepository: Repository<Role>;
  let permissionsService: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        PermissionsService,
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

    rolesService = module.get<RolesService>(RolesService);
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

      const result = await rolesService.getRoles(filter);

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

      const result = await rolesService.getRoleById(roleId);

      expect(result).toBe(role);
    });

    it('should throw exception if role does not exist', async () => {
      const roleId = 'non_existing_role_id';
      roleRepository.findOne = jest.fn().mockResolvedValue(undefined);

      const result = rolesService.getRoleById(roleId);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.ROLES,
          [ERROR.ROLE_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('getRoleByName', () => {
    it('should return a role by name', async () => {
      const roleName = 'role_name';
      const role = new Role();
      roleRepository.findOne = jest.fn().mockResolvedValue(role);

      const result = await rolesService.getRoleByName(roleName);

      expect(result).toBe(role);
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

      const result = await rolesService.createRole(createRoleDto);

      expect(result).toBeInstanceOf(Role);
    });

    it('should throw exception if role name has been used', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'new_role_name',
      } as CreateRoleDto;
      const existedRole = new Role();

      roleRepository.findOne = jest.fn().mockResolvedValue(existedRole);

      const result = rolesService.createRole(createRoleDto);

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

      const result = await rolesService.updateRole(roleId, updateRoleDto);

      expect(result).toBe(updatedRole);
    });

    it('should throw exception if role is system role', async () => {
      const roleId = ADMIN_ROLE_ID || USER_ROLE_ID;
      const updateRoleDto: UpdateRoleDto = {
        name: 'new_role_name',
      } as UpdateRoleDto;

      const result = rolesService.updateRole(roleId, updateRoleDto);

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

      const result = rolesService.updateRole(roleId, updateRoleDto);

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

      const result = rolesService.deleteRole(roleId);

      await expect(result).resolves.toBeUndefined();
    });

    it('should throw exception if role is system role', async () => {
      const roleId = ADMIN_ROLE_ID || USER_ROLE_ID;

      const result = rolesService.deleteRole(roleId);

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

      const result = rolesService.deleteRole(roleId);

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

      const result = rolesService.deleteRole(roleId);

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
