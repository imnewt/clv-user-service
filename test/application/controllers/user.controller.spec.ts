import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { HttpStatus } from '@nestjs/common';

import { UserController } from '@application/controllers';
import {
  IUserService,
  IUserRepository,
  UserService,
} from '@domain/use-cases/user';
import { IRoleRepository } from '@domain/use-cases/role';
import { CreateUserDto, UpdateUserDto } from '@domain/dtos';
import { jwtConfig } from '@domain/configs/jwtConfig';
import { BusinessException } from '@domain/exceptions/business.exception';
import { ERROR, MODULE } from '@domain/utilities/constants';
import { User, Permission } from '@infrastructure/database/entities';
import {
  TypeOrmRoleRepository,
  TypeOrmUserRepository,
} from '@infrastructure/database/repositories';

describe('UserController', () => {
  let userController: UserController;
  let userService: IUserService;
  let roleRepository: IRoleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register(jwtConfig)],
      controllers: [UserController],
      providers: [
        {
          provide: IUserService,
          useValue: UserService,
        },
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

    userController = module.get<UserController>(UserController);
    userService = module.get<IUserService>(IUserService);
    roleRepository = module.get<IRoleRepository>(IRoleRepository);
  });

  describe('getUsers', () => {
    it('should return an array of users and total count', async () => {
      const query = {
        searchTerm: 'example',
        pageNumber: 1,
        pageSize: 10,
      };
      const users = [new User(), new User()];
      const total = 2;

      userService.getUsers = jest.fn().mockResolvedValue({ users, total });

      const result = await userController.getUsers(query);

      expect(result).toEqual({ users, total });
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const userId = 'user_id';
      const user = new User();

      userService.getUserById = jest.fn().mockResolvedValue(user);

      const result = await userController.getUserById(userId);

      expect(result).toStrictEqual(user);
    });

    it('should throw exception if user does not exist', async () => {
      const userId = 'non_existing_user_id';

      userService.getUserById = jest
        .fn()
        .mockRejectedValue(
          new BusinessException(
            MODULE.USERS,
            [ERROR.USER_NOT_FOUND],
            HttpStatus.NOT_FOUND,
          ),
        );

      const result = userController.getUserById(userId);

      await expect(result).rejects.toThrow(
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
      userService.getUserPermissions = jest
        .fn()
        .mockResolvedValue(userPermissions);

      const result = await userController.getUserPermissions(user.id);

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

      const result = userController.getUserPermissions(userId);

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

      userService.getUserById = jest.fn().mockResolvedValue(undefined);
      roleRepository.getRolesByIds = jest.fn().mockResolvedValue(addedRoles);
      userService.createUser = jest.fn().mockReturnValue(new User());

      const result = await userController.createUser(createUserDto);

      expect(result).toBeInstanceOf(User);
    });

    it('should throw exception if email has been used', async () => {
      const createUserDto: CreateUserDto = {
        email: 'userEmail@gmail.com',
        password: 'newUser',
      } as CreateUserDto;

      userService.createUser = jest
        .fn()
        .mockRejectedValue(
          new BusinessException(
            MODULE.USERS,
            [ERROR.EMAIL_HAS_BEEN_USED],
            HttpStatus.BAD_REQUEST,
          ),
        );

      const result = userController.createUser(createUserDto);

      expect(result).rejects.toThrow(
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
      const userId = 'user_id';
      const updateUserDto: UpdateUserDto = {
        userName: 'new_username',
      } as UpdateUserDto;
      const updatedUser = new User();

      userService.getUserById = jest.fn().mockResolvedValue(new User());
      roleRepository.getRolesByIds = jest.fn().mockResolvedValue([]);
      userService.updateUser = jest.fn().mockResolvedValue(updatedUser);

      const result = await userController.updateUser(userId, updateUserDto);

      expect(result).toBe(updatedUser);
    });

    it('should throw exception if user does not exist', async () => {
      const updateUserDto: UpdateUserDto = {
        id: 'non_existing_user_id',
        userName: 'new_username',
      } as UpdateUserDto;

      userService.updateUser = jest
        .fn()
        .mockRejectedValue(
          new BusinessException(
            MODULE.USERS,
            [ERROR.USER_NOT_FOUND],
            HttpStatus.NOT_FOUND,
          ),
        );

      const result = userController.updateUser(updateUserDto.id, updateUserDto);

      expect(result).rejects.toThrow(
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
      const userId = 'user_id';

      userService.getUserById = jest.fn().mockResolvedValue(new User());
      userService.deleteUser = jest.fn().mockResolvedValue(undefined);

      const result = userController.deleteUser(userId);

      await expect(result).resolves.toBeUndefined();
    });

    it('should throw exception if user does not exist', async () => {
      const userId = 'non_existing_user_id';

      userService.deleteUser = jest
        .fn()
        .mockRejectedValue(
          new BusinessException(
            MODULE.USERS,
            [ERROR.USER_NOT_FOUND],
            HttpStatus.NOT_FOUND,
          ),
        );

      const result = userController.deleteUser(userId);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.USERS,
          [ERROR.USER_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });
});
