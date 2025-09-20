# Project overview

**tend-attend** is a serverless event attendance management system with distributed architecture:

- Frontend: Next.js 15 with React 19 (see `/frontend/CLAUDE.md`)
- Backend: Python FastAPI with clean architecture (see `/backend/CLAUDE.md`)
- QRCode service: TypeScript Lambda function (see `/qrcode/CLAUDE.md`)
- Infrastructure: Terraform-managed AWS resources (see `/terraform/CLAUDE.md`)
- Scripts: Build, deployment, and utility scripts (see `/scripts/CLAUDE.md`)

# Workflow

- Follow git-flow
- Follow conventional commits format
- Be sure to create a new branch before starting tasks
- Be sure to commit when you're done making a series of code changes

# Home folder CLAUDE.md

- @~/.claude/CLAUDE.md

# TODO: Google Calendar Integration

## Overview

Implement Google Calendar integration allowing HOST users to sync their events to Google Calendar and share public calendar URLs with followers. Followers can subscribe to these calendars directly in Google Calendar app without requiring API calls from our service.

## Backend Implementation

### Milestone 1: Core Infrastructure (Backend PR #1) ✅

- [x] Add Google API dependencies to `backend/pyproject.toml`
- [x] Create domain entity: `backend/app/core/domain/entities/google_calendar.py`
- [x] Create repository interface: `backend/app/core/domain/repositories/google_calendar.py`
- [x] Add error codes to `backend/app/core/error/error_code.py`
- [x] Create token encryption utility: `backend/app/core/cryptography/google_tokens.py`

### Milestone 2: Database Layer (Backend PR #2) ✅

- [x] Create SQLAlchemy model: `backend/app/core/infrastructure/sqlalchemy/models/shards/google_calendar.py`
- [x] Update models `__init__.py` to include new model
- [x] Create repository implementation: `backend/app/core/infrastructure/sqlalchemy/repositories/google_calendar.py`
- [x] Generate and test database migration with alembic
- [x] Add environment variables for Google OAuth credentials to `backend/app/core/constants/secrets.py`

### Milestone 3: Google API Integration (Backend PR #3) ✅

- [x] Create Google Calendar service: `backend/app/core/infrastructure/google/calendar_service.py`
- [x] Implement OAuth flow utilities for token exchange and refresh
- [x] Create DTOs: `backend/app/core/dtos/google_calendar.py`
- [x] Add Google Calendar constants and configuration

### Milestone 4: Use Case Implementation (Backend PR #4)

- [ ] Implement GoogleCalendarUsecase: `backend/app/core/usecase/google_calendar.py`
- [ ] Add auth callback handling with @rollbackable decorator
- [ ] Add event synchronization logic
- [ ] Add followee calendar URL retrieval
- [ ] Integration with existing event management workflows

### Milestone 5: API Layer (Backend PR #5)

- [ ] Create API routes: `backend/app/api/routes/google_calendar.py`
- [ ] Update API router in `backend/app/api/main.py`
- [ ] Add proper access control using existing AccessControl dependency
- [ ] Test all endpoints with proper error handling and response patterns

### Milestone 6: Backend Testing & Documentation (Backend PR #6)

- [ ] Add comprehensive unit tests for all backend components
- [ ] Update API documentation and examples
- [ ] Add deployment configuration updates for Google OAuth
- [ ] Performance testing and optimization

## Frontend Implementation

### Milestone 7: API Integration Layer (Frontend PR #7)

- [ ] Add Google Calendar DTOs to `frontend/src/lib/api/dtos/google-calendar.ts`
- [ ] Create API functions in `frontend/src/lib/api/google-calendar.ts` using existing patterns
- [ ] Add environment variables for Google OAuth (NEXT_PUBLIC_GOOGLE_CLIENT_ID)
- [ ] Update `frontend/next.config.ts` if needed for new environment variables

### Milestone 8: Google OAuth Flow Components (Frontend PR #8)

- [ ] Create GoogleCalendarAuth component in `frontend/src/components/organisms/specific/integrations/GoogleCalendarAuth/index.tsx`
- [ ] Create OAuth callback page at `frontend/src/app/auth/google/callback/page.tsx`
- [ ] Add OAuth URL generation utilities in `frontend/src/lib/utils/google-auth.ts`
- [ ] Create loading and error states for authentication flow

### Milestone 9: Calendar Integration UI (Frontend PR #9)

- [ ] Create GoogleCalendarSync component in `frontend/src/components/organisms/specific/integrations/GoogleCalendarSync/index.tsx`
- [ ] Add calendar URL display and copy-to-clipboard functionality
- [ ] Create integration status indicators using existing UI components
- [ ] Add sync progress and error handling UI with toast notifications

### Milestone 10: Follow Flow Integration (Frontend PR #10)

- [ ] Update existing follow components to include calendar integration options
- [ ] Add calendar URL sharing functionality to user profiles
- [ ] Create followee calendar URL display component
- [ ] Add clear user instructions for Google Calendar subscription process

### Milestone 11: Settings and Management (Frontend PR #11)

- [ ] Create Google Calendar settings page following existing page structure
- [ ] Add disconnect/reconnect functionality with proper state management
- [ ] Create sync history and status display using existing UI patterns
- [ ] Add calendar URL regeneration functionality if needed

### Milestone 12: Frontend Testing and Polish (Frontend PR #12)

- [ ] Add Vitest tests for all Google Calendar components
- [ ] Test OAuth flow end-to-end integration
- [ ] Add error boundary for Google Calendar features
- [ ] Performance optimization and code splitting
- [ ] Update user documentation and guides

## Infrastructure Updates

### Milestone 13: Infrastructure Configuration (Infrastructure PR #13)

- [ ] Add Google OAuth credentials to 1Password vault
- [ ] Update Terraform lambda configuration for new environment variables
- [ ] Update `terraform/modules/lambda/variables.tf` for Google credentials
- [ ] Update deployment scripts if needed
- [ ] Test infrastructure deployment with new configuration

## Implementation Notes

- Follow clean architecture patterns established in the codebase
- Use dependency injection throughout backend implementation
- Apply @rollbackable decorator for transactional integrity
- Follow existing error handling and response patterns
- Use existing UI components and styling patterns in frontend
- Maintain strict TypeScript typing throughout
- Each PR should be atomic and testable
- Coordinate backend/frontend PRs for integrated features
