"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { MapPin, Briefcase, Globe, Mail } from "lucide-react";
import { Card } from "../../../../components/ui/card";

interface PreviewData {
  firstName?: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  website?: string;
  followersCount?: number;
  followingCount?: number;
}

/**
 * Real-time Live Preview component for the Edit Profile page.
 * Mirrors the main profile aesthetics in a compact, floating card.
 */
export default function EditProfilePreview({ data }: { data: PreviewData }) {
  const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Your Name";

  return (
    <div className="sticky top-32">
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#FF7E5F] mb-1">Live Preview</h3>
        <p className="text-xs text-gray-400">See how others view your universe</p>
      </div>

      <Card className="relative overflow-hidden border-none bg-white dark:bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem]">
        {/* Banner Mockup */}
        <div className="h-32 bg-gradient-to-br from-[#FF7E5F] to-[#FEB47B] relative">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        </div>

        <div className="px-8 pb-8">
          {/* Avatar Area */}
          <div className="relative -mt-12 mb-6 flex justify-between items-end">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF7E5F] to-[#FEB47B] blur-md opacity-40" />
              <Avatar className="h-24 w-24 rounded-full border-4 border-white dark:border-zinc-900 shadow-xl transition-transform duration-500 group-hover:scale-105">
                <AvatarImage src={data.avatarUrl || "https://github.com/yyx990803.png"} className="object-cover" />
                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-xl font-bold">
                  {fullName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-sm font-bold">{data.followersCount || 0}</div>
                <div className="text-[10px] uppercase tracking-tighter text-gray-400">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold">{data.followingCount || 0}</div>
                <div className="text-[10px] uppercase tracking-tighter text-gray-400">Following</div>
              </div>
            </div>
          </div>

          {/* Info Area */}
          <div className="space-y-4">
            <div>
              <motion.h2 
                key={fullName}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-black tracking-tight text-gray-900 dark:text-white"
              >
                {fullName}
              </motion.h2>
              
              <AnimatePresence mode="wait">
                {data.jobTitle && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-sm text-[#FF7E5F] font-semibold mt-1"
                  >
                    <Briefcase size={14} />
                    <span>{data.jobTitle} {data.company ? `@ ${data.company}` : ""}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.p 
                key={data.bio}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 italic"
              >
                {data.bio || "No biography provided yet. Add one to shine!"}
              </motion.p>
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
              {data.location && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={12} className="text-[#FEB47B]" />
                  <span>{data.location}</span>
                </div>
              )}
              {data.website && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Globe size={12} className="text-[#FEB47B]" />
                  <span className="truncate">{data.website.replace(/^https?:\/\//, "")}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Mail size={12} className="text-[#FEB47B]" />
                <span>{data.email}</span>
              </div>
            </div>

            {/* Mock Action Button */}
            <div className="pt-4">
              <div className="w-full h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-gray-400">
                Profile Actions
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Strength Indicator */}
      <Card className="mt-8 p-6 bg-zinc-950 dark:bg-[#0A0A0A] border-none rounded-[2rem] text-white shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
           <Briefcase className="w-12 h-12" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#FEB47B]">Profile Strength</h4>
            <span className="text-xl font-black">85%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "85%" }}
              className="h-full bg-gradient-to-r from-[#FF7E5F] to-[#FEB47B]"
            />
          </div>
          <p className="mt-3 text-[10px] text-gray-400 font-medium">
            You're almost there! Add social links to reach 100%.
          </p>
        </div>
      </Card>
    </div>
  );
}
