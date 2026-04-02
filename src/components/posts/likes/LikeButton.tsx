"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { motion } from "framer-motion";  // Import framer-motion
import { Heart } from "lucide-react";

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
      console.log(`\n[Like] Sending request post: ${postId}, user: ${userId}`);

      const res = await fetch("/api/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postId, userId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Server responded with status ${res.status}:`, errorText);
        throw new Error("Failed to update like");
      }

      const data = await res.json();
      console.log(`Server response for post ${postId}:`, data);
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
      console.log(`[Like] Post: ${postId}, User: ${userId}, Optimistic isLiked: ${nextIsLiked}`);
      return previousState;
    },

    onSuccess: (data) => {
      setIsLiked(data.action === "liked");
      setLikesCount(data.likesCount);
      console.log(`[Like] Post: ${postId}, User: ${userId}, Action: ${data.action}, Likes: ${data.likesCount}`);
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.setQueryData(["posts"], (oldData: any) => {
      console.log("[Cache Update] Updating posts cache");

  return oldData?.map((post: any) => {
    if (post.id === postId) {
      return {
        ...post,
        likesCount: data.likesCount,
      };
    }
    return post;
  });
});
    },

    onError: (error, _, context) => {
      console.error(`[LikeButton] Mutation failed for post ${postId}, user ${userId}:`, error);

      if (context) {
        setIsLiked(context.previousIsLiked);
        setLikesCount(context.previousLikesCount);
        console.error(`[Like] Post: ${postId}, User: ${userId}, Mutation failed`);
      }
    },
  });

  return (
    // <motion.div
    //   initial={{ opacity: 0, y: 20 }}
    //   animate={{ opacity: 1, y: 0 }}
    //   transition={{ duration: 0.3 }}
    // >
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => likeMutation.mutate()}
        disabled={likeMutation.isPending}
        className={`${
          isLiked ? "text-red-500" : "text-foreground/80 hover:text-red-500"
        } flex items-center rounded-full transition-[transform,background-color,color] duration-200 ease-out hover:bg-red-500/10 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]`}
      >
        <motion.span
          key={String(isLiked)}
          initial={{ scale: 0.96, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="inline-flex items-center"
        >
          <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
          {likesCount} {likesCount === 1 ? "Like" : "Likes"}
        </motion.span>
      </Button>
      </div>
    // </motion.div>
  );
};
