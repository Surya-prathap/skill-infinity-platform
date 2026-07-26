# Skill Infinity - Mentor Service

Enterprise-grade mentor management service for the Skill Infinity platform. Enables users to become mentors, manage their profiles, define expertise, manage availability, create pricing options, and prepare for session booking.

## Architecture

The Mentor Service is a Spring Boot microservice within the Skill Infinity platform, following a clean architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (8080)                        │
│                        │                                    │
│            lb://mentor-service (8083)                        │
│                        │                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Controller Layer  →  Service Layer  →  Repository  │   │
│  │                        │                            │   │
│  │                   ┌────┴────┐                       │   │
│  │                   │  Redis  │── Cache               │   │
│  │                   ├─────────┤                       │   │
│  │                   │RabbitMQ │── Events              │   │
│  │                   └─────────┘                       │   │
│  │                        │                            │   │
│  │                   MySQL Database                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Java 21** with Spring Boot 3.2.x
- **Spring Data JPA** for database access
- **Spring Security** for authentication (via API Gateway)
- **Spring Cloud Config Client** for externalized configuration
- **Eureka Discovery Client** for service registration
- **Redis** for caching mentor profiles and search results
- **RabbitMQ** for asynchronous event publishing
- **MySQL** as the primary database
- **MapStruct** for entity-to-DTO mapping
- **OpenAPI** for API documentation
- **JUnit 5 & Mockito** for testing

## Responsibilities

- Mentor registration and profile management
- Expertise and skill management with category taxonomy
- Weekly availability scheduling and time slot generation
- Pricing configuration with multiple session types
- Certification and achievement management
- Language proficiency tracking
- Advanced mentor search with filtering and pagination
- Mentor dashboard with statistics
- Profile completion tracking
- Verification workflow (admin approval)

## Database

The service uses its own isolated database: `skill_infinity_mentor`

### Entity Model

| Entity | Description |
|--------|-------------|
| `Mentor` | Core mentor entity linked to user accounts |
| `MentorProfile` | Extended profile information (bio, headline, location) |
| `Expertise` | Skills and areas of expertise with teaching levels |
| `Category` | Top-level taxonomy categories |
| `SubCategory` | Sub-categories within categories |
| `Skill` | Specific skills within sub-categories |
| `MentorAvailability` | Weekly recurring or date-specific availability |
| `TimeSlot` | Generated individual time slots from availability |
| `Pricing` | Session pricing options (hourly, per-session) |
| `Language` | Languages the mentor speaks |
| `Certification` | Professional certifications and credentials |
| `Achievement` | Awards, honors, and achievements |
| `Experience` | Work experience history |
| `Education` | Educational background |
| `VerificationDocument` | Uploaded verification documents |
| `MentorStatistics` | Aggregated mentor performance metrics |
| `MentorPreference` | Mentor-specific preferences |
| `SocialProfile` | Social media and professional network links |

