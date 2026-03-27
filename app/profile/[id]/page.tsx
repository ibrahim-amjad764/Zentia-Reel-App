// // profile/[id]/page.tsx
// import { notFound } from "next/navigation";
// import { AppDataSource } from "../../../src/db/data-source";
// import { initDB } from "../../../src/db/init-db";

// import { User as UserEntity } from "../../../src/entities/user";
// import { Post as PostEntity } from "../../../src/entities/post";
// import { Comment as CommentEntity } from "../../../src/entities/comment";
// import { Like as LikeEntity } from "../../../src/entities/like";

// import UserProfileCard from "../../../src/components/membership/profile-page/UserProfileCard";
// import ProfileTabs from "../../../src/components/membership/profile-page/ProfileTabs";
// import BackButton from "../../../src/components/shared/BackButton";
// import ProfilePageClient from "../../../src/components/membership/profile-page/ProfilePageClient";

// interface ProfilePageProps {
//   params: { id: string };
// }

// export default async function UserProfilePage({ params }: ProfilePageProps) {
//   const { id } = params;

//   console.log("[ProfilePage] Loading profile for:", id);

//   try {
//     if (!AppDataSource?.isInitialized) {
//       await initDB();
//     } // ✅ FIXED (missing bracket)

//     const userRepo = AppDataSource!.getRepository(UserEntity);
//     const postRepo = AppDataSource!.getRepository(PostEntity);
//     const commentRepo = AppDataSource!.getRepository(CommentEntity);
//     const likeRepo = AppDataSource!.getRepository(LikeEntity);

//     const dbUser = await userRepo.findOne({
//       where: { id },
//       relations: ["followers", "following"],
//     });

//     if (!dbUser) {
//       console.log("[ProfilePage] User not found");
//       return notFound();
//     }

//     /* =========================
//        POSTS
//     ==========================*/

//     const posts = await postRepo.find({
//       where: { user: { id } },
//       relations: ["user", "comments", "comments.user", "likes"],
//       order: { createdAt: "DESC" },
//       take: 10,
//     });

//     /* =========================
//        COMMENTS BY USER
//     ==========================*/

//     const comments = await commentRepo.find({
//       where: { user: { id } },
//       relations: ["post"],
//       order: { createdAt: "DESC" },
//     });

//     /* =========================
//        LIKES BY USER
//     ==========================*/

//     const likes = await likeRepo.find({
//       where: { user: { id } },
//       relations: ["post"],
//     });

//     console.log("[ProfilePage] Posts:", posts.length);
//     console.log("[ProfilePage] Comments:", comments.length);
//     console.log("[ProfilePage] Likes:", likes.length);

//     /* =========================
//        MAP USER
//     ==========================*/

//     const user = {
//       id: dbUser.id,
//       firstName: dbUser.firstName,
//       lastName: dbUser.lastName,
//       email: dbUser.email,
//       avatarUrl: dbUser.avatarUrl,
//       bio: dbUser.bio,
//       createdAt: dbUser.createdAt?.toISOString(),
//       isActive: dbUser.isActive,
//     };

//     /* =========================
//        MAP POSTS
//     ==========================*/

//     const mappedPosts = posts.map((p) => ({
//       id: p.id,
//       content: p.content,
//       images: p.images,
//       createdAt: p.createdAt?.toISOString(),
//       likesCount: p.likes?.length || 0,

//       comments: (p.comments || []).map((c) => ({
//         id: c.id,
//         content: c.content,
//         createdAt: c.createdAt?.toISOString(),
//         user: {
//           id: c.user.id,
//           firstName: c.user.firstName || "",
//           lastName: c.user.lastName || "",
//         },
//       })),

//       user: {
//         id: p.user.id,
//         firstName: p.user.firstName || "",
//         avatarUrl: p.user.avatarUrl,
//       },
//     }));

//     /* =========================
//        MAP COMMENTS
//     ==========================*/

//     const mappedComments = comments.map((c) => ({
//       id: c.id,
//       content: c.content,
//       createdAt: c.createdAt?.toISOString(),
//       postId: c.post?.id,
//       userId: c.user.id,  // ✅ add userId
//     }));

//     /* =========================
//        MAP LIKES
//     ==========================*/

//     const mappedLikes = likes.map((l) => ({
//       id: l.id,
//       postId: l.post?.id,
//       userId: l.user.id, // ✅ add userId
//     }));

//     /* =========================
//        MAP FOLLOWERS
//     ==========================*/

//     const followers =
//       dbUser.followers?.map((f) => ({
//         id: f.id,
//         firstName: f.firstName,
//         avatarUrl: f.avatarUrl,
//       })) || [];

//     /* =========================
//        MAP FOLLOWING
//     ==========================*/

//     const following =
//       dbUser.following?.map((f) => ({
//         id: f.id,
//         firstName: f.firstName,
//         avatarUrl: f.avatarUrl,
//       })) || [];

//     console.log("[ProfilePage] Followers:", followers.length);
//     console.log("[ProfilePage] Following:", following.length);

//    return (
//   <div className="max-w-3xl mx-auto space-y-6 p-6">
//     <BackButton />

