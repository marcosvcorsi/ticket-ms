import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { HashService } from './hash/hash.service';
import { User } from './models/user.model';
import { UsersRepository } from './repositories/users.repository';

type SignResponse = {
  token?: string;
  user: User;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateToken(id: string): Promise<string> {
    const token = await this.jwtService.sign({ id });

    return token;
  }

  async signIn(signInDto: SignInDto): Promise<SignResponse> {
    const { email, password } = signInDto;

    const user = await this.usersRepository.findByEmail(email);

    if (!user || !(await this.hashService.compare(password, user.password))) {
      throw new UnauthorizedException('E-mail or password is invalid');
    }

    const token = await this.generateToken(user._id);

    return {
      token,
      user: User.fromDocument(user),
    };
  }

  async signUp(signUpDto: SignUpDto): Promise<SignResponse> {
    const { email } = signUpDto;

    const emailAlreadyExists = await this.usersRepository.findByEmail(email);

    if (emailAlreadyExists) {
      throw new BadRequestException('E-mail already exists');
    }

    const user = await this.usersRepository.create(signUpDto);

    const token = await this.generateToken(user._id);

    return {
      token,
      user: User.fromDocument(user),
    };
  }

  async showUserInfo(token: string) {
    if (!token) {
      return new BadRequestException('token is not provided');
    }

    try {
      const { id } = await this.jwtService.verify(token);

      const user = await this.usersRepository.findById(id);

      return User.fromDocument(user);
    } catch {
      return new UnauthorizedException('Invalid token');
    }
  }
}
