import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from './users.service';
import { RolesService } from '@roles/services/roles.service';
import { PermissionsService } from '@permissions/services/permissions.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User, Role, Permission } from '@shared/entities';
import { FilterDto } from '@shared/dtos/filter.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let rolesService: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    rolesService = module.get<RolesService>(RolesService);
  });

  describe('getAllUsers', () => {
    it('should return an array of users and total count', async () => {
      const filter: FilterDto = {
        searchTerm: 'example',
        pageNumber: 1,
        pageSize: 10,
      };
      const users = [new User(), new User()];
      const total = 2;

      userRepository.findAndCount = jest.fn().mockResolvedValue([users, total]);

      const result = await usersService.getAllUsers(filter);

      expect(result.users).toBeInstanceOf(Array);
      expect(result.users.length).toBe(users.length);
      expect(result.total).toBe(total);
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const userId = 'user_id';
      const user = new User();
      userRepository.findOne = jest.fn().mockResolvedValue(user);

      const result = await usersService.getUserById(userId);

      expect(result).toBe(user);
    });

    it('should throw an error when user is not found', async () => {
      const userId = 'non_existing_user_id';
      userRepository.findOne = jest.fn().mockResolvedValue(undefined);

      const result = usersService.getUserById(userId);

      await expect(result).rejects.toThrowError();
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'example@gmail.com';
      const user = new User();
      userRepository.findOne = jest.fn().mockResolvedValue(user);

      const result = await usersService.getUserByEmail(email);

      expect(result).toBe(user);
    });
  });

  describe('getUserByResetToken', () => {
    it('should return a user by reset token', async () => {
      const resetToken = 'reset_token';
      const user = new User();
      userRepository.findOne = jest.fn().mockResolvedValue(user);

      const result = await usersService.getUserByResetToken(resetToken);

      expect(result).toBe(user);
    });

    it('should throw an error when user is not found', async () => {
      const resetToken = 'non_existing_reset_token';
      userRepository.findOne = jest.fn().mockResolvedValue(undefined);

      const result = usersService.getUserByResetToken(resetToken);

      await expect(result).rejects.toThrowError();
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions', async () => {
      const user = {
        id: 'user_id',
        roles: [
          { id: 'role_id_1', permissions: [{ id: 'permission_id_1' }] },
          { id: 'role_id_2', permissions: [{ id: 'permission_id_2' }] },
        ],
      } as User;
      const userPermissions = user.roles.reduce<Permission[]>(
        (res, role) => [...res, ...role.permissions],
        [],
      );

      usersService.getUserById = jest.fn().mockResolvedValue(user);
      rolesService.getRolesByIds = jest.fn().mockResolvedValue(user.roles);

      const result = await usersService.getUserPermissions(user.id);

      expect(result).toEqual(userPermissions);
    });

    it('should throw an error when user is not found', async () => {
      const userId = 'non_existing_user_id';
      usersService.getUserById = jest.fn().mockResolvedValue(undefined);

      const result = usersService.getUserPermissions(userId);

      await expect(result).rejects.toThrowError();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newUser@gmail.com',
        password: 'newUser',
      } as CreateUserDto;
      const addedRoles = [{ id: 'role_id' }];

      userRepository.findOne = jest.fn().mockResolvedValue(undefined);
      rolesService.getRolesByIds = jest.fn().mockResolvedValue(addedRoles);
      userRepository.create = jest.fn().mockReturnValue(new User());
      userRepository.save = jest.fn().mockReturnValue(new User());

      const result = await usersService.createUser(createUserDto);

      expect(result).toBeInstanceOf(User);
    });

    it('should throw an error when email has been used', async () => {
      const createUserDto: CreateUserDto = {
        email: 'userEmail@gmail.com',
        password: 'newUser',
      } as CreateUserDto;
      const existedUser = new User();

      userRepository.findOne = jest.fn().mockResolvedValue(existedUser);

      const result = usersService.createUser(createUserDto);

      expect(result).rejects.toThrowError();
    });
  });

  describe('saveUser', () => {
    it('should save a user', async () => {
      const user = new User();
      userRepository.save = jest.fn().mockResolvedValue(user);

      const result = await usersService.saveUser(user);

      expect(result).toBe(user);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const userId = 'user_id';
      const updateUserDto: UpdateUserDto = {
        userName: 'new_username',
      } as UpdateUserDto;
      const updatedUser = new User();

      userRepository.findOne = jest.fn().mockResolvedValue(new User());
      rolesService.getRolesByIds = jest.fn().mockResolvedValue([]);
      userRepository.save = jest.fn().mockResolvedValue(updatedUser);

      const result = await usersService.updateUser(userId, updateUserDto);

      expect(result).toBe(updatedUser);
    });

    it('should throw an error when user is not found', async () => {
      const updateUserDto: UpdateUserDto = {
        id: 'non_existing_user_id',
        userName: 'new_username',
      } as UpdateUserDto;

      userRepository.findOne = jest.fn().mockResolvedValue(undefined);

      const result = usersService.updateUser(updateUserDto.id, updateUserDto);

      expect(result).rejects.toThrowError();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = 'user_id';
      userRepository.findOne = jest.fn().mockResolvedValue(new User());
      userRepository.remove = jest.fn().mockResolvedValue(undefined);

      const result = usersService.deleteUser(userId);

      await expect(result).resolves.toBeUndefined();
    });

    it('should throw an error when user is not found', async () => {
      const userId = 'non_existing_user_id';
      userRepository.findOne = jest.fn().mockResolvedValue(undefined);

      const result = usersService.deleteUser(userId);

      await expect(result).rejects.toThrowError();
    });
  });
});
