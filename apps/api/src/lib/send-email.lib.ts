
import transport from "../config/nodemailer.config.js";

type EmailBase = {
  to: string;
  replyTo?: string;
};

type EmailTemplate =
  | (EmailBase & {
      type: "verification";
      name: string;
      verificationUrl: string;
    })
  | (EmailBase & {
      type: "password-reset";
      name: string;
      resetUrl: string;
    })
  | (EmailBase & {
      type: "otp";
      name?: string;
      otp: string;
      expiresInMinutes?: number;
    })
  | (EmailBase & {
      type: "welcome";
      name: string;
      dashboardUrl: string;
    })
  | (EmailBase & {
      type: "login-alert";
      name: string;
      loginTime: string;
      device?: string;
      ipAddress?: string;
    })
  | (EmailBase & {
      type: "transaction-receipt";
      name: string;
      amount: number;
      currency?: string;
      transactionType: "income" | "expense" | "transfer";
      transactionDate: string;
      description: string;
      transactionId?: string;
    })
  | (EmailBase & {
      type: "invitation";
      name: string;
      inviterName: string;
      invitationUrl: string;
    })
  | (EmailBase & {
      type: "custom";
      subject: string;
      text: string;
      html?: string;
    });

type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};





const escapeHtml = (value: string | number): string =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character]!;
  });

const button = (label: string, url: string): string => `
  <a
    href="${escapeHtml(url)}"
    style="
      display: inline-block;
      padding: 12px 20px;
      background: #18181b;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
    "
  >
    ${escapeHtml(label)}
  </a>
`;

const layout = (
  title: string,
  content: string,
): string => `
  <!doctype html>
  <html lang="en">
    <body style="
      margin: 0;
      padding: 24px 12px;
      background: #f4f4f5;
      font-family: Arial, Helvetica, sans-serif;
      color: #27272a;
      line-height: 1.6;
    ">
      <div style="
        max-width: 560px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #e4e4e7;
        border-radius: 8px;
        overflow: hidden;
      ">
        <div style="
          padding: 20px 24px;
          border-bottom: 1px solid #e4e4e7;
        ">
          <strong style="font-size: 18px;">CWAD Expense</strong>
        </div>

        <div style="padding: 24px;">
          <h2 style="margin-top: 0; font-size: 22px;">
            ${escapeHtml(title)}
          </h2>

          ${content}
        </div>

        <div style="
          padding: 16px 24px;
          background: #fafafa;
          border-top: 1px solid #e4e4e7;
          color: #71717a;
          font-size: 12px;
        ">
          This is an automated email from CWAD Expense.
          Please do not reply unless the message says otherwise.
        </div>
      </div>
    </body>
  </html>
`;

const paragraph = (text: string): string =>
  `<p>${escapeHtml(text)}</p>`;

const formatAmount = (
  amount: number,
  currency: string,
): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount);





