import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Client, ClientKafka } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto, LoginDto, RegisterDto } from '@domain/dtos';
import { User, AuthPayload, AuthResponse } from '@domain/models';
import { IAuthService } from './auth.service.interface';
import { IUserService, IUserRepository } from '../user';
import { BusinessException } from '@domain/exceptions/business.exception';
import { comparePasswords, encodePassword } from '@domain/utilities/bcrypt';
import { microserviceConfig } from '@domain/configs/microservice.config';
import { generateRandomPassword } from '@domain/utilities/functions';
import {
  ERROR,
  MODULE,
  SEND_RESET_PASSWORD_MAIL,
  SEND_WELCOME_MAIL,
  USER_ROLE_ID,
} from '@domain/utilities/constants';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(IUserService)
    private readonly userService: IUserService,
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Client(microserviceConfig)
  client: ClientKafka;

  async register(registerDto: RegisterDto): Promise<User> {
    return await this.userService.createUser({
      ...registerDto,
      roleIds: [USER_ROLE_ID],
    });
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const existedUser = await this.userRepository.getUserByEmail(
      loginDto.email,
    );
    if (!existedUser) {
      throw new BusinessException(
        MODULE.AUTH,
        [ERROR.USER_NOT_FOUND],
        HttpStatus.NOT_FOUND,
      );
    }
    const isMatched = comparePasswords(loginDto.password, existedUser.password);
    if (!isMatched) {
      throw new BusinessException(
        MODULE.AUTH,
        [ERROR.WRONG_PASSWORD],
        HttpStatus.BAD_REQUEST,
      );
    }
    const accessToken = await this.generateToken(existedUser);
    const refreshToken = await this.generateRefreshToken(existedUser);
    return { accessToken, refreshToken, userId: existedUser.id };
  }

  async googleLogin(googleRequest: any): Promise<AuthResponse> {
    if (!googleRequest.user) {
      throw new BusinessException(
        MODULE.AUTH,
        [ERROR.FAIL_VALIDATION_FROM_GOOGLE],
        HttpStatus.BAD_REQUEST,
      );
    }
    let dataForPayload: User;
    const existedUser = await this.userRepository.getUserByEmail(
      googleRequest.user.email,
    );
    if (!existedUser) {
      const { email, firstName, lastName } = googleRequest.user;
      const temporaryPassword = generateRandomPassword();
      const createUserDto: CreateUserDto = {
        email,
        userName: `${firstName} ${lastName}`,
        password: temporaryPassword,
        roleIds: [USER_ROLE_ID],
      };
      const newUser = await this.userService.createUser(createUserDto);
      this.client.emit(SEND_WELCOME_MAIL, {
        email,
        password: temporaryPassword,
      });
      dataForPayload = newUser;
    } else {
      dataForPayload = existedUser;
    }
    const accessToken = await this.generateToken(dataForPayload);
    const refreshToken = await this.generateRefreshToken(dataForPayload);
    return { accessToken, refreshToken, userId: dataForPayload.id };
  }

  async forgotPassword(email: string): Promise<void> {
    const existedUser = await this.userRepository.getUserByEmail(email);
    if (!existedUser) {
      throw new BusinessException(
        MODULE.AUTH,
        [ERROR.USER_NOT_FOUND],
        HttpStatus.NOT_FOUND,
      );
    }
    const resetToken = await this.generateToken(existedUser);
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);
    existedUser.resetToken = resetToken;
    existedUser.resetTokenExpires = expirationTime;
    this.userRepository.saveUser(existedUser);
    this.client.emit(SEND_RESET_PASSWORD_MAIL, {
      email,
      token: resetToken,
    });
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.getUserByResetToken(resetToken);
    if (user.resetTokenExpires < new Date()) {
      throw new BusinessException(
        MODULE.AUTH,
        [ERROR.TOKEN_HAS_EXPIRED],
        HttpStatus.BAD_REQUEST,
      );
    }

    const newHashedPassword = encodePassword(newPassword);
    this.userRepository.saveUser({
      ...user,
      resetToken: null,
      resetTokenExpires: null,
      password: newHashedPassword,
    });
  }

  async verifyRefreshToken(refreshToken: string): Promise<AuthPayload> {
    try {
      const payload: AuthPayload = await this.jwtService.verifyAsync(
        refreshToken,
      );
      return payload;
    } catch {
      throw new BusinessException(
        MODULE.AUTH,
        [ERROR.INVALID_REFRESH_TOKEN],
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async generateToken(user: User): Promise<string> {
    const payload: AuthPayload = {
      userId: user.id,
      userName: user.userName,
    };
    return await this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload: AuthPayload = {
      userId: user.id,
      userName: user.userName,
    };
    return await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
  }
}
