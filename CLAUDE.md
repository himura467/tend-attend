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
- Use dependency injection throughout backend implementation
- Apply @rollbackable decorator for transactional integrity
- Follow existing error handling and response patterns
- Use existing UI components and styling patterns in frontend

# Home folder CLAUDE.md

- @~/.claude/CLAUDE.md
