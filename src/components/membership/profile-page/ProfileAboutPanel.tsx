"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Calendar,
  Globe,
  BookOpen,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Mail,
  Award,
  Github,
} from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { toast } from "sonner";
import AchievementsSection from "./AchievementsSection";

interface ProfileAboutPanelProps {
  user: {
    id?: string;
    bio?: string;
    jobTitle?: string;
    company?: string;
    location?: any;
    createdAt?: string;
    email: string;
    lat?: number | null;
    lng?: number | null;
    achievements?: any[];
    social?: Record<string, string>;
    website?: string;
  };
}

const ProfileAboutPanel = ({ user }: ProfileAboutPanelProps) => {
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    : "Joined recently";

  console.log("[ProfileAboutPanel] User data received:", {
    email: user.email,
    social: user.social,
    hasInstagram: !!user.social?.instagram,
    hasFacebook: !!user.social?.facebook,
    hasTwitter: !!user.social?.twitter,
    hasLinkedin: !!user.social?.linkedin,
    hasWebsite: !!user.social?.website
  });

  const handleSocialClick = (platform: string) => {
    console.log("[ProfileAboutPanel] Social link clicked:", platform);
    console.log("[ProfileAboutPanel] Full user data:", user);

    // Get the link from both social and website fields
    let link = user.social?.[platform];
    console.log(`[ProfileAboutPanel] user.social.${platform}:`, link);

    // Special handling for website field (stored separately from social)
    if (!link && platform === 'website') {
      link = user.website;
      console.log("[ProfileAboutPanel] Using user.website field:", link);
    }

    console.log("[ProfileAboutPanel] Final link to open:", link);

    if (!link) {
      console.log("[ProfileAboutPanel] No link found for platform:", platform);

      // Show user-friendly toast notification
      const platformNames: Record<string, string> = {
        twitter: 'Twitter',
        linkedin: 'LinkedIn',
        instagram: 'Instagram',
        facebook: 'Facebook',
        github: 'GitHub',
        website: 'Personal Website'
      };

      toast.error(`${platformNames[platform] || platform} link not added yet. Add it in Edit Profile!`);
      return; // Do nothing if no link exists
    }

    // Validate and format URL
    let url = link;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
      console.log("[ProfileAboutPanel] Added https:// prefix:", url);
    }

    // Validate URL format
    try {
      const urlObj = new URL(url);
      console.log("[ProfileAboutPanel] Valid URL object created:", urlObj.href);

      // Open in new tab
      console.log("[ProfileAboutPanel] Attempting to open URL:", urlObj.href);
      const opened = window.open(urlObj.href, '_blank', 'noopener,noreferrer');
      console.log("[ProfileAboutPanel] window.open returned:", opened);
    } catch (err) {
      console.error("[ProfileAboutPanel] Invalid URL format:", link, err);
      toast.error("Invalid social media link format");
    }
  };

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
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-zinc-500">Location</p>
              <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">
                {typeof user.location === 'object' && user.location
                  ? ([user.location.city, user.location.country].filter(Boolean).join(", ") ||
                    (user.location.lat && user.location.lng ? `${Number(user.location.lat).toFixed(4)}, ${Number(user.location.lng).toFixed(4)}` : "Earth"))
                  : (user.location || "Earth")}
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
      <Card className="p-6 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-white/20 dark:border-zinc-800 rounded-3xl">

        {/* Dynamic Achievements Section */}
        {user.achievements && <AchievementsSection achievements={user.achievements} user={user} />}
      </Card>

      {/* Links Card */}
      <Card className="p-6 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-white/20 dark:border-zinc-800 rounded-3xl">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          Social Presence
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialClick('twitter')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-[#FF7E5F]/10 hover:text-[#FF7E5F] transition-all group"
          >
            <Twitter size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-medium">Twitter</span>
          </button>
          <button
            onClick={() => handleSocialClick('linkedin')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-600/10 hover:text-blue-600 transition-all group"
          >
            <Linkedin size={18} className="group-hover:-rotate-12 transition-transform" />
            <span className="text-xs font-medium">LinkedIn</span>
          </button>
          <button
            onClick={() => handleSocialClick('instagram')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-pink-600/10 hover:text-pink-600 transition-all group"
          >
            <Instagram size={18} className="group-hover:-rotate-12 transition-transform" />
            <span className="text-xs font-medium">Instagram</span>
          </button>
          <button
            onClick={() => handleSocialClick('facebook')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-600/10 hover:text-blue-600 transition-all group"
          >
            <Facebook size={18} className="group-hover:-rotate-12 transition-transform" />
            <span className="text-xs font-medium">Facebook</span>
          </button>

          <button
            onClick={() => handleSocialClick('website')}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all col-span-2 group"
          >
            <Globe size={18} className="group-hover:animate-pulse" />
            <span className="text-xs font-medium">Personal Website</span>
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProfileAboutPanel;
