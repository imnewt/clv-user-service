import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { AuthController } from '@application/controllers';
import { IAuthService, AuthService } from '@domain/use-cases/auth';
import {
  IUserService,
  IUserRepository,
  UserService,
} from '@domain/use-cases/user';
import { IRoleRepository } from '@domain/use-cases/role';
import { BusinessException } from '@domain/exceptions/business.exception';
import { ERROR, MODULE } from '@domain/utilities/constants';
import { jwtConfig } from '@domain/configs/jwtConfig';
import { encodePassword } from '@domain/utilities/bcrypt';
import {
  TypeOrmRoleRepository,
  TypeOrmUserRepository,
} from '@infrastructure/database/repositories';
import { Permission, Role, User } from '@infrastructure/database/entities';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: IAuthService;
  let userService: IUserService;
  let userRepository: IUserRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register(jwtConfig)],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: IAuthService,
          useClass: AuthService,
        },
        {
          provide: IUserService,
          useClass: UserService,
        },
        {
          provide: IUserRepository,
          useClass: TypeOrmUserRepository,
        },
        {
          provide: IRoleRepository,
          useClass: TypeOrmRoleRepository,
        },
        // {
        //   provide: JwtService,
        //   useValue: {
        //     signAsync: jest.fn(),
        //     verifyAsync: jest.fn(),
        //   },
        // },
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
    userService = module.get<IUserService>(IUserService);
    userRepository = module.get<IUserRepository>(IUserRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should return created user', async () => {
      const registerDto = {
        email: 'login@gmail.com',
        userName: 'login',
        password: 'login123',
      };
      const newUser = new User();

      userService.createUser = jest.fn().mockResolvedValue(newUser);

      const result = await authController.register(registerDto);

      expect(result).toBe(newUser);
    });
  });

  describe('login', () => {
    it('should return accessToken, refreshToken and userId', async () => {
      const loginDto = {
        email: 'login@gmail.com',
        password: 'login123',
      };
      const user = new User();
      user.id = 'user_id';
      user.userName = 'username';
      user.password = encodePassword('login123');

      const payload = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        userId: 'user_id',
      };

      userRepository.getUserByEmail = jest.fn().mockResolvedValue(user);
      authService.login = jest.fn().mockResolvedValue(payload);

      const result = await authController.login(loginDto);

      expect(result).toStrictEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          userId: expect.any(String),
        }),
      );
    });

    it('should throw exception if user does not exist', async () => {
      const loginDto = {
        email: 'login@gmail.com',
        password: 'login123',
      };

      userRepository.getUserByEmail = jest.fn().mockResolvedValue(undefined);

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

      userRepository.getUserByEmail = jest.fn().mockResolvedValue(user);

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

  describe('refreshToken', () => {
    it('should return new refresh token', async () => {
      const payload = {
        userId: 'user_id',
        userName: 'username',
      };
      const tokenDto = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      jwtService.verifyAsync = jest.fn().mockResolvedValue(payload);
      userService.getUserById = jest.fn().mockResolvedValue(new User());
      authService.generateToken = jest
        .fn()
        .mockResolvedValue('new_access_token');

      const result = await authController.refreshToken(tokenDto);

      expect(result).toStrictEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      );
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

      userRepository.getUserByResetToken = jest.fn().mockResolvedValue(user);
      userRepository.saveUser = jest.fn().mockResolvedValue(updatedUser);

      const result = authController.resetPassword({
        resetToken,
        newPassword,
      });

      expect(result).resolves.toBeUndefined();
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

      userRepository.getUserByResetToken = jest.fn().mockResolvedValue(user);

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
