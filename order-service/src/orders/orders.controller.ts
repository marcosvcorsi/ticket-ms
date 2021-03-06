import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from './dtos/create-order.dto';
import { OrdersService } from './services/orders.service';

@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async find(@Request() request) {
    const { id: userId } = request.user;

    return this.ordersService.find(userId);
  }

  @Get('/:id')
  async findById(@Param('id') id: string, @Request() request) {
    const { id: userId } = request.user;

    return this.ordersService.findById(id, userId);
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() request) {
    const { id: userId } = request.user;

    return this.ordersService.create({
      userId,
      ...createOrderDto,
    });
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Request() request) {
    const { id: userId } = request.user;

    await this.ordersService.cancel(id, userId);
  }
}
