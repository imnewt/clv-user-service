import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';

import { CreateUserDto, UpdateUserDto } from '@domain/dtos';
import {
  IRoleRepository,
  IUserRepository,
} from '@domain/interfaces/repositories';
import { BusinessException } from '@domain/exceptions/business.exception';
import { ERROR, MODULE } from '@domain/utilities/constants';
import { UserService } from '@domain/services';
import { Permission, User } from '@infrastructure/persistence/typeorm/entities';
import {
  TypeOrmRoleRepository,
  TypeOrmUserRepository,
} from '@infrastructure/persistence/typeorm/repositories';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: IUserRepository;
  let roleRepository: IRoleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: IUserRepository,
          useValue: TypeOrmUserRepository,
        },
        {
          provide: IRoleRepository,
          useValue: TypeOrmRoleRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<IUserRepository>(IUserRepository);
    roleRepository = module.get<IRoleRepository>(IRoleRepository);
  });

  describe('getUsers', () => {
    it('should return an array of users and total count', async () => {
      const query = {
        searchTerm: 'search',
        pageNumber: 1,
        pageSize: 10,
      };
      const users = [new User(), new User()];
      const total = 2;

      userRepository.getUsers = jest.fn().mockResolvedValue({ users, total });

      const result = await userService.getUsers(query);

      expect(result.users).toBeInstanceOf(Array);
      expect(result.users.length).toBe(users.length);
      expect(result.total).toBe(total);
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const userId = '1';
      const user = new User();

      userRepository.getUserById = jest.fn().mockResolvedValue(user);

      expect(await userService.getUserById(userId)).toBe(user);
    });

    it('should throw exception if user does not exist', async () => {
      const userId = 'non_existing_user_id';

      userRepository.getUserById = jest.fn().mockResolvedValue(null);

      await expect(userService.getUserById(userId)).rejects.toThrow(
        new BusinessException(
          MODULE.USERS,
          [ERROR.USER_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        ),
      );
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

      userService.getUserById = jest.fn().mockResolvedValue(user);
      roleRepository.getRolesByIds = jest.fn().mockResolvedValue(user.roles);

      const result = await userService.getUserPermissions(user.id);

      expect(result).toEqual(userPermissions);
    });

    it('should throw exception if user does not exist', async () => {
      const userId = 'non_existing_user_id';

      userService.getUserPermissions = jest
        .fn()
        .mockRejectedValue(
          new BusinessException(
            MODULE.USERS,
            [ERROR.USER_NOT_FOUND],
            HttpStatus.NOT_FOUND,
          ),
        );

      const result = userService.getUserPermissions(userId);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.USERS,
          [ERROR.USER_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newUser@gmail.com',
        password: 'newUser',
      } as CreateUserDto;
      const addedRoles = [{ id: 'role_id' }];

      userRepository.getUserByEmail = jest.fn().mockResolvedValue(undefined);
      roleRepository.getRolesByIds = jest.fn().mockResolvedValue(addedRoles);
      userRepository.saveUser = jest.fn().mockReturnValue(new User());

      const result = await userService.createUser(createUserDto);

      expect(result).toBeInstanceOf(User);
    });

    it('should throw exception if email has been used', async () => {
      const createUserDto: CreateUserDto = {
        email: 'used_email',
      } as CreateUserDto;
      const existedUser = new User();

      userRepository.getUserByEmail = jest.fn().mockResolvedValue(existedUser);

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        new BusinessException(
          MODULE.USERS,
          [ERROR.EMAIL_HAS_BEEN_USED],
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        userName: 'new_username',
      } as UpdateUserDto;
      const existedUser = new User();
      const updatedUser = { ...updateUserDto } as unknown as User;

      userService.getUserById = jest.fn().mockResolvedValue(existedUser);
      roleRepository.getRolesByIds = jest.fn().mockResolvedValue([]);
      userRepository.saveUser = jest.fn().mockResolvedValue(updatedUser);

      expect(await userService.updateUser(userId, updateUserDto)).toBe(
        updatedUser,
      );
    });

    it('should throw exception if user does not exist', async () => {
      const userId = 'non_existing_user_id';
      const updateUserDto: UpdateUserDto = {
        userName: 'new_username',
      } as UpdateUserDto;

      userRepository.getUserById = jest
        .fn()
        .mockRejectedValue(
          new BusinessException(
            MODULE.USERS,
            [ERROR.USER_NOT_FOUND],
            HttpStatus.NOT_FOUND,
          ),
        );

      await expect(
        userService.updateUser(userId, updateUserDto),
      ).rejects.toThrow(
        new BusinessException(
          MODULE.USERS,
          [ERROR.USER_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = '1';
      const user = new User();

      userService.getUserById = jest.fn().mockResolvedValue(user);
      userRepository.deleteUser = jest.fn().mockResolvedValue(undefined);

      expect(await userService.deleteUser(userId)).toBeUndefined();
    });

    it('should throw exception if user does not exist', async () => {
      const userId = 'non_existing_user_id';

      userRepository.getUserById = jest
        .fn()
        .mockRejectedValue(
          new BusinessException(
            MODULE.USERS,
            [ERROR.USER_NOT_FOUND],
            HttpStatus.NOT_FOUND,
          ),
        );

      await expect(userService.deleteUser(userId)).rejects.toThrow(
        new BusinessException(
          MODULE.USERS,
          [ERROR.USER_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });
});
