import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Client, ClientKafka } from '@nestjs/microservices';

import { microserviceConfig } from 'src/configs/microserviceConfig';
import { User } from 'src/typeorm';
import { UserNotFoundException } from 'src/modules/users/exceptions/UserNotFound.exception';
import { comparePasswords, encodePassword } from 'src/utils/bcrypt';
import {
  SEND_RESET_PASSWORD_MAIL,
  SEND_WELCOME_MAIL,
  USER_ROLE_ID,
} from 'src/utils/constants';
import { generateRandomPassword } from 'src/utils/functions';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Client(microserviceConfig)
  client: ClientKafka;

  async login(email: string, password: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new UserNotFoundException();
    }
    const isMatched = comparePasswords(password, user.password);
    if (!isMatched) {
      throw new BadRequestException('Wrong password!');
    }
    const accessToken = await this.generateToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return { accessToken, refreshToken, userId: user.id };
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new BadRequestException('Failed validation from Google!');
    }
    let userForPayload: User;
    const existedUser = await this.usersService.getUserByEmail(req.user.email);
    if (!existedUser) {
      const { email, firstName, lastName } = req.user;
      const temporaryPassword = generateRandomPassword();
      const newUser = await this.usersService.createUser({
        email,
        userName: `${firstName} ${lastName}`,
        password: temporaryPassword,
        roleIds: [USER_ROLE_ID],
      });
      this.client.emit(SEND_WELCOME_MAIL, {
        email,
        password: temporaryPassword,
      });
      userForPayload = newUser;
    } else {
      userForPayload = existedUser;
    }
    const accessToken = await this.generateToken(userForPayload);
    const refreshToken = await this.generateRefreshToken(userForPayload);
    return { accessToken, refreshToken, userId: userForPayload.id };
  }

  async register(email: string, userName: string, password: string) {
    const newUser = this.usersService.createUser({
      email,
      userName,
      password,
      roleIds: [USER_ROLE_ID],
    });
    return newUser;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new UserNotFoundException();
    }
    const resetToken = await this.generateToken(user);
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);
    user.resetToken = resetToken;
    user.resetTokenExpires = expirationTime;
    this.usersService.saveUser(user);
    return this.client.emit(SEND_RESET_PASSWORD_MAIL, {
      email,
      token: resetToken,
    });
  }

  async resetPassword(resetToken: string, newPassword: string) {
    const user = await this.usersService.getUserByResetToken(resetToken);
    if (!user) {
      throw new UserNotFoundException();
    }
    if (user.resetTokenExpires < new Date()) {
      throw new BadRequestException('Token has expired');
    }

    const newHashedPassword = encodePassword(newPassword);
    return this.usersService.saveUser({
      ...user,
      resetToken: null,
      resetTokenExpires: null,
      password: newHashedPassword,
    });
  }

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid Refresh Token!');
    }
  }

  generateToken = async (user: User): Promise<string> => {
    const userPermissions = await this.usersService.getUserPermissions(user.id);
    const payload = {
      userName: user.userName,
      sub: user.id,
      permissions: userPermissions,
    };
    return await this.jwtService.signAsync(payload);
  };

  private generateRefreshToken = async (user: User): Promise<string> => {
    const payload = { userName: user.userName, sub: user.id };
    return await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
  };
}
