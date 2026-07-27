# Skill Infinity - Payment Service

Payment processing service that powers the Skill Infinity credit economy, handling credit purchases, subscriptions, coupons, invoicing, and financial transactions.

## Architecture

The Payment Service follows a clean architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Payment Controller                        │
├─────────────────────────────────────────────────────────────┤
│                    Payment Service Layer                      │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │
│   │ PaymentService│ │ CouponService│ │ SubscriptionService│  │
│   └──────┬───────┘ └──────┬───────┘ └────────┬─────────┘   │
│          │                │                   │              │
│   ┌──────┴────────────────┴───────────────────┴─────────┐   │
│   │              Gateway Strategy Layer                   │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐  ...         │   │
│   │  │ Internal │ │ Stripe   │ │ Razorpay │  (extensible) │   │
│   │  └──────────┘ └──────────┘ └──────────┘              │   │
│   └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                  Repository Layer (JPA)                      │
├─────────────────────────────────────────────────────────────┤
│               Database / Redis / RabbitMQ                    │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Patterns

- **Strategy Pattern**: Payment gateway integrations
- **Repository Pattern**: Data access abstraction
- **DTO Pattern**: Entity-to-Response mapping via MapStruct
- **Event-Driven Architecture**: RabbitMQ for async communication
- **Caching**: Redis for payment summaries, subscription status, and coupons

## Responsibilities

- **Credit Purchase**: Process credit purchases through internal/external gateways
- **Payment Initiation**: Create and track payment transactions
- **Payment Confirmation**: Verify and confirm successful payments
- **Payment Failure**: Handle and record failed payment attempts
- **Retry Payment**: Allow retrying failed payments
- **Refund Processing**: Request and approve refunds with eligibility checks
- **Coupon Management**: Validate and apply discount coupons
- **Subscription Management**: Purchase, cancel, and manage subscription plans
- **Invoice Generation**: Auto-generate invoices for completed payments
- **Receipt Generation**: Auto-generate receipts for completed payments
- **Payment History**: Paginated payment history and audit logs

## Database

### Tables

| Table | Description |
|-------|-------------|
| `payments` | Core payment transactions |
| `payment_attempts` | Individual payment attempt records |
| `payment_methods` | Saved payment methods per user |
| `payment_history` | Status change history |
| `invoices` | Generated invoices |
| `receipts` | Generated receipts |
| `refunds` | Refund transactions |
| `coupons` | Discount coupons |
| `taxes` | Tax records per payment |
| `subscription_plans` | Available subscription plans |
| `subscription_history` | User subscription records |
| `payment_audit` | Audit trail for all payment actions |

All tables use UUID primary keys and include audit fields (`created_at`, `updated_at`, `created_by`, `updated_by`).

## Payment Flow

### Credit Purchase Flow

```
User → POST /api/v1/payments (Initiate)
  → Payment created with status INITIATED
  → Gateway order created
  → PaymentAttempt saved

User → POST /api/v1/payments/confirm (Confirm)
  → Signature verified
  → Payment processed via gateway
  → Status → COMPLETED
  → Invoice generated
  → Receipt generated
  → Events published (PaymentCompleted, CreditsPurchased)

OR

User → POST /api/v1/payments/fail (Fail)
  → Status → FAILED
  → Failure reason/code recorded
  → Events published (PaymentFailed)
```

### Refund Flow

```
User → POST /api/v1/payments/refund (Request)
  → Eligibility validated (30-day window)
  → Refund created with status PENDING
  → Auto-approved if amount ≤ 1000

Admin → Refund approval (manual for > 1000)
  → Gateway refund processed
  → Payment status → REFUNDED / PARTIALLY_REFUNDED
  → Events published (RefundCompleted)
```

## Coupons

### Supported Features

| Feature | Description |
|---------|-------------|
| **Flat Discount** | Fixed amount discount |
| **Percentage Discount** | Percentage-based discount |
| **Expiry** | Coupon validity period |
| **Usage Limits** | Max total uses and per-user limits |
| **Minimum Purchase** | Minimum amount required |
| **Max Discount** | Cap on discount amount |

### Coupon Validation

When a payment is initiated with a coupon code:
1. Coupon exists and is active
2. Within valid date range
3. Usage limit not exceeded
4. Minimum purchase amount met
5. Discount calculated and applied

## Subscriptions

### Plan Types

| Plan | Price | Credits/Month | Duration |
|------|-------|---------------|----------|
| Free | 0 CREDITS | 10 | 30 days |
| Learner Pro | Configurable | Configurable | Configurable |
| Mentor Pro | Configurable | Configurable | Configurable |
| Enterprise | Custom | Custom | Custom |

### Subscription Lifecycle

```
PURCHASED → ACTIVE → EXPIRED
                  → CANCELLED (by user)
                  → SUSPENDED (by admin)
```

## Caching (Redis)

### Cache Configuration

| Cache Name | TTL | Description |
|-----------|-----|-------------|
| `paymentSummary` | 5 min | Payment details |
| `subscriptionStatus` | 5 min | Active subscription status |
| `coupon` | 10 min | Coupon data |

Caches are invalidated after any write operation.

## Messaging (RabbitMQ)

### Published Events

