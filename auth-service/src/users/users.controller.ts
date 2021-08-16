import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private setAuthCookie(response: Response, token: string) {
    response.cookie('jwt', token);
  }

  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.setAuthCookie(
      response,
      await this.usersService.signIn(signInDto),
    );
  }

  @Post('sign-up')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.setAuthCookie(
      response,
      await this.usersService.signUp(signUpDto),
    );
  }

  @Post('sign-out')
  async signOut() {
    return this.usersService.signOut();
  }

  @Get('me')
  async showUserInfo() {
    return this.usersService.showUserInfo();
  }
}
