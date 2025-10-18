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

Completed

## Frontend Implementation

### Milestone 7: API Integration Layer (Frontend PR #7) ✅

- [x] Add Google Calendar DTOs to `frontend/src/lib/api/dtos/google-calendar.ts`
- [x] Create API functions in `frontend/src/lib/api/google-calendar.ts` using existing patterns
- [x] Add environment variables for Google OAuth (No frontend env vars needed - OAuth handled server-side)
- [x] Update `frontend/next.config.ts` if needed (No changes needed - using existing BACKEND_API_URL)

### Milestone 8: Google OAuth Flow Components (Frontend PR #8) ✅

- [x] Create GoogleCalendarAuth component in `frontend/src/components/organisms/specific/integrations/GoogleCalendarAuth/index.tsx`
- [x] Create OAuth callback page at `frontend/src/app/auth/google/callback/page.tsx`
- [x] Add OAuth URL generation utilities in `frontend/src/lib/utils/google-auth.ts`
- [x] Create loading and error states for authentication flow (integrated in callback page and GoogleCalendarStatusDisplay)

### Milestone 9: Calendar Integration UI (Frontend PR #9) ✅

- [x] Create GoogleCalendarSync component in `frontend/src/components/organisms/specific/integrations/GoogleCalendarSync/index.tsx`
- [x] Add calendar URL display and copy-to-clipboard functionality
- [x] Create integration status indicators using existing UI components
- [x] Add sync progress and error handling UI with toast notifications
- [x] Create `/settings/integrations` page with connection/disconnection flow
- [x] Update OAuth callback redirect to integrations page

### Milestone 10: Follow Flow Integration (Frontend PR #10)

- [ ] Update existing follow components to include calendar integration options
- [ ] Add calendar URL sharing functionality to user profiles
- [ ] Create followee calendar URL display component
- [ ] Add clear user instructions for Google Calendar subscription process

### Milestone 11: Settings and Management (Frontend PR #11)

Note: This milestone has been integrated into Milestone 9 as the settings/integrations page already includes:

- [x] Google Calendar settings page at `/settings/integrations`
- [x] Disconnect/reconnect functionality with proper state management
- [x] Sync status display using existing UI patterns
- [ ] Calendar URL regeneration functionality if needed (to be determined)

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
