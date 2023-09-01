import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from '@auth/services/auth.service';
import { UsersService } from '@users/services/users.service';
import { RolesService } from '@roles/services/roles.service';
import { PermissionsService } from '@permissions/services/permissions.service';
import { BusinessException } from '@shared/exceptions/business.exception';
import { ERROR, MODULE } from '@shared/utilities/constants';
import { Permission, Role, User } from '@shared/entities';
import { jwtConfig } from '@shared/configs/jwtConfig';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register(jwtConfig)],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: 'USER_SERVICE',
          useClass: UsersService,
        },
        RolesService,
        PermissionsService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
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

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>('USER_SERVICE');
  });

  describe('login', () => {
    it('should return accessToken, refreshToken and userId', async () => {
      const loginDto = {
        email: 'login@gmail.com',
        password: 'login123',
      };
      const user = new User();
      user.password = 'login123';

      const expectedResult = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        userId: 'user_id',
      };

      usersService.getUserByEmail = jest.fn().mockResolvedValue(user);
      authService.login = jest.fn().mockResolvedValue(expectedResult);

      const result = await authController.login(loginDto);

      expect(result).toBe(expectedResult);
    });

    it('should throw exception if user does not exist', async () => {
      const loginDto = {
        email: 'login@gmail.com',
        password: 'login123',
      };

      usersService.getUserByEmail = jest.fn().mockResolvedValue(undefined);

      const result = authController.login(loginDto);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.AUTH,
          [ERROR.USER_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw exception if password is not matched', async () => {
      const loginDto = {
        email: 'login@gmail.com',
        password: 'login123',
      };
      const user = new User();
      user.password = 'login';

      usersService.getUserByEmail = jest.fn().mockResolvedValue(user);

      const result = authController.login(loginDto);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.AUTH,
          [ERROR.WRONG_PASSWORD],
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('register', () => {
    it('should return created user', async () => {
      const registerDto = {
        email: 'login@gmail.com',
        userName: 'login',
        password: 'login123',
      };
      const newUser = new User();

      usersService.createUser = jest.fn().mockResolvedValue(newUser);

      const result = await authController.register(registerDto);

      expect(result).toBe(newUser);
    });
  });

  describe('refreshToken', () => {
    it('should return new refresh token', async () => {
      const tokenDto = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      authService.verifyRefreshToken = jest.fn().mockResolvedValue({});
      usersService.getUserById = jest.fn().mockResolvedValue(new User());
      authService.generateToken = jest
        .fn()
        .mockResolvedValue('new_access_token');

      const result = await authController.refreshToken(tokenDto);

      expect(result).toStrictEqual({
        accessToken: 'new_access_token',
        refreshToken: 'refresh_token',
      });
    });
  });

  describe('resetPassword', () => {
    it('should save new password for user', async () => {
      const resetToken = 'reset_token';
      const newPassword = 'new_password';
      const tomorrow = new Date(new Date().getTime()).setDate(
        new Date().getDate() + 1,
      );
      const user = {
        resetTokenExpires: tomorrow,
      };
      const updatedUser = new User();

      usersService.getUserByResetToken = jest.fn().mockResolvedValue(user);
      usersService.saveUser = jest.fn().mockResolvedValue(updatedUser);

      const result = await authController.resetPassword({
        resetToken,
        newPassword,
      });

      expect(result).toBe(updatedUser);
    });

    it('should throw exception if reset token is expired', async () => {
      const resetToken = 'reset_token';
      const newPassword = 'newPassword';
      const yesterday = new Date(new Date().getTime()).setDate(
        new Date().getDate() - 1,
      );
      const user = {
        resetTokenExpires: yesterday,
      };

      usersService.getUserByResetToken = jest.fn().mockResolvedValue(user);

      const result = authController.resetPassword({ resetToken, newPassword });

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.AUTH,
          [ERROR.TOKEN_HAS_EXPIRED],
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});
