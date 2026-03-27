"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Calendar, Mail, MapPin } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import LogoutButton from "../logout-page-03/logout-form";
import Link from "next/link";

/** Props: user from API, onEdit callback for Edit Profile button */
interface ProfileHeaderProps {
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
    bio?: string;
    avatarUrl?: string;
    jobTitle?: string;
    company?: string;
    location?: string;
    createdAt?: string;
  };
  onEdit?: () => void;
  showEditButton?: boolean;
}

/** Header card: avatar, name, job, email, location, joined date. */
export default function ProfileHeader({
  user,
  onEdit,
  showEditButton = true,
}: ProfileHeaderProps) {
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email.split("@")[0] ||
    "User";

  const jobDisplay =
    user.jobTitle || user.company
      ? [user.jobTitle, user.company].filter(Boolean).join(" at ")
      : null;

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="pt-6 px-4 sm:px-6 md:px-8 lg:px-12">
        {/* button row: home left, logout right */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Button
            variant="outline"
            asChild
            className="text-gray-600 h-9 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
          >
            <Link href="/feed">Home</Link>
          </Button>
          <div className="w-full sm:w-24">
            <Button
              className="w-full bg-red-600 hover:bg-red-800 text-white rounded-md shadow-md transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
              asChild
            >
              <LogoutButton />
            </Button>
          </div>
        </div>

        {/* main content */}
        <div className="flex flex-col items-center text-center gap-6 md:flex-row md:items-center md:text-left">
          {/* avatar */}
          <div className="relative flex justify-center md:justify-start w-full md:w-auto">
            <Avatar className="h-24 w-24 shadow-md rounded-full transition-transform duration-300 ease-in-out hover:scale-105">
              <AvatarImage
                src={user.avatarUrl || "https://github.com/yyx990803.png"}
                alt={fullName}
              />
              <AvatarFallback className="text-2xl font-semibold">
                {fullName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* main info */}
          <div className="flex-1 space-y-2 w-full min-w-0 warp-break-words">
            {/* Name + Badge */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <h1 className="text-xl sm:text-2xl font-bold warp-break-words">{fullName}</h1>
              <Badge variant="secondary" className="whitespace-nowrap">
                Active
              </Badge>
            </div>

            {jobDisplay && (
              <p className="text-muted-foreground warp-break-words">{jobDisplay}</p>
            )}

            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm warp-break-words">
              <div className="flex items-center gap-1 break-all">
                <Mail className="w-4 h-4 shrink-0" />
                {user.email}
              </div>

              {user.location && (
                <div className="flex items-center gap-1 warp-break-words">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {user.location}
                </div>
              )}

              {joinedDate && (
                <div className="flex items-center gap-1 warp-break-words">
                  <Calendar className="w-4 h-4 shrink-0" />
                  Joined {joinedDate}
                </div>
              )}
            </div>

            {/* Bio Section */}
            <div className="mt-4 w-full">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                About
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 italic whitespace-pre-line warp-break-words">
                {user.bio?.trim() ? user.bio : "No bio added yet."}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          {showEditButton && onEdit && (
            <Button
              variant="default"
              onClick={onEdit}
              className="w-full md:w-auto transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95" >
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}