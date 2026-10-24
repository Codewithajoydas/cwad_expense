# CWAD Expense — Personal Finance Management

A full-stack personal finance application built to help users organize their financial activities, manage transactions, and understand their income and expenses through a dedicated web interface.

**Live Application:** https://cwad-expense.codewithajoydas.in  
**Source Code:** https://github.com/Codewithajoydas/cwad_expense  
**Developer:** [Ajoy Das](https://github.com/Codewithajoydas)

---

## Table of Contents

- [Overview](#overview)
- [Project Goals](#project-goals)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Development Commands](#development-commands)
- [Application Architecture](#application-architecture)
- [API Documentation](#api-documentation)
- [Validation and Error Handling](#validation-and-error-handling)
- [Security Considerations](#security-considerations)
- [Testing and Code Quality](#testing-and-code-quality)
- [Docker](#docker)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

---

## Overview

CWAD Expense is a web-based financial management project designed around a separate frontend and backend architecture.

The application follows a monorepo structure, allowing the web application, API server, and shared packages to be developed and maintained within a single repository.

Instead of combining all application responsibilities into one codebase, the project establishes a clear separation between presentation, HTTP handling, validation, business logic, and reusable functionality.

### Key Highlights

- **Full-stack architecture:** Separate React frontend and Express backend.
- **Type safety:** TypeScript across the application.
- **Monorepo workflow:** npm workspaces and Turborepo for managing multiple applications and packages.
- **Shared packages:** Common types, validation schemas, UI primitives, and utilities.
- **API-oriented design:** A dedicated backend that communicates with the frontend over HTTP.
- **Code quality:** Type checking, linting, formatting, and automated test commands.
- **Containerization:** Docker configuration for running the application services.
- **Deployment flexibility:** Frontend and backend can be deployed independently.

## Project Goals

CWAD Expense aims to provide a maintainable foundation for personal finance management while following established full-stack development practices.

The primary goals are:

1. Keep frontend and backend responsibilities separate.
2. Organize application code into reusable, understandable modules.
3. Use shared validation and type definitions where appropriate.
4. Make development, testing, and production builds repeatable.
5. Establish a foundation that can support additional financial management capabilities.
6. Keep the application maintainable as its features and complexity grow.

## Features

### Financial Management

The application is intended for managing personal financial activity through a dedicated dashboard and transaction-oriented interface.

The broader financial management scope can include:

- Recording income and expenses.
- Viewing transaction history.
- Organizing financial records.
- Reviewing financial activity over time.
- Extending the application with additional finance-management modules.

The availability of individual features depends on their current implementation in the application.

### Application Architecture

- Independent web and API applications.
- Shared TypeScript contracts.
- Reusable validation schemas.
- Modular backend routes, controllers, middleware, and services.
- Centralized development scripts.
- Automated quality checks through the repository's configured tooling.

### Developer Experience

- TypeScript-based development.
- Vite-powered frontend development.
- Express-based API server.
- npm workspaces for dependency management.
- Turborepo for coordinating workspace tasks.
- ESLint and Prettier for code quality and formatting.
- Vitest for frontend testing.
- Docker Compose support.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend library | React |
| Frontend build tool | Vite |
| Programming language | TypeScript |
| Backend framework | Express |
| Runtime | Node.js |
| Package management | npm workspaces |
| Monorepo orchestration | Turborepo |
| Schema validation | Zod |
| Authentication dependency | Better Auth |
| Logging | Pino |
| HTTP security headers | Helmet |
| Cross-origin requests | CORS |
| Frontend testing | Vitest |
| Code linting | ESLint |
| Code formatting | Prettier |
| Containerization | Docker and Docker Compose |
| CI/CD | GitHub Actions |

**Note:** This table describes the repository's configured technology stack. It does not imply that every optional integration or infrastructure component is enabled in production.

## Architecture

CWAD Expense uses a monorepo architecture with independently organized frontend and backend applications.

```text
                        CWAD Expense
                              |
                    +---------+---------+
                    |                   |
              Web Application      API Server
                    |                   |
              React + Vite          Express
                    |                   |
              API Client         Routes / Middleware
                    |                   |
                    +------ HTTP -------+
                                        |
                              Controllers / Services
                                        |
                              Validation / Business Logic
                                        |
                              Persistence Integrations
```

### Frontend Responsibilities

The frontend is responsible for:

- Rendering application pages and components.
- Managing browser-side state.
- Handling user interactions and form input.
- Communicating with the backend through HTTP requests.
- Presenting loading, success, and error states.
- Organizing UI code into reusable components and feature modules.

### Backend Responsibilities

The backend is responsible for:

- Exposing HTTP API endpoints.
- Processing incoming requests.
- Applying middleware.
- Validating incoming data.
- Executing application business logic.
- Enforcing authentication and authorization where required.
- Integrating with persistence layers and external services.
- Returning structured responses to the frontend.

### Request Lifecycle

A typical API request follows this flow:

```text
Client Request
      |
      v
Express Middleware
      |
      v
Route Handler
      |
      v
Controller
      |
      v
Input Validation
      |
      v
Service / Business Logic
      |
      v
Persistence or External Integration
      |
      v
HTTP Response
```

This separation helps keep HTTP-specific code independent from business logic.

## Project Structure

The repository follows a workspace-based structure.

```text
cwad_expense/
├── .github/
│   └── workflows/
│       └── ci.yml
│
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
│   │   ├── package.json
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
│       └── package.json
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── ui/
│   ├── utils/
│   └── config/
│
├── docs/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── package-lock.json
├── tsconfig.base.json
├── turbo.json
└── README.md
```

### Directory Responsibilities

| Directory | Purpose |
|---|---|
| `apps/web` | React frontend application |
| `apps/api` | Express backend application |
| `packages/types` | Shared domain and API type definitions |
| `packages/validation` | Shared Zod validation schemas |
| `packages/ui` | Reusable React UI primitives |
| `packages/utils` | Framework-independent utility functions |
| `packages/config` | Shared configuration where appropriate |
| `docs` | Project documentation |
| `.github/workflows` | GitHub Actions workflows |
| `docker-compose.yml` | Local container orchestration |
| `turbo.json` | Turborepo task configuration |
| `tsconfig.base.json` | Shared TypeScript configuration |

The exact contents of individual directories may evolve as the application grows.

---

## Prerequisites

Before running the project locally, install the following tools:

- **Node.js:** Version 20 or later.
- **npm:** Version 10 or later.
- **Git:** For cloning the repository.
- **Docker Desktop:** Optional, for containerized development.

Verify your installation:

```bash
node --version
npm --version
git --version
```

Use a Node.js version compatible with all workspace dependencies.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Codewithajoydas/cwad_expense.git
```

Navigate into the project:

```bash
cd cwad_expense
```

### 2. Install Dependencies

Run the following command from the repository root:

```bash
npm install
```

Because the project uses npm workspaces, install dependencies from the root rather than installing each workspace independently.

### 3. Configure Environment Variables

Create the required application-specific environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

On Windows PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

Open the generated files and configure the required values.

The exact variables depend on the current application configuration and enabled integrations.

### 4. Start the Development Servers

From the repository root:

```bash
npm run dev
```

The configured development setup uses these default local addresses:

| Service | URL |
|---|---|
| Web application | http://localhost:5173 |
| API server | http://localhost:4000 |
| API health check | http://localhost:4000/api/v1/health |

If you change a port or environment variable, use the resulting address configured by the application.

### 5. Open the Application

Open the frontend in your browser:

http://localhost:5173

Ensure the backend is running and the frontend's API URL points to the correct server.

---

## Environment Configuration

Environment variables are maintained by the application that owns them.

### Frontend

The frontend uses the following API base URL variable in the documented local setup:

```dotenv
VITE_API_URL=http://localhost:4000
```

The frontend uses this setting to determine where API requests should be sent.

For production, configure the variable to point to the deployed API origin.

### Backend

Copy the backend example file:

```bash
cp apps/api/.env.example apps/api/.env
```

Populate all variables required by the backend's actual configuration.

Depending on enabled functionality, these may include:

- Server port.
- Application origin and CORS settings.
- Authentication URL and secret.
- Database connection details, if a database integration is enabled.
- Email or other external-service credentials, if those integrations are enabled.

Use the backend's environment example and configuration files as the source of truth for the required variable names.

### Environment Variable Security

- Never commit real secrets to Git.
- Keep local `.env` files out of version control.
- Never expose backend secrets through `VITE_*` variables.
- Use the hosting provider's secret-management facility in production.
- Rotate credentials if they are accidentally exposed.

---

## Development Commands

Run these commands from the repository root.

| Command | Purpose |
|---|---|
| `npm install` | Install workspace dependencies |
| `npm run dev` | Start development tasks |
| `npm run build` | Build workspace applications |
| `npm run start` | Run configured production tasks |
| `npm run lint` | Run linting tasks |
| `npm run typecheck` | Check TypeScript types |
| `npm run test` | Run configured tests |
| `npm run format` | Format project files |
| `npm run format:check` | Check formatting without modifying files |
| `npm run clean` | Run configured workspace cleanup tasks |

The root scripts delegate tasks to the workspace packages through Turborepo. A command's effective behavior depends on the scripts configured in the individual workspaces.

### Recommended Development Workflow

After making changes, run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Fix any reported issues before submitting changes or deploying the application.

---

## Application Architecture

### Shared Packages

The shared packages help reduce duplication across applications.

#### `@cwad/types`

Contains shared API contracts and domain-level types where defined.

#### `@cwad/validation`

Provides reusable Zod schemas for validating application data.

#### `@cwad/ui`

Contains reusable UI primitives intended for the frontend and compatible React-based clients.

#### `@cwad/utils`

Contains general-purpose utilities that do not depend on a specific application framework.

#### `@cwad/config`

Provides a location for configuration that is genuinely shared between workspaces.

### Frontend Feature Organization

Frontend functionality is organized into application-level directories such as `features`, `components`, `pages`, and `lib`.

As the application grows, domain-specific logic should remain close to the feature that owns it instead of accumulating in a large global utility directory.

### Backend Organization

The API separates configuration, routing, controllers, middleware, services, and server initialization.

A useful convention is:

- **Routes:** Define HTTP endpoints.
- **Controllers:** Handle HTTP request and response concerns.
- **Services:** Implement reusable business operations.
- **Middleware:** Handle cross-cutting request processing.
- **Configuration:** Centralize runtime configuration and integrations.

Keep persistence-specific code behind an appropriate integration boundary as the application evolves.

---

## API Documentation

The frontend and backend communicate over HTTP. The backend is independently organized so additional clients can use its API without depending on the React application's runtime.

### Base URL

Local development:

```text
http://localhost:4000
```

Production:

```text
https://<your-api-domain>
```

Replace the production placeholder with the actual deployed API origin.

### Health Endpoint

**Endpoint**

```http
GET /api/v1/health
```

This endpoint is intended to report basic API health.

Example request:

```bash
curl http://localhost:4000/api/v1/health
```

Inspect the actual route implementation for the response schema and status codes.

### Readiness Endpoint

**Endpoint**

```http
GET /api/v1/ready
```

This endpoint is the intended extension point for readiness checks, including database, cache, queue, or external-service checks when those integrations are implemented.

Example request:

```bash
curl http://localhost:4000/api/v1/ready
```

### Transactions API

The application includes transaction-oriented functionality. For example, the frontend integration uses a paginated transaction request in the following form:

```http
GET /api/transactions?page=1&limit=100
```

The precise response structure, supported filters, authentication requirements, and available create, update, or delete operations should be documented against the current route and controller implementations.

Do not assume that every CRUD operation or query parameter is supported merely because the frontend calls this endpoint.

### Recommended API Documentation Format

For each implemented endpoint, document:

- HTTP method and route.
- Purpose of the endpoint.
- Authentication requirements.
- Query parameters.
- Request body schema.
- Successful response schema.
- Validation errors.
- Authorization errors.
- Pagination and filtering behavior.

This keeps the API documentation consistent with the actual backend implementation.

---

## Validation and Error Handling

The project includes Zod as its validation technology.

Validation should be performed at the appropriate boundaries, particularly when processing user-provided input.

Recommended practices include:

- Validate request bodies, query parameters, and route parameters.
- Reject invalid data before executing business operations.
- Return predictable error responses.
- Distinguish validation failures from server failures.
- Avoid returning stack traces or internal implementation details to clients.
- Log useful diagnostic information on the server.
- Display understandable error messages in the frontend.

A validation failure should not be treated as a successful operation, and a frontend success message should only appear after the relevant request succeeds.

---

## Security Considerations

Financial applications handle potentially sensitive information. Security must be considered throughout the development lifecycle.

### Authentication and Authorization

The repository includes Better Auth as an authentication dependency.

Configure the authentication system according to the installed version and the application's actual integration.

For protected financial resources:

- Verify the user's authenticated identity on the server.
- Apply authorization checks to every protected operation.
- Scope financial records to the appropriate user or account.
- Do not trust user or account identifiers supplied by the browser without server-side verification.
- Handle session expiration and authentication failures appropriately.

Authentication establishes who is making a request; authorization determines what that user may access.

### HTTP Security

The backend includes Helmet and CORS in its technology stack.

Configure security headers and cross-origin policies for the intended deployment environment.

CORS is a browser access policy, not an authentication mechanism. It does not replace server-side authorization.

### Secrets and Sensitive Data

- Keep authentication secrets and API credentials server-side.
- Avoid logging passwords, tokens, or sensitive financial data.
- Use HTTPS in production.
- Validate and normalize untrusted input.
- Apply appropriate rate limits to sensitive endpoints.
- Review dependencies and keep them updated.

Security controls should be verified against the actual deployed configuration rather than assumed to be active merely because a dependency exists.

---

## Testing and Code Quality

The repository provides commands for type checking, linting, testing, formatting, and production builds.

### Run Tests

```bash
npm run test
```

### Check TypeScript

```bash
npm run typecheck
```

### Run Linting

```bash
npm run lint
```

### Check Formatting

```bash
npm run format:check
```

### Build the Project

```bash
npm run build
```

### Testing Recommendations

As new financial features are implemented, prioritize tests for:

- Transaction validation.
- Income and expense calculations.
- Pagination and filtering.
- Authentication and authorization.
- Access to user-specific records.
- Invalid or missing request data.
- API error responses.
- Frontend loading and error states.

Financial calculations and access-control rules deserve particular attention because incorrect results can undermine user trust.

---

## Docker

Docker Compose is available for containerized development.

### Start the Application

From the repository root:

```bash
docker compose up --build
```

The documented containerized configuration uses these local addresses:

| Service | URL |
|---|---|
| Web application | http://localhost:8080 |
| API server | http://localhost:4000 |

### Stop the Application

```bash
docker compose down
```

Review `docker-compose.yml` and the associated Dockerfiles for service configuration, environment variables, exposed ports, and any required external dependencies.

---

## Deployment

The frontend and backend are separate applications and can be deployed independently.

### Frontend Deployment

1. Build the web application.
2. Configure the production API URL.
3. Deploy the generated frontend assets to a compatible static hosting platform.
4. Configure the frontend domain and any required rewrite rules.
5. Verify that browser requests reach the correct API origin.

### Backend Deployment

1. Configure the Node.js runtime.
2. Install dependencies.
3. Build the backend.
4. Set required production environment variables.
5. Configure the service port and networking.
6. Configure allowed frontend origins.
7. Deploy the API.
8. Verify the health and readiness endpoints.

### Production Verification Checklist

- [ ] Frontend loads successfully.
- [ ] Backend health endpoint responds correctly.
- [ ] Frontend uses the production API URL.
- [ ] CORS allows the intended frontend origin.
- [ ] Authentication URLs and secrets are configured correctly.
- [ ] Protected endpoints enforce authentication and authorization.
- [ ] Financial data is isolated according to the application's access-control rules.
- [ ] No secrets are exposed in frontend bundles.
- [ ] Production build and type checks pass.
- [ ] Error responses and server logs are reviewed.

### CORS Troubleshooting

If the browser reports a CORS error:

1. Check the API's configured allowed origins.
2. Ensure the exact deployed frontend origin is allowed.
3. Check whether the request URL contains an unintended extra slash or incorrect path.
4. Confirm that the API is reachable and responding.
5. Verify preflight handling for requests using non-simple methods or headers.
6. If cookies are used for authentication, verify the required credentials settings on both frontend and backend.

For example, these are different origins:

```text
https://cwad-expense.codewithajoydas.in
https://api-cwad-expense.codewithajoydas.in
```

The backend must be configured to allow the actual frontend origin when browser requests require cross-origin access.

---

## Troubleshooting

### Dependencies Fail to Install

Run the installation command from the repository root:

```bash
npm install
```

Confirm that your Node.js and npm versions meet the project's requirements.

### Frontend Cannot Reach the API

Check the frontend environment variable:

```dotenv
VITE_API_URL=http://localhost:4000
```

Restart the frontend development server after changing environment variables.

### Port Already in Use

Check whether another process is using the configured port. Stop the conflicting process or update the relevant application configuration.

### Type Checking Fails

Run:

```bash
npm run typecheck
```

Resolve the reported errors before building or deploying.

### Tests Fail

Run:

```bash
npm run test
```

Inspect the failing test and its related implementation. Confirm that required environment variables and test dependencies are configured.

### Authentication Fails

Verify the configured authentication URL, secret, cookie settings, and frontend/backend origins. Confirm that the relevant authentication routes and session handling are configured for the deployed environment.

### Docker Services Fail to Start

Run:

```bash
docker compose logs
```

Check service logs, port conflicts, environment variables, and dependencies required by the containers.

---

## Development Roadmap

The following are potential directions for future development, not a guarantee that these capabilities are already implemented.

### Financial Features

- [ ] Expand transaction management.
- [ ] Improve financial summaries and reporting.
- [ ] Add configurable budget tracking.
- [ ] Introduce category-based spending analysis.
- [ ] Add recurring transaction workflows.
- [ ] Improve transaction search and filtering.
- [ ] Add export and backup options where appropriate.

### Engineering Improvements

- [ ] Expand automated unit and integration tests.
- [ ] Improve API documentation and response schemas.
- [ ] Strengthen authentication and authorization test coverage.
- [ ] Add structured operational monitoring.
- [ ] Improve production deployment automation.
- [ ] Review performance as transaction volumes grow.
- [ ] Improve accessibility and responsive behavior.

Prioritize roadmap items according to user needs and the current state of the codebase.

---

## Contributing

Contributions and suggestions are welcome.

### Suggested Workflow

1. Fork the repository.
2. Create a dedicated feature branch.
3. Make a focused change.
4. Add or update tests where appropriate.
5. Run type checking, linting, and tests.
6. Review the resulting changes.
7. Open a pull request with a clear description.

Example:

```bash
git checkout -b feat/your-feature
```

Before submitting a pull request, ensure that your change follows the existing workspace structure and does not introduce unnecessary dependencies or unrelated modifications.

For larger changes, describe the problem being solved and the reasoning behind the implementation.

## Author

**Ajoy Das**

- GitHub: https://github.com/Codewithajoydas
- Portfolio: https://codewithajoydas.in
- Project: https://github.com/Codewithajoydas/cwad_expense
- Live application: https://cwad-expense.codewithajoydas.in

## License

Review the repository's license file or licensing terms before redistributing or reusing this project.

---

**CWAD Expense** is part of Ajoy Das's software development work, focused on building practical applications with maintainable architecture and modern web technologies.
