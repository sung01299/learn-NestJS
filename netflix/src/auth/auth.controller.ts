import { ClassSerializerInterceptor, Controller, Get, Header, Headers, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  registerUser(@Headers('authorization') token: string) {
    return this.authService.register(token);
  }

  @Public()
  @Post('login')
  loginUser(@Headers('authorization') token: string) {
    return this.authService.login(token);
  }

  @Post('token/access')
  async rotateAccessToken(@Request() req) {
    return {
      accessToken: await this.authService.issueToken(req.user, false)
    }
  }

  @UseGuards(AuthGuard('local'))
  @Post('login/passport')
  async loginUserPassport(@Request() req) {
    return {
      refreshToken: await this.authService.issueToken(req.user, true),
      accessToken: await this.authService.issueToken(req.user, false)
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('private')
  async private(@Request() req) {
    return req.user;
  }
}
