# Skill Infinity - Communication Service

Enterprise-grade communication microservice providing real-time chat, notifications, emails, announcements, and file sharing for the Skill Infinity platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Communication Service                      │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │   Chat    │  │  Notif.  │  │    Email  │  │Announce.  │ │
│  │  Service  │  │  Service │  │  Service  │  │  Service  │ │
│  └─────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│        │              │              │               │       │
│  ┌─────┴──────────────┴──────────────┴───────────────┴───┐ │
│  │                   Message Broker (RabbitMQ)            │ │
│  └────────────────────────┬──────────────────────────────┘ │
│                          │                                  │
│  ┌───────────────────────┴──────────────┐                  │
│  │  WebSocket (STOMP + SockJS)         │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Responsibilities

- **Real-time Chat**: Private, mentor-learner, and session-based messaging
- **Notifications**: In-app, push, email, and SMS architecture
- **Email**: Template-based email delivery for all platform events
- **Push Notifications**: Architecture ready for FCM, APNS, and Web Push
- **Announcements**: Create, schedule, publish, and target announcements
- **File Sharing**: MinIO-based file upload and storage
- **Presence**: Real-time user online/offline status
- **Message Reactions**: Emoji reactions to messages
- **Message Search**: Full-text message search within conversations

## Technology Stack

| Technology | Purpose |
|-----------|---------|
| Java 21 | Runtime |
| Spring Boot 3.2 | Framework |
| Spring WebSocket | Real-time communication |
| STOMP + SockJS | WebSocket protocol |
| Spring Data JPA | Database access |
| Spring Security | Authentication |
| Spring Cloud Config | External configuration |
| Eureka Discovery | Service registration |
| RabbitMQ | Async messaging |
| Redis | Caching |
| MySQL | Persistent storage |
| MapStruct | DTO mapping |
| MinIO | File storage |
| OpenAPI (Swagger) | API documentation |

## API Endpoints

### Chat
```
POST   /api/v1/chat                      Create conversation
GET    /api/v1/chat                      Get user's conversations
GET    /api/v1/chat/{id}                 Get conversation details
POST   /api/v1/chat/message              Send message
PUT    /api/v1/chat/message/{id}         Edit message
DELETE /api/v1/chat/message/{id}         Delete message
GET    /api/v1/chat/search               Search messages
GET    /api/v1/chat/history              Get message history
```

### Notifications
```
POST   /api/v1/notifications             Create notification
GET    /api/v1/notifications             Get notifications
PUT    /api/v1/notifications/read        Mark as read
DELETE /api/v1/notifications/{id}        Delete notification
```

### Announcements (Admin)
```
POST   /api/v1/announcements             Create announcement
PUT    /api/v1/announcements/{id}        Update announcement
DELETE /api/v1/announcements/{id}        Delete announcement
GET    /api/v1/announcements             Get announcements
```

### Presence
```
GET    /api/v1/presence/{userId}         Get user presence
GET    /api/v1/presence/online           Get online users
POST   /api/v1/presence/batch            Get batch presence
```

### Files
```
POST   /api/v1/files/upload              Upload file
POST   /api/v1/files/upload/image        Upload image
GET    /api/v1/files/download/...        Download file
DELETE /api/v1/files/delete/...          Delete file
```

## WebSocket Endpoints

```
WS     /ws                               WebSocket endpoint (STOMP + SockJS)
/app/chat.sendMessage                    Send message via WebSocket
/app/chat.typing                         Typing indicator
/app/chat.markRead                       Mark messages as read
/app/presence.online                     User online
/app/presence.offline                    User offline
```

## Database

The service uses MySQL with the following main tables:

- `chat_rooms` - Chat conversations
- `chat_participants` - Conversation participants
- `messages` - Chat messages
- `message_attachments` - File attachments
- `message_reactions` - Emoji reactions
- `message_statuses` - Per-user message delivery status
- `notifications` - User notifications
- `notification_preferences` - User notification settings
- `email_templates` - Email template storage
- `email_history` - Email delivery history
- `push_notifications` - Push notification records
- `announcements` - System announcements
- `presence` - User online status
- `typing_indicators` - Typing indicators
- `file_metadata` - File metadata for MinIO

## Real-Time Chat

The chat system supports:
- **Private Chat**: One-on-one messaging
- **Mentor-Learner Chat**: Direct communication between mentors and learners
- **Session Chat**: Conversations tied to mentoring sessions
- **Message Edit/Delete**: Edit or delete sent messages
- **Reactions**: Emoji reactions on messages
- **Pinned Messages**: Pin important messages
- **Read Receipts**: Track message delivery and read status
- **Search**: Full-text search across messages
- **Typing Indicators**: Real-time typing status

## Notifications

The notification engine supports:
- **In-App**: Stored notifications retrievable via API
- **Push**: Architecture ready for FCM, APNS, Web Push
- **Email**: Template-based email via JavaMail
- **SMS**: Architecture ready for SMS providers

Notification categories include:
- SYSTEM, REMINDER, PAYMENT, SESSION, ANNOUNCEMENT, MESSAGE, SUBSCRIPTION, BOOKING

## RabbitMQ Integration

### Published Events
- `NotificationSentEvent` - When a notification is delivered
- `EmailSentEvent` - When an email is sent
- `PushSentEvent` - When a push notification is sent

### Consumed Events
- `UserRegisteredEvent` - Send welcome notification
- `SessionBookedEvent` - Notify about booking
- `SessionApprovedEvent` - Notify about approval
- `SessionCancelledEvent` - Notify about cancellation
- `PaymentCompletedEvent` - Payment confirmation
- `WalletCreditedEvent` - Wallet credit notification
- `SubscriptionActivatedEvent` - Subscription activation

## Redis Caching

Cached data includes:
- Recent conversations (TTL: 5 min)
- Unread message counts (TTL: 1 min)
- Notification counts (TTL: 1 min)
- Online users (TTL: 30 sec)

## Docker

```bash
# Build and run with all services
docker-compose up -d

# Build specific service
docker-compose build communication-service

# Run specific service
docker-compose up -d communication-service
```

## Swagger UI

Once running, access the API documentation at:
```
http://localhost:8087/communication-service/swagger-ui.html
```

## Testing

```bash
# Run all tests
mvn test -pl communication-service

# Run specific test class
mvn test -pl communication-service -Dtest=ChatServiceTest

# Run with coverage
mvn verify -pl communication-service
```
