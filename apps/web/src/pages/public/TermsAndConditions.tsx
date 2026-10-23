
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsAndConditions() {
    const navigate = useNavigate()
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
            Terms and Conditions
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: October 23, 2026
          </p>
        </header>

        <article className="space-y-8 py-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2">
              By accessing or using CWAD Expense, you agree to these Terms
              and Conditions. If you do not agree, please do not use the
              application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              2. About the Service
            </h2>
            <p className="mt-2">
              CWAD Expense is a personal finance management application
              designed to help users record and organize income, expenses,
              accounts, budgets, financial goals, debts, and transactions.
              Features may change as the application develops.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. User Accounts
            </h2>
            <p className="mt-2">
              You are responsible for providing accurate account information,
              maintaining the confidentiality of your credentials, and
              activity performed through your account. Notify the service
              operator if you suspect unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              4. Acceptable Use
            </h2>
            <p className="mt-2">
              You agree not to misuse the application, attempt unauthorized
              access, interfere with its operation, upload malicious content,
              or use the service for unlawful activities.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              5. Financial Information Disclaimer
            </h2>
            <p className="mt-2">
              CWAD Expense is intended for record keeping and budgeting.
              It does not provide financial, investment, tax, or legal advice.
              You are responsible for checking the accuracy of the information
              you enter and for decisions made using that information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              6. Data and Backups
            </h2>
            <p className="mt-2">
              You should retain independent copies of important financial
              records. Although reasonable efforts may be made to maintain
              service reliability and protect data, uninterrupted availability
              and recovery of every record cannot be guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              7. Availability and Changes
            </h2>
            <p className="mt-2">
              Features may be updated, suspended, or discontinued as needed.
              We may revise these terms from time to time and will provide
              notice of material changes where required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              8. Limitation of Liability
            </h2>
            <p className="mt-2">
              To the extent permitted by applicable law, the service is
              provided on an "as is" and "as available" basis. Nothing in
              these terms excludes liability that cannot legally be excluded.
              Your statutory rights remain unaffected.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              9. Termination
            </h2>
            <p className="mt-2">
              Access may be suspended or terminated for violations of these
              terms or where required for security or legal reasons, subject
              to applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              10. Contact
            </h2>
            <p className="mt-2">
              For questions about these terms, contact the CWAD Expense
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
