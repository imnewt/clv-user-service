import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Client, ClientKafka } from '@nestjs/microservices';

import { microserviceConfig } from 'src/configs/microserviceConfig';
import { AuthMethod } from 'src/users/dtos/create-user.dto';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound.exception';
import { comparePasswords } from 'src/utils/bcrypt';
import { SEND_WELCOME_MAIL } from 'src/utils/constants';
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

    const payload = { userName: user.userName, sub: user.id };
    return this.generateToken(payload);
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new BadRequestException('Failed validation from Google!');
    }
    let payload;
    const existedUser = await this.usersService.findUserByEmail(req.user.email);
    if (!existedUser) {
      const { email, firstName, lastName } = req.user;
      const temporaryPassword = generateRandomPassword();
      const newUser = await this.usersService.createUser(
        {
          email,
          userName: `${firstName} ${lastName}`,
          password: temporaryPassword,
        },
        AuthMethod.Google,
      );
      this.client.emit(SEND_WELCOME_MAIL, {
        email,
        password: temporaryPassword,
      });
      payload = {
        userName: newUser.userName,
        sub: newUser.id,
      };
    } else {
      payload = {
        userName: existedUser.userName,
        sub: existedUser.id,
      };
    }
    return this.generateToken(payload);
  }

  async register(email: string, userName: string, password: string) {
    const user = await this.usersService.findUserByEmail(email);
    if (user) {
      throw new BadRequestException('Your email has been used!');
    }
    const newUser = this.usersService.createUser(
      {
        email,
        userName,
        password,
      },
      AuthMethod.Manual,
    );
    return newUser;
  }

  private generateToken = async (payload: {
    userName: string;
    sub: string;
  }) => {
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  };
}
