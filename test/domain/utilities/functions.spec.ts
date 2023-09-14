import { generateRandomPassword } from '@domain/utilities/functions';

describe('generateRandomPassword', () => {
  it('should generate a password with the specified length', () => {
    const length = 8;
    const password = generateRandomPassword(length);
    expect(password.length).toBe(length);
  });

  it('should generate a password with valid characters', () => {
    const length = 8;
    const password = generateRandomPassword(length);
    const validCharacters = /^[A-Za-z0-9]+$/;

    expect(password).toMatch(validCharacters);
  });

  it('should generate different passwords for each call', () => {
    const length = 8;
    const password1 = generateRandomPassword(length);
    const password2 = generateRandomPassword(length);

    expect(password1).not.toBe(password2);
  });
});
