import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  name: string;
}
