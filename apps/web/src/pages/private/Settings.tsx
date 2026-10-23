
import { useState } from "react";
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
} from "lucide-react";

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
  email: "",
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

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  function updateSetting<K extends keyof typeof initialSettings>(
    key: K,
    value: (typeof initialSettings)[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    // Frontend demo: replace with an API request when the backend is ready.
    setSaved(true);
  }

  function handleReset() {
    setSettings(initialSettings);
    setSaved(false);
  }

  const activeLabel =
    sections.find((section) => section.id === activeSection)?.label ??
    "Settings";

  return (
    <main className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
          {/* Settings navigation */}
          <aside>
            <nav className="flex gap-1 overflow-x-auto pb-2 md:flex-col md:overflow-visible">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
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
              <div className="rounded-lg border bg-background">
                <div className="p-5">
                  <h3 className="font-medium">Personal information</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your basic account details.
                  </p>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={settings.name}
                        onChange={(e) =>
                          updateSetting("name", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={settings.email}
                        onChange={(e) =>
                          updateSetting("email", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-sm font-medium">Account status</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your account is currently managed locally.
                    </p>
                  </div>
                  <span className="rounded-md border px-2.5 py-1 text-xs text-muted-foreground">
                    Demo
                  </span>
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
                        onChange={(e) =>
                          updateSetting("monthlyBudget", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weekStartsOn">
                        Week starts on
                      </Label>
                      <select
                        id="weekStartsOn"
                        value={settings.weekStartsOn}
                        onChange={(e) =>
                          updateSetting("weekStartsOn", e.target.value)
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
                        onChange={(e) =>
                          updateSetting("dateFormat", e.target.value)
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
                  Theme selection is a UI preference only; connect it to your
                  app's theme provider to apply it globally.
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
                      onChange={(e) =>
                        updateSetting("currency", e.target.value)
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
                      onChange={(e) =>
                        updateSetting("language", e.target.value)
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

                {[
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
                ].map((item) => {
                  const key = item.key as
                    | "expenseAlerts"
                    | "budgetAlerts"
                    | "incomeAlerts"
                    | "weeklySummary"
                    | "emailNotifications";

                  return (
                    <div
                      key={item.key}
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
                    Password changes require a configured authentication
                    backend.
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
                  Security controls are visual preferences until connected
                  to your authentication system.
                </p>
              </div>
            )}

            {/* Data management */}
            {activeSection === "data" && (
              <div className="space-y-5">
                <div className="rounded-lg border bg-background p-5">
                  <h3 className="font-medium">Export your data</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Download a copy of your transactions and financial
                    records.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      window.alert(
                        "Connect your transaction data to enable export.",
                      )
                    }
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

            {/* Save actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {saved ? "Changes saved in the current session." : ""}
              </p>

              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>

              <Button onClick={handleSave}>
                <Save className="mr-2 size-4" />
                Save changes
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
