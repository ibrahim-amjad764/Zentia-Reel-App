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
        relative flex items-center gap-2 px-2 py-2 rounded-full font-medium
        
        ${following === null ? "bg-gray-200 text-gray-500" : following ? "bg-gray-100 text-green-600 border border-gray-300 hover:bg-gray-200" : "bg-cyan-900 text-white hover:bg-cyan-700"}
        ${loading || initialLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
        shadow-md hover:shadow-lg
      `} >
      {loading || initialLoading ? (
        <FaSpinner className="animate-spin" />
      ) : following ? (
        <FaCheck />
      ) : (
        <FaUserPlus />
      )}
      <span>{loading || initialLoading ? "Loading..." : following ? "Following" : "Follow"}</span>
    </button>
  );
};