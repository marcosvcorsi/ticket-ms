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

    return signResponse;
  }

  @Post('sign-up')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, user } = await this.usersService.signUp(signUpDto);

    response.cookie('jwt', token);

    return user;
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(@Res() response: Response) {
    response.clearCookie('jwt');

    return response.send();
  }

  @Get('me')
  async showUserInfo(@Req() request: Request) {
    const token = request.cookies['jwt'];

    return this.usersService.showUserInfo(token);
  }
}
