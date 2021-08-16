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

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateToken(id: string): Promise<string> {
    const token = this.jwtService.sign({ id });

    return token;
  }

  async signIn(signInDto: SignInDto): Promise<string> {
    const { email, password } = signInDto;

    const user = await this.usersRepository.findByEmail(email);

    if (!user || !(await this.hashService.compare(password, user.password))) {
      throw new UnauthorizedException('E-mail or password is invalid');
    }

    return this.generateToken(user._id);
  }

  async signUp(signUpDto: SignUpDto): Promise<string> {
    const { email } = signUpDto;

    const emailAlreadyExists = await this.usersRepository.findByEmail(email);

    if (emailAlreadyExists) {
      throw new BadRequestException('E-mail already exists');
    }

    const user = await this.usersRepository.create(signUpDto);

    return this.generateToken(user._id);
  }

  async showUserInfo() {
    return 'OK';
  }

  async signOut() {
    return 'OK';
  }
}
