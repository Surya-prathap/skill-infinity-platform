# Security Guide

## Overview

This document outlines the security architecture and practices implemented in the Skill Infinity Platform.

## Authentication

### JWT Token Strategy

- **Access Token**: Short-lived (15 minutes default), stateless JWT
- **Refresh Token**: Long-lived (7 days), stored in database, revocable
- **Token Storage**: Refresh tokens are stored with hashed values in the database
- **Token Rotation**: Refresh tokens are rotated on each use (old token revoked)

### Password Policy

| Policy | Requirement |
|--------|-------------|
| Minimum Length | 8 characters |
| Maximum Length | 128 characters |
| Uppercase Letters | At least 1 required |
| Lowercase Letters | At least 1 required |
| Digits | At least 1 required |
| Special Characters | At least 1 required |
| Maximum Login Attempts | 5 before lockout |
| Lockout Duration | 15 minutes |
| Password History | Last 5 passwords remembered |
| Password Expiry | 90 days |

### Brute Force Protection

- Rate limiting on login endpoint (10 requests/minute/IP)
- Rate limiting on registration endpoint (5 requests/minute/IP)
- Account lockout after 5 failed attempts
- Progressive delay on repeated failures

## Authorization

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| ROLE_ADMIN | Full system access, user management, platform configuration |
| ROLE_MENTOR | Mentor profile management, session management, community participation |
| ROLE_LEARNER | Profile management, session booking, community participation |

## API Security

### Security Headers

| Header | Value |
|--------|-------|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Strict-Transport-Security | max-age=31536000; includeSubDomains |
| Content-Security-Policy | restrictive defaults |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | restricted defaults |
| Cache-Control | no-store for API endpoints |

### Input Validation

- All inputs validated at the API Gateway level
- SQL injection patterns rejected
- XSS payloads blocked
- Request size limits enforced
- Content-Type validation

### Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Authentication endpoints | 10 req/min |
| Registration | 5 req/min |
| General API | 100 req/min |
| Admin endpoints | 30 req/min |

## Data Security

### Database

- All connections use SSL/TLS in production
- Prepared statements prevent SQL injection
- HikariCP connection pool with leak detection
- Database credentials stored as environment variables
- Per-service database isolation

### RabbitMQ

- TLS encryption for message transport
- Vhost per service for isolation
- Queue access restricted by service

## Logging Security

### Never Logged

- Passwords (any form)
- JWT tokens
- Credit card numbers
- Bank account details
- Personal sensitive data (full SSN, full DOB)

### Masked in Logs

- Email addresses (first char + ***@domain)
- Phone numbers (last 4 digits visible)
- IP addresses (last octet masked)
- Session tokens (first 10 + ... + last 10)

## CSRF Protection

Spring Security's CSRF protection is disabled for the REST API since we use:
- Stateless JWT authentication (Bearer tokens)
- CORS configuration restricts origins
- Proper Content-Type validation

For browser-based interactions, CSRF tokens should be implemented if session-based auth is used.

## Secret Management

### Development
- Default secrets in application.yml (never used in production)
- .env file for local development

### Production
- All secrets via environment variables
- Integration with HashiCorp Vault (planned)
- Secrets rotated regularly
- No hardcoded credentials in codebase

## Compliance Checklist

- [ ] Password policy enforced
- [ ] Account lockout implemented
- [ ] Rate limiting active
- [ ] Security headers present
- [ ] Input validation active
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Audit logging configured
- [ ] Sensitive data masked in logs
- [ ] CORS properly configured
- [ ] JWT tokens securely stored
- [ ] Password encryption (BCrypt)
- [ ] Secure transport (TLS)
