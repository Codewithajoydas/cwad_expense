
import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Receipt,
  Plus,
  Tags,
  Wallet,
  Settings,
  TrendingUp,
  ArrowLeftRight,
  PiggyBank,
  Repeat,
  ChartNoAxesCombined,
  Target,
  HandCoins,
  Bell,
  CalendarDays,
  ChevronRight,
  X,
  Menu,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

import logo from "@/assets/images/cwad-expense-logo.png";
import { Separator } from "@/components/ui/separator";

type SidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
};

const navigationGroups = [
  {
    title: "OVERVIEW",
    links: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "TRANSACTIONS",
    links: [
      {
        title: "All Transactions",
        url: "/transactions",
        icon: Receipt,
      },
      {
        title: "Add Expense",
        url: "/create-expense",
        icon: Plus,
      },
      {
        title: "Add Income",
        url: "/create-income",
        icon: TrendingUp,
      },
      {
        title: "Transfers",
        url: "/transfers",
        icon: ArrowLeftRight,
      },
      {
        title: "Recurring",
        url: "/recurring",
        icon: Repeat,
      },
    ],
  },
  {
    title: "MANAGEMENT",
    links: [
      {
        title: "Accounts",
        url: "/accounts",
        icon: Wallet,
      },
      {
        title: "Categories",
        url: "/categories",
        icon: Tags,
      },
      {
        title: "Budgets",
        url: "/budgets",
        icon: PiggyBank,
      },
      {
        title: "Financial Goals",
        url: "/goals",
        icon: Target,
      },
      {
        title: "Debts & Loans",
        url: "/debts",
        icon: HandCoins,
      },
    ],
  },
  {
    title: "INSIGHTS",
    links: [
      {
        title: "Reports",
        url: "/reports",
        icon: ChartNoAxesCombined,
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: CalendarDays,
      },
    ],
  },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "group flex h-9 w-full items-center gap-3 rounded-md px-3",
    "text-[13px] transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    isActive
      ? "bg-accent font-medium text-accent-foreground"
      : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
  ].join(" ");

export default function Sidebar({
  isOpen,
  onToggle,
}: SidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r bg-background transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center px-3">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 rounded-md"
          >
            <img
              src={logo}
              alt="CWAD Expense"
              className="size-9 shrink-0 object-contain"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                CWAD Expense
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Personal finance
              </p>
            </div>
          </NavLink>
        </div>

        <Separator />

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-5"
        >
          {navigationGroups.map((group) => (
            <section key={group.title}>
              <h2 className="mb-2 px-3 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground/80">
                {group.title}
              </h2>

              <div className="space-y-1">
                {group.links.map(({ title, url, icon: Icon }) => (
                  <NavLink
                    key={url}
                    to={url}
                    end
                    className={navLinkClass}
                  >
                    <Icon className="size-[17px] shrink-0 opacity-85" />

                    <span className="min-w-0 flex-1 truncate">
                      {title}
                    </span>

                    <ChevronRight className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-50" />
                  </NavLink>
                ))}
              </div>
            </section>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 space-y-1 border-t px-3 py-3">
          <NavLink
            to="/notifications"
            end
            className={navLinkClass}
          >
            <Bell className="size-[17px] shrink-0 opacity-85" />
            <span className="min-w-0 flex-1">Notifications</span>
          </NavLink>

          <NavLink
            to="/settings"
            end
            className={navLinkClass}
          >
            <Settings className="size-[17px] shrink-0 opacity-85" />
            <span className="min-w-0 flex-1">Settings</span>
          </NavLink>
        </div>
      </aside>

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isOpen}
        className={`fixed top-5 z-50 flex size-8 items-center justify-center rounded-md border bg-background shadow-sm transition-all duration-200 ${
          isOpen ? "left-[240px]" : "left-3"
        }`}
      >
        {isOpen ? (
          <PanelRightClose className="size-4"/>
        ) : (
          <PanelRightOpen className="size-4" />
        )}
      </button>
    </>
  );
}
