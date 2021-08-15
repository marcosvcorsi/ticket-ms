import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { UsersRepository } from './repositories/users.repository';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async showUserInfo() {
    return 'OK';
  }

  async signIn() {
    return 'OK';
  }

  async signOut() {
    return 'OK';
  }

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const { email } = signUpDto;

    const emailAlreadyExists = await this.usersRepository.findByEmail(email);

    if (emailAlreadyExists) {
      throw new BadRequestException('E-mail already exists');
    }

    const user = await this.usersRepository.create(signUpDto);

    return user;
  }
}
