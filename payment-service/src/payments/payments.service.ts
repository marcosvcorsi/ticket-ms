import { OrderStatus } from '@mvctickets/common';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { StripeGateway } from './gateways/stripe.gateway';
import { OrdersRepository } from './repositories/orders.repository';
import { PaymentsRepository } from './repositories/payments.repository';
import { Payment } from './schemas/payment.schema';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly stripeGateway: StripeGateway,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<Payment> {
    const { orderId, token } = createPaymentDto;

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

    const charge = await this.stripeGateway.charge(token, order.price);

    const payment = await this.paymentsRepository.create({
      chargeId: charge.id,
      order,
    });

    return payment;
  }
}
