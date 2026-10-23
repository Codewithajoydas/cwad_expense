import { useEffect, useState } from "react";
import {
  UserRound,
  SlidersHorizontal,
  Palette,
  Globe,
  Bell,
  ShieldCheck,
  Database,
  Download,
  Save,
  RotateCcw,
  LoaderCircle,
  CheckCircle2,
  CircleAlert,
  Mail,
  CalendarDays,
  Copy,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

type SettingsSection =
  | "profile"
  | "preferences"
  | "appearance"
  | "region"
  | "notifications"
  | "security"
  | "data";

const sections = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "region", label: "Currency & Region", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "data", label: "Data Management", icon: Database },
] as const;

const initialSettings = {
  name: "",
  monthlyBudget: "20000",
  weekStartsOn: "Monday",
  dateFormat: "DD/MM/YYYY",
  theme: "system",
  currency: "INR",
  language: "English",
  expenseAlerts: true,
  budgetAlerts: true,
  incomeAlerts: false,
  weeklySummary: true,
  emailNotifications: false,
  twoFactorAuth: false,
};

const notificationOptions = [
  {
    key: "expenseAlerts",
    label: "Expense notifications",
    description: "Get notified when expenses are recorded.",
  },
  {
    key: "budgetAlerts",
    label: "Budget alerts",
    description: "Get notified when approaching your budget.",
  },
  {
    key: "incomeAlerts",
    label: "Income notifications",
    description: "Get notified when income is recorded.",
  },
  {
    key: "weeklySummary",
    label: "Weekly summary",
    description: "Receive a weekly overview of your finances.",
  },
  {
    key: "emailNotifications",
    label: "Email notifications",
    description: "Allow financial updates by email.",
  },
] as const;

