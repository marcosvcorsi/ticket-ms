import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { PaymentsService } from './payments.service';

@UseGuards(AuthGuard('jwt'))
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto, @Request() request) {
    const { id: userId } = request.user;

    return this.paymentsService.create(createPaymentDto, userId);
  }
}
