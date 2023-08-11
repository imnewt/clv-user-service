import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dtos/create-user.dto';
import { SerializedUser } from './types/user';
import { User as UserEntity } from '../typeorm';
import { encodePassword } from 'src/utils/bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getUsers() {
    const users = await this.userRepository.find();
    return users.map((user) => new SerializedUser(user));
  }

  getUserById(id: string) {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  findUserByUserName(userName: string) {
    return this.userRepository.findOne({
      where: { userName },
    });
  }

  createUser(dto: CreateUserDto) {
    const hashedPassword = encodePassword(dto.password);
    const newUser = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }
}
