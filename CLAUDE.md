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

completed

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
