// src/entities/user.ts
import { Exclude, Expose, instanceToPlain } from "class-transformer";
import { BeforeInsert, BeforeUpdate } from "typeorm";
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

  @Column({ name: "first_name", type: "varchar", length: 255, nullable: true })
  firstName?: string;

  @Column({ name: "last_name", type: "varchar", length: 255, nullable: true })
  lastName?: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ name: "avatar_url", type: "varchar", length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ type: "text", nullable: true })
  bio?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  phone?: string;

  // Add this column
  @Column({ type: "varchar", length: 20, nullable: true })
  platform?: string;

  // Hidden structured location fields
  @Column({ type: "varchar", length: 255, nullable: true })
  @Expose()
  city?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  @Expose()
  country?: string | null;

  @Column({ type: "numeric", precision: 10, scale: 7, nullable: true })
  @Expose()
  lat?: number | null;
  @Column({ type: "numeric", precision: 10, scale: 7, nullable: true })
  @Expose()
  lng?: number | null;

  // Add this hook for automatic detection
  @BeforeInsert()
  @BeforeUpdate()
  setPlatform() {
    if (this.social?.twitter?.match(/https?:\/\/(www\.)?twitter\.com\/[A-Za-z0-9_]+/)) {
      this.platform = "twitter";
    } else if (this.social?.instagram?.match(/https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+/)) {
      this.platform = "instagram";
    } else if (this.social?.facebook?.match(/https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_.]+/)) {
      this.platform = "facebook";
    } else if (this.social?.linkedin?.match(/https?:\/\/(www\.)?linkedin\.com\/.*/)) {
      this.platform = "linkedin";
    } else if (this.website?.match(/https?:\/\/.*/)) {
      this.platform = "website";
    } else {
      this.platform = "other";
    }
  }
  // Exposed virtual location
  @Expose()
  get location(): {
    city?: string | null;
    country?: string | null;
  } {
    const locationObj = {
      city: this.city ?? null,
      country: this.country ?? null,
    };

    return locationObj;
  }

  @Column({ type: "varchar", length: 500, nullable: true })
  website?: string;

  @Column({ type: "jsonb", nullable: true, default: {} })
  social!: Record<string, string>;

  @Column({ type: "jsonb", default: () => "'[]'::jsonb" })
  achievements?: any[];

  @Column({ type: "text", array: true, nullable: true })
  skills?: string[];

  @Column({ type: "text", array: true, nullable: true })
  hobbies?: string[];

  @Column({ type: "jsonb", nullable: true, default: {} })
  @Exclude()
  profile!: Record<string, any>;

  @Expose()
  get jobTitle(): string | null {
    return this.profile?.jobTitle || null;
  }

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @Column({ name: "firebase_uid", type: "varchar", length: 255, nullable: true })
  firebaseUid?: string;

  // Relations
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

  @OneToMany(
    () => require("./notification").Notification,
    (notification: Notification) => notification.recipient
  )
  notifications!: Notification[];

  /**
   * Ensure JSON serialization applies Exclude/Expose decorators
   * and default values for arrays and JSON objects
   */
  toJSON() {
    const plain = instanceToPlain(this) as any;

    // Ensure arrays and JSON objects always have default values
    plain.skills = this.skills ?? [];
    plain.hobbies = this.hobbies ?? [];
    plain.achievements = this.achievements ?? [];
    plain.social = this.social ?? {};
    plain.profile = this.profile ?? {};

    // Ensure raw location coordinates are included for UI persistence
    plain.lat = this.lat ? Number(this.lat) : null;
    plain.lng = this.lng ? Number(this.lng) : null;
    plain.city = this.city ?? null;
    plain.country = this.country ?? null;

    // Ensure profile data is accessible at top level
    plain.jobTitle = this.jobTitle;
    // plain.company = this.company;

    return plain;
  }
}