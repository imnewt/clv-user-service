import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';

import { FilterDto } from '@domain/dtos';
import { TypeOrmRoleRepository } from '@infrastructure/persistence/typeorm/repositories/role.repository';
import { Role } from '@infrastructure/persistence/typeorm/entities/role.entity';

describe('RoleRepository', () => {
  let roleRepository: TypeOrmRoleRepository;
  let mockRepository: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmRoleRepository,
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
      ],
    }).compile();

    roleRepository = module.get<TypeOrmRoleRepository>(TypeOrmRoleRepository);
    mockRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  describe('getRoles', () => {
    it('should return an array of roles and total count', async () => {
      const filter: FilterDto = {
        searchTerm: 'searchTerm',
        pageNumber: 1,
        pageSize: 10,
      };
      const roles = [new Role(), new Role()];
      const total = roles.length;

      jest
        .spyOn(mockRepository, 'findAndCount')
        .mockResolvedValueOnce([roles, total]);

      const result = await roleRepository.getRoles(filter);

      expect(result.roles).toBeInstanceOf(Array);
      expect(result.roles.length).toBe(roles.length);
      expect(result.total).toBe(total);
    });
  });

  describe('getRoleById', () => {
    it('should return a role by ID', async () => {
      const roleId = 'some-id';
      const mockRole = new Role();

      jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(mockRole);

      const result = await roleRepository.getRoleById(roleId);

      expect(result).toBe(mockRole);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
        relations: {
          users: true,
          permissions: true,
        },
      });
    });

    it('should return null if no role is found by ID', async () => {
      const roleId = 'non-existent-id';

      jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await roleRepository.getRoleById(roleId);

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
        relations: {
          users: true,
          permissions: true,
        },
      });
    });
  });

  describe('getRoleByName', () => {
    it('should return a role by name', async () => {
      const roleName = 'role_name';
      const mockRole = new Role();

      jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(mockRole);

      const result = await roleRepository.getRoleByName(roleName);

      expect(result).toBe(mockRole);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { name: ILike(`%${roleName}%`) },
      });
    });

    it('should return null if no role is found by id', async () => {
      const roleId = 'non-existent-id';

      jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await roleRepository.getRoleById(roleId);

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
        relations: {
          users: true,
          permissions: true,
        },
      });
    });
  });

  describe('getRolesByIds', () => {
    it('should return roles by role ids', async () => {
      const roleIds = ['some-id', 'another-id'];
      const mockRoles = [new Role(), new Role()];

      jest.spyOn(mockRepository, 'find').mockResolvedValueOnce(mockRoles);

      const result = await roleRepository.getRolesByIds(roleIds);

      expect(result).toBe(mockRoles);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          id: In(roleIds),
        },
        relations: {
          permissions: true,
        },
      });
    });
  });

  describe('saveRole', () => {
    it('should save a role', async () => {
      const mockRole = new Role();

      jest.spyOn(mockRepository, 'save').mockResolvedValueOnce(mockRole);

      const result = await roleRepository.saveRole(mockRole);

      expect(result).toBe(mockRole);
      expect(mockRepository.save).toHaveBeenCalledWith(mockRole);
    });
  });

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      const mockRole = new Role();

      jest.spyOn(mockRepository, 'remove').mockResolvedValueOnce(null);

      await roleRepository.deleteRole(mockRole);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockRole);
    });
  });
});
