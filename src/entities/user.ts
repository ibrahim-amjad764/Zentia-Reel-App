// // src/entities/user.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import type { Post } from "./post";
import type { Like } from "./like";
import type { Comment } from "./comment";
import type { Notification } from "./notification"; // type-only import

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  firstName?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  lastName?: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ type: "text", nullable: true })
  bio?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  jobTitle?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  company?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  location?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  website?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  github?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  linkedin?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  twitter?: string;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  lat?: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  lng?: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  city?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  country?: string;

  @Column({ type: "text", array: true, nullable: true })
  skills?: string[];

  @Column({ type: "text", array: true, nullable: true })
  hobbies?: string[];

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  firebaseUid?: string;

  @OneToMany("Post", "user")
  posts!: Post[];

  @OneToMany("Like", "user")
  likes!: Like[];

  @OneToMany("Comment", "user")
  comments!: Comment[];

  @ManyToMany(() => User, (user) => user.followers)
  @JoinTable({
    name: "users_following_users",
    joinColumn: { name: "followerId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "followingId", referencedColumnName: "id" },
  })
  following!: User[];

  @ManyToMany(() => User, (user) => user.following)
  followers!: User[];

  // Circular-safe Notification relation
  @OneToMany(() => require("./notification").Notification, (notification: Notification) => notification.recipient)
  notifications!: Notification[];
}