import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FilterDto } from '@domain/dtos';
import { TypeOrmUserRepository } from '@infrastructure/database/repositories/user.repository';
import { User } from '@infrastructure/database/entities/user.entity';

describe('UserRepository', () => {
  let userRepository: TypeOrmUserRepository;
  let mockRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmUserRepository,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    userRepository = module.get<TypeOrmUserRepository>(TypeOrmUserRepository);
    mockRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('getUsers', () => {
    it('should return an array of users and total count', async () => {
      const filter: FilterDto = {
        searchTerm: 'searchTerm',
        pageNumber: 1,
        pageSize: 10,
      };
      const users = [new User(), new User()];
      const total = users.length;

      jest
        .spyOn(mockRepository, 'findAndCount')
        .mockResolvedValueOnce([users, total]);

      const result = await userRepository.getUsers(filter);

      expect(result.users).toBeInstanceOf(Array);
      expect(result.users.length).toBe(users.length);
      expect(result.total).toBe(total);
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const userId = 'some-id';
      const mockUser = new User();

      jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(mockUser);

      const result = await userRepository.getUserById(userId);

      expect(result).toBe(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: { roles: true },
      });
    });

    it('should return null if no user is found by ID', async () => {
      const userId = 'non-existent-id';

      jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await userRepository.getUserById(userId);

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: { roles: true },
      });
    });
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'email@gmail.com';
      const mockUser = new User();

      jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(mockUser);

      const result = await userRepository.getUserByEmail(email);

      expect(result).toBe(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return null if no user is found by id', async () => {
      const email = 'non-existent-email@gmail.com';

      jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await userRepository.getUserByEmail(email);

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('getUserByResetToken', () => {
    it('should return a user by reset token', async () => {
      const resetToken = 'reset-token';
      const mockUser = new User();

      jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(mockUser);

      const result = await userRepository.getUserByResetToken(resetToken);

      expect(result).toBe(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { resetToken },
      });
    });

    it('should return null if no user is found by reset token', async () => {
      const resetToken = 'non-exist-reset-token';

      jest.spyOn(mockRepository, 'findOne').mockResolvedValueOnce(null);

      const result = await userRepository.getUserByResetToken(resetToken);

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { resetToken },
      });
    });
  });

  describe('saveUser', () => {
    it('should save a user', async () => {
      const mockUser = new User();

      jest.spyOn(mockRepository, 'save').mockResolvedValueOnce(mockUser);

      const result = await userRepository.saveUser(mockUser);

      expect(result).toBe(mockUser);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const mockUser = new User();

      jest.spyOn(mockRepository, 'remove').mockResolvedValueOnce(null);

      await userRepository.deleteUser(mockUser);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
    });
  });
});
