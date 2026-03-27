"use client";
import Link from "next/link";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Calendar, Mail, MapPin } from "lucide-react";
import LogoutButton from "../logout-page-03/logout-form";
/** Header card: avatar, name, job, email, location, joined date. */
export default function ProfileHeader({ user, onEdit, showEditButton = true, }) {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.email.split("@")[0] ||
        "User";
    const jobDisplay = user.jobTitle || user.company
        ? [user.jobTitle, user.company].filter(Boolean).join(" at ")
        : null;
    const joinedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        })
        : null;
    return (<Card className="w-full overflow-hidden">
      <CardContent className="pt-6 px-4 sm:px-6">

        {/* button row: home left, logout right */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

          <Button variant="outline" asChild className="text-gray-500 h-9 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95">
            <Link href="/feed">Home</Link>
          </Button>
          <div className="w-full sm:w-24">
            <Button className="w-full bg-red-600 hover:bg-red-500 text-white rounded-md shadow-sm transition-all duration-200 ease-in-out hover:scale-105 active:scale-95" asChild>
              <LogoutButton />
            </Button>
          </div>
        </div>

        {/* main content */}
        <div className="flex flex-col items-center text-center gap-6 md:flex-row md:items-center md:text-left">

          {/* avatar */}
          <div className="relative flex justify-center md:justify-start w-full md:w-auto">
            <Avatar className="h-24 w-24 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md">
              <AvatarImage src={user.avatarUrl || "https://github.com/yyx990803.png"} alt={fullName}/>
              <AvatarFallback className="text-2xl">
                {fullName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* main info */}
          <div className="flex-1 space-y-2 w-full wrap-break-words min-w-0">

            {/* Name + Badge */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <h1 className="text-xl sm:text-2xl font-bold wrap-break-words">{fullName}
              </h1>
              <Badge variant="secondary">Active</Badge>
            </div>

            {jobDisplay && (<p className="text-muted-foreground wrap-break-words">
                {jobDisplay}
              </p>)}
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm wrap-break-words">

              <div className="flex items-center gap-1 break-all">
                <Mail className="size-4 shrink-0"/>
                {user.email}
              </div>

              {user.location && (<div className="flex items-center gap-1">
                  <MapPin className="size-4 shrink-0"/>
                  {user.location}
                </div>)}

              {joinedDate && (<div className="flex items-center gap-1">
                  <Calendar className="size-4 shrink-0"/>
                  Joined {joinedDate}
                </div>)}
            </div>

            {/* Bio Section */}
            <div className="mt-4 w-full">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300"> About </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic whitespace-pre-line wrap-break-words">  {user.bio?.trim() ? user.bio : "No bio added yet."}</p>
            </div>
          </div>

          {/* Edit Button */}
          {showEditButton && onEdit && (<Button variant="default" onClick={onEdit} className="w-full md:w-auto transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"> Edit Profile
            </Button>)}
        </div>
      </CardContent>
    </Card>);
}
