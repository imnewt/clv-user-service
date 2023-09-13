import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { uniqBy } from 'lodash';

import { CreateUserDto, UpdateUserDto, FilterDto } from '../dtos';
import { User, Permission } from '../models';
import { IUserService } from '../interfaces/services';
import { IUserRepository, IRoleRepository } from '../interfaces/repositories';
import { BusinessException } from '../exceptions/business.exception';
import { ERROR, MODULE } from '../utilities/constants';
import { encodePassword } from '../utilities/bcrypt';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IRoleRepository)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async getUsers(filter: FilterDto): Promise<{ users: User[]; total: number }> {
    return await this.userRepository.getUsers(filter);
  }

  async getUserById(userId: string): Promise<User | null> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new BusinessException(
        MODULE.USERS,
        [ERROR.USER_NOT_FOUND],
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async getUserPermissions(userId: string): Promise<Permission[] | null> {
    const user = await this.getUserById(userId);
    const rolesIds = user.roles.map((role) => role.id);
    const userRoles = await this.roleRepository.getRolesByIds(rolesIds);
    const userPermissions = userRoles.reduce<Permission[]>(
      (permissions, role) => [...permissions, ...role.permissions],
      [],
    );
    return uniqBy(userPermissions, 'id');
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existedUser = await this.userRepository.getUserByEmail(
      createUserDto.email,
    );
    if (existedUser) {
      throw new BusinessException(
        MODULE.USERS,
        [ERROR.EMAIL_HAS_BEEN_USED],
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashedPassword = encodePassword(createUserDto.password);
    const addedRoles = await this.roleRepository.getRolesByIds(
      createUserDto.roleIds,
    );
    const newUser = {
      ...createUserDto,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: addedRoles,
    } as unknown as User;
    return this.userRepository.saveUser(newUser);
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const existedUser = await this.getUserById(userId);
    const updatedRoles = await this.roleRepository.getRolesByIds(
      updateUserDto.roleIds,
    );
    const updatedUser = {
      ...existedUser,
      ...updateUserDto,
      updatedAt: new Date(),
      roles: updatedRoles,
    };
    return this.userRepository.saveUser(updatedUser);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    await this.userRepository.deleteUser(user);
  }
}
