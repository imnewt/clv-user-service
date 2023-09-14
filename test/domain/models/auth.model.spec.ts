import { AuthPayload, AuthResponse } from '@domain/models';

describe('AuthPayload', () => {
  const authPayload = new AuthPayload('user_id', 'username');

  it('should create an instance of AuthPayload', () => {
    expect(authPayload).toBeInstanceOf(AuthPayload);
  });

  it('should have correct values for properties', () => {
    expect(authPayload.userId).toBe('user_id');
    expect(authPayload.userName).toBe('username');
  });
});

describe('AuthResponse', () => {
  const authResponse = new AuthResponse(
    'access_token',
    'refresh_token',
    'user_id',
  );

  it('should create an instance of AuthResponse', () => {
    expect(authResponse).toBeInstanceOf(AuthResponse);
  });

  it('should have correct values for properties', () => {
    expect(authResponse.accessToken).toBe('access_token');
    expect(authResponse.refreshToken).toBe('refresh_token');
    expect(authResponse.userId).toBe('user_id');
  });
});
