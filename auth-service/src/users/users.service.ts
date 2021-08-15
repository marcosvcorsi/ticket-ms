import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class UsersService {
  async showUserInfo() {
    return 'OK';
  }

  async signIn() {
    return 'OK';
  }

  async signOut() {
    return 'OK';
  }

  async signUp(signUpDto: SignUpDto) {
    return 'OK';
  }
}
