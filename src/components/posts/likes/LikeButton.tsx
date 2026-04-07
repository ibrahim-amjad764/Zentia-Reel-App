"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

/**
 * Zentia Premium LikeButton
 * 
 * Purpose: Provides a highly interactive like action with optimistic 
 * updates and Zentia's signature soft coral aesthetic.
 * 
 * Design: Features smooth heart animations, vibrant color transitions, 
 * and robust error recovery.
 */

interface LikeButtonProps {
  postId: string;
  initialIsLiked: boolean;
  initialLikesCount: number;
  userId: string;
  className?: string;
}

interface LikeButtonMutationContext {
  previousIsLiked: boolean;
  previousLikesCount: number;
}

export const LikeButton = ({
  postId,
  initialIsLiked,
  initialLikesCount,
  userId,
}: LikeButtonProps) => {
  const queryClient = useQueryClient();

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  const likeMutation = useMutation({
    mutationFn: async () => {
      console.log(`[Zentia Action] Heart signal pulsing: Post ${postId}`);

      const res = await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postId, userId }),
      });

      if (!res.ok) throw new Error("Signal synchronization failure");
      const data = await res.json();
      console.log(`[Zentia Action] Signal success:`, data);
      return data;
    },

    onMutate: async () => {
      const previousState: LikeButtonMutationContext = {
        previousIsLiked: isLiked,
        previousLikesCount: likesCount,
      };
       
      const nextIsLiked = !isLiked;
      setIsLiked(nextIsLiked);
      setLikesCount((prev) => prev + (nextIsLiked ? 1 : -1));
      console.log(`[Zentia Optimistic] New pulse state: ${nextIsLiked}`);
      return previousState;
    },

    onSuccess: (data) => {
      setIsLiked(data.action === "liked");
      setLikesCount(data.likesCount);
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },

    onError: (error, _, context) => {
      console.error(`[Zentia Error] Heart pulse failed:`, error);
      if (context) {
        setIsLiked(context.previousIsLiked);
        setLikesCount(context.previousLikesCount);
      }
    },
  });

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => likeMutation.mutate()}
        disabled={likeMutation.isPending}
        className={`
          flex items-center gap-2 rounded-full px-4 h-10 transition-all duration-300
          ${isLiked 
            ? "text-[#FF4D4D] bg-[#FF4D4D]/10 hover:bg-[#FF4D4D]/20" 
            : "text-[#7B7B7B] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10"
          }
          active:scale-90 hover:-translate-y-0.5
        `}
      >
        <motion.div
           key={String(isLiked)}
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Heart 
            size={18} 
            className={`transition-colors ${isLiked ? "fill-current" : ""}`} 
          />
        </motion.div>
        <span className="text-sm font-black tabular-nums">{likesCount}</span>
      </Button>
    </div>
  );
};
