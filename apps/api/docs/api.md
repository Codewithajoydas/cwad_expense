# CWAD Expense API

This document describes the HTTP API currently exposed by `apps/api`.

## Local setup

The API listens on port `4000` by default. Its environment requires:

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port (defaults to `4000`) |
| `CORS_ORIGIN` | Allowed browser origin (defaults to `http://localhost:5173`) |
| `MONGODB_URI` | MongoDB connection string |
| `EMAIL` | Sender address used by the mail service |
| `EMAIL_PASSWORD` | SMTP credential; for Gmail, use an app password |
| `BETTER_AUTH_URL` | Optional Better Auth base URL; defaults to `http://localhost:4000` |

Create `apps/api/.env` with these values before starting the API. Do not commit credentials. The API connects to MongoDB during startup and will not serve requests if that connection fails.

## Conventions

- Unless noted otherwise, send and receive JSON using `Content-Type: application/json`.
- The account, category, and transaction endpoints require an authenticated Better Auth session. Sign in through `/api/auth/*` first and send the resulting session cookie with subsequent requests. Browser clients should include credentials when making cross-origin requests.
- The web origin must match `CORS_ORIGIN`.
- The API allows request bodies up to 1 MB and applies a limit of 300 requests per 15 minutes per client.
- Resource IDs are MongoDB ObjectId strings.
- Resource records are scoped to the authenticated user.
- Some validation and failure responses differ by resource. Unhandled errors use HTTP `500` with `{ "status": "error", "code": "INTERNAL_SERVER_ERROR", "message": "Internal server error" }`.

## Service and health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | API name, version, and running status |
| `GET` | `/api/v1/health` | No | Liveness status and timestamp |
| `GET` | `/api/v1/ready` | No | Readiness status |

Example:

```http
GET /api/v1/health
```

```json
{
  "status": "ok",
  "service": "api",
  "timestamp": "2026-10-24T05:30:00.000Z"
}
```

## Authentication

Better Auth is mounted at `/api/auth/*`. It provides the authentication endpoints, session cookies, email verification, and password-reset workflow. See [Mail](./mail.md) for email setup and the verification and reset messages. Endpoint details follow Better Auth's configured email-and-password flow; there are no separate application-specific auth routes in this API.

## Accounts

Base path: `/api/accounts`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/accounts` | List the signed-in user's accounts |
| `POST` | `/api/accounts` | Create an account |
| `PATCH` | `/api/accounts/:id` | Update an account |
| `DELETE` | `/api/accounts/:id` | Delete an account when it has no transactions and is not the default |

`GET` query parameters:

| Parameter | Values | Description |
| --- | --- | --- |
| `type` | `cash`, `bank`, `savings`, `credit_card`, `wallet`, `investment`, `other` | Filter by account type |
| `isActive` | `true`, `false` | Filter by active state |

Create body example:

```json
{
  "name": "Everyday checking",
  "type": "bank",
  "openingBalance": 1250,
  "currency": "INR",
  "institution": "Example Bank"
}
```

Account types are `cash`, `bank`, `savings`, `credit_card`, `wallet`, `investment`, and `other`. `name` and `type` are required on creation. `openingBalance` defaults to `0` and initializes `currentBalance`; it cannot be changed through the update endpoint. Other supported fields include `accountNumber`, `creditLimit`, `color`, `icon`, `isDefault`, `isActive`, and `notes`.

Successful list responses contain `success`, `count`, and `data`. Create, update, and delete responses contain `success`, `message`, and `data`. Duplicate names return `409`; an account with transactions or the default account cannot be deleted (`409`).

## Categories

Base path: `/api/categories`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/categories` | List the signed-in user's categories |
| `POST` | `/api/categories` | Create a category |
| `PATCH` | `/api/categories/:id` | Update a category |
| `DELETE` | `/api/categories/:id` | Delete an unused, non-default category |

`GET` accepts optional `type` (`income` or `expense`) and `isActive` (`true` or `false`) query parameters.

The API ensures a standard set of active, user-owned income and expense categories exists whenever the signed-in user lists categories. This makes the built-in options available to new users before they create any categories. Seeding is idempotent and does not overwrite existing categories or reactivate categories the user has deactivated. The defaults are protected from editing and deletion; users can create and manage additional categories.

Default expense categories: `Food & Dining`, `Groceries`, `Transportation`, `Shopping`, `Housing`, `Bills & Utilities`, `Healthcare`, `Education`, `Entertainment`, and `Other`.

Default income categories: `Salary`, `Freelancing`, `Business`, `Investments`, `Rental Income`, `Interest`, `Gifts`, `Refunds`, and `Other Income`.

Create body example:

```json
{
  "name": "Groceries",
  "type": "expense",
  "description": "Food and household essentials",
  "icon": "shopping-cart",
  "color": "#64748b"
}
```

`name` and `type` are required on creation. Other supported fields include `description`, `icon`, `color`, `parentCategory`, and `sortOrder`; `isActive` can be toggled when updating a category. Duplicate names for the same type return `409`. Default categories cannot be changed or deleted; categories with transactions cannot be deleted and should be deactivated instead.

Successful list responses contain `success`, `count`, and `data`. Create, update, and delete responses contain `success`, `message`, and `data`.

## Transactions

