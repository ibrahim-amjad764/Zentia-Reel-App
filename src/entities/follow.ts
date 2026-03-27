// src/entities/follow.ts
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { User } from "./user";

@Entity("users_following_users") // Explicit table name
@Index(["followerId"])
@Index(["followingId"])
export class Follow {
  @PrimaryColumn()
  followerId!: string; // Who follows

  @PrimaryColumn()
  followingId!: string; // Who is followed

  @ManyToOne(() => User, (user) => user.following, { onDelete: "CASCADE" })
  @JoinColumn({ name: "followerId" })
  follower!: User;

  @ManyToOne(() => User, (user) => user.followers, { onDelete: "CASCADE" })
  @JoinColumn({ name: "followingId" })
  following!: User;
}