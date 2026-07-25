# Skill Infinity - User Service

## Purpose

The User Service manages user profiles and related data for the Skill Infinity platform. It handles personal information, education, experience, skills, languages, and social links.

## Responsibilities

- User profile creation, update, and retrieval
- Education history management (CRUD)
- Work experience management (CRUD)
- Skills management (CRUD)
- Languages management (CRUD)
- Profile completion percentage calculation
- Profile search
- Resume and profile picture metadata storage

## Architecture

```
Client → API Gateway → User Service (:8082) → MySQL (user_db)
                              │
                              ├── User Profiles
                              ├── Education History
                              ├── Work Experience
                              ├── Skills & Languages
                              └── Eureka Client
```

## Database

| Schema | Purpose |
|--------|---------|
| `user_db` | User profiles and related data |

### Tables
- `user_profiles` — Main profile with personal info and metadata
- `educations` — Education history entries
- `experiences` — Work experience entries
- `skills` — User skills with proficiency levels
- `languages` — User languages with proficiency levels

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Spring Cloud Config Client | Configuration from Config Server |
| Spring Cloud Eureka Client | Service registration with Eureka |
| Spring Data JPA | Database access |
| MySQL Connector | MySQL database driver |
| Spring Validation | Input validation |
| Spring Boot Actuator | Health checks, metrics |
| Springdoc OpenAPI | API documentation |
| Common Library | Shared DTOs, exceptions, and utilities |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `USER_SERVICE_PORT` | `8082` | Server port |
| `USER_DB_HOST` | `localhost` | Database host |
| `USER_DB_PORT` | `3306` | Database port |
| `USER_DB_NAME` | `user_db` | Database name |
| `USER_DB_USERNAME` | `root` | Database username |
| `USER_DB_PASSWORD` | `root` | Database password |
| `EUREKA_DEFAULT_ZONE` | `http://localhost:8761/eureka/` | Eureka URL |
| `CONFIG_SERVER_URL` | `http://localhost:8888` | Config Server URL |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/users` | Create user profile |
| GET | `/api/v1/users/{id}` | Get profile by ID |
| GET | `/api/v1/users/profile` | Get current user's profile |
| PUT | `/api/v1/users/{id}` | Update profile |
| DELETE | `/api/v1/users/{id}` | Delete profile |
| GET | `/api/v1/users/search` | Search profiles |
| POST | `/api/v1/users/{userId}/education` | Add education |
| PUT | `/api/v1/users/{userId}/education/{id}` | Update education |
| DELETE | `/api/v1/users/{userId}/education/{id}` | Delete education |
| POST | `/api/v1/users/{userId}/experience` | Add experience |
| PUT | `/api/v1/users/{userId}/experience/{id}` | Update experience |
| DELETE | `/api/v1/users/{userId}/experience/{id}` | Delete experience |
| POST | `/api/v1/users/{userId}/skills` | Add skill |
| PUT | `/api/v1/users/{userId}/skills/{id}` | Update skill |
| DELETE | `/api/v1/users/{userId}/skills/{id}` | Delete skill |
| POST | `/api/v1/users/{userId}/languages` | Add language |
| PUT | `/api/v1/users/{userId}/languages/{id}` | Update language |
| DELETE | `/api/v1/users/{userId}/languages/{id}` | Delete language |

## Swagger

- Swagger UI: http://localhost:8082/swagger-ui.html
- API Docs: http://localhost:8082/v3/api-docs

## Running Instructions

```bash
# Build
cd backend && mvn clean install -pl user-service -am

# Run
cd user-service && mvn spring-boot:run
```
