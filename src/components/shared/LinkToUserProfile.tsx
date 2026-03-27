"use client";

import React from "react";
import Link from "next/link";

interface LinkToUserProfileProps {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  className?: string;
}

export default function LinkToUserProfile({ user, className }: LinkToUserProfileProps) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";

  return (
    <Link
      href={`/profile/${user.id}`}
      className={`flex items-center space-x-2 cursor-pointer hover:underline ${className || ""}`} >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={`${fullName} avatar`}
          className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
          {user.firstName?.[0] || "U"}
        </div>
      )}

      <span className="font-semibold text-sm">{fullName}</span>
    </Link>
  );
}