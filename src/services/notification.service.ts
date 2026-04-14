import { Notification, NotificationType } from "../entities/notification";
import { pushNotificationToUser } from "@/lib/notificationWsServer";
import { AppDataSource } from "../db/data-source";
import { DataSource } from "typeorm";
import { User } from "../entities/user";

const ensureDb = async (): Promise<DataSource> => {
  if (!AppDataSource) {
    console.error("[NotificationService] AppDataSource is null");
    throw new Error("Database not initialized");
  }
  if (!AppDataSource.isInitialized) {
    console.log("[NotificationService] Initializing AppDataSource...");
    await AppDataSource.initialize();
    console.log("[NotificationService] AppDataSource initialized");
  }
  return AppDataSource;
};

export const NotificationService = {
  async createNotification({
    recipientId,
    senderId,
    type,
    message,
    postId,
  }: {
    recipientId: string;
    senderId?: string;
    type: NotificationType;
    message: string;
    postId?: string;
  }) {
    console.log("[NotificationService] Creating notification", {
      recipientId,
      senderId,
      type,
      message,
      postId,
    });

    const db = await ensureDb();
    const notificationRepo = db.getRepository(Notification);
    const duplicateWhere: any = {
      recipient: { id: recipientId },
      sender: senderId ? ({ id: senderId } as User) : undefined,
      type,
      read: false,
    };
    if (postId) duplicateWhere.postId = postId;

    const duplicate = await notificationRepo.findOne({
      where: duplicateWhere,
      relations: ["sender"],
      order: { createdAt: "DESC" },
    });

    if (duplicate) {
      const duplicateAgeMs = Date.now() - new Date(duplicate.createdAt).getTime();
      if (duplicateAgeMs < 10000) {
        console.log("[NotificationService] Duplicate notification skipped:", duplicate.id);
        return duplicate;
      }
    }

    const notification = notificationRepo.create({
      recipient: { id: recipientId } as User,
      sender: senderId ? ({ id: senderId } as User) : undefined,
      type,
      message,
      postId,
    });

    const saved = await notificationRepo.save(notification);
    console.log("[NotificationService] Notification saved:", saved.id);

    try {
      pushNotificationToUser(recipientId, {
        id: saved.id,
        message: saved.message,
        read: saved.read,
        createdAt: saved.createdAt.toISOString(),
        type: saved.type,
        postId: saved.postId,
        sender: senderId ? { id: senderId, firstName: "User", lastName: "" } : undefined,
      });
      console.log("[NotificationService] Realtime push sent:", saved.id);
    } catch (err) {
      console.error("[NotificationService] WebSocket push failed:", err);
    }

    return saved;
  },

  async getUserNotifications(userId: string, limit = 50) {
    console.log("[NotificationService] Fetching notifications for userId:", userId);
    const db = await ensureDb();
    const notificationRepo = db.getRepository(Notification);
    const notifications = await notificationRepo.find({
      where: { recipient: { id: userId } },
      relations: ["sender", "post"],
      order: { createdAt: "DESC" },
      take: limit,
    });
    console.log("[NotificationService] Notifications fetched:", notifications.length);
    return notifications;
  },

  async markAsRead(notificationId: string) {
    console.log("[NotificationService] Marking notification as read:", notificationId);
    const db = await ensureDb();
    const notificationRepo = db.getRepository(Notification);
    return notificationRepo.update(notificationId, { read: true });
  },

  async countUnread(userId: string) {
    console.log("[NotificationService] Counting unread notifications for userId:", userId);
    const db = await ensureDb();
    const notificationRepo = db.getRepository(Notification);
    return notificationRepo
      .createQueryBuilder("notification")
      .leftJoin("notification.recipient", "recipient")
      .where("recipient.id = :userId", { userId })
      .andWhere("notification.read = false")
      .getCount();
  },

  async getUnreadCount(userId: string): Promise<number> {
    return this.countUnread(userId);
  },
};