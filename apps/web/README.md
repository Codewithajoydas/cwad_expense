# CWAD Expense - Next.js

This is the Next.js App Router version of the CWAD Expense web application.
Its pages and shared UI are migrated from `apps/web`.

## Getting Started

From the repository root, install dependencies and start this workspace:

```bash
npm install
npm run dev --workspace=nextjs_version
```

Open [http://localhost:3000](http://localhost:3000). Set
`NEXT_PUBLIC_API_URL` in `apps/nextjs_version/.env.local` to override the API
URL; see `.env.example` for the local development value.

## Validation

```bash
npm run typecheck --workspace=nextjs_version
npm run build --workspace=nextjs_version
```
