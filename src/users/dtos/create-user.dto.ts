import { IsEmail, IsNotEmpty, IsNumberString } from 'class-validator';

export class CreateUserDto {
  @IsNumberString()
  id: string;

  @IsNotEmpty()
  userName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
