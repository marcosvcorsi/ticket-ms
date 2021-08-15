import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { HashService } from './hash/hash.service';
import { UsersRepository } from './repositories/users.repository';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async showUserInfo() {
    return 'OK';
  }

  async signIn(signInDto: SignInDto): Promise<{ token: string }> {
    const { email, password } = signInDto;

    const user = await this.usersRepository.findByEmail(email);

    if (!user || !(await this.hashService.compare(password, user.password))) {
      throw new UnauthorizedException('E-mail or password is invalid');
    }

    const token = this.jwtService.sign({ id: user._id });

    return { token };
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
