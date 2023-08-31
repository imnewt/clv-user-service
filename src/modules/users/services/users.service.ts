import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { uniqBy } from 'lodash';

import { RolesService } from '@roles/services/roles.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { SerializedUser } from '../types/user.type';
import { Permission, User } from '@shared/entities';
import { encodePassword } from '@shared/utilities/bcrypt';
import { FilterDto } from '@shared/dtos/filter.dto';
import { BusinessException } from '@shared/exceptions/business.exception';
import { ERROR, MODULE } from '@shared/utilities/constants';

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

  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        roles: true,
      },
    });
    if (!user) {
      throw new BusinessException(
        MODULE.USERS,
        [ERROR.USER_NOT_FOUND],
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  getUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async getUserByResetToken(resetToken: string) {
    const user = await this.userRepository.findOne({
      where: { resetToken },
    });
    if (!user) {
      throw new BusinessException(
        MODULE.USERS,
        [ERROR.USER_NOT_FOUND],
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
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
      throw new BusinessException(
        MODULE.USERS,
        [ERROR.EMAIL_HAS_BEEN_USED],
        HttpStatus.BAD_REQUEST,
      );
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
    return await this.userRepository.remove(user);
  }
}
