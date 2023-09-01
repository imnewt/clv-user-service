import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { AuthService } from './auth.service';
import { UsersService } from '@users/services/users.service';
import { RolesService } from '@roles/services/roles.service';
import { PermissionsService } from '@permissions/services/permissions.service';
import { BusinessException } from '@shared/exceptions/business.exception';
import { ERROR, MODULE } from '@shared/utilities/constants';
import { Permission, Role, User } from '@shared/entities';
import { jwtConfig } from '@shared/configs/jwtConfig';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register(jwtConfig)],
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

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>('USER_SERVICE');
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should return accessToken, refreshToken and userId', async () => {
      const email = 'login@gmail.com';
      const password = 'login123';
      const user = new User();
      user.password = 'login123';

      const expectedResult = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        userId: 'user_id',
      };

      usersService.getUserByEmail = jest.fn().mockResolvedValue(user);
      authService.login = jest.fn().mockResolvedValue(expectedResult);

      const result = await authService.login(email, password);

      expect(result).toBe(expectedResult);
    });

    it('should throw exception if user does not exist', async () => {
      const email = 'login@gmail.com';
      const password = 'login123';

      usersService.getUserByEmail = jest.fn().mockResolvedValue(undefined);

      const result = authService.login(email, password);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.AUTH,
          [ERROR.USER_NOT_FOUND],
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw exception if password is not matched', async () => {
      const email = 'login@gmail.com';
      const password = 'login123';
      const user = new User();
      user.password = 'login';

      usersService.getUserByEmail = jest.fn().mockResolvedValue(user);

      const result = authService.login(email, password);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.AUTH,
          [ERROR.WRONG_PASSWORD],
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('googleLogin', () => {
    it('should throw exception if failed validation from google', async () => {
      // Don't have user in request
      const request = {};

      const result = authService.googleLogin(request);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.AUTH,
          [ERROR.FAIL_VALIDATION_FROM_GOOGLE],
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('register', () => {
    it('should return created user', async () => {
      const email = 'login@gmail.com';
      const userName = 'login';
      const password = 'login123';
      const newUser = new User();

      usersService.createUser = jest.fn().mockResolvedValue(newUser);

      const result = await authService.register(email, userName, password);

      expect(result).toBe(newUser);
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

      const result = await authService.resetPassword(resetToken, newPassword);

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

      const result = authService.resetPassword(resetToken, newPassword);

      await expect(result).rejects.toThrow(
        new BusinessException(
          MODULE.AUTH,
          [ERROR.TOKEN_HAS_EXPIRED],
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return payload', async () => {
      const refreshToken = 'refresh_token';

      jwtService.verifyAsync = jest.fn().mockResolvedValue(undefined);

      const result = authService.verifyRefreshToken(refreshToken);

      expect(result).resolves.toBeUndefined();
    });
  });

  describe('generateToken', () => {
    it('should return generated token', async () => {
      const user = new User();
      const userPermissions = [{ id: 'permission_id_1' }];

      usersService.getUserPermissions = jest
        .fn()
        .mockResolvedValue(userPermissions);
      jwtService.signAsync = jest.fn().mockResolvedValue(undefined);

      const result = authService.generateToken(user);

      expect(result).resolves.toBeUndefined();
    });
  });

  describe('generateRefreshToken', () => {
    it('should return generated refresh token', async () => {
      const user = new User();

      jwtService.signAsync = jest.fn().mockResolvedValue(undefined);

      const result = authService.generateRefreshToken(user);

      expect(result).resolves.toBeUndefined();
    });
  });
});
