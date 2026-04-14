"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Calendar, Mail, MapPin, Edit3, Settings, LogOut, ChevronLeft, Link as LinkIcon, Award, Users, Share2, Download, MessageCircle } from "lucide-react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import Link from "next/link";
import { createPortal } from "react-dom";

interface ProfileHeaderProps {
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
    bio?: string;
    avatarUrl?: string;
    jobTitle?: string;
    company?: string;
    location?: any;
    createdAt?: string;
    postsCount?: number;
    followersCount?: number;
    followingCount?: number;
    // tokensCount?: number;
  };
  onEdit?: () => void;
  showEditButton?: boolean;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  // tokensCount?: number;
}

const StatItem = ({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Basic counter animation
    const duration = 1000;
    const start = 0;
    const end = value;
    const startTime = performance.now();

    const updateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  }, [value]);

  return (
    <div className="flex flex-col items-center justify-center px-4 md:px-8 border-x border-zinc-200/50 dark:border-zinc-800/50 first:border-l-0 last:border-r-0 group cursor-default">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-300">
          {displayValue.toLocaleString()}
        </span>
        {icon && <span className="text-[#FF7E5F] opacity-70">{icon}</span>}
      </div>
      <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-[#FF7E5F] dark:text-[#FEB47B] opacity-70 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </div>
  );
};

