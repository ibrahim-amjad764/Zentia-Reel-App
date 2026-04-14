"use server";
import { Comment as CommentEntity } from "../../../src/entities/comment";
import { User as UserEntity } from "../../../src/entities/user";
import { Post as PostEntity } from "../../../src/entities/post";
import { Like as LikeEntity } from "../../../src/entities/like";
import { AppDataSource } from "../../../src/db/data-source";
import { initDB } from "../../../src/db/init-db";
import { notFound } from "next/navigation";
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
    const commentsMap: Record<
      string,
      {
        id: string;
        content: string;
        createdAt: string;
        postId: string;
        user: { id: string; firstName: string; lastName: string; avatarUrl: string };
      }
    > = {};
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