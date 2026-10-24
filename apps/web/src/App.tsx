import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Link,
  Navigate,
} from "react-router";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

import { authClient } from "./lib/auth-client";

// Private pages
import Dashboard from "./pages/private/Dashboard";
import CreateExpense from "./pages/private/Create-expense";
import Transactions from "./pages/private/Transactions";
import Categories from "./pages/private/Categories";
import Accounts from "./pages/private/Accounts";
import SettingsPage from "./pages/private/Settings";
import Budgets from "./pages/private/Budgets";
import Calendar from "./pages/private/Calendar";
import Debts from "./pages/private/Debts";
import Goals from "./pages/private/Goals";
import Income from "./pages/private/Income";
import Transfers from "./pages/private/Transfers";
import Recurring from "./pages/private/Recurring";
import Reports from "./pages/private/Reports";
import Notifications from "./pages/private/Notifications";

// Public pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/Forgot-password";
import VerifyEmail from "./pages/auth/Verify-email";
import VerifyOtp from "./pages/auth/Verify-otp";
import ResetPassword from "./pages/auth/Reset-password";

import LandingPage from "./pages/public/LandingPage";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsAndConditions from "./pages/public/TermsAndConditions";

// Private layout and authentication guard
function PrivateLayout() {
  const {
    data: session,
    error,
    isPending,
  } = authClient.useSession();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Wait for the session check to finish.
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Checking your session...
        </p>
      </div>
    );
  }

  // Do not display private pages if session verification fails.
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <h2 className="text-xl font-semibold">
          Unable to verify your session
        </h2>

        <p className="max-w-md text-sm text-muted-foreground">
          Please check your connection and try again.
        </p>

        <Button onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  // Redirect logged-out users to the login page.
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Only authenticated users can see the private application.
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      <main
        className={`min-h-screen min-w-0 transition-all duration-200 ${
          isSidebarOpen ? "md:pl-64" : "pl-0"
        }`}
      >
        <Header onMenuClick={toggleSidebar} />

        <Outlet />
      </main>
    </div>
  );
}

// 404 page
function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-6xl font-semibold tracking-tight">
        404
      </h1>

      <h2 className="text-xl font-medium">
        Page not found
      </h2>

      <p className="max-w-md text-sm text-muted-foreground">
        The page you're looking for doesn't exist or may have
        been moved.
      </p>

      <Button  className="mt-3">
        <Link to="/dashboard">
          Back to dashboard
        </Link>
      </Button>
    </main>
  );
}

// Main application
export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          {/* Public routes */}

          <Route
            path="/"
            element={<LandingPage />}
          />

          <Route
            path="/landing"
            element={<LandingPage />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Signup />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />

          <Route
            path="/verify-otp"
            element={<VerifyOtp />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />

          <Route
            path="/terms-conditions"
            element={<TermsAndConditions />}
          />

          {/* Protected routes */}

          <Route element={<PrivateLayout />}>
            {/* Dashboard */}

            <Route
              index
              element={<Navigate to="/dashboard" replace />}
            />

            <Route
              path="dashboard"
              element={<Dashboard />}
            />

            {/* Transactions */}

            <Route
              path="create-expense"
              element={<CreateExpense />}
            />

            <Route
              path="create-income"
              element={<Income />}
            />

            <Route
              path="transactions"
              element={<Transactions />}
            />

            <Route
              path="transfers"
              element={<Transfers />}
            />

            <Route
              path="recurring"
              element={<Recurring />}
            />

            {/* Management */}

            <Route
              path="accounts"
              element={<Accounts />}
            />

            <Route
              path="categories"
              element={<Categories />}
            />

            <Route
              path="budgets"
              element={<Budgets />}
            />

            <Route
              path="goals"
              element={<Goals />}
            />

            <Route
              path="debts"
              element={<Debts />}
            />

            {/* Insights */}

            <Route
              path="reports"
              element={<Reports />}
            />

            <Route
              path="calendar"
              element={<Calendar />}
            />

            {/* Settings */}

            <Route
              path="notifications"
              element={<Notifications />}
            />

            <Route
              path="settings"
              element={<SettingsPage />}
            />
          </Route>

          {/* Unknown routes */}

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
}