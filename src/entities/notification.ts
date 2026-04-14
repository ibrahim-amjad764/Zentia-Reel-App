// src/entities/notification.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Index, JoinColumn } from "typeorm";
import type { User } from "./user";
import type { Post } from "./post";

export enum NotificationType {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  FOLLOW = "FOLLOW",
}

@Entity({ name: 'notifications' })
@Index("recipientId_index", ["recipient"]) // Index on recipientId for faster queries
@Index("senderId_index", ["sender"]) // Index on senderId for faster queries
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string; // definite assignment assertion

  @ManyToOne("User", { nullable: false })
  recipient!: User; // Who receives the notification

  @ManyToOne("User", { nullable: true })
  sender?: User; // Who triggered it (like/comment/follow)

  @Column({ type: "enum", enum: NotificationType })
  type!: NotificationType;

  @Column({ type: "text" })
  message!: string;

  @Column({ type: "uuid", nullable: true })
  postId?: string;

  @ManyToOne("Post", "notifications", { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "postId" })
  post?: Post;

  @Column({ default: false })
  read!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}