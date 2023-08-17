import { IsNotEmpty } from 'class-validator';

export class TokenDto {
  @IsNotEmpty()
  readonly refreshToken: string;
}
