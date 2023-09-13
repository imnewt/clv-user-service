import { User, Permission } from '../../models';
import { CreateUserDto, UpdateUserDto, FilterDto } from '../../dtos';

export interface IUserService {
  getUsers(filter: FilterDto): Promise<{ users: User[]; total: number }>;
  getUserById(userId: string): Promise<User | null>;
  getUserPermissions(userId: string): Promise<Permission[] | null>;
  createUser(createUserDto: CreateUserDto): Promise<User>;
  updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User>;
  deleteUser(userId: string): Promise<void>;
}
export const IUserService = Symbol('IUserService');
