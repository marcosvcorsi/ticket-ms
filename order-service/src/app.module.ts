import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './shared/strategies/jwt.strategy';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        NATS_CLUSTER_ID: Joi.string().required(),
        NATS_CLIENT_ID: Joi.string().required(),
        NATS_URL: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    OrdersModule,
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
