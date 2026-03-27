"use client";

import React from "react";
import Link from "next/link";
import { FollowButton } from "../profile-page/FollowButton";

interface UserProfileSummaryProps {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export default function UserProfileSummary({ user }: UserProfileSummaryProps) {
  // console.log("[UserProfileSummary] Rendering user summary:", user);

  // Combine first and last name, fallback to "User"
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";

  return (
   <div className="flex items-center justify-between w-full">
  {/* Left: Avatar + Name, clickable */}
  <Link
    href={`/profile/${user.id}`}
    className="flex items-center space-x-2 cursor-pointer hover:underline"
    onClick={() => console.log(`[Profile Click] User clicked for userId: ${user.id}`)} >
    {user.avatarUrl ? (
      <img
        src={user.avatarUrl}
        alt={`${fullName} avatar`}
        className="w-8 h-8 rounded-full object-cover"/>
    ) : (
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
        {user.firstName?.[0] || "U"}
      </div>
    )}
    <span className="font-semibold text-sm">{fullName}</span>
  </Link>

  {/* Right: Follow Button aligned right edge */}
  <div className="flex-shrink-0">
    <FollowButton userId={user.id} />
  </div>
</div>
  );
}