Base path: `/api/transactions`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/transactions` | List transactions with filters and pagination |
| `POST` | `/api/transactions` | Create a transaction |
| `PATCH` | `/api/transactions/:id` | Update a transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |

`GET` query parameters:

| Parameter | Values | Description |
| --- | --- | --- |
| `type` | `income`, `expense`, `transfer` | Filter by transaction type |
| `status` | `completed`, `pending`, `cancelled` | Filter by status |
| `account` | Account ID | Filter by account |
| `category` | Category ID | Filter by category |
| `startDate`, `endDate` | Date strings accepted by JavaScript `Date` | Inclusive date range |
| `page` | Positive integer | Page number; defaults to `1` |
| `limit` | Positive integer | Page size; defaults to `20`, capped at `100` |

Create body example:

```json
{
  "type": "expense",
  "amount": 42.5,
  "description": "Lunch",
  "account": "66f000000000000000000001",
  "category": "66f000000000000000000002",
  "date": "2026-10-24",
  "paymentMethod": "card",
  "status": "completed"
}
```

`type`, positive `amount`, and an active `account` belonging to the signed-in user are required. `category` must be an active category of the same type as an income or expense transaction; transfers cannot have a category. Transfers require a distinct destination account in `toAccount`. Optional fields include `description`, `date`, `paymentMethod` (`cash`, `card`, `bank_transfer`, `upi`, `wallet`, `other`), `status`, `notes`, `tags`, `isRecurring`, `recurringTransaction`, and `receiptUrl`.

Completed transactions update account balances. Pending and cancelled transactions do not.

`PATCH /api/transactions/:id` accepts any supported transaction fields from the create payload. Omitted fields remain unchanged; the complete resulting transaction is validated before it is saved. For example:

```http
PATCH /api/transactions/66f000000000000000000003
Content-Type: application/json
```

```json
{
  "amount": 48.5,
  "description": "Lunch with colleagues",
  "date": "2026-10-24"
}
```

`DELETE /api/transactions/:id` permanently removes the signed-in user's transaction. For a completed transaction, its effect is reversed on the source account and, for a transfer, the destination account. Both operations validate ownership; a transaction belonging to another user cannot be changed or removed. Create, update, and delete responses contain `success`, `message`, and `data`. List responses contain `success`, `message`, `transactions`, and `pagination` (`total`, `page`, `limit`, and `totalPages`); account, destination account, and category details are populated in each result.

## Other user data

The following authenticated endpoints provide persistent, user-scoped records for the web application's budgets, goals, debts, recurring schedules, notifications, and preferences. Records are stored under the signed-in user's ID; a user cannot read or change another user's records.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/data/:resource` | List records for a resource |
| `POST` | `/api/data/:resource` | Create a record |
| `PATCH` | `/api/data/:resource/:id` | Update a record |
| `DELETE` | `/api/data/:resource/:id` | Delete a record |

Supported `resource` values are `budgets`, `goals`, `debts`, `recurring`, `notifications`, and `preferences`. All responses are JSON. List responses have `{ "success": true, "count": 0, "data": [] }`; create and update responses return the saved record in `data`, and delete responses return the deleted record's ID. `PATCH` accepts partial record data, merges it into the saved record, and validates the result. `DELETE` permanently removes the selected record. Unknown resources return `404`; invalid bodies and IDs return `400`; records that do not exist or do not belong to the signed-in user return `404`.

Each request body must be a JSON object containing only fields supported for that resource. `PATCH` merges the submitted fields into the existing record and validates the complete result. Record IDs are MongoDB ObjectId strings.

| Resource | Supported fields | Required on creation |
| --- | --- | --- |
| `budgets` | `name`, `category`, `categoryId`, `limit`, `period` | `name`, `limit`, `period` |
| `goals` | `name`, `category`, `target`, `saved`, `targetDate`, `description` | `name`, `target`, `saved` |
| `debts` | `person`, `type`, `amount`, `paid`, `date`, `dueDate`, `note` | `person`, `type`, `amount`, `paid`, `date` |
| `recurring` | `title`, `category`, `type`, `amount`, `account`, `frequency`, `startDate`, `nextDate`, `endDate`, `status`, `note` | `title`, `type`, `amount`, `account`, `frequency`, `startDate`, `nextDate`, `status` |
| `notifications` | `title`, `description`, `time`, `type`, `read` | `title`, `description`, `type`, `read` |
| `preferences` | `monthlyBudget`, `weekStartsOn`, `dateFormat`, `theme`, `currency`, `language`, `expenseAlerts`, `budgetAlerts`, `incomeAlerts`, `weeklySummary`, `emailNotifications`, `twoFactorAuth` | None |

`budgets.period` and `recurring.frequency` accept `Weekly`, `Monthly`, or `Yearly`. `debts.type` accepts `lent` or `borrowed`; recurring `type` accepts `expense` or `income`, and `status` accepts `active` or `paused`; notification `type` accepts `expense`, `budget`, `goal`, `account`, or `system`. Preferences validate `weekStartsOn` as `Monday` or `Sunday`, `dateFormat` as `DD/MM/YYYY`, `MM/DD/YYYY`, or `YYYY-MM-DD`, and `theme` as `light`, `dark`, or `system`. Numeric amount fields must be non-negative, `saved` cannot exceed a goal's `target`, and debt `paid` cannot exceed `amount`. Date fields must be valid date strings or empty strings.

Example:

```http
POST /api/data/goals
Content-Type: application/json
```

```json
{
  "name": "Emergency fund",
  "category": "Savings",
  "target": 100000,
  "saved": 25000,
  "targetDate": "2027-06-01",
  "description": "Build a financial safety net."
}
```

Preferences use the same collection endpoints as other resources. The web client lists the user's preference records and updates the first record if one exists, otherwise it creates one. Creating a transaction also creates a notification in the same database transaction.
