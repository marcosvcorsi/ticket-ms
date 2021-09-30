import { OrderStatus } from '@mvctickets/common';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { PaymentCreatedPublisher } from './events/publishers';
import { StripeGateway } from './gateways/stripe.gateway';
import { PaymentModel } from './model/payment.model';
import { OrdersRepository } from './repositories/orders.repository';
import { PaymentsRepository } from './repositories/payments.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly stripeGateway: StripeGateway,
    private readonly paymentCreatedPublisher: PaymentCreatedPublisher,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<PaymentModel> {
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

    const paymentDocument = await this.paymentsRepository.create({
      chargeId: charge.id,
      order,
    });

    const payment = PaymentModel.fromDocument(paymentDocument);

    await this.paymentCreatedPublisher.publish(payment);

    return payment;
  }
}