type NotificationKey = (typeof notificationOptions)[number]["key"];

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  // Populate the profile form with the authenticated user's information.
  useEffect(() => {
    if (user) {
      setSettings((current) => ({
        ...current,
        name: user.name || "",
      }));
    }
  }, [user?.id, user?.name]);

  const userName = user?.name?.trim() || "User";
  const userEmail = user?.email || "";
  const userImage = user?.image;

  const initials =
    userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  const activeLabel =
    sections.find((section) => section.id === activeSection)?.label ??
    "Settings";

  function updateSetting<K extends keyof typeof initialSettings>(
    key: K,
    value: (typeof initialSettings)[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setSaveError("");
  }

  async function handleSave() {
    setSaved(false);
    setSaveError("");
    setIsSaving(true);

    try {
      if (activeSection === "profile") {
        if (!user) {
          setSaveError("Please sign in to update your profile.");
          return;
        }

        const name = settings.name.trim();

        if (!name) {
          setSaveError("Name cannot be empty.");
          return;
        }

        const { error } = await authClient.updateUser({ name });

        if (error) {
          setSaveError(error.message || "Unable to update your profile.");
          return;
        }

        setSaved(true);
        return;
      }

      // Other preferences are currently stored in component state only.
      // Connect them to your backend or persistent storage to save them.
      setSaved(true);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    setSettings((current) => ({
      ...initialSettings,
      name: user?.name || "",
      // Keep the other preferences at their initial defaults.
      monthlyBudget: initialSettings.monthlyBudget,
      weekStartsOn: initialSettings.weekStartsOn,
      dateFormat: initialSettings.dateFormat,
      theme: initialSettings.theme,
      currency: initialSettings.currency,
      language: initialSettings.language,
      expenseAlerts: initialSettings.expenseAlerts,
      budgetAlerts: initialSettings.budgetAlerts,
      incomeAlerts: initialSettings.incomeAlerts,
      weeklySummary: initialSettings.weeklySummary,
      emailNotifications: initialSettings.emailNotifications,
      twoFactorAuth: current.twoFactorAuth,
    }));

    setSaved(false);
    setSaveError("");
  }

  async function handleCopyUserId() {
    if (!user?.id) return;

    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setSaveError("Unable to copy the account ID.");
    }
  }

  function handleExport() {
    window.alert(
      "Connect your transaction data to enable financial data export.",
    );
  }

  return (
    <main className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Page heading */}
   

        <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
          {/* Settings navigation */}
          <aside>
            <nav className="flex gap-1 overflow-x-auto pb-2 md:flex-col md:overflow-visible">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setActiveSection(id);
                    setSaved(false);
                    setSaveError("");
                  }}
                  className={[
                    "flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                    activeSection === id
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  ].join(" ")}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Settings content */}
          <section className="min-w-0 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{activeLabel}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your {activeLabel.toLowerCase()} settings.
              </p>
            </div>

            {/* Profile */}
            {activeSection === "profile" && (
              <div className="space-y-5">
                {/* Authenticated user summary */}
                <div className="rounded-lg border bg-background">
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-lg font-semibold">
                      {isPending ? (
                        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
                      ) : userImage ? (
                        <img
                          src={userImage}
                          alt={userName}
                          className="size-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-semibold">
                        {isPending ? "Loading account..." : userName}
                      </h3>

                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {userEmail || "No email available"}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {user?.emailVerified ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium">
                            <CheckCircle2 className="size-3.5 text-green-600" />
                            Email verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground">
                            <Mail className="size-3.5" />
                            Email not verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 p-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Account ID
                      </p>

                      <div className="mt-1 flex min-w-0 items-center gap-2">
                        <p
                          className="truncate text-sm font-medium"
                          title={user?.id}
                        >
                          {isPending
                            ? "Loading..."
                            : user?.id || "Not signed in"}
                        </p>

                        {user?.id && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0"
                            onClick={handleCopyUserId}
                            aria-label="Copy account ID"
                          >
                            {copied ? (
                              <CheckCircle2 className="size-3.5" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Account created
                      </p>

                      <p className="mt-1 flex items-center gap-2 text-sm font-medium">
                        <CalendarDays className="size-4 text-muted-foreground" />

                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : isPending
                            ? "Loading..."
                            : "Not available"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Editable profile information */}
                <div className="rounded-lg border bg-background">
                  <div className="p-5">
                    <h3 className="font-medium">Personal information</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Update the name associated with your account.
                    </p>

                    {isPending ? (
                      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                        <LoaderCircle className="size-4 animate-spin" />
                        Loading your account details...
                      </div>
                    ) : (
                      <div className="mt-6 space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full name</Label>
                          <Input
                            id="name"
                            placeholder="Enter your name"
                            value={settings.name}
                            onChange={(event) =>
                              updateSetting("name", event.target.value)
                            }
                            maxLength={100}
                            autoComplete="name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={userEmail}
                            readOnly
                            disabled
                            autoComplete="email"
                          />
                          <p className="text-xs text-muted-foreground">
                            Email is managed by your authentication account.
                            Changing it requires a separate email-change flow.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <p className="text-sm text-muted-foreground">
                      Profile changes are saved to your account.
                    </p>

                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={isPending || isSaving || !user}
                    >
                      {isSaving ? (
                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 size-4" />
                      )}
                      {isSaving ? "Saving..." : "Save profile"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeSection === "preferences" && (
              <div className="rounded-lg border bg-background">
                <div className="p-5">
                  <h3 className="font-medium">Expense preferences</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Set your default budget and date preferences.
                  </p>

                  <div className="mt-6 max-w-md space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyBudget">
                        Monthly budget (₹)
                      </Label>
                      <Input
                        id="monthlyBudget"
                        type="number"
                        min="0"
                        value={settings.monthlyBudget}
                        onChange={(event) =>
                          updateSetting("monthlyBudget", event.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weekStartsOn">Week starts on</Label>
                      <select
                        id="weekStartsOn"
                        value={settings.weekStartsOn}
                        onChange={(event) =>
                          updateSetting("weekStartsOn", event.target.value)
                        }
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option>Monday</option>
                        <option>Sunday</option>
                        <option>Saturday</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date format</Label>
                      <select
                        id="dateFormat"
                        value={settings.dateFormat}
                        onChange={(event) =>
                          updateSetting("dateFormat", event.target.value)
                        }
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeSection === "appearance" && (
              <div className="rounded-lg border bg-background p-5">
                <h3 className="font-medium">Appearance</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose how the application should look.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      value: "light",
                      label: "Light",
                      description: "Light background",
                    },
                    {
                      value: "dark",
                      label: "Dark",
                      description: "Dark background",
                    },
                    {
                      value: "system",
                      label: "System",
                      description: "Use device preference",
                    },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => updateSetting("theme", theme.value)}
                      className={[
                        "rounded-lg border p-4 text-left transition-colors",
                        settings.theme === theme.value
                          ? "border-primary bg-accent"
                          : "hover:bg-muted/50",
                      ].join(" ")}
                    >
                      <div className="mb-4 flex gap-1">
                        <div className="h-8 flex-1 rounded border bg-background" />
                        <div className="h-8 w-8 rounded border bg-muted" />
                      </div>
                      <p className="text-sm font-medium">{theme.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {theme.description}
                      </p>
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Theme selection is a UI preference. Connect it to your
                  application theme provider to apply it globally.
                </p>
              </div>
            )}

            {/* Currency and region */}
            {activeSection === "region" && (
              <div className="rounded-lg border bg-background p-5">
                <h3 className="font-medium">Currency & Region</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose your preferred currency and language.
                </p>

                <div className="mt-6 max-w-md space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default currency</Label>
                    <select
                      id="currency"
                      value={settings.currency}
                      onChange={(event) =>
                        updateSetting("currency", event.target.value)
                      }
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="INR">INR — Indian Rupee (₹)</option>
                      <option value="USD">USD — US Dollar ($)</option>
                      <option value="EUR">EUR — Euro (€)</option>
                      <option value="GBP">GBP — British Pound (£)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select
                      id="language"
                      value={settings.language}
                      onChange={(event) =>
                        updateSetting("language", event.target.value)
                      }
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option>English</option>
                      <option>Hindi</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <div className="divide-y rounded-lg border bg-background">
                <div className="p-5">
                  <h3 className="font-medium">Notifications</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose which updates you want to receive.
                  </p>
                </div>

                {notificationOptions.map((item) => {
                  const key: NotificationKey = item.key;

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 p-5"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>

                      <Switch
                        checked={settings[key]}
                        onCheckedChange={(checked) =>
                          updateSetting(key, checked)
                        }
                        aria-label={item.label}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Security */}
            {activeSection === "security" && (
              <div className="rounded-lg border bg-background">
                <div className="p-5">
                  <h3 className="font-medium">Security</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage account protection options.
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-sm font-medium">
                      Two-factor authentication
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add an extra verification step to sign-in.
                    </p>
                  </div>

                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      updateSetting("twoFactorAuth", checked)
                    }
                    aria-label="Two-factor authentication"
                  />
                </div>

                <Separator />

                <div className="p-5">
                  <p className="text-sm font-medium">Password</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Password changes require a configured authentication flow.
                  </p>

                  <Button
                    className="mt-4"
                    variant="outline"
                    disabled
                  >
                    Change password
                  </Button>
                </div>

                <p className="px-5 pb-5 text-xs text-muted-foreground">
                  The two-factor switch is currently a UI preference. It does
                  not enable server-side two-factor authentication.
                </p>
              </div>
            )}

            {/* Data management */}
            {activeSection === "data" && (
              <div className="space-y-5">
                <div className="rounded-lg border bg-background p-5">
                  <h3 className="font-medium">Export your data</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Download a copy of your transactions and financial records.
                  </p>

                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleExport}
                  >
                    <Download className="mr-2 size-4" />
                    Export data
                  </Button>
                </div>

                <div className="rounded-lg border bg-background p-5">
                  <h3 className="font-medium">Reset preferences</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Restore the settings form to its initial values.
                  </p>

                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleReset}
                  >
                    <RotateCcw className="mr-2 size-4" />
                    Reset settings
                  </Button>
                </div>
              </div>
            )}

            {/* Save status and errors */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div className="min-w-0 flex-1">
                {saved && (
                  <p
                    className="flex items-center gap-2 text-sm text-green-700"
                    aria-live="polite"
                  >
                    <CheckCircle2 className="size-4 shrink-0" />
                    {activeSection === "profile"
                      ? "Profile updated successfully."
                      : "Changes saved in the current session."}
                  </p>
                )}

                {saveError && (
                  <p
                    role="alert"
                    className="flex items-center gap-2 text-sm text-destructive"
                  >
                    <CircleAlert className="size-4 shrink-0" />
                    {saveError}
                  </p>
                )}
              </div>

              {activeSection !== "profile" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  Reset
                </Button>
              )}

              {activeSection !== "profile" && (
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 size-4" />
                  )}
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}