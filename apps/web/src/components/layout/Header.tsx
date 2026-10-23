import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Search,
  Bell,
  ChevronDown,
  UserRound,
  Settings,
  LogOut,
  Menu,
  LoaderCircle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

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
  "/dashboard": "Dashboard",
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
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  // Get the currently authenticated user from Better Auth.
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  const pageTitle = pageTitles[location.pathname] ?? "CWAD Expense";

  const userName = user?.name?.trim() || "My Account";
  const userEmail = user?.email || "";
  const userImage = user?.image;

  const initials =
    userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    if (query) {
      // Connect this to your global search API when available.
      console.log("Search:", query);
    }
  }

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const { error } = await authClient.signOut();

      if (error) {
        setLogoutError(error.message || "Unable to sign out. Please try again.");
        return;
      }

      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Something went wrong while signing out.",
      );
    } finally {
      setIsLoggingOut(false);
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

          <div className="min-w-0">
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
          <Button type="button" variant="ghost" size="icon" aria-label="Notifications">
            <Link to="/notifications">
              <Bell className="size-[18px]" />
            </Link>
          </Button>

          {/* Profile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className="flex h-10 max-w-56 items-center gap-2 px-2"
                  aria-label="Open account menu"
                />
              }
            >
              <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-xs font-semibold">
                {userImage ? (
                  <img src={userImage} alt={userName} className="size-full object-cover" />
                ) : (
                  initials
                )}
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-36 truncate text-sm font-medium leading-none">
                  {isPending ? "Loading account..." : userName}
                </p>

                <p className="mt-1 max-w-36 truncate text-xs text-muted-foreground">
                  {userEmail || "Account"}
                </p>
              </div>

              <ChevronDown className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8} className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-sm font-semibold">
                      {userImage ? (
                        <img src={userImage} alt={userName} className="size-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {isPending ? "Loading..." : userName}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {userEmail || "No email available"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem render={<Link to="/settings" />}>
                  <UserRound className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem render={<Link to="/settings" />}>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {logoutError && (
                <div role="alert" className="px-2 py-2 text-xs text-destructive">
                  {logoutError}
                </div>
              )}

              <DropdownMenuItem
                disabled={isLoggingOut}
                onClick={()=>handleLogout()}
                onSelect={(event) => {
                  event.preventDefault();
                  void handleLogout();
                }}
                className="text-destructive focus:text-destructive"
              >
                {isLoggingOut ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 size-4" />
                )}

                {isLoggingOut ? "Signing out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
