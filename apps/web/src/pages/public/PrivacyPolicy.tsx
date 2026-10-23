
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function PrivacyPolicy() {
    const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <Button onClick={()=>navigate(-1)} variant={"link"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        <header className="mt-10 border-b pb-8">
          <p className="text-sm font-medium text-primary">CWAD Expense</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: October 23, 2026
          </p>
        </header>

        <article className="space-y-8 py-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              1. Introduction
            </h2>
            <p className="mt-2">
              This Privacy Policy explains how CWAD Expense may collect, use,
              store, and protect information when you use the application.
              The actual practices depend on the features and services
              implemented in the application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              2. Information We May Collect
            </h2>
            <p className="mt-2">
              Depending on the features you use, information may include:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                Account information, such as your name and email address.
              </li>
              <li>
                Financial records you enter, including income, expenses,
                accounts, budgets, debts, and goals.
              </li>
              <li>
                Account security information and authentication records.
              </li>
              <li>
                Technical information needed to operate, secure, and
                troubleshoot the service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. How Information May Be Used
            </h2>
            <p className="mt-2">
              Information may be used to provide application features, manage
              your account, display financial summaries, maintain security,
              troubleshoot problems, and meet applicable legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              4. Financial Data
            </h2>
            <p className="mt-2">
              Financial records are used to provide the recordkeeping and
              budgeting features you request. CWAD Expense should not be
              treated as a bank, payment provider, or financial institution
              unless a specific feature explicitly establishes that role.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              5. Cookies and Local Storage
            </h2>
            <p className="mt-2">
              The application may use cookies, local storage, or similar
              technologies for functionality, preferences, and authentication,
              if implemented. Review your browser settings to manage available
              storage controls. Essential technologies may be necessary for
              the service to work correctly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              6. Sharing of Information
            </h2>
            <p className="mt-2">
              Information may be processed by service providers that support
              hosting, email delivery, security, or other application
              functions, where those providers are used. Information may also
              be disclosed when required by law or to protect the service
              and its users. The actual providers and sharing practices
              should be documented before launch.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              7. Data Security
            </h2>
            <p className="mt-2">
              Appropriate technical and organizational safeguards should be
              used to protect information. No method of transmission or
              storage can be guaranteed completely secure. Do not store
              passwords or sensitive authentication secrets in plain text.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              8. Data Retention and Deletion
            </h2>
            <p className="mt-2">
              Information should be retained only as long as needed for the
              purposes described in this policy or as required by law.
              Users should be provided with a way to request access,
              correction, or deletion where applicable. Actual deletion
              behavior depends on the implemented account and data systems.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              9. Your Privacy Rights
            </h2>
            <p className="mt-2">
              Depending on applicable law, you may have rights to access,
              correct, delete, or obtain a copy of your personal information,
              and to raise concerns about its processing. Contact the service
              operator to make a request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              10. Children's Privacy
            </h2>
            <p className="mt-2">
              The application is not intended to collect children's personal
              information unlawfully. If you believe a child has provided
              personal information inappropriately, contact the service
              operator.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              11. Changes to This Policy
            </h2>
            <p className="mt-2">
              This policy may be updated as the application changes.
              The revised version will include an updated date, and notice
              will be provided where required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              12. Contact
            </h2>
            <p className="mt-2">
              For privacy questions or data requests, contact the CWAD Expense
              service operator through the official contact channel published
              with the application.
            </p>
          </section>
        </article>

        <footer className="border-t py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} CWAD Expense. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
