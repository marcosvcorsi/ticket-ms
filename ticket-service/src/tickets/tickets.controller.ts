import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { TicketsService } from './tickets.service';

@UseGuards(AuthGuard('jwt'))
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async createTicket(
    @Body() createTicketDto: CreateTicketDto,
    @Request() request,
  ) {
    const { id: userId } = request.user;

    return this.ticketsService.create({
      userId,
      ...createTicketDto,
    });
  }
}
