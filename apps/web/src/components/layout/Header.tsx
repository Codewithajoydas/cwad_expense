import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Search, Bell, ChevronDown, UserRound, Settings, LogOut, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/create-expense": "Add Expense",
  "/create-income": "Add Income",
  "/transactions": "Transactions",
  "/transfers": "Transfers",
  "/recurring": "Recurring Transactions",
  "/accounts": "Accounts",
  "/categories": "Categories",
  "/budgets": "Budgets",
  "/goals": "Financial Goals",
  "/debts": "Debts & Loans",
  "/reports": "Reports",
  "/calendar": "Calendar",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

type HeaderProps = {
  onMenuClick?: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const [search, setSearch] = useState("");

  const pageTitle = pageTitles[location.pathname] ?? "CWAD Expense";

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    if (query) {
      // Connect search to your transactions or global search logic.
      console.log("Search:", query);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Mobile menu and page title */}
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation menu"
            onClick={onMenuClick}
          >
            <Menu className="size-5" />
          </Button>

          <div className="min-w-0 px-6">
            <h1 className="truncate text-base font-semibold tracking-tight">{pageTitle}</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Manage your personal finances
            </p>
          </div>
        </div>

        {/* Right: Search and actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden w-48 lg:block xl:w-64">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transactions..."
                aria-label="Search transactions"
                className="h-9 bg-muted/40 pl-9 text-sm"
              />
            </div>
          </form>

          <Separator orientation="vertical" className="hidden h-7 sm:block" />

          {/* Notifications */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Link to="/notifications">
              <Bell className="size-[18px]" />
            </Link>
          </Button>

          {/* Profile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button type="button" variant="ghost" className="flex h-10 items-center gap-2 px-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                  <UserRound className="size-4" />
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  <p className="mt-1 text-xs text-muted-foreground">Personal</p>
                </div>

                <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                    <UserRound className="mr-2 size-4" />
                  <Link to="/settings">
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem>
                    <Settings className="mr-2 size-4" />
                  <Link to="/settings">
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={() => {
                    // Connect your logout API/session cleanup here.
                    console.log("Logout clicked");
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
