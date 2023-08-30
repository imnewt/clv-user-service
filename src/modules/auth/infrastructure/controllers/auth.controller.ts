import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Res,
  OnModuleInit,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Client, ClientKafka } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

import { UsersService } from '@users/services/users.service';
import { AuthService } from '@auth/services/auth.service';
import { LoginDto } from '@auth/dtos/login.dto';
import { RegisterDto } from '@auth/dtos/register.dto';
import { TokenDto } from '@auth/dtos/token.dto';
import { Public } from '@shared/decorators/public.decorator';
import { microserviceConfig } from '@shared/configs/microserviceConfig';
import {
  DASHBOARD_URL,
  INVALID_REFRESH_TOKEN,
  SEND_WELCOME_MAIL,
  SEND_RESET_PASSWORD_MAIL,
} from '@shared/utilities/constants';

@Controller('auth')
export class AuthController implements OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    @Inject('USER_SERVICE') private readonly userService: UsersService,
  ) {}

  @Client(microserviceConfig)
  client: ClientKafka;

  onModuleInit() {
    const requestPatterns = [SEND_WELCOME_MAIL, SEND_RESET_PASSWORD_MAIL];
    requestPatterns.forEach((pattern) => {
      this.client.subscribeToResponseOf(pattern);
    });
  }

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.userName,
      registerDto.password,
    );
  }

  @Public()
  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Public()
  @Get('login/google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken, userId } =
      await this.authService.googleLogin(req);
    if (accessToken && refreshToken) {
      return res.redirect(
        `${DASHBOARD_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${userId}`,
      );
    }
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(
    @Body() tokenDto: TokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = tokenDto;
    const payload = await this.authService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException(INVALID_REFRESH_TOKEN);
    }
    const user = await this.userService.getUserById(payload.sub);
    const accessToken = await this.authService.generateToken(user);

    return { accessToken, refreshToken };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() { email }: { email: string }) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body()
    { resetToken, newPassword }: { resetToken: string; newPassword: string },
  ) {
    return this.authService.resetPassword(resetToken, newPassword);
  }
}
