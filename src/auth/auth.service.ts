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
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound.exception';
import { comparePasswords } from 'src/utils/bcrypt';
import { SEND_WELCOME_MAIL, USER_ROLE_ID } from 'src/utils/constants';
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
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UserNotFoundException();
    }
    const isMatched = comparePasswords(password, user.password);
    if (!isMatched) {
      throw new BadRequestException('Wrong password!');
    }
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new BadRequestException('Failed validation from Google!');
    }
    let userForPayload: User;
    const existedUser = await this.usersService.findUserByEmail(req.user.email);
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
    const accessToken = await this.generateAccessToken(userForPayload);
    const refreshToken = await this.generateRefreshToken(userForPayload);
    return { accessToken, refreshToken };
  }

  async register(email: string, userName: string, password: string) {
    const user = await this.usersService.findUserByEmail(email);
    if (user) {
      throw new BadRequestException('Your email has been used!');
    }
    const newUser = this.usersService.createUser({
      email,
      userName,
      password,
      roleIds: [USER_ROLE_ID],
    });
    return newUser;
  }

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid Refresh Token!');
    }
  }

  generateAccessToken = async (user: User): Promise<string> => {
    const payload = { userName: user.userName, sub: user.id };
    return await this.jwtService.signAsync(payload);
  };

  private generateRefreshToken = async (user: User): Promise<string> => {
    const payload = { userName: user.userName, sub: user.id };
    return await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
  };
}
