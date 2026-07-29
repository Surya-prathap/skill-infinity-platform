# Skill Infinity - Review Service

Mentor ratings, session reviews, review replies, voting, reporting, moderation, and rating analytics.

## Architecture

The Review Service is a Spring Boot 3.x microservice responsible for:
- **Reviews**: Create, read, update, and delete reviews for mentoring sessions
- **Ratings**: 1-5 star rating system with average calculations
- **Replies**: Mentors can reply to reviews
- **Voting**: Users can vote reviews as HELPFUL or NOT_HELPFUL
- **Reporting**: Users can report inappropriate reviews
- **Moderation**: Admin moderation (approve/reject reviews)
- **Analytics**: Rating statistics, breakdowns, top mentors, growth metrics

## Technology Stack

| Technology | Purpose |
|---|---|
| Java 21 | Runtime |
| Spring Boot 3.2.x | Framework |
| Spring Data JPA | Database access |
| Spring Security | Authentication/Authorization |
| Spring Cloud Config | Centralized configuration |
| Spring Cloud Eureka | Service discovery |
| MySQL | Primary database |
| Redis | Caching |
| RabbitMQ | Async messaging |
| MapStruct | Entity-DTO mapping |
| Lombok | Boilerplate reduction |
| OpenAPI 3 | API documentation |
| JUnit 5 + Mockito | Testing |

## Database

**Database Name**: `skill_infinity_review`

The service owns the following tables:

| Table | Description |
|---|---|
| `reviews` | Core review entity with ratings and content |
| `review_replies` | Mentor replies to reviews |
| `review_votes` | User votes (HELPFUL/NOT_HELPFUL) |
| `review_reports` | Review reports for moderation |
| `mentor_ratings` | Aggregated rating data per mentor |
| `rating_statistics` | Detailed analytics per mentor |
| `review_history` | Audit trail for review changes |

## Review Workflow

1. **Learner completes a mentoring session** → Session service publishes `SessionCompletedEvent`
2. **Learner submits a review** → Review is created with `PENDING` status
3. **Admin moderates** → Review is `APPROVED` or `REJECTED`
4. **Approved review** → Becomes visible, contributes to mentor rating
5. **Mentor can reply** → After review is approved
6. **Users can vote** → HELPFUL or NOT_HELPFUL
7. **Users can report** → Reports are queued for admin review

## Caching Strategy (Redis)

| Cache Name | TTL | Purpose |
|---|---|---|
| `topMentors` | 5 min | Top rated mentors list |
| `averageRatings` | 10 min | Average rating per mentor |
| `reviewStatistics` | 15 min | Detailed statistics |
| `recentReviews` | 5 min | Recent reviews per mentor |
| `ratingBreakdown` | 10 min | Rating distribution |
| `sessionReviews` | 5 min | Reviews per session |

Cache is invalidated when:
- New review is created, updated, or deleted
- Review is moderated
- Vote or report is submitted

## Messaging (RabbitMQ)

### Published Events

| Event | Routing Key | Description |
|---|---|---|
| `ReviewCreatedEvent` | `review.created` | New review submitted |
| `ReviewUpdatedEvent` | `review.updated` | Review content changed |
| Review Deleted | `review.deleted` | Review removed |
| Review Reported | `review.reported` | Review flagged |

### Consumed Events

| Event | Queue | Source Service |
|---|---|---|
| `SessionCompletedEvent` | `review.session.completed.queue` | Session Service |
| `UserRegisteredEvent` | `review.user.registered.queue` | Identity Service |
| `MentorRegisteredEvent` | `review.mentor.registered.queue` | Mentor Service |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/reviews` | Create a review |
| GET | `/api/v1/reviews` | Get reviews by mentor |
| GET | `/api/v1/reviews/{id}` | Get review by ID |
| PUT | `/api/v1/reviews/{id}` | Update a review |
| DELETE | `/api/v1/reviews/{id}` | Delete a review |
| POST | `/api/v1/reviews/reply` | Reply to a review |
| POST | `/api/v1/reviews/vote` | Vote on a review |
| POST | `/api/v1/reviews/report` | Report a review |
| GET | `/api/v1/reviews/search` | Search reviews |
| GET | `/api/v1/reviews/statistics` | Get review statistics |
| GET | `/api/v1/reviews/average-rating` | Get average rating |
| GET | `/api/v1/reviews/rating-breakdown` | Get rating breakdown |
| GET | `/api/v1/reviews/recent` | Get recent reviews |
| GET | `/api/v1/reviews/top-rated` | Get top rated mentors |
| GET | `/api/v1/reviews/session/{sessionId}` | Get session reviews |
| PUT | `/api/v1/reviews/{id}/moderate` | Moderate a review (admin) |

## Docker

```bash
# Build the service
docker build -t skill-infinity/review-service -f Dockerfile ..

# Run with docker-compose
docker-compose up -d review-service
```

## Swagger

Once running, access Swagger UI at:
- `http://localhost:8089/review-service/swagger-ui.html`
- API Docs: `http://localhost:8089/review-service/v3/api-docs`

## Testing

```bash
# Run all tests
mvn test -pl review-service

# Run with coverage
mvn test -pl review-service -Dcoverage

# Run specific test
mvn test -pl review-service -Dtest=ReviewServiceImplTest
```

## Configuration

Key configuration properties (via Config Server or environment variables):

| Variable | Default | Description |
|---|---|---|
| `REVIEW_SERVICE_PORT` | 8089 | Service port |
| `REVIEW_DB_HOST` | localhost | Database host |
| `REVIEW_DB_NAME` | skill_infinity_review | Database name |
| `REDIS_HOST` | localhost | Redis host |
| `RABBITMQ_HOST` | localhost | RabbitMQ host |
| `EUREKA_DEFAULT_ZONE` | http://localhost:8761/eureka/ | Eureka URL |

## Security

- All endpoints require JWT authentication (except actuator and swagger)
- Users can only manage their own reviews
- Mentors can only reply to their own reviews
- Admin role required for moderation
- Duplicate review detection per session
- Spam prevention via rate limiting

## Dependencies

This service depends on:
- **Config Server** - Configuration
- **Discovery Server** - Service registration
- **MySQL** - Database
- **Redis** - Caching
- **RabbitMQ** - Messaging
- **Identity Service** - JWT validation
- **Session Service** - Session completion events
