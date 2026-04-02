// // src/lib/mappers.ts

// src/lib/mappers.ts
import { User as UserEntity } from "../entities/user";
import { Post as PostEntity } from "../entities/post";
 
export const mapUserForComponents = (user: UserEntity) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  jobTitle: user.jobTitle,
  company: user.company,
  location: user.location,
  createdAt: user.createdAt?.toISOString() || "",
});
 
export const mapPostForComponents = (post: PostEntity) => ({
  id: post.id,
  content: post.content,
  images: post.images || [],
  createdAt: post.createdAt?.toISOString() || "",
  likesCount: (post.likes || []).length,
  comments: (post.comments || []).map((c) => ({
    id: c.id,
    content: c.content,
    user: {
      id: c.user.id,
      firstName: c.user.firstName || "",
      lastName: c.user.lastName || "",
    },
    createdAt: c.createdAt?.toISOString() || "",
  })),
  user: {
    id: post.user.id,
    firstName: post.user.firstName || "",
    avatarUrl: post.user.avatarUrl || "",
  },
});
 
interface DBUser {
  followers?: { id: string; firstName: string; avatarUrl?: string }[];
  following?: { id: string; firstName: string; avatarUrl?: string }[];
}

const dbUser: DBUser = {
  followers: [],
  following: [],
};