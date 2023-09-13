import { User, AuthResponse, AuthPayload } from '../../models';
import { RegisterDto, LoginDto } from '../../dtos';

export interface IAuthService {
  register(registerDto: RegisterDto): Promise<User>;
  login(loginDto: LoginDto): Promise<AuthResponse>;
  googleLogin(googleRequest: any): Promise<AuthResponse>;
  verifyRefreshToken(refreshToken: string): Promise<AuthPayload>;
  generateToken(user: User): Promise<string>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(resetToken: string, newPassword: string): Promise<void>;
}
export const IAuthService = Symbol('IAuthService');
