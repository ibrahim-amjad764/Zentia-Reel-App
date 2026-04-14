// Robust input validation schemas for XSS protection
import { z } from 'zod';
 
console.log("🛡️ Loading validation schemas for XSS protection");
 
// SECURITY: Validation schema for post content - prevents XSS and injection attacks
export const postSchema = z.object({
  content: z.string()
    .min(1, "Post content cannot be empty")
    .max(500, "Post content too long")
    .regex(/^[^<>]*$/, "HTML tags not allowed") // Prevent HTML injection
    .regex(/^(?!.*javascript:)/, "JavaScript URLs not allowed") // Prevent JS injection
    .transform(val => val.trim()), // Auto-trim whitespace
  images: z.array(z.string().url("Invalid image URL")).max(6, "Too many images").optional()
});
 
// SECURITY: Validation schema for user profile updates
export const profileSchema = z.object({
  firstName: z.string()
    .min(1, "First name required")
    .max(50, "First name too long")
    .regex(/^[a-zA-Z\s'-]*$/, "Invalid characters in name")
    .transform(val => val.trim()),
  lastName: z.string()
    .min(1, "Last name required")
    .max(50, "Last name too long")
    .regex(/^[a-zA-Z\s'-]*$/, "Invalid characters in name")
    .transform(val => val.trim()),
  bio: z.string()
    .max(500, "Bio too long")
    .regex(/^[^<>]*$/, "HTML tags not allowed in bio")
    .optional()
    .transform(val => val?.trim()),
  website: z.string()
    .url("Invalid website URL")
    .regex(/^https?:\/\//, "Website must start with http:// or https://")
    .optional(),
  instagram: z.string()
    .max(50, "Instagram handle too long")
    .regex(/^[a-zA-Z0-9._]*$/, "Invalid Instagram handle")
    .optional(),
  facebook: z.string()
    .max(50, "Facebook handle too long")
    .regex(/^[a-zA-Z0-9._]*$/, "Invalid Facebook handle")
    .optional(),
  twitter: z.string()
    .max(50, "Twitter handle too long")
    .regex(/^[a-zA-Z0-9._]*$/, "Invalid Twitter handle")
    .optional(),
  linkedin: z.string()
    .max(50, "LinkedIn handle too long")
    .regex(/^[a-zA-Z0-9._-]*$/, "Invalid LinkedIn handle")
    .optional()
});
 
// SECURITY: Validation schema for search queries
export const searchSchema = z.object({
  query: z.string()
    .min(1, "Search query cannot be empty")
    .max(100, "Search query too long")
    .regex(/^[^<>]*$/, "HTML tags not allowed in search")
    .regex(/^(?!.*javascript:)/, "JavaScript not allowed in search")
    .transform(val => val.trim())
});
 
console.log("✅ Validation schemas loaded successfully");

// SECURITY: Validation schema for comment content - prevents XSS and injection attacks
export const commentSchema = z.object({
  content: z.string()
    .min(1, "Comment cannot be empty")
    .max(300, "Comment too long - max 300 characters")
    .regex(/^[^<>]*$/, "HTML tags not allowed in comments") // Prevent HTML injection
    .regex(/^(?!.*javascript:)/, "JavaScript URLs not allowed") // Prevent JS injection
    .regex(/^(?!.*on\w+=)/, "Event handlers not allowed") // Prevent event handlers
    .transform(val => val.trim()), // Auto-trim whitespace
  postId: z.string().min(1, "Post ID is required"),
  userId: z.string().min(1, "User ID is required").optional() // Optional for WebSocket
});
 
console.log(" Comment validation schema loaded successfully");