# Bash commands

- `pnpm dev`: Development server with Turbopack
- `pnpm build`: Production build
- `pnpm ci:lint`: Run ESLint and Prettier
- `pnpm lint:eslint`: ESLint only
- `pnpm lint:prettier`: Prettier only
- `pnpm lint-fix:eslint`: Fix ESLint issues
- `pnpm lint-fix:prettier`: Fix Prettier formatting
- `pnpm test`: Run tests with Vitest
- `pnpm coverage`: Run tests with coverage report

# Code style guidelines

- Next.js 15 with React 19 and TypeScript
- Tailwind CSS 4 for styling

# Testing instructions

- Vitest for unit testing
- Place test files next to source files with `.test.ts` extension
- Run `pnpm test` for development testing
- Run `pnpm coverage` for coverage reports

# Architecture

- App Router structure in `/app/`
- Component library in `/components/`
- Utilities and hooks in `/lib/`
- Global styles in `/styles/`
