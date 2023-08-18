import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  userName: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  roleIds: string[];
}
