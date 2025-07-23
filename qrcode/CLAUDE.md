# Bash commands

- `pnpm build`: TypeScript compilation
- `pnpm test`: Run Vitest unit tests
- `pnpm ci:lint`: ESLint and Prettier
- `pnpm lint:eslint`: ESLint only
- `pnpm lint:prettier`: Prettier only
- `pnpm lint-fix:eslint`: Fix ESLint issues
- `pnpm lint-fix:prettier`: Fix Prettier formatting

# Code style guidelines

- TypeScript AWS Lambda function
- Use qr-code-styling library for QR generation
- Canvas for image rendering

# Testing instructions

- YOU MUST test QRCode query parameter changes
- Comprehensive Vitest tests with AWS Lambda event mocking
- Tests cover all styling options and query parameter parsing
- Environment variable validation included

# API behavior

- Accepts GET requests with query parameters
- Supports extensive customization: `width`, `height`, `margin`, `outputType`, `dotsType`, `dotsColor`, etc.
- DOMAIN_NAME environment variable required for URL generation
- Returns PNG or SVG based on `outputType` parameter
