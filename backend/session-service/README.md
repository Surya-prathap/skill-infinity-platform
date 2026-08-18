# Skill Infinity - Session Service

Mentoring session lifecycle management including booking, scheduling, attendance, reminders, and calendar.

## Architecture

The Session Service follows a microservice architecture pattern and integrates with:

- **Config Server** - Centralized configuration management
- **Eureka Discovery Server** - Service registration and discovery
- **API Gateway** - Unified API entry point
- **Identity Service** - JWT token validation
- **User Service** - Learner profile retrieval
- **Mentor Service** - Mentor profile and availability validation
- **RabbitMQ** - Event-driven communication
- **MySQL** - Persistent data storage

## Responsibilities

- Session CRUD operations
- Booking management (learner books, mentor approves/rejects)
- Session lifecycle (schedule, start, end, complete)
- Rescheduling and cancellation
- Attendance tracking
- Meeting link management
- Calendar integration preparation
- Session reminders via RabbitMQ events
- Session history and audit trail

## Database

Uses an isolated `skill_infinity_session` MySQL database with the following tables:

| Table | Description |
|-------|-------------|
| `sessions` | Core session records |
| `bookings` | Booking requests |
| `session_participants` | Session participants |
| `cancellations` | Cancellation records |
| `reschedule_requests` | Reschedule request history |
| `meeting_links` | Meeting/video conference links |
| `attendance` | Attendance records |
| `session_history` | Audit trail |
| `session_reminders` | Reminder schedule |
| `session_notes` | Session notes |
| `calendar_events` | Calendar integration |
| `timezone_configurations` | User timezone settings |
| `session_feedback_placeholders` | Feedback placeholders |

## Booking Workflow

1. **Learner** creates a booking request with preferred time
2. System validates slot availability and duplicate bookings
3. **Mentor** receives the booking request
4. **Mentor** approves or rejects the booking
5. On approval, a session is automatically created
6. Meeting link and reminders are generated
7. RabbitMQ events are published for each state change

## Session Lifecycle

```
SCHEDULED → IN_PROGRESS → COMPLETED
    ↓            ↓
RESCHEDULED   CANCELLED
    ↓
SCHEDULED
```

- **SCHEDULED**: Session is created and scheduled
- **PENDING_APPROVAL**: Awaiting mentor approval
- **APPROVED**: Mentor has approved the booking
- **REJECTED**: Mentor has rejected the booking
- **IN_PROGRESS**: Session is currently active
- **COMPLETED**: Session has ended
- **CANCELLED**: Session was cancelled
- **RESCHEDULED**: Session time was changed
- **NO_SHOW**: Participant did not attend
- **EXPIRED**: Booking expired without action

## API Endpoints

### Session Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/sessions` | Create a new session |
| GET | `/api/v1/sessions` | Get all sessions (Admin) |
| GET | `/api/v1/sessions/{id}` | Get session by ID |
| PUT | `/api/v1/sessions/{id}` | Update session |
| DELETE | `/api/v1/sessions/{id}` | Delete session (Admin) |

### Booking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/sessions/book` | Book a session |
| POST | `/api/v1/sessions/approve` | Approve a booking |
| POST | `/api/v1/sessions/reject` | Reject a booking |

### Session Lifecycle
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/sessions/start` | Start a session |
| POST | `/api/v1/sessions/end` | End a session |
| POST | `/api/v1/sessions/reschedule` | Reschedule a session |
| POST | `/api/v1/sessions/cancel` | Cancel a session |

### Queries
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/sessions/upcoming` | Get upcoming sessions |
| GET | `/api/v1/sessions/history` | Get session history |
| GET | `/api/v1/sessions/search` | Search sessions |

### Attendance & Meeting
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/sessions/attendance` | Mark attendance |
| GET | `/api/v1/sessions/attendance` | Get attendance record |
| GET | `/api/v1/sessions/{id}/meeting` | Get meeting link |

### Calendar
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/sessions/calendar` | Get calendar events |
| GET | `/api/v1/sessions/calendar/export` | Export calendar as ICS |

## Caching


| Cache Name | TTL | Description |
|------------|-----|-------------|
| `upcomingSessions` | 5 min | Cached upcoming sessions list |
| `sessionDetails` | 10 min | Cached session details |
| `mentorSchedule` | 5 min | Cached mentor schedule |
| `popularTimeSlots` | 15 min | Cached popular time slot data |

Cache is automatically invalidated on session creation, update, booking, or status changes.

## Messaging

RabbitMQ events published:

| Event | Routing Key | When |
|-------|-------------|------|
| Session Booked | `session.booked` | Learner books a session |
| Session Approved | `session.approved` | Mentor approves booking |
| Session Rejected | `session.rejected` | Mentor rejects booking |
| Session Cancelled | `session.cancelled` | Session is cancelled |
| Session Completed | `session.completed` | Session is completed |
| Session Reminder | `session.reminder` | Reminder trigger |
| Session Rescheduled | `session.rescheduled` | Session is rescheduled |

## Docker

```bash
# Build and start the session service
docker-compose up -d session-service

# Or with all services
docker-compose up -d
```

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `SESSION_SERVICE_PORT` | 8084 | Service port |
| `SESSION_DB_HOST` | localhost | Database host |
| `SESSION_DB_PORT` | 3306 | Database port |
| `SESSION_DB_NAME` | skill_infinity_session | Database name |
| `SESSION_DB_USERNAME` | root | Database username |
| `SESSION_DB_PASSWORD` | root | Database password |
| `RABBITMQ_HOST` | localhost | RabbitMQ host |

## Swagger

API documentation is available when the service is running:

- **Swagger UI**: http://localhost:8084/session-service/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8084/session-service/v3/api-docs

## Testing

```bash
# Run all tests
mvn test -pl session-service

# Run specific test class
mvn test -pl session-service -Dtest=SessionControllerTest

# Run with coverage
mvn test -pl session-service -Pcoverage
```

## Technology Stack

- Java 21
- Spring Boot 3.x
- Spring Data JPA
- Spring Validation
- Spring Cloud Config Client
- Spring Cloud Eureka Client
- Spring Boot Actuator
- OpenAPI / Swagger
- RabbitMQ
- MySQL
- MapStruct
- Lombok
- JUnit 5
- Mockito
