import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dtos/create-user.dto';
import { SerializedUser, User } from './types/user';

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: '1', userName: 'truc', email: 'truc@gmail.com', password: 'truc1' },
    {
      id: '2',
      userName: 'duyen',
      email: 'duyen@gmail.com',
      password: 'duyen1',
    },
  ];

  getUsers() {
    return this.users.map((user) => new SerializedUser(user));
  }

  getUserById(id: string) {
    return this.users.find((x) => x.id === id);
  }

  createUser(dto: CreateUserDto) {
    this.users.push(dto);
  }
}