All entities use UUID primary keys with audit fields (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`) and optimistic locking via `@Version`.

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MENTOR_SERVICE_PORT` | `8083` | Service port |
| `MENTOR_DB_HOST` | `localhost` | MySQL host |
| `MENTOR_DB_PORT` | `3306` | MySQL port |
| `MENTOR_DB_NAME` | `skill_infinity_mentor` | Database name |
| `MENTOR_DB_USERNAME` | `root` | Database username |
| `MENTOR_DB_PASSWORD` | `root` | Database password |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `RABBITMQ_HOST` | `localhost` | RabbitMQ host |
| `RABBITMQ_PORT` | `5672` | RabbitMQ port |
| `EUREKA_DEFAULT_ZONE` | `http://localhost:8761/eureka/` | Eureka URL |
| `CONFIG_SERVER_URL` | `http://localhost:8888` | Config server URL |

## API Endpoints

### Mentor Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/mentors` | Register as a mentor | JWT |
| GET | `/api/v1/mentors` | List all mentors (paginated) | JWT |
| GET | `/api/v1/mentors/{id}` | Get mentor by ID | JWT |
| PUT | `/api/v1/mentors/{id}` | Update mentor profile | JWT |
| DELETE | `/api/v1/mentors/{id}` | Delete mentor profile | JWT |
| GET | `/api/v1/mentors/{id}/public` | Get public mentor profile | Public |
| GET | `/api/v1/mentors/profile` | Get own mentor profile | JWT |

### Search

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/mentors/search` | Advanced search | Public |

Search supports filtering by: keyword, skills, categories, experience range, languages, max price, country, timezone.

### Expertise

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/mentors/{id}/expertise` | Add expertise |
| PUT | `/api/v1/mentors/{id}/expertise/{expertiseId}` | Update expertise |
| DELETE | `/api/v1/mentors/{id}/expertise/{expertiseId}` | Delete expertise |
| GET | `/api/v1/mentors/{id}/expertise` | Get all expertise |

### Categories (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/mentors/categories` | Get all categories |
| GET | `/api/v1/mentors/categories/{id}` | Get category by ID |
| GET | `/api/v1/mentors/categories/{id}/subcategories` | Get subcategories |

### Availability

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/mentors/availability` | Add own availability |
| PUT | `/api/v1/mentors/availability` | Update own availability |
| GET | `/api/v1/mentors/availability` | Get own availability |
| POST | `/api/v1/mentors/{id}/availability` | Add availability by ID |
| PUT | `/api/v1/mentors/{id}/availability` | Update availability by ID |
| GET | `/api/v1/mentors/{id}/availability` | Get availability by ID |
| POST | `/api/v1/mentors/{id}/availability/generate-slots` | Generate time slots |

### Pricing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/mentors/{id}/pricing` | Add pricing |
| PUT | `/api/v1/mentors/{id}/pricing/{pricingId}` | Update pricing |
| DELETE | `/api/v1/mentors/{id}/pricing/{pricingId}` | Delete pricing |
| GET | `/api/v1/mentors/{id}/pricing` | Get all pricing |

### Certifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/mentors/certifications` | Add own certification |
| PUT | `/api/v1/mentors/certifications/{id}` | Update own certification |
| DELETE | `/api/v1/mentors/certifications/{id}` | Delete own certification |
| POST | `/api/v1/mentors/{id}/certifications` | Add certification by ID |
| PUT | `/api/v1/mentors/{id}/certifications/{certificationId}` | Update certification |
| DELETE | `/api/v1/mentors/{id}/certifications/{certificationId}` | Delete certification |
| GET | `/api/v1/mentors/{id}/certifications` | Get certifications |

### Languages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/mentors/{id}/languages` | Add language |
| PUT | `/api/v1/mentors/{id}/languages/{languageId}` | Update language |
| DELETE | `/api/v1/mentors/{id}/languages/{languageId}` | Delete language |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/mentors/dashboard` | Get mentor dashboard |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/v1/mentors/{id}/verify` | Verify/reject mentor (Admin) |

## Availability Management

The availability system supports:
- Weekly recurring schedules
- Specific date availability
- Working hours with break time configuration
- Slot duration customization (default: 60 minutes)
- Time zone support
- Automatic time slot generation for date ranges
- Conflict detection for overlapping slots
- Slot status tracking (AVAILABLE, BOOKED, BLOCKED, EXPIRED)

## Caching Strategy

| Cache Name | TTL | Description |
|------------|-----|-------------|
| `mentorProfiles` | 30 minutes | Individual mentor profiles |
| `mentorSearch` | 15 minutes | Search results |
| `categories` | 60 minutes | Category taxonomy |

Caches are automatically invalidated on write operations (profile updates, expertise changes, etc.).

## Docker

```bash
# Build the service
cd backend
mvn clean package -pl mentor-service -am -DskipTests

# Run with Docker Compose
docker-compose up -d mentor-service
```

## Swagger Documentation

Once the service is running:

- Swagger UI: `http://localhost:8083/mentor-service/swagger-ui.html`
- API Docs: `http://localhost:8083/mentor-service/v3/api-docs`

## Testing

```bash
# Run all tests
cd backend
mvn test -pl mentor-service -am

# Run specific test class
mvn test -pl mentor-service -am -Dtest=MentorControllerTest
```

## RabbitMQ Events

The service publishes the following events:

| Event | Routing Key | Trigger |
|-------|-------------|---------|
| `MentorRegisteredEvent` | `mentor.registered` | Mentor registration |
| `MentorProfileUpdatedEvent` | `mentor.profile.updated` | Profile update |
| `MentorAvailabilityUpdatedEvent` | `mentor.availability.updated` | Availability change |
| `MentorVerifiedEvent` | `mentor.verified` | Mentor verification |
