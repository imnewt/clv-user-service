import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { SerializedUser } from './types/user';
import { User as UserEntity } from '../typeorm';
import { encodePassword } from 'src/utils/bcrypt';
import { UserNotFoundException } from './exceptions/UserNotFound.exception';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly roleService: RolesService,
  ) {}

  async getAllUsers(searchTerm: string) {
    const users = await this.userRepository.find({
      where: [
        {
          email: ILike(`%${searchTerm}%`),
        },
        {
          userName: ILike(`%${searchTerm}%`),
        },
      ],
      relations: {
        roles: true,
      },
      order: {
        createdAt: 'desc',
      },
    });
    return users.map((user) => new SerializedUser(user));
  }

  getUserById(id: string) {
    return this.userRepository.findOne({
      where: { id },
      relations: {
        roles: true,
      },
    });
  }

  getUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async createUser(dto: CreateUserDto) {
    const hashedPassword = encodePassword(dto.password);
    const addedRoles = await this.roleService.getRolesByIds(dto.roleIds);
    const newUser = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: addedRoles,
    });
    return this.userRepository.save(newUser);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new UserNotFoundException();
    }
    const updatedRoles = await this.roleService.getRolesByIds(
      updateUserDto.roleIds,
    );
    const updatedUser = {
      ...user,
      ...updateUserDto,
      updatedAt: new Date(),
      roles: updatedRoles,
    };
    return await this.userRepository.save(updatedUser);
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User with id ${userId} not found!`);
    }

    return await this.userRepository.remove(user);
  }
}