| Event | Routing Key | Description |
|-------|-------------|-------------|
| `PaymentInitiatedEvent` | `payment.initiated` | Payment has been initiated |
| `PaymentCompletedEvent` | `payment.completed` | Payment completed successfully |
| `PaymentFailedEvent` | `payment.failed` | Payment processing failed |
| `RefundCompletedEvent` | `payment.refund.completed` | Refund processed successfully |
| `CreditsPurchasedEvent` | `payment.credits.purchased` | Credits have been purchased |
| `SubscriptionActivatedEvent` | `payment.subscription.activated` | Subscription activated |

### Event Exchange

- Exchange: `payment.exchange` (Direct)
- All queues are durable

## API Endpoints

### Payment Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/payments` | Initiate payment | Authenticated |
| POST | `/api/v1/payments/confirm` | Confirm payment | Authenticated |
| POST | `/api/v1/payments/fail` | Report payment failure | Authenticated |
| POST | `/api/v1/payments/retry` | Retry failed payment | Authenticated |
| POST | `/api/v1/payments/refund` | Request refund | Authenticated |
| GET | `/api/v1/payments/history` | Get payment history | Authenticated |
| GET | `/api/v1/payments/{id}` | Get payment details | Authenticated |
| POST | `/api/v1/payments/coupon` | Validate coupon | Authenticated |
| POST | `/api/v1/payments/subscription` | Purchase subscription | Authenticated |
| POST | `/api/v1/payments/subscription/{id}/cancel` | Cancel subscription | Authenticated |
| GET | `/api/v1/payments/invoice/{id}` | Get invoice | Authenticated |
| GET | `/api/v1/payments/receipt/{id}` | Get receipt | Authenticated |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actuator/health` | Health check |
| GET | `/actuator/info` | Service info |
| GET | `/payment-service/v3/api-docs/**` | OpenAPI docs |
| GET | `/payment-service/swagger-ui/**` | Swagger UI |

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 21 | Runtime |
| Spring Boot | 3.2.5 | Application framework |
| Spring Data JPA | 3.x | Database access |
| Spring Security | 3.x | Authentication & RBAC |
| Spring Cloud Config | 2023.0.6 | Configuration management |
| Eureka | 2023.0.6 | Service discovery |
| MySQL 8.0 | 8.0 | Primary database |
| Redis 7 | 7 | Caching |
| RabbitMQ | 3.x | Async messaging |
| MapStruct | 1.5.5 | Entity-DTO mapping |
| OpenAPI | 2.5.0 | API documentation |
| Lombok | 1.18.46 | Boilerplate reduction |

## Docker

### Build

```bash
# From the backend directory
docker build -t skill-infinity/payment-service -f payment-service/Dockerfile .
```

### docker-compose

The service is configured in `docker/docker-compose.yml`:

```yaml
payment-service:
  build:
    context: ../backend
    dockerfile: payment-service/Dockerfile
  container_name: skill-infinity-payment-service
  ports:
    - "8086:8086"
  depends_on:
    - config-server
    - discovery-server
    - mysql
    - redis
    - rabbitmq
```

## Swagger

Access the Swagger UI at:
- Local: `http://localhost:8086/payment-service/swagger-ui.html`
- Via Gateway: `http://localhost:8080/payment-service/swagger-ui.html`
- OpenAPI Spec: `http://localhost:8086/payment-service/v3/api-docs`

## Configuration

Key configuration properties (via Config Server or `application.yml`):

```yaml
payment:
  cache:
    payment-summary-ttl: 300       # 5 minutes
    subscription-status-ttl: 300    # 5 minutes
    coupon-ttl: 600                 # 10 minutes
  credit:
    default-currency: CREDITS
    min-purchase-amount: 10
    max-purchase-amount: 10000
    conversion-rate: 1.0
  refund:
    max-days-after-payment: 30
    auto-approve-threshold: 1000
```

Environment variables:
- `PAYMENT_SERVICE_PORT` (default: 8086)
- `PAYMENT_DB_HOST`, `PAYMENT_DB_PORT`, `PAYMENT_DB_NAME`
- `PAYMENT_DB_USERNAME`, `PAYMENT_DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`
- `RABBITMQ_HOST`, `RABBITMQ_PORT`
- `EUREKA_DEFAULT_ZONE`

## Testing

```bash
# Run all tests
cd backend && mvn test -pl payment-service

# Run specific test class
cd backend && mvn test -pl payment-service -Dtest=PaymentServiceImplTest

# Run with coverage
cd backend && mvn test -pl payment-service -Pcoverage
```

### Test Coverage

| Layer | Coverage Target |
|-------|----------------|
| Service | > 90% |
| Controller | > 80% |
| Repository | > 80% |
| Mapper | > 90% |
| **Overall** | **> 80%** |

## Building

```bash
# Build the entire project
cd backend && mvn clean install -DskipTests

# Build only payment-service with dependencies
cd backend && mvn clean install -pl payment-service -am -DskipTests

# Run the service locally
cd backend && mvn spring-boot:run -pl payment-service
```

## Integration Points

### Incoming Communication
- **Identity Service**: JWT token validation
- **User Service**: User profile information
- **Config Server**: Centralized configuration
- **Eureka**: Service registration and discovery

### Outgoing Communication (Events)
- **Wallet Service**: `CreditsPurchasedEvent` for credit addition
- **Communication Service**: `PaymentCompletedEvent` for notifications
- **Session Service**: Payment status for session bookings
