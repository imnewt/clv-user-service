import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserNotFoundException } from 'src/users/exceptions/UserNotFound.exception';
import { comparePasswords } from 'src/utils/bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(userName: string, password: string) {
    const user = await this.usersService.findUserByUserName(userName);
    if (!user) {
      throw new UserNotFoundException();
    }

    const isMatched = comparePasswords(password, user.password);
    if (!isMatched) {
      throw new BadRequestException('Wrong Password!');
    }

    const payload = { userName: user.userName, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
