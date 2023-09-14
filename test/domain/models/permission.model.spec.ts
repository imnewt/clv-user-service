import { Permission } from '@domain/models';

describe('Permission', () => {
  const permission = new Permission('permission_id', 'permission_name', []);

  it('should create an instance of Permission', () => {
    expect(permission).toBeInstanceOf(Permission);
  });

  it('should have correct values for properties', () => {
    expect(permission.id).toBe('permission_id');
    expect(permission.name).toBe('permission_name');
    expect(permission.roles).toBeInstanceOf(Array);
    expect(permission.roles.length).toBe(0);
  });
});
