// src/entities/comment.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
  Index,
} from "typeorm";
import type { Post } from "./post";
import type { User } from "./user";

@Entity("comments")
@Index("idx_comments_user", ["post", "user"])
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  content!: string;

  // Relations use string references to avoid circular imports
  @ManyToOne("Post", "comments", { nullable: false, onDelete: "CASCADE" })
  @JoinColumn()
  post!: Post;

  @ManyToOne("User", "comments", { nullable: false, onDelete: "CASCADE" })
  @JoinColumn()
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}