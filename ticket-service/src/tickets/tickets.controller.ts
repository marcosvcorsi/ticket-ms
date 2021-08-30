import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
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

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.ticketsService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() request,
  ) {
    const { id: userId } = request.user;

    return this.ticketsService.update(id, {
      userId,
      ...updateTicketDto,
    });
  }

  @Get()
  async find() {
    return this.ticketsService.find();
  }
}
