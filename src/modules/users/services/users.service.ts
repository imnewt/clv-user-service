import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { uniqBy } from 'lodash';

import { RolesService } from 'src/modules/roles/services/roles.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { SerializedUser } from '../types/user.type';
import { Permission, User } from 'src/shared/entities';
import { encodePassword } from 'src/shared/utilities/bcrypt';
import { UserNotFoundException } from 'src/shared/exceptions/userNotFound.exception';
import { FilterDto } from 'src/shared/dtos/filter.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roleService: RolesService,
  ) {}

  async getAllUsers(filter: FilterDto) {
    const { searchTerm, pageNumber, pageSize } = filter;
    const [users, total] = await this.userRepository.findAndCount({
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
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });
    const serializedUsers = users.map((user) => new SerializedUser(user));
    return { users: serializedUsers, total };
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

  getUserByResetToken(resetToken: string) {
    return this.userRepository.findOne({
      where: { resetToken },
    });
  }

  async getUserPermissions(userId: string) {
    const user = await this.getUserById(userId);
    const rolesIds = user.roles.map((role) => role.id);
    const roles = await this.roleService.getRolesByIds(rolesIds);
    const permissions = roles.reduce<Permission[]>(
      (res, role) => [...res, ...role.permissions],
      [],
    );
    return uniqBy(permissions, 'id');
  }

  async createUser(dto: CreateUserDto) {
    const user = await this.getUserByEmail(dto.email);
    if (user) {
      throw new BadRequestException('Email has been used!');
    }
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

  saveUser(user: User) {
    return this.userRepository.save(user);
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.getUserById(userId);
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
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found!`);
    }
    return await this.userRepository.remove(user);
  }
}
