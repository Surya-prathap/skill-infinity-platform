# Skill Infinity - Wallet Service

The Wallet Service powers the Skill Infinity credit economy, managing virtual currency operations including wallet creation, credit transactions, rewards, bonuses, referrals, and financial auditing.

## Architecture

The Wallet Service follows a domain-driven microservice architecture with the following components:

- **Controllers**: RESTful API endpoints for all wallet operations
- **Services**: Business logic for credit/debit, freeze/release, rewards, and statistics
- **Repositories**: Data access layer using Spring Data JPA
- **Entities**: JPA entities with UUID primary keys and audit fields
- **Mappers**: MapStruct-based entity-to-DTO mapping
- **Events**: RabbitMQ-based event publishing for inter-service communication
- **Cache**: none (direct DB reads)
- **Security**: JWT authentication via API Gateway with RBAC support

## Responsibilities

- Wallet creation and lifecycle management
- Credit purchase, consumption, and refund processing
- Wallet balance tracking (current, available, frozen, pending)
- Transaction history and wallet statement generation
- Reward and bonus credit management
- Referral reward processing
- Coupon redemption tracking
- Immutable audit trail for all operations
- Wallet statistics and reporting
- Credits freeze/release mechanism
- Event publishing for inter-service communication

## Database

The service uses MySQL as its primary database with the following tables:

| Table | Description |
|---|---|
| `wallets` | Wallet master data with aggregated totals |
| `wallet_balances` | Current balance state (1:1 with wallet) |
| `credit_transactions` | Immutable transaction records |
| `wallet_ledger` | Double-entry bookkeeping ledger |
| `rewards` | Credit reward records |
| `bonus_credits` | Promotional bonus credits |
| `referral_rewards` | Referral program rewards |
| `coupon_redemptions` | Coupon usage tracking |
| `wallet_audits` | Immutable audit log |
| `wallet_statistics` | Aggregated wallet statistics |

### Database Schema

```sql
CREATE DATABASE IF NOT EXISTS skill_infinity_wallet
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

## Wallet Flow

1. **Wallet Creation**: When a user registers, a wallet is automatically created with zero balance
2. **Credit Purchase**: User purchases credits via payment gateway → credits added to wallet
3. **Session Booking**: Credits deducted when booking a mentoring session
4. **Session Completion**: Mentor receives credit earnings after session completion
5. **Refund**: Credits refunded if a session is cancelled within policy
6. **Freeze/Release**: Credits can be frozen for dispute resolution and released when resolved

## Credit System

- **Internal Currency**: `CREDITS` (virtual currency)
- **Credit Purchase**: Real money → credits conversion
- **Credit Consumption**: Credits spent on mentoring sessions
- **Credit Refund**: Credits returned for cancelled sessions
- **Promotional Credits**: Special credits with expiration
- **Reward Credits**: Earned through platform achievements
- **Bonus Credits**: Promotional bonuses (first purchase, bulk, seasonal)
- **Referral Credits**: Rewards for referring new users

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/wallet` | Create new wallet |
| GET | `/api/v1/wallet` | Get wallet details |
| GET | `/api/v1/wallet/balance` | Get wallet balance |
| POST | `/api/v1/wallet/credit` | Add credits |
| POST | `/api/v1/wallet/debit` | Deduct credits |
| POST | `/api/v1/wallet/freeze` | Freeze credits |
| POST | `/api/v1/wallet/release` | Release credits |
| GET | `/api/v1/wallet/history` | Transaction history |
| GET | `/api/v1/wallet/statement` | Wallet statement by date range |
| GET | `/api/v1/wallet/statistics` | Wallet statistics |

## Caching


| Cache Name | TTL | Purpose |
|---|---|---|
| `walletBalance` | 5 minutes | Wallet balance for authenticated user |
| `walletDetails` | 10 minutes | Full wallet details |
| `walletStatistics` | 5 minutes | Aggregated wallet statistics |

Cache is invalidated after any write operation (credit, debit, freeze, release).

## Messaging

The service publishes RabbitMQ events for inter-service communication:

| Event | Routing Key | Description |
|---|---|---|
| `WalletCreditedEvent` | `wallet.credited` | Credits added to wallet |
| `WalletDebitedEvent` | `wallet.debited` | Credits deducted from wallet |
| `CreditsPurchasedEvent` | `wallet.credits.purchased` | Credits purchased via payment |
| `RefundCompletedEvent` | `wallet.refund.completed` | Credit refund completed |

## Docker

```bash
# Build the service
docker build -f wallet-service/Dockerfile -t skillinfinity/wallet-service .

# Run with docker-compose
docker-compose up -d wallet-service
```

## Swagger

Once the service is running, access the Swagger UI at:

```
http://localhost:8085/wallet-service/swagger-ui.html
```

## Testing

```bash
# Run all tests
mvn test -pl wallet-service

# Run specific test class
mvn test -pl wallet-service -Dtest=WalletServiceImplTest

# Run with coverage
mvn test -pl wallet-service -Djacoco.skip=false
```

## Configuration

Key environment variables:

| Variable | Default | Description |
|---|---|---|
| `WALLET_SERVICE_PORT` | 8085 | Service port |
| `WALLET_DB_HOST` | localhost | MySQL host |
| `WALLET_DB_PORT` | 3306 | MySQL port |
| `WALLET_DB_NAME` | skill_infinity_wallet | Database name |
| `RABBITMQ_HOST` | localhost | RabbitMQ host |
| `CONFIG_SERVER_URL` | http://localhost:8888 | Config server URL |
| `EUREKA_DEFAULT_ZONE` | http://localhost:8761/eureka/ | Eureka URL |
