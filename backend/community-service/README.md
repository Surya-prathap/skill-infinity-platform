# Skill Infinity - Community Service

Discussion forums, communities, posts, comments, polls, and moderation platform for the Skill Infinity ecosystem.

## Architecture

The Community Service follows Clean Architecture principles with a layered structure:

- **Controller** — REST API endpoints
- **Service** — Business logic layer
- **Repository** — Data access layer (Spring Data JPA)
- **Entity** — JPA domain models
- **DTO** — Request/Response data transfer objects
- **Mapper** — MapStruct for entity↔DTO conversion
- **Event** — RabbitMQ event publishing and consumption
- **Config** — Spring configuration classes

## Responsibilities

- Community creation, discovery, and membership management
- Post creation, editing, deletion, search, and discovery
- Comments, replies, likes, and bookmarks
- Poll creation and voting
- Content reporting and moderation
- Platform analytics and trending content
- Redis caching for trending posts, popular communities, and tags
- RabbitMQ event publishing for inter-service communication

## Database

- **Database:** `community_db` (MySQL)
- **Naming:** Snake case table and column names
- **IDs:** UUID primary keys
- **Audit:** `created_at`, `updated_at`, `created_by`, `updated_by`
- **Soft deletes:** `active` boolean flag

### Tables

| Table | Description |
|-------|-------------|
| `communities` | Community groups |
| `community_members` | Community membership with roles |
| `posts` | Discussion posts and articles |
| `comments` | Post comments and replies |
| `likes` | Post and comment likes |
| `bookmarks` | Post bookmarks |
| `tags` | Content tags |
| `categories` | Content categories |
| `polls` | Poll questions |
| `poll_options` | Poll answer options |
| `poll_votes` | Poll votes |
| `pinned_posts` | Pinned posts mapping |
| `reports` | Content reports |
| `moderation_actions` | Moderation action log |

## API Endpoints

### Communities

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/communities` | Create community |
| GET | `/api/v1/communities` | List communities |
| GET | `/api/v1/communities/{id}` | Get community by ID |
| GET | `/api/v1/communities/slug/{slug}` | Get community by slug |
| PUT | `/api/v1/communities/{id}` | Update community |
| DELETE | `/api/v1/communities/{id}` | Delete community |
| POST | `/api/v1/communities/{id}/join` | Join community |
| POST | `/api/v1/communities/{id}/leave` | Leave community |
| GET | `/api/v1/communities/my` | Get my communities |
| GET | `/api/v1/communities/search` | Search communities |

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/posts` | Create post |
| PUT | `/api/v1/posts/{id}` | Update post |
| DELETE | `/api/v1/posts/{id}` | Delete post |
| GET | `/api/v1/posts/{id}` | Get post |
| GET | `/api/v1/posts` | Get posts by community |
| GET | `/api/v1/posts/user/{userId}` | Get posts by user |
| POST | `/api/v1/posts/{id}/like` | Like post |
| POST | `/api/v1/posts/{id}/unlike` | Unlike post |
| POST | `/api/v1/posts/{id}/bookmark` | Bookmark post |
| POST | `/api/v1/posts/{id}/unbookmark` | Unbookmark post |
| GET | `/api/v1/posts/trending` | Get trending posts |
| GET | `/api/v1/posts/pinned` | Get pinned posts |
| GET | `/api/v1/posts/popular` | Get popular posts |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/comments` | Create comment |
| DELETE | `/api/v1/comments/{id}` | Delete comment |
| GET | `/api/v1/comments/post/{postId}` | Get post comments |
| GET | `/api/v1/comments/replies/{parentId}` | Get replies |
| POST | `/api/v1/comments/{id}/like` | Like comment |
| POST | `/api/v1/comments/{id}/unlike` | Unlike comment |

### Polls

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/polls` | Create poll |
| GET | `/api/v1/polls/{id}` | Get poll |
| POST | `/api/v1/polls/vote` | Vote on poll |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search` | Search posts |
| GET | `/api/v1/search/communities` | Search communities |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics` | Platform analytics (Admin) |
| GET | `/api/v1/analytics/popular-posts` | Popular posts |
| GET | `/api/v1/analytics/trending-communities` | Trending communities |
| GET | `/api/v1/analytics/popular-tags` | Popular tags |

## Caching (Redis)

- `trendingPosts` — TTL: 5 minutes
- `popularCommunities` — TTL: 2 minutes
- `popularTags` — TTL: 5 minutes
- `topContributors` — TTL: 10 minutes

## Messaging (RabbitMQ)

### Published Events
- `community.post.created` — When a post is created
- `community.comment.created` — When a comment is created

### Consumed Events
- `session.completed` — Session completed
- `user.registered` — New user registered
- `mentor.registered` — New mentor registered

## Docker

```bash
# Build image
docker build -t skill-infinity-community-service -f community-service/Dockerfile .

# Run container
docker run -p 8088:8088 --name community-service skill-infinity-community-service
```

## Swagger

Once running, Swagger UI is available at:
```
http://localhost:8088/swagger-ui/index.html
```

## Testing

```bash
# Run tests
mvn test -pl community-service -am

# Run tests with coverage
mvn test -pl community-service -am -Pcoverage
```

## Technology Stack

- Java 21
- Spring Boot 3.x
- Spring Data JPA
- Spring Validation
- Spring Cloud Config Client
- Spring Cloud Eureka Client
- Spring Security
- Spring Boot Actuator
- RabbitMQ
- Redis
- MySQL
- MapStruct
- Lombok
- OpenAPI / Swagger
- JUnit 5 / Mockito
