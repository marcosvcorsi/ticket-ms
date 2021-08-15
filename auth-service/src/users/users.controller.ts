import { Body, Controller, Get, Post } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async showUserInfo() {
    return this.usersService.showUserInfo();
  }

  @Post('sign-in')
  async signIn() {
    return this.usersService.signIn();
  }

  @Post('sign-out')
  async signOut() {
    return this.usersService.signOut();
  }

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.usersService.signUp(signUpDto);
  }
}
