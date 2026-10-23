
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { sendEmail } from "../lib/send-email.js";

export function createAuth(db: Parameters<typeof mongodbAdapter>[0]) {
  return betterAuth({
    database: mongodbAdapter(db),

    baseURL:
      process.env.BETTER_AUTH_URL ?? "http://localhost:4000",

    trustedOrigins: ["http://localhost:5173"],

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,

      sendResetPassword: async ({ user, url }) => {
        await sendEmail({
          type: "password-reset",
          to: user.email,
          name: user.name,
          resetUrl: url,
        });
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: false,

      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail({
          type: "verification",
          to: user.email,
          name: user.name,
          verificationUrl: url,
        });
      },
    },
  });
}
