# Contributing to Skill Infinity

## Welcome
Thank you for considering contributing to Skill Infinity. This document outlines the guidelines for contributing.

## Branch Naming
- `feature/day-1-foundation` - Infrastructure setup
- `feature/day-2-identity` - Identity Service
- `feature/day-3-mentor` - Mentor Service
- `feature/day-4-session` - Session Service
- `feature/day-5-wallet` - Wallet Service
- `feature/day-6-admin` - Admin Service
- `feature/day-7-testing` - Testing
- `feature/day-8-release` - Release

## Commit Format
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `docs:` Documentation changes
- `style:` Code style changes
- `chore:` Maintenance tasks

## Development Workflow
1. Create a feature branch from `develop`
2. Implement your changes following the Master Prompt standards
3. Ensure all tests pass: `mvn clean install`
4. Create a pull request with a clear description
5. Request review from the appropriate team

## Code Standards
- Follow SOLID, DRY, KISS principles
- Use constructor injection only
- No field injection
- No TODO comments in production code
- All code must compile
- All tests must pass
- No hardcoded secrets
