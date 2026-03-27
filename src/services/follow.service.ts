import { AppDataSource } from "../db/data-source";
import { Follow } from "../entities/follow";
import { User } from "../entities/user";

const followRepo = AppDataSource!.getRepository(Follow);

export const followUser = async (followerId: string, followingId: string) => {
  try {
    console.log(`[followUser] Attempting to follow ${followingId} by ${followerId}`);
    
    if (followerId === followingId) throw new Error("Cannot follow yourself");

    const exists = await followRepo.findOneBy({ followerId, followingId });
    if (exists) return { message: "Already following" };

    const follow = followRepo.create({ followerId, followingId });
    await followRepo.save(follow);

    console.log(`[followUser] Follow successful: ${followerId} -> ${followingId}`);
    return { success: true, message: "Followed successfully" };
  } catch (error) {
    console.error("[followUser] Error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to follow user");
  }
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  try {
    console.log(`[unfollowUser] Attempting to unfollow ${followingId} by ${followerId}`);

    const deleted = await followRepo.delete({ followerId, followingId });
    if (!deleted.affected) return { message: "Not following" };

    console.log(`[unfollowUser] Unfollow successful: ${followerId} -> ${followingId}`);
    return { success: true, message: "Unfollowed successfully" };
  } catch (error) {
    console.error("[unfollowUser] Error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to unfollow user");
  }
};

// Optional: check follow status
export const isFollowing = async (followerId: string, followingId: string) => {
  const exists = await followRepo.findOneBy({ followerId, followingId });
  return !!exists;
};