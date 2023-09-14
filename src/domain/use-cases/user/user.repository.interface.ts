import { User } from '../../models';
import { FilterDto } from '../../dtos';

export interface IUserRepository {
  getUsers(filter: FilterDto): Promise<{ users: User[]; total: number }>;
  getUserById(userId: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByResetToken(resetToken: string): Promise<User | null>;
  saveUser(user: User): Promise<User>;
  deleteUser(user: User): Promise<void>;
}

export const IUserRepository = Symbol('IUserRepository');