//     {/* USER PROFILE */}
//     <UserProfileCard user={user} />

//     {/* PROFILE TABS (USER DATA ONLY) */}
//    <ProfileTabs
//   posts={mappedPosts.filter(p => p.user.id === id)}
//   comments={mappedComments.filter(c => c.userId === id)}
//   likes={mappedLikes.filter(l => l.userId === id)}
//   followers={followers}
//   following={following}
// />
//   </div>
// )} catch (err) {
//     console.error("[ProfilePage] Error:", err);
//     return notFound();
//   }
// }

"use server";
import { notFound } from "next/navigation";
import { AppDataSource } from "../../../src/db/data-source";
import { initDB } from "../../../src/db/init-db";

import { User as UserEntity } from "../../../src/entities/user";
import { Post as PostEntity } from "../../../src/entities/post";
import { Comment as CommentEntity } from "../../../src/entities/comment";
import { Like as LikeEntity } from "../../../src/entities/like";

import BackButton from "../../../src/components/shared/BackButton";
import ProfileTabs from "../../../src/components/membership/profile-page/ProfileTabs";

interface ProfilePageProps {
  params: { id: string } | Promise<{ id: string }>;
}

// Deduplicate users by ID
const dedupeUsers = (users: UserEntity[] = []) => {
  const map = new Map<string, UserEntity>();
  users.forEach((u) => map.set(u.id, u));
  return Array.from(map.values()).map((f) => ({
    id: f.id,
    firstName: f.firstName || "User",
    avatarUrl: f.avatarUrl || "",
  }));
};

export default async function UserProfilePage(props: ProfilePageProps) {
  // Unwrap params because it might be a Promise
  const { id } = await props.params;

  // Initialize DB if not done
  if (!AppDataSource?.isInitialized) await initDB();

  const userRepo = AppDataSource!.getRepository(UserEntity);
  const postRepo = AppDataSource!.getRepository(PostEntity);
  const commentRepo = AppDataSource!.getRepository(CommentEntity);
  const likeRepo = AppDataSource!.getRepository(LikeEntity);

  // Fetch profile user with followers/following
  const dbUser = await userRepo.findOne({
    where: { id },
    relations: ["followers", "following"],
  });
  if (!dbUser) return notFound();

  const user = {
    id: dbUser.id,
    firstName: dbUser.firstName || "User",
    lastName: dbUser.lastName || "",
    email: dbUser.email || "unknown@example.com",
    avatarUrl: dbUser.avatarUrl || "",
    bio: dbUser.bio || "",
    createdAt: dbUser.createdAt?.toISOString() || new Date().toISOString(),
    isActive: dbUser.isActive || false,
  };

  // Fetch posts with comments and likes
  const posts = await postRepo.find({
    where: { user: { id } },
    relations: ["user", "comments", "comments.user", "likes", "likes.user"],
    order: { createdAt: "DESC" },
  });

  // Fetch user comments and likes separately (for profile tabs)
  const comments = await commentRepo.find({
    where: { user: { id } },
    relations: ["post", "user"],
    order: { createdAt: "DESC" },
  });

  const likes = await likeRepo.find({
    where: { user: { id } },
    relations: ["post", "user"],
  });

  // Map posts with deduplicated comments
  const mappedPosts = posts.map((p) => {
    const commentsMap: Record<string, any> = {};
    (p.comments || []).forEach((c) => {
      if (!commentsMap[c.id]) {
        commentsMap[c.id] = {
          id: c.id,
          content: c.content,
          createdAt: c.createdAt?.toISOString() || new Date().toISOString(),
          postId: p.id,
          user: {
            id: c.user?.id || "",
            firstName: c.user?.firstName || "User",
            lastName: c.user?.lastName || "",
            avatarUrl: c.user?.avatarUrl || "",
          },
        };
      }
    });

    const likesCount = (p.likes || []).length;

    return {
      id: p.id,
      content: p.content,
      images: p.images || [],
      createdAt: p.createdAt?.toISOString() || new Date().toISOString(),
      likesCount,
      comments: Object.values(commentsMap),
      user: {
        id: p.user?.id || "",
        firstName: p.user?.firstName || "User",
        avatarUrl: p.user?.avatarUrl || "",
      },
    };
  });

  const mappedComments = comments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt?.toISOString() || new Date().toISOString(),
    postId: c.post?.id || "",
    user: {
      id: c.user?.id || "",
      firstName: c.user?.firstName || "User",
      lastName: c.user?.lastName || "",
      avatarUrl: c.user?.avatarUrl || "",
    },
  }));

  const mappedLikes = likes.map((l) => ({
    id: l.id,
    postId: l.post?.id || "",
    user: {
      id: l.user?.id || "",
      firstName: l.user?.firstName || "User",
      lastName: l.user?.lastName || "",
      avatarUrl: l.user?.avatarUrl || "",
    },
  }));

  const followers = dedupeUsers(dbUser.followers);
  const following = dedupeUsers(dbUser.following);

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <BackButton />
      <ProfileTabs
        posts={mappedPosts}
        comments={mappedComments}
        likes={mappedLikes}
        followers={followers}
        following={following}/>
    </div>
  );
}