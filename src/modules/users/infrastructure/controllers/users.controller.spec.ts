import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { UsersController } from './users.controller';
import { UsersService } from '@users/services/users.service';
import { CreateUserDto } from '@users/dtos/create-user.dto';
import { UpdateUserDto } from '@users/dtos/update-user.dto';
import { SerializedUser } from '@users/types/user.type';
import { RolesService } from '@roles/services/roles.service';
import { PermissionsService } from '@permissions/services/permissions.service';
import { UserNotFoundException } from '@shared/exceptions/userNotFound.exception';
import { User, Role, Permission } from '@shared/entities';
import { jwtConfig } from '@shared/configs/jwtConfig';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let rolesService: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register(jwtConfig)],
      controllers: [UsersController],
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

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    rolesService = module.get<RolesService>(RolesService);
  });

  describe('getAllUsers', () => {
    it('should return an array of users and total count', async () => {
      const query = {
        searchTerm: 'example',
        pageNumber: 1,
        pageSize: 10,
      };
      const users = [
        new SerializedUser(new User()),
        new SerializedUser(new User()),
      ];
      const total = 2;
      usersService.getAllUsers = jest.fn().mockResolvedValue({ users, total });

      const result = await usersController.getAllUsers(query);

      expect(result).toEqual({ users, total });
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const userId = 'user_id';
      const user = new SerializedUser(new User());
      usersService.getUserById = jest.fn().mockResolvedValue(user);

      const result = await usersController.getUserById(userId);

      expect(result).toStrictEqual(user);
    });

    it('should throw UserNotFoundException if user does not exist', async () => {
      const userId = 'non_existing_user_id';
      userRepository.findOne = jest.fn().mockResolvedValue(undefined);

      const result = usersController.getUserById(userId);

      await expect(result).rejects.toThrow(UserNotFoundException);
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

      const result = await usersController.getUserPermissions(user.id);

      expect(result).toEqual(userPermissions);
    });

    it('should throw UserNotFoundException if user does not exist', async () => {
      const userId = 'non_existing_user_id';
      userRepository.findOne = jest.fn().mockResolvedValue(undefined);

      const result = usersController.getUserPermissions(userId);

      await expect(result).rejects.toThrow(UserNotFoundException);
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

      const result = await usersController.createUser(createUserDto);

      expect(result).toBeInstanceOf(User);
    });

    it('should throw BadRequestException if email has been used', async () => {
      const createUserDto: CreateUserDto = {
        email: 'userEmail@gmail.com',
        password: 'newUser',
      } as CreateUserDto;
      const existedUser = new User();

      userRepository.findOne = jest.fn().mockResolvedValue(existedUser);

      const result = usersController.createUser(createUserDto);

      expect(result).rejects.toThrow(
        new BadRequestException('Email has been used!'),
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

      userRepository.findOne = jest.fn().mockResolvedValue(new User());
      rolesService.getRolesByIds = jest.fn().mockResolvedValue([]);
      userRepository.save = jest.fn().mockResolvedValue(updatedUser);

      const result = await usersController.updateUser(userId, updateUserDto);

      expect(result).toBe(updatedUser);
    });

    it('should throw UserNotFoundException if user does not exist', async () => {
      const updateUserDto: UpdateUserDto = {
        id: 'non_existing_user_id',
        userName: 'new_username',
      } as UpdateUserDto;

      userRepository.findOne = jest.fn().mockResolvedValue(undefined);

      const result = usersController.updateUser(
        updateUserDto.id,
        updateUserDto,
      );

      expect(result).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = 'user_id';
      userRepository.findOne = jest.fn().mockResolvedValue(new User());
      userRepository.remove = jest.fn().mockResolvedValue(undefined);

      const result = usersController.deleteUser(userId);

      await expect(result).resolves.toBeUndefined();
    });

    it('should throw UserNotFoundException if user does not exist', async () => {
      const userId = 'non_existing_user_id';
      userRepository.findOne = jest.fn().mockResolvedValue(undefined);

      const result = usersController.deleteUser(userId);

      await expect(result).rejects.toThrow(UserNotFoundException);
    });
  });
});
