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
    const users = await this.userRepository.find({
      where: {
        isDeleted: false,
      },
      relations: {
        roles: true,
      },
    });
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

  createUser(dto: CreateUserDto) {
    const hashedPassword = encodePassword(dto.password);
    const newUser = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User with id ${userId} not found!`);
    }

    user.isDeleted = true;
    return await this.userRepository.save(user);
  }
}
