
import React, { useCallback, useEffect, useState } from "react";

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
  Trash2,
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
  id: string;
  title: string;
  description: string;
  time: string;
  type: NotificationType;
  read: boolean;
};

const DefaultNotificationIcon = Bell;

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

function getNotificationIcon(type: string) {
  return (
    notificationIcons[
      type as NotificationType
    ] ?? DefaultNotificationIcon
  );
}

const filters = ["All", "Unread", "Read"] as const;

type FilterType = (typeof filters)[number];

function NotificationSkeleton() {
  return (
    <div
      className="space-y-0"
      role="status"
      aria-label="Loading notifications"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <React.Fragment key={index}>
          <div className="flex gap-4 p-5">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-muted" />

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="h-4 w-36 max-w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              </div>

              <div className="h-3 w-full max-w-md animate-pulse rounded bg-muted" />

              <div className="flex gap-2 pt-1">
                <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>

          {index < 3 && <Separator />}
        </React.Fragment>
      ))}

      <span className="sr-only">Loading notifications...</span>
    </div>
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] =
    useState<FilterType>("All");

  // Fetch notifications from the backend.
  const loadNotifications = useCallback(async () => {
    try {
      setError("");

      const records = await getNotifications();

      setNotifications(
        records.map((record: ApiNotification) => ({
          id: String(record._id),
          title: record.title,
          description: record.description,
          time: record.time,
          type: record.type,
          read: record.read,
        }))
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to load notifications."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

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

  // Mark one notification as read.
  async function markAsRead(id: string) {
    try {
      setError("");

      await updateNotification(id, { read: true });

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to update notification."
      );
    }
  }

  // Mark all unread notifications as read.
  async function markAllAsRead() {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.read
    );

    if (unreadNotifications.length === 0) return;

    try {
      setError("");

      const results = await Promise.allSettled(
        unreadNotifications.map((notification) =>
          updateNotification(notification.id, { read: true })
        )
      );

      const failedCount = results.filter(
        (result) => result.status === "rejected"
      ).length;

      await loadNotifications();

      if (failedCount > 0) {
        setError(
          `${failedCount} notification(s) could not be marked as read.`
        );
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to mark notifications as read."
      );
    }
  }

  // Delete one notification.
  async function removeNotification(id: string) {
    try {
      setError("");

      await deleteNotification(id);

      setNotifications((current) =>
        current.filter(
          (notification) => notification.id !== id
        )
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to delete notification."
      );
    }
  }

  // Delete all notifications, handling partial failures.
  async function removeAllNotifications() {
    if (notifications.length === 0) return;

    try {
      setError("");

      const results = await Promise.allSettled(
        notifications.map((notification) =>
          deleteNotification(notification.id)
        )
      );

      const failedCount = results.filter(
        (result) => result.status === "rejected"
      ).length;

      await loadNotifications();

      if (failedCount > 0) {
        setError(
          `${failedCount} notification(s) could not be deleted.`
        );
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to clear notifications."
      );
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page header and errors */}
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 font-medium hover:opacity-70"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={isLoading || unreadCount === 0}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>

          <Button
            variant="outline"
            onClick={removeAllNotifications}
            disabled={isLoading || notifications.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        </div>
      </div>

      {/* Summary cards */}
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
                {isLoading ? "—" : notifications.length}
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
                {isLoading ? "—" : unreadCount}
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
                {isLoading
                  ? "—"
                  : notifications.length - unreadCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification list */}
      <Card>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">
              Recent notifications
            </h2>

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
                  activeFilter === filter
                    ? "secondary"
                    : "ghost"
                }
                onClick={() => setActiveFilter(filter)}
                aria-pressed={activeFilter === filter}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <CardContent className="p-0">
          {isLoading ? (
            <NotificationSkeleton />
          ) : filteredNotifications.length > 0 ? (
            <div>
              {filteredNotifications.map(
                (notification, index) => {
                  const Icon = getNotificationIcon(notification.type);

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
                                <span
                                  className="h-2 w-2 shrink-0 rounded-full bg-primary"
                                  aria-label="Unread"
                                />
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
                                : notification.type
                                    .charAt(0)
                                    .toUpperCase() +
                                  notification.type.slice(1)}
                            </Badge>

                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() =>
                                  void markAsRead(
                                    notification.id
                                  )
                                }
                              >
                                <Check className="mr-1 h-3.5 w-3.5" />
                                Mark as read
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-destructive hover:text-destructive"
                              onClick={() =>
                                void removeNotification(
                                  notification.id
                                )
                              }
                              aria-label={`Delete ${notification.title}`}
                            >
                              <Trash2 className="mr-1 h-3.5 w-3.5" />
                              Delete
                            </Button>
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

              {error && notifications.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setIsLoading(true);
                    void loadNotifications();
                  }}
                >
                  Try again
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
