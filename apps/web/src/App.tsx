
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Link,
} from "react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

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
import Signup from "./pages/auth/signup";
import ForgotPassword from "./pages/auth/forgot-password";
import VerifyEmail from "./pages/auth/Verify-email";
import VerifyOtp from "./pages/auth/verify-otp";
import ResetPassword from "./pages/auth/Reset-password";
import LandingPage from "./pages/public/LandingPage";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsAndConditions from "./pages/public/TermsAndConditions";

// Shared layout for private pages
function PrivateLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

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
      <h1 className="text-6xl font-semibold tracking-tight">404</h1>

      <h2 className="text-xl font-medium">Page not found</h2>

      <p className="max-w-md text-sm text-muted-foreground">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <Button  className="mt-3">
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsAndConditions />} />

          {/* Private application layout */}
          <Route element={<PrivateLayout />}>
            <Route index element={<Dashboard />} />

            {/* Transactions */}
            <Route
              path="create-expense"
              element={<CreateExpense />}
            />
            <Route path="create-income" element={<Income />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="recurring" element={<Recurring />} />

            {/* Management */}
            <Route path="accounts" element={<Accounts />} />
            <Route path="categories" element={<Categories />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="goals" element={<Goals />} />
            <Route path="debts" element={<Debts />} />

            {/* Insights */}
            <Route path="reports" element={<Reports />} />
            <Route path="calendar" element={<Calendar />} />

            {/* Settings */}
            <Route
              path="notifications"
              element={<Notifications />}
            />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Unknown routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
}
