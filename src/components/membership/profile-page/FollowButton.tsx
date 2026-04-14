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
  const [initialLoading, setInitialLoading] = useState(false);

  useEffect(() => {
    if (following !== null) return;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/follow-status`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Connection error");

        setFollowing(data.following);
        console.log(`[Zentia FollowSignals] Status for ${userId}:`, data.following);
      } catch (err) {
        console.error("[Zentia FollowSignals] Connection failure:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchStatus();
  }, [userId]);

  const toggleFollow = async () => {
    if (following === null) return;
    
    setLoading(true);
    try {
      const url = following
        ? `/api/users/${userId}/unfollow`
        : `/api/users/${userId}/follow`;

      const res = await fetch(url, { method: "POST", credentials: "include" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Signal fail");

      setFollowing(data.following);
      toast.success(data.following ? "Joined their universe" : "Universe departed");
      console.log(`[Zentia FollowSignals] ${data.following ? "Followed" : "UnFollow"} ${userId}`);
    } catch (err) {
      console.error("[Zentia FollowSignals] Signal error:", err);
      toast.error("Failed to synchronize signals. Retry?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={loading || initialLoading}
      aria-label={following ? "Unfollow Zentia voyager" : "Follow Zentia voyager"}
      className={`
        relative flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-500
        
        ${following === null
          ? "bg-[#94A3B8]/10 text-[#94A3B8] border border-[#94A3B8]/20 animate-pulse"
          : following
            ? "bg-[#FF7F50]/10 text-[#FF7F50] border border-[#FFDAB9]/40 hover:bg-[#FF7F50]/20"
            : "bg-gradient-to-r from-[#FF7E5F] via-[#FF7F50] to-[#FEB47B] text-white shadow-[0_8px_20px_rgba(255,126,95,0.3)] hover:shadow-[0_12px_25px_rgba(255,126,95,0.5)] active:scale-95"}
        ${loading || initialLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
      `} >
      {loading || initialLoading ? (
        <FaSpinner size={12} className="animate-spin" />
      ) : following ? (
        <FaCheck size={12} />
      ) : (
        <FaUserPlus size={12} />
      )}
      <span>{loading || initialLoading ? "Loading..." : following ? "Following" : "Follow"}</span>
    </button>
  );
};