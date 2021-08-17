import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const signResponse = await this.usersService.signIn(signInDto);

    response.cookie('jwt', signResponse.token);

    return response.send(signResponse);
  }

  @Post('sign-up')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, user } = await this.usersService.signUp(signUpDto);

    response.cookie('jwt', token);

    return response.send(user);
  }

  @Post('sign-out')
  async signOut() {
    return this.usersService.signOut();
  }

  @Get('me')
  async showUserInfo(@Req() request: Request) {
    const token = request.cookies['jwt'];

    return this.usersService.showUserInfo(token);
  }
}