export default function ProfileHeader({
  user,
  onEdit,
  showEditButton = true,
  postsCount = 0,
  followersCount = 0,
  // tokensCount = 0,
}: ProfileHeaderProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 100);
    });
  }, [scrollY]);

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email.split("@")[0] ||
    "Universal User";

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 3000);
  };

  const handleShare = (platform: string) => {
    const profileUrl = `${window.location.origin}/profile/${user.email}`;
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(profileUrl);
        showToast('Profile link copied to clipboard!');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=Check out ${fullName}'s profile on Zentia!&url=${encodeURIComponent(profileUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&summary=Check out ${fullName}'s profile`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=Check out ${fullName}'s profile on Zentia: ${encodeURIComponent(profileUrl)}`, '_blank');
        break;
      case 'download':
        showToast('Download feature coming soon!');
        break;
    }
    setShowShareMenu(false);
  };

  const bannerId = `banner-${user.email.length % 5}`;
  
  // Custom Banner logic (simulated since user doesn't have a banner field)
  const bannerGradients = [
    "from-[#FF7E5F] to-[#FEB47B]",
    "from-[#6A11CB] to-[#2575FC]",
    "from-[#11998e] to-[#38ef7d]",
    "from-[#FF512F] to-[#DD2476]",
    "from-[#000000] to-[#434343]"
  ];
  const activeGradient = bannerGradients[user.email.length % bannerGradients.length];

  return (
    <div className="relative w-full">
      {/* BACKGROUND BANNER */}
      <div className="h-48 md:h-72 w-full rounded-b-[4rem] overflow-hidden relative shadow-2xl transition-all duration-700 bg-gradient-to-br from-[#FF7E5F] to-[#FEB47B]">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
        <div className="absolute inset-0 opacity-40 dark:opacity-40 bg-[#FEB47B]" />
        
        {/* Banner Controls Overlay */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
          <Link href="/feed">
            <Button variant="ghost" size="icon" className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all hover:scale-110">
              <ChevronLeft size={24} />
            </Button>
          </Link>
          <div className="flex gap-2">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all hover:scale-110"
                onClick={() => setShowShareMenu(!showShareMenu)}
              >
                <Share2 size={20} />
              </Button>
              
              {/* Share Dropdown Menu - YouTube Style Modal */}
              {showShareMenu && createPortal(
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm" 
                    onClick={() => setShowShareMenu(false)}
                  />
                  
                  {/* Modal */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
                  >
                    <div className="w-full max-w-md surface-glass rounded-3xl border border-white/20 dark:border-orange-500/30 shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-white/10 dark:border-orange-500/20 flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-foreground dark:text-white">Share this profile</h3>
                          <button
                            onClick={() => setShowShareMenu(false)}
                            className="w-8 h-8 rounded-full hover:bg-white/10 dark:hover:bg-orange-500/20 flex items-center justify-center transition-colors"
                          >
                            <ChevronLeft size={20} className="text-foreground dark:text-white rotate-180" />
                          </button>
                        </div>
                        
                        {/* Profile Preview */}
                        <div className="px-6 py-4 border-b border-white/10 dark:border-orange-500/20">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                              {fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground dark:text-white">{fullName}</div>
                              <div className="text-sm text-muted-foreground dark:text-white/60">Share this profile with others</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Share Options */}
                        <div className="p-4 space-y-2">
                          {/* Copy Link */}
                          <button
                            onClick={() => handleShare('copy')}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-primary/10 dark:hover:bg-orange-500/20 transition-all duration-200 text-left group"
                          >
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 dark:bg-orange-500/10 group-hover:bg-primary/20 dark:group-hover:bg-orange-500/30 transition-colors">
                              <LinkIcon size={18} className="text-muted-foreground group-hover:text-primary dark:group-hover:text-orange-400 transition-colors" />
                            </div>
                            <div className="flex-1">
                              <div className="text-base font-medium text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-orange-400 transition-colors">Copy link</div>
                              <div className="text-sm text-muted-foreground dark:text-white/60">Copy profile URL to clipboard</div>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-orange-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronLeft size={14} className="text-primary dark:text-orange-400 rotate-180" />
                            </div>
                          </button>
                          
                          {/* Twitter */}
                          <button
                            onClick={() => handleShare('twitter')}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-primary/10 dark:hover:bg-orange-500/20 transition-all duration-200 text-left group"
                          >
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-500/10 group-hover:bg-sky-500/20 transition-colors">
                              <MessageCircle size={18} className="text-sky-500 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1">
                              <div className="text-base font-medium text-foreground dark:text-white group-hover:text-sky-500 transition-colors">Twitter</div>
                              <div className="text-sm text-muted-foreground dark:text-white/60">Share to your followers</div>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronLeft size={14} className="text-sky-500 rotate-180" />
                            </div>
                          </button>
                          
                          {/* Facebook */}
                          <button
                            onClick={() => handleShare('facebook')}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-primary/10 dark:hover:bg-orange-500/20 transition-all duration-200 text-left group"
                          >
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                              <div className="w-5 h-5 bg-blue-500 rounded-sm group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1">
                              <div className="text-base font-medium text-foreground dark:text-white group-hover:text-blue-500 transition-colors">Facebook</div>
                              <div className="text-sm text-muted-foreground dark:text-white/60">Share with friends</div>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronLeft size={14} className="text-blue-500 rotate-180" />
                            </div>
                          </button>
                          
                          {/* LinkedIn */}
                          <button
                            onClick={() => handleShare('linkedin')}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-primary/10 dark:hover:bg-orange-500/20 transition-all duration-200 text-left group"
                          >
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-700/10 group-hover:bg-blue-700/20 transition-colors">
                              <div className="w-5 h-5 bg-blue-700 rounded-sm group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1">
                              <div className="text-base font-medium text-foreground dark:text-white group-hover:text-blue-700 transition-colors">LinkedIn</div>
                              <div className="text-sm text-muted-foreground dark:text-white/60">Share professionally</div>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-blue-700/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronLeft size={14} className="text-blue-700 rotate-180" />
                            </div>
                          </button>
                          
                          {/* WhatsApp */}
                          <button
                            onClick={() => handleShare('whatsapp')}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-primary/10 dark:hover:bg-orange-500/20 transition-all duration-200 text-left group"
                          >
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                              <MessageCircle size={18} className="text-green-500 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1">
                              <div className="text-base font-medium text-foreground dark:text-white group-hover:text-green-500 transition-colors">WhatsApp</div>
                              <div className="text-sm text-muted-foreground dark:text-white/60">Share via chat</div>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronLeft size={14} className="text-green-500 rotate-180" />
                            </div>
                          </button>
                          
                          {/* Download Profile */}
                          <button
                            onClick={() => handleShare('download')}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-primary/10 dark:hover:bg-orange-500/20 transition-all duration-200 text-left group"
                          >
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 dark:bg-orange-500/10 group-hover:bg-primary/20 dark:group-hover:bg-orange-500/30 transition-colors">
                              <Download size={18} className="text-muted-foreground group-hover:text-primary dark:group-hover:text-orange-400 transition-colors" />
                            </div>
                            <div className="flex-1">
                              <div className="text-base font-medium text-foreground dark:text-white group-hover:text-primary dark:group-hover:text-orange-400 transition-colors">Download profile</div>
                              <div className="text-sm text-muted-foreground dark:text-white/60">Save profile data</div>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-orange-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronLeft size={14} className="text-primary dark:text-orange-400 rotate-180" />
                            </div>
                          </button>
                        </div>
                        
                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-white/10 dark:border-orange-500/20">
                          <button
                            onClick={() => setShowShareMenu(false)}
                            className="w-full py-3 rounded-2xl bg-muted/50 border-2 border-orange-200 dark:bg-orange-500/10 hover:bg-gradient-to-br from-orange-400 to-orange-600 dark:hover:bg-orange-500/20 transition-colors text-sm font-medium text-foreground dark:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                </>,
                document.body
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE INFO CONTAINER */}
      <div className="max-w-8xl mx-auto px-6 md:px-12 -mt-24 relative z-20">
        <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-8 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border border-white/20 dark:border-zinc-800 rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          <div className="flex flex-col md:flex-row items-center md:items-center gap-8 w-full md:w-auto">
            {/* AVATAR SECTION */}
            <div className="relative group">
              {/* <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-[#FF7E5F] to-[#FEB47B] blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" /> */}
                <Avatar className="h-24 w-24 md:h-32 md:w-32 shadow-neon rounded-full transition-all duration-500 group-hover:scale-[1.03] cursor-pointer border-4 border-white/50 dark:border-zinc-800/50">
                  <AvatarImage
                    src={user.avatarUrl || "https://github.com/yyx990803.png"}
                    alt={fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl font-semibold bg-zinc-100 dark:bg-zinc-800">
                    {fullName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Online Status */}
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full shadow-lg" />

            </div>

            {/* NAME & BIO SUBSECTION */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                    {user.firstName} <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#FF7E5F] to-[#FEB47B]">{user.lastName}</span>
                  </h1>

                </div>
                <p className="text-sm md:text-base font-medium text-gray-500 dark:text-zinc-400 max-w-md">
                  {[user.jobTitle, user.company].filter(Boolean).join(" at ") || "Zentia Member"}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#FF7E5F]" /> 
                  {typeof user.location === 'object' && user.location
                    ? ([user.location.city, user.location.country].filter(Boolean).join(", ") || 
                       (user.location.lat && user.location.lng ? `${Number(user.location.lat).toFixed(2)}, ${Number(user.location.lng).toFixed(2)}` : "Orbiting Space"))
                    : (user.location || "Orbiting Space")}
                </span>
                <span className="bg-zinc-100 dark:bg-zinc-800 w-1 h-1 rounded-full" />
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#FF7E5F]" /> Joined {new Date(user.createdAt || "").toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
              
              {showEditButton && onEdit && (
                <div className="flex gap-4 pt-2">
                  <Button
                    onClick={onEdit}
                    className="h-12 px-8 rounded-2xl bg-gradient-to-br from-[#FF7E5F] to-[#FEB47B] text-white font-bold shadow-gold-soft hover:shadow-gold-heavy transition-all duration-300 hover:scale-[1.05] flex items-center gap-2 group"
                  >
                    <Edit3 size={18} className="group-hover:rotate-12 transition-transform" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* STATS SECTION (Desktop Only) */}
          <div className="hidden lg:flex items-center py-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-inner">
            <StatItem label="Posts" value={postsCount} icon={null} />
            <StatItem label="Followers" value={followersCount || user.followersCount || 0} icon={<Users size={16} />} />
            <StatItem label="Following" value={user.followingCount || 0} icon={<Users size={16}  />} />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.visible && createPortal(
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[10001]"
        >
          <div className="surface-glass px-6 py-4 rounded-2xl border border-white/20 dark:border-orange-500/30 shadow-2xl flex items-center gap-3 min-w-[300px]">
            <div className="w-8 h-8 rounded-full bg-primary/20 dark:bg-orange-500/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary dark:bg-orange-500 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground dark:text-white">
                {toast.message}
              </div>
            </div>
          </div>
        </motion.div>,
        document.body
      )}
    </div>
  );
}