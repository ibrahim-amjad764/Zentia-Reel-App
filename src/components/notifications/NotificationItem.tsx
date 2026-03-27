//src/components/notifications/NotificationItem.tsx
"use client";

export function NotificationItem({ notification, markAsRead }: { notification: any, markAsRead: () => void }) {
  const createdAt = notification?.createdAt && !Number.isNaN(new Date(notification.createdAt).getTime())
    ? new Date(notification.createdAt).toLocaleString()
    : "Just now";

  return (
    <div
      onClick={markAsRead} className={`cursor-pointer p-3 border-b last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200
        ${ !notification.read ? "font-semibold" : "text-gray-500"}`}>
      {notification.message}

      <p className="text-xs text-gray-400"> {createdAt} </p>
    </div>
  );
}