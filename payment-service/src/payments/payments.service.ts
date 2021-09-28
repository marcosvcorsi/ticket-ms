import { OrderStatus } from '@mvctickets/common';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { OrdersRepository } from './repositories/orders.repository';

@Injectable()
export class PaymentsService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<string> {
    const { orderId } = createPaymentDto;

    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    if (order.userId !== userId) {
      throw new ForbiddenException("You can't pay for this order");
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestException("You can't pay for a cancelled order");
    }

    return 'OK';
  }
}
