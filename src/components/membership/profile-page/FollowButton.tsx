//src/components/membership/profile-page/FollowButton.tsx
"use client";

import { FaUserPlus, FaCheck, FaSpinner } from "react-icons/fa";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialFollowing = false,
}) => {
  const [following, setFollowing] = useState<boolean | null>(initialFollowing ? true : null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false); // Skip initial loading animation

  // Fetch initial follow status only if not provided
  useEffect(() => {
    if (following !== null) return; // Skip fetch if state is already set

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/follow-status`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch follow status");

        setFollowing(data.following);
        console.log("[FollowButton] Initial follow status:", data.following);
      } catch (err) {
        console.error("[FollowButton] Error fetching follow status:", err);
        toast.error(err instanceof Error ? err.message : "Failed to fetch follow status");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchStatus();
  }, [userId]);

  const toggleFollow = async () => {
    if (following === null) return; // Don't allow toggle if status not loaded
    
    setLoading(true);
    try {
      const url = following
        ? `/api/users/${userId}/unfollow`
        : `/api/users/${userId}/follow`;

      const res = await fetch(url, { method: "POST", credentials: "include" });
      const data = await res.json();

      if (!res.ok) {
        console.warn("[FollowButton] API returned error", data);
        throw new Error(data.error || "Request failed");
      }

      setFollowing(data.following);
      toast.success(data.message || (data.following ? "Followed" : "Unfollowed"));
      console.log(`[FollowButton] ${data.following ? "Followed" : "Unfollowed"} ${userId}`);
    } catch (err) {
      console.error("[FollowButton] Toggle error:", err);
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={loading || initialLoading}
      aria-label={following ? "Unfollow user" : "Follow user"}
      className={`
        relative flex items-center gap-2 px-3 py-2 rounded-full font-medium ring-neon
        
        ${following === null
          ? "bg-white/6 text-muted-foreground border border-white/10"
          : following
            ? "bg-white/6 text-primary border border-white/12 hover:bg-white/10"
            : "bg-primary text-primary-foreground shadow-neon hover:brightness-110"}
        ${loading || initialLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
        transition-[transform,filter,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]
      `} >
      {loading || initialLoading ? (
        <FaSpinner className="animate-spin" />
      ) : following ? (
        <FaCheck />
      ) : (
        <FaUserPlus />
      )}
      <span className="tracking-wide">{loading || initialLoading ? "Loading..." : following ? "Following" : "Follow"}</span>
    </button>
  );
};