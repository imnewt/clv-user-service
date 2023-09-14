import { Role } from '@domain/models';

describe('Role', () => {
  const role = new Role('role_id', 'role_name', [], []);

  it('should create an instance of Role', () => {
    expect(role).toBeInstanceOf(Role);
  });

  it('should have correct values for properties', () => {
    expect(role.id).toBe('role_id');
    expect(role.name).toBe('role_name');
    expect(role.users).toBeInstanceOf(Array);
    expect(role.users.length).toBe(0);
    expect(role.permissions).toBeInstanceOf(Array);
    expect(role.permissions.length).toBe(0);
  });
});
