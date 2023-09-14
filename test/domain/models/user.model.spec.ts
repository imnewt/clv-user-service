import { User } from '@domain/models';

describe('User', () => {
  const user = new User(
    'user_id',
    'username',
    'email@gmail.com',
    'password',
    true,
    'resetToken',
    new Date(),
    [],
  );

  it('should create an instance of User', () => {
    expect(user).toBeInstanceOf(User);
  });

  it('should have correct values for properties', () => {
    expect(user.id).toBe('user_id');
    expect(user.userName).toBe('username');
    expect(user.email).toBe('email@gmail.com');
    expect(user.password).toBe('password');
    expect(user.isActive).toBe(true);
    expect(user.resetToken).toBe('resetToken');
    expect(user.resetTokenExpires).toBeInstanceOf(Date);
    expect(user.roles).toBeInstanceOf(Array);
    expect(user.roles.length).toBe(0);
  });
});
