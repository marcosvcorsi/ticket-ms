# Ticket Payment Microservice

[![GitHub stars](https://img.shields.io/github/stars/marcosvcorsi/ticket-ms)](https://github.com/marcosvcorsi/ticket-ms/stargazers)

A **microservice for handling ticket payments** in a distributed event-driven architecture. Built with NestJS, this service processes payment events using NATS Streaming for event communication and Stripe for payment processing.

## 📋 About

The Ticket Payment Microservice is part of a larger ticketing system that handles payment processing for ticket orders. It listens for order-related events (created, cancelled) and processes payments accordingly, then emits payment events for other services to consume.

## ✨ Features

- **Event-Driven Architecture**: Communicates via NATS Streaming
- **Payment Processing**: Stripe integration for secure payments
- **Event Listeners**: Reacts to order creation and cancellation
- **Event Publishers**: Emits payment events
- **MongoDB Integration**: Stores payment records
- **JWT Authentication**: Secured endpoints
- **Version Control**: Optimistic concurrency control
- **Microservice Pattern**: Independent, scalable service

## 🛠️ Tech Stack

- **Framework**: NestJS (v8)
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Message Broker**: NATS Streaming
- **Payment Gateway**: Stripe
- **Authentication**: JWT + Passport
- **Validation**: class-validator, Joi
- **Testing**: Jest, Supertest, mongodb-memory-server
- **Code Quality**: ESLint, Prettier, Husky

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/marcosvcorsi/ticket-ms.git
cd ticket-ms/payment-service

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

## 🚀 Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Production mode
npm run build
npm run start:prod
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run tests in debug mode
npm run test:debug

# Run end-to-end tests
npm run test:e2e
```

## 🏗️ Architecture

### Event Flow

```
Order Service          NATS Streaming         Payment Service
     |                        |                         |
     |--order.created------->|                         |
     |                        |--order.created------->|
     |                        |                    [Process Payment]
     |                        |                    [Save to MongoDB]
     |                        |                         |
     |                        |<---payment.created-----|
     |<--payment.created-----|                         |
```

### Service Structure

```
payment-service/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   └── payments/
│       ├── payments.controller.ts # HTTP endpoints
│       ├── payments.service.ts    # Business logic
│       ├── payments.module.ts     # Module configuration
│       ├── model/                 # Data models
│       ├── dtos/                  # Data Transfer Objects
│       ├── repositories/          # Database access
│       ├── schemas/               # Mongoose schemas
│       └── events/
│           ├── listeners/         # Event listeners
│           │   ├── order-created-listener.ts
│           │   └── order-cancelled-listener.ts
│           └── publishers/        # Event publishers
│               └── payment-created-publisher.ts
└── package.json
```

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Application
PORT=3000
NODE_ENV=development

# NATS Streaming
NATS_CLUSTER_ID=ticketing
NATS_CLIENT_ID=payment-service
NATS_URL=http://localhost:4222

# MongoDB
MONGO_URI=mongodb://payments-mongo-srv:27017/payments

# Stripe
STRIPE_KEY=your_stripe_secret_key

# JWT
JWT_KEY=your_jwt_key_here
```

## 📚 API Endpoints

### Get All Payments

```bash
GET /api/payments
```

### Get Payment by ID

```bash
GET /api/payments/:id
```

### Create Payment

```bash
POST /api/payments
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "orderId": "order_id",
  "token": "stripe_token"
}
```

## 🔑 Event Listeners

### Order Created

Listens for `order:created` events and processes payments for new orders.

### Order Cancelled

Listens for `order:cancelled` events and handles payment refunds or cancellations.

## 📤 Event Publishers

### Payment Created

Publishes `payment:created` events after successful payment processing.

## 🔐 Authentication

Endpoints are secured using JWT. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## 📝 Code Quality

```bash
# Build the project
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

## 🐳 Docker Deployment

This service is designed to run in a Docker container with other microservices. Ensure NATS Streaming and MongoDB are accessible.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and unlicensed.

## 👤 Author

**Marcos Vinicius Corsi**

- GitHub: [@marcosvcorsi](https://github.com/marcosvcorsi)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=marcosvcorsi/ticket-ms&type=Date)](https://star-history.com/#marcosvcorsi/ticket-ms&Date)

## 🔗 Related Services

This microservice is part of a larger ticketing system:

- **Order Service**: Handles ticket orders
- **Ticket Service**: Manages ticket inventory
- **Expiration Service**: Handles order expiration
- **Payment Service**: This service - processes payments
