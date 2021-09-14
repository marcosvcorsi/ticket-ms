import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { OrdersRepository } from './repositories/orders.repository';
import { TicketsRepository } from './repositories/tickets.repository';
import { TicketsService } from './services/tickets.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersRepository,
    TicketsRepository,
    TicketsService,
    OrdersService,
  ],
})
export class OrdersModule {}
