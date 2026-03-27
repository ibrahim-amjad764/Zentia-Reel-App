"use client";

import React from "react";
import Link from "next/link";

interface UserProfileCardProps {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    bio?: string;
    email?: string;
    createdAt?: string;
    isActive?: boolean;
  };
  editable?: boolean; // Show edit button if true
  onEdit?: () => void; // Edit button click handler
}

export default function UserProfileCard({
  user,
  editable = false,
  onEdit,
}: UserProfileCardProps) {
  //  Log to verify the dynamic user is rendering
  console.log("[UserProfileCard] Rendering user:", user.id, user.firstName);

  // Safely build full name
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto space-y-4">
      <div className="flex items-center space-x-4">
        {/* User avatar or placeholder */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`${fullName} avatar`}
            className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white">
            {user.firstName?.[0] || "U"}
          </div>
        )}

        <div className="flex-grow">
          <h1 className="text-2xl font-semibold">{fullName}</h1>

          {/* Active badge */}
          {user.isActive && (
            <span className="text-sm text-green-600 font-medium px-2 py-0.5 rounded bg-green-100 inline-block">
              Active
            </span>
          )}

          {/* Email */}
          <p className="text-sm text-gray-500 mt-1">
            {user.email ? (
              <a href={`mailto:${user.email}`} className="underline">
                {user.email}
              </a>
            ) : (
              "No email provided"
            )}
          </p>

          {/* Joined date */}
          <p className="text-sm text-gray-400 mt-0.5">
            Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
          </p>
        </div>

        {/* Edit button */}
        {editable && onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"  >
            Edit Profile
          </button>
        )}
      </div>

      {/* Bio / About */}
      <div className="text-gray-700">
        <h3 className="font-semibold mb-1">About</h3>
        <p className="italic text-gray-500">{user.bio || "No bio added yet."}</p>
      </div>
    </div>
  );
}