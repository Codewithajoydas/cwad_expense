
import React, { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  Receipt,
  Wallet,
  Target,
  Settings,
  CircleCheck,
  Circle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  deleteNotification,
  getNotifications,
  updateNotification,
  type Notification as ApiNotification,
} from "@/lib/api-client";

type NotificationType =
  | "expense"
  | "budget"
  | "goal"
  | "account"
  | "system";

type NotificationItem = {
  id: string | number;
  title: string;
  description: string;
  time: string;
  type: NotificationType;
  read: boolean;
};

const notificationIcons: Record<
  NotificationType,
  React.ElementType
> = {
  expense: Receipt,
  budget: Wallet,
  goal: Target,
  account: CreditCard,
  system: Settings,
};

const filters = ["All", "Unread", "Read"] as const;

type FilterType = (typeof filters)[number];

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [activeFilter, setActiveFilter] =
    useState<FilterType>("All");

  async function loadNotifications() {
    try {
      setError("");
      const records = await getNotifications();
      setNotifications(records.map((record: ApiNotification) => ({
        id: record._id,
        title: record.title,
        description: record.description,
        time: record.time,
        type: record.type,
        read: record.read,
      })));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredNotifications = notifications.filter(
    (notification) => {
      if (activeFilter === "Unread") {
        return !notification.read;
      }

      if (activeFilter === "Read") {
        return notification.read;
      }

      return true;
    }
  );

  async function markAsRead(id: string) {
    try {
      await updateNotification(id, { read: true });
      await loadNotifications();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update notification.");
    }
  }

  async function markAllAsRead() {
    try {
      await Promise.all(notifications.filter((item) => !item.read).map((item) => updateNotification(String(item.id), { read: true })));
      await loadNotifications();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to mark notifications as read.");
    }
  }

  async function removeAllNotifications() {
    try {
      await Promise.all(notifications.map((item) => deleteNotification(String(item.id))));
      await loadNotifications();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to clear notifications.");
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page Header */}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {isLoading && <p role="status" className="text-sm text-muted-foreground">Loading notifications...</p>}
      <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>

          <Button
            variant="outline"
            onClick={removeAllNotifications}
            disabled={notifications.length === 0}
          >
            Clear all
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
              <Bell className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Total notifications
              </p>
              <p className="text-2xl font-semibold">
                {notifications.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
              <Circle className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Unread
              </p>
              <p className="text-2xl font-semibold">
                {unreadCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
              <CircleCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Read
              </p>
              <p className="text-2xl font-semibold">
                {notifications.length - unreadCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification List */}
      <Card>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Recent notifications</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your latest updates.
            </p>
          </div>

          <div className="flex gap-1 rounded-md bg-muted p-1">
            {filters.map((filter) => (
              <Button
                key={filter}
                size="sm"
                variant={
                  activeFilter === filter ? "secondary" : "ghost"
                }
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <CardContent className="p-0">
          {filteredNotifications.length > 0 ? (
            <div>
              {filteredNotifications.map(
                (notification, index) => {
                  const Icon =
                    notificationIcons[notification.type];

                  return (
                    <React.Fragment key={notification.id}>
                      <div
                        className={`flex gap-4 p-5 transition-colors ${
                          notification.read
                            ? "bg-background"
                            : "bg-muted/30"
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium">
                                {notification.title}
                              </h3>

                              {!notification.read && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                              )}
                            </div>

                            <span className="shrink-0 text-xs text-muted-foreground">
                              {notification.time}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {notification.description}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                              {notification.type === "system"
                                ? "System"
                                : notification.type.charAt(0).toUpperCase() +
                                  notification.type.slice(1)}
                            </Badge>

                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() =>
                                  markAsRead(String(notification.id))
                                }
                              >
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {index <
                        filteredNotifications.length - 1 && (
                        <Separator />
                      )}
                    </React.Fragment>
                  );
                }
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-medium">
                {notifications.length === 0
                  ? "No notifications"
                  : `No ${activeFilter.toLowerCase()} notifications`}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {notifications.length === 0
                  ? "You're all caught up. New notifications will appear here."
                  : "Try another filter to see your notifications."}
              </p>

              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setActiveFilter("All")}
                >
                  View all notifications
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
