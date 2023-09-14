import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Client, ClientKafka } from '@nestjs/microservices';
import { Request, Response } from 'express';

import { LoginDto, RegisterDto, TokenDto } from '@domain/dtos';
import { IAuthService } from '@domain/use-cases/auth';
import { IUserService } from '@domain/use-cases/user';
import { Public } from '@domain/decorators/public.decorator';
import { microserviceConfig } from '@domain/configs/microserviceConfig';
import { BusinessException } from '@domain/exceptions/business.exception';
import {
  DASHBOARD_URL,
  ERROR,
  MODULE,
  SEND_RESET_PASSWORD_MAIL,
  SEND_WELCOME_MAIL,
} from '@domain/utilities/constants';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(IAuthService) private readonly authService: IAuthService,
    @Inject(IUserService) private readonly userService: IUserService,
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
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
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
      throw new BusinessException(
        MODULE.AUTH,
        [ERROR.INVALID_REFRESH_TOKEN],
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userService.getUserById(payload.userId);
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