const renderEmail = (email: EmailTemplate): RenderedEmail => {
  switch (email.type) {
    case "verification": {
      const name = escapeHtml(email.name);
      const url = escapeHtml(email.verificationUrl);

      return {
        subject: "Verify your email address",
        text: [
          `Hello ${email.name},`,
          "",
          "Please verify your email address to complete your registration.",
          email.verificationUrl,
          "",
          "If you did not create this account, ignore this email.",
        ].join("\n"),
        html: layout(
          "Verify your email",
          `
            <p>Hello ${name},</p>
            <p>
              Please confirm your email address to complete your
              CWAD Expense registration.
            </p>
            ${button("Verify email address", email.verificationUrl)}
            <p style="font-size: 13px; color: #71717a;">
              If the button does not work, open this link:
              <br />
              <a href="${url}">${url}</a>
            </p>
            <p>If you did not create this account, ignore this email.</p>
          `,
        ),
      };
    }

    case "password-reset": {
      const name = escapeHtml(email.name);
      const url = escapeHtml(email.resetUrl);

      return {
        subject: "Reset your password",
        text: [
          `Hello ${email.name},`,
          "",
          "We received a request to reset your password.",
          `Reset your password: ${email.resetUrl}`,
          "",
          "If you did not request this, ignore this email.",
        ].join("\n"),
        html: layout(
          "Reset your password",
          `
            <p>Hello ${name},</p>
            <p>
              We received a request to reset your CWAD Expense password.
            </p>
            ${button("Reset password", email.resetUrl)}
            <p style="font-size: 13px; color: #71717a;">
              If you did not request a password reset, you can ignore
              this email.
            </p>
            <p><a href="${url}">Open reset link</a></p>
          `,
        ),
      };
    }

    case "otp": {
      const name = email.name
        ? `<p>Hello ${escapeHtml(email.name)},</p>`
        : "";

      const expiry = email.expiresInMinutes ?? 5;

      return {
        subject: "Your verification code",
        text: [
          email.name ? `Hello ${email.name},` : "",
          `Your verification code is: ${email.otp}`,
          `This code expires in ${expiry} minutes.`,
          "Do not share this code with anyone.",
        ]
          .filter(Boolean)
          .join("\n"),
        html: layout(
          "Your verification code",
          `
            ${name}
            <p>Use the following code to continue:</p>
            <div style="
              padding: 16px;
              margin: 20px 0;
              background: #f4f4f5;
              border-radius: 6px;
              text-align: center;
              font-size: 28px;
              font-weight: bold;
              letter-spacing: 8px;
            ">
              ${escapeHtml(email.otp)}
            </div>
            <p>This code expires in ${expiry} minutes.</p>
            <p>Never share this code with anyone.</p>
          `,
        ),
      };
    }

    case "welcome": {
      const name = escapeHtml(email.name);
      const url = escapeHtml(email.dashboardUrl);

      return {
        subject: "Welcome to CWAD Expense",
        text: [
          `Hello ${email.name},`,
          "",
          "Welcome to CWAD Expense!",
          "Your account is ready to use.",
          `Open your dashboard: ${email.dashboardUrl}`,
        ].join("\n"),
        html: layout(
          "Welcome to CWAD Expense",
          `
            <p>Hello ${name},</p>
            <p>
              Welcome aboard! Your account is ready.
              You can now manage your income, expenses and transactions.
            </p>
            ${button("Open dashboard", email.dashboardUrl)}
            <p>Thank you for choosing CWAD Expense.</p>
          `,
        ),
      };
    }

    case "login-alert": {
      const name = escapeHtml(email.name);

      const details = [
        `<p><strong>Login time:</strong> ${escapeHtml(email.loginTime)}</p>`,
        email.device
          ? `<p><strong>Device:</strong> ${escapeHtml(email.device)}</p>`
          : "",
        email.ipAddress
          ? `<p><strong>IP address:</strong> ${escapeHtml(email.ipAddress)}</p>`
          : "",
      ].join("");

      return {
        subject: "New login to your account",
        text: [
          `Hello ${email.name},`,
          "",
          "A login to your account was detected.",
          `Login time: ${email.loginTime}`,
          email.device ? `Device: ${email.device}` : "",
          email.ipAddress ? `IP address: ${email.ipAddress}` : "",
          "",
          "If this was not you, secure your account immediately.",
        ]
          .filter(Boolean)
          .join("\n"),
        html: layout(
          "New account login",
          `
            <p>Hello ${name},</p>
            <p>A login to your CWAD Expense account was detected.</p>
            ${details}
            <p>
              If you do not recognize this activity, change your password
              and review your account security.
            </p>
          `,
        ),
      };
    }

    case "transaction-receipt": {
      if (!Number.isFinite(email.amount) || email.amount < 0) {
        throw new Error("Transaction amount must be a valid non-negative number.");
      }

      const currency = email.currency ?? "INR";
      const amount = formatAmount(email.amount, currency);
      const type = email.transactionType;

      return {
        subject: `Your ${type} transaction receipt`,
        text: [
          `Hello ${email.name},`,
          "",
          "Here are your transaction details:",
          `Type: ${type}`,
          `Amount: ${amount}`,
          `Date: ${email.transactionDate}`,
          `Description: ${email.description}`,
          email.transactionId
            ? `Transaction ID: ${email.transactionId}`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
        html: layout(
          "Transaction receipt",
          `
            <p>Hello ${escapeHtml(email.name)},</p>
            <p>Your transaction has been recorded with these details:</p>
            <table style="
              width: 100%;
              border-collapse: collapse;
            ">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e4e4e7;">
                  Transaction type
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e4e4e7;">
                  ${escapeHtml(type)}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e4e4e7;">
                  Amount
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e4e4e7;">
                  <strong>${escapeHtml(amount)}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e4e4e7;">
                  Date
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e4e4e7;">
                  ${escapeHtml(email.transactionDate)}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e4e4e7;">
                  Description
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e4e4e7;">
                  ${escapeHtml(email.description)}
                </td>
              </tr>
              ${
                email.transactionId
                  ? `
                    <tr>
                      <td style="padding: 10px;">Transaction ID</td>
                      <td style="padding: 10px;">
                        ${escapeHtml(email.transactionId)}
                      </td>
                    </tr>
                  `
                  : ""
              }
            </table>
          `,
        ),
      };
    }

    case "invitation": {
      const name = escapeHtml(email.name);
      const inviter = escapeHtml(email.inviterName);
      const url = escapeHtml(email.invitationUrl);

      return {
        subject: "You're invited to CWAD Expense",
        text: [
          `Hello ${email.name},`,
          "",
          `${email.inviterName} invited you to join CWAD Expense.`,
          `Accept the invitation: ${email.invitationUrl}`,
        ].join("\n"),
        html: layout(
          "You're invited",
          `
            <p>Hello ${name},</p>
            <p>
              <strong>${inviter}</strong> invited you to join CWAD Expense.
            </p>
            ${button("Accept invitation", email.invitationUrl)}
            <p><a href="${url}">Open invitation link</a></p>
          `,
        ),
      };
    }

    case "custom": {
      return {
        subject: email.subject,
        text: email.text,
        html:
          email.html ??
          layout("Message from CWAD Expense", paragraph(email.text)),
      };
    }
  }
};





export const sendEmail = async (
  options: EmailTemplate,
): Promise<void> => {
  const from = process.env.EMAIL;

  if (!from) {
    throw new Error("EMAIL environment variable is not configured.");
  }

  if (!options.to.trim()) {
    throw new Error("Recipient email address is required.");
  }

  const rendered = renderEmail(options);

  try {
    await transport.sendMail({
      from: {
        name: "CWAD Expense",
        address: from,
      },
      to: options.to,
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    });
  } catch (error) {
    console.error("Email delivery failed:", error);
    throw new Error("Unable to send email.", { cause: error });
  }
};
