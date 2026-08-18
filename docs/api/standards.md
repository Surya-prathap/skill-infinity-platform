# Skill Infinity - API Standards

## Base URL

All API endpoints are prefixed with `/api/v1/`.

```
GET /api/v1/users
POST /api/v1/users
GET /api/v1/users/{id}
```

## Authentication

API requests require a JWT Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "timestamp": "2026-01-01T12:00:00",
  "path": "/api/v1/users",
  "requestId": "uuid-here"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "timestamp": "2026-01-01T12:00:00",
  "path": "/api/v1/users",
  "requestId": "uuid-here"
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {
    "content": [],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5,
    "first": true,
    "last": false,
    "empty": false
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

## Versioning

- Current version: `/api/v1/`
- Future versions: `/api/v2/`
