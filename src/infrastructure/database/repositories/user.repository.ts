import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

import { User } from '../entities';
import { IUserRepository } from '@domain/use-cases/user';
import { FilterDto } from '@domain/dtos';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUsers(filter: FilterDto): Promise<{ users: User[]; total: number }> {
    const { searchTerm = '', pageNumber = 1, pageSize = 10 } = filter;
    const [users, total] = await this.userRepository.findAndCount({
      select: [
        'id',
        'userName',
        'email',
        'isActive',
        'roles',
        'createdAt',
        'updatedAt',
      ],
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
    return { users, total };
  }

  async getUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        roles: true,
      },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async getUserByResetToken(resetToken: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { resetToken },
    });
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async deleteUser(user: User): Promise<void> {
    await this.userRepository.remove(user);
  }
}
