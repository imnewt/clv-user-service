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

import { microserviceConfig } from 'src/configs/microserviceConfig';
import { UsersService } from 'src/users/users.service';
import { DASHBOARD_URL, SEND_WELCOME_MAIL } from 'src/utils/constants';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { TokenDto } from './dtos/token.dto';

@Controller('auth')
export class AuthController implements OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    @Inject('USER_SERVICE') private readonly userService: UsersService,
  ) {}

  @Client(microserviceConfig)
  client: ClientKafka;

  onModuleInit() {
    const requestPatterns = [SEND_WELCOME_MAIL];
    requestPatterns.forEach((pattern) => {
      this.client.subscribeToResponseOf(pattern);
    });
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.userName, dto.password);
  }

  @Public()
  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Public()
  @Get('login/google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.googleLogin(
      req,
    );
    if (accessToken && refreshToken) {
      return res.redirect(
        `${DASHBOARD_URL}?access_token=${accessToken}&refresh_token=${refreshToken}`,
      );
    }
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(
    @Body() tokenDto: TokenDto,
  ): Promise<{ accessToken: string }> {
    const { refreshToken } = tokenDto;
    const payload = await this.authService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
    const user = await this.userService.getUserById(payload.sub);
    const accessToken = await this.authService.generateAccessToken(user);

    return { accessToken };
  }
}
