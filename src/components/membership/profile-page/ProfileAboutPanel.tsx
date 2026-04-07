"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Mail, 
  Linkedin, 
  Twitter, 
  Globe,
  Award,
  BookOpen
} from "lucide-react";
import { Card } from "../../../../components/ui/card";

interface ProfileAboutPanelProps {
  user: {
    bio?: string;
    jobTitle?: string;
    company?: string;
    location?: string;
    createdAt?: string;
    email: string;
  };
}

const ProfileAboutPanel = ({ user }: ProfileAboutPanelProps) => {
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Joined recently";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="space-y-6"
    >
      {/* About Card */}
      <Card className="p-6 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-white/20 dark:border-zinc-800 rounded-3xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-40 transition-opacity">
          <BookOpen className="w-12 h-12 text-[#FF7E5F]" />
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          About
        </h3>
        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed italic">
          {user.bio || "No bio information provided yet."}
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3 group/item">
            <div className="p-2 rounded-xl bg-[#FF7E5F]/10 text-[#FF7E5F] group-hover:scale-110 transition-transform">
              <Briefcase size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-500">Occupation</p>
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                {[user.jobTitle, user.company].filter(Boolean).join(" at ") || "Not specified"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 group/item">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <MapPin size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-500">Location</p>
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                {user.location || "Earth"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 group/item">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
              <Calendar size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-500">Member Since</p>
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                {joinedDate}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Skills/Badges Section */}
      <Card className="p-6 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-white/20 dark:border-zinc-800 rounded-3xl">
       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                 Achievements
                   {user.jobTitle && (
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#FF7E5F]/20 to-[#FEB47B]/20 border border-[#FF7E5F]/40 rounded-full">
                       <Award size={14} className="text-[#FF7E5F]" />
                       <span className="text-[10px] uppercase tracking-wider font-bold text-[#FF7E5F]">{user.jobTitle}</span>
                     </div>
                   )}
               </h3>
               <div className="flex flex-wrap gap-2">
                 {user.jobTitle && (
                   <span 
                     className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-gradient-to-r from-[#FF7E5F]/10 to-[#FEB47B]/10 text-[#FF7E5F] border border-[#FF7E5F]/30 cursor-default"
                   >
                     {user.jobTitle}
                   </span>
                 )}
                 {["Pioneer", "Creator", "Early Adopter", "Influencer"].map((badge) => (
                   <span 
                     key={badge}
                     className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-zinc-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-[#FF7E5F] transition-colors cursor-default"
                   >
                     {badge}
                   </span>
                 ))}
               </div>
      </Card>

      {/* Links Card */}
      <Card className="p-6 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-white/20 dark:border-zinc-800 rounded-3xl">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          Social Presence
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-[#FF7E5F]/10 hover:text-[#FF7E5F] transition-all group">
            <Twitter size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-medium">Twitter</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-600/10 hover:text-blue-600 transition-all group">
            <Linkedin size={18} className="group-hover:-rotate-12 transition-transform" />
            <span className="text-xs font-medium">LinkedIn</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all col-span-2 group">
            <Globe size={18} className="group-hover:animate-pulse" />
            <span className="text-xs font-medium">Personal Website</span>
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProfileAboutPanel;
