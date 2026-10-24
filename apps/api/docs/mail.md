# Mail service

The API sends transactional email through Nodemailer using Gmail's SMTP service. The mail transport is configured in `src/config/nodemailer.config.ts`, and templates and delivery are handled by `src/lib/send-email.lib.ts`.

## Configuration

Set these variables in `apps/api/.env`:

| Variable | Purpose |
| --- | --- |
| `EMAIL` | Gmail address used as the sender |
| `EMAIL_PASSWORD` | Gmail app password used for SMTP authentication |

The transport uses `smtp.gmail.com`, port `465`, and secure TLS. For Gmail accounts with two-step verification, configure an app password rather than the account's regular password. Keep both values private and out of source control. The API validates these settings during startup.

## Current email flows

Email verification and password reset are wired into Better Auth:

- Verification messages are sent on sign-up. Users must verify their email to complete registration, and verification does not automatically sign them in.
- Password-reset requests send a reset link. Sessions are revoked after a password reset.

Better Auth supplies the recipient, user name, and one-time URL. The mail utility sends the corresponding template; email sending is not exposed as a public API endpoint.

## Supported templates

The internal `sendEmail` utility accepts a discriminated template object. Every template requires `to` (recipient address); `replyTo` is optional.

| `type` | Required template fields | Optional fields |
| --- | --- | --- |
| `verification` | `name`, `verificationUrl` | `replyTo` |
| `password-reset` | `name`, `resetUrl` | `replyTo` |
| `otp` | `otp` | `name`, `expiresInMinutes` (defaults to 5), `replyTo` |
| `welcome` | `name`, `dashboardUrl` | `replyTo` |
| `login-alert` | `name`, `loginTime` | `device`, `ipAddress`, `replyTo` |
| `transaction-receipt` | `name`, `amount`, `transactionType`, `transactionDate`, `description` | `currency` (defaults to `INR`), `transactionId`, `replyTo` |
| `invitation` | `name`, `inviterName`, `invitationUrl` | `replyTo` |
| `custom` | `subject`, `text` | `html`, `replyTo` |

`transactionType` must be `income`, `expense`, or `transfer`. A receipt amount must be a finite, non-negative number. Currency values must be supported ISO currency codes because the amount is formatted with `Intl.NumberFormat`.

All built-in templates include plain-text and HTML content. HTML values in the built-in templates are escaped before insertion. For a custom email, supplied `html` is sent as provided; only provide trusted, intentionally authored HTML.

## Delivery behavior

`sendEmail` resolves after Nodemailer successfully hands off the message. Invalid recipient/template data, missing sender configuration, or SMTP delivery failures reject with an error. Callers should handle delivery failures rather than treating them as successful sends. Failed delivery is also logged by the mail utility.

## Adding a template or flow

1. Extend the `EmailTemplate` union in `src/lib/send-email.lib.ts` with a type-safe payload.
2. Add its subject, text body, and HTML rendering in `renderEmail`.
3. Call `sendEmail` from the relevant server-side flow and handle rejection.
4. Update this document with the template fields and describe where the flow is triggered.
