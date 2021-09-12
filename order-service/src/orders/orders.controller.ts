import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';

@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async find() {
    return [];
  }

  @Get('/:id')
  async findById(@Param('id') id: string) {
    return {};
  }

  @Post()
  async create() {
    return {};
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return {};
  }
}
