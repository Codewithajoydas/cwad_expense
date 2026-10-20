# CWAD React + Express Monorepo

A professional fullstack monorepo for teams that explicitly want a separate React frontend and Express API.

This is different from the Next.js monorepo template: the web and API are independently deployable applications with a deliberate HTTP boundary between them.

## Stack

- React 19.3
- Vite 8.3
- TypeScript 5.9
- Express 5.2
- npm workspaces
- Turborepo 2.11
- Zod
- Pino
- Helmet
- CORS
- Vitest
- ESLint
- Prettier

React 19.3.0, Vite 8.3.0, and Express 5.2.1 are the current package versions verified during template generation. citeturn0search4turn0search3turn0search1

## Architecture

```text
monorepo-react-express/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── config/
│   │   │   ├── features/
│   │   │   ├── lib/
│   │   │   ├── pages/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── styles.css
│   │   ├── tests/
│   │   ├── .env.example
│   │   ├── eslint.config.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── api/
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── middlewares/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── app.ts
│       │   └── server.ts
│       ├── tests/
│       ├── .env.example
│       ├── eslint.config.js
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── ui/
│   ├── utils/
│   └── config/
│
├── .github/workflows/ci.yml
├── docker/
│   ├── api.Dockerfile
│   └── web.Dockerfile
├── docker-compose.yml
├── package.json
├── turbo.json
├── tsconfig.base.json
└── README.md
```

## Why React + Express?

Use this template when the frontend and backend need an explicit service boundary.

Examples:

- independent frontend/backend deployments
- multiple clients consuming the API
- mobile applications consuming the same API
- API versioning as a first-class boundary
- independently scaled backend
- backend integrations that should not depend on the web runtime

If you do not need that separation, use the `monorepo-nextjs` template instead.

## Requirements

- Node.js 20+
- npm 10+
- Docker Desktop optional

## Install

```bash
npm install
```

## Development

Run both applications:

```bash
npm run dev
```

Applications:

```text
Web: http://localhost:5173
API: http://localhost:4000
API health: http://localhost:4000/api/v1/health
```

## Environment

API:

```bash
cp apps/api/.env.example apps/api/.env
```

PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Web:

```bash
cp apps/web/.env.example apps/web/.env
```

The web app uses:

```env
VITE_API_URL=http://localhost:4000
```

Never put secrets in `VITE_*` variables because they are exposed to the browser.

## Application boundaries

### Web

The React app owns:

- pages
- UI
- browser state
- API client
- feature presentation

### API

The Express app owns:

- HTTP
- request validation
- controllers
- services
- authentication boundary
- authorization boundary
- business operations
- persistence integrations

A typical request flow is:

```text
HTTP Request
     ↓
Express middleware
     ↓
Route
     ↓
Controller
     ↓
Validation
     ↓
Service
     ↓
Repository / external capability
     ↓
Response
```

## Shared packages

### `@cwad/types`

Shared API/domain contracts.

### `@cwad/validation`

Shared Zod schemas.

### `@cwad/ui`

React UI primitives intended for the web application and future React-based clients.

### `@cwad/utils`

Framework-independent utilities.

### `@cwad/config`

Reserved for configuration that is genuinely shared.

## API endpoints

### Health

```http
GET /api/v1/health
```

### Readiness

```http
GET /api/v1/ready
```

The readiness endpoint is the extension point for database, cache, queue, and external-service checks.

## Production build

```bash
npm run build
```

Run production applications:

```bash
npm run start
```

## Docker

```bash
docker compose up --build
```

Applications:

```text
Web: http://localhost:8080
API: http://localhost:4000
```

Stop:

```bash
docker compose down
```

## Quality

```bash
npm run typecheck
npm run lint
npm run test
npm run format:check
```

## CI

GitHub Actions runs:

1. npm installation
2. typecheck
3. lint
4. tests
5. production build

## Capability architecture

The base template intentionally does not install every infrastructure dependency.

Optional CWAD capabilities can add:

```text
Database
  ├── PostgreSQL
  └── Prisma / Drizzle

Authentication
  ├── JWT
  ├── Session
  └── OAuth

Infrastructure
  ├── Redis
  ├── BullMQ
  ├── S3
  └── WebSockets

Observability
  ├── OpenTelemetry
  └── Sentry
```

This keeps the generated project understandable instead of turning the base template into a dependency dump.

## Scaling the frontend

Keep domain code under feature boundaries:

```text
apps/web/src/features/
├── auth/
├── users/
├── projects/
└── billing/
```

Avoid putting application-specific business logic into a global `utils` directory.

## Scaling the API

Use domain-oriented modules:

```text
apps/api/src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── projects/
│   └── billing/
├── config/
├── middlewares/
└── server.ts
```

The initial template uses a simpler structure so the first generated project remains approachable. Move a domain into `modules/` once it becomes substantial.

## Design goal

This template should give a developer a professional starting point without pretending to know application-specific requirements.

CWAD should add capabilities based on explicit user choices rather than forcing infrastructure into every project.
