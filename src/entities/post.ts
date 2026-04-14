// src/entities/post.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from "typeorm";
import type { User } from "./user";
import type { Like } from "./like";
import type { Comment } from "./comment";
import { Notification } from "./notification";

@Entity("posts")
export class Post {

  notifications: Notification[] = []; 

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ type: "simple-array", default: [] })
  images!: string[];

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  lat?: number;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  lng?: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  city?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  country?: string;

  // Relations use string references to avoid circular imports
  @ManyToOne("User", "posts", { nullable: false, onDelete: "CASCADE" })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany("Like", "post")
  likes!: Like[];

  @OneToMany("Comment", "post")
  comments!: Comment[];
}