// src/entities/like.ts
import {Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import type { Post } from "./post";
import type { User } from "./user";

@Entity("likes")
@Index("idx_likes_user", ["post", "user"])
export class Like {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Relations use string references to avoid circular imports
  @ManyToOne("Post", "likes", { nullable: false, onDelete: "CASCADE" })
  @JoinColumn()
  post!: Post;

  @ManyToOne("User", "likes", { nullable: false, onDelete: "CASCADE" })
  @JoinColumn()
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}