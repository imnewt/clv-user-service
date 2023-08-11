import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  login(@Body() loginDto: Record<string, any>) {
    return this.authService.login(loginDto.userName, loginDto.password);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
