import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}
