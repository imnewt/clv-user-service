import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthMethod, CreateUserDto } from './dtos/create-user.dto';
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

  findUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  createUser(dto: CreateUserDto, authMethod: AuthMethod) {
    const hashedPassword = encodePassword(dto.password);
    const newUser = this.userRepository.create({
      ...dto,
      authMethod,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }
}
