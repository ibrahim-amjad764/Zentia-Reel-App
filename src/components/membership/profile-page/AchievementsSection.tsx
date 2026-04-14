// src/components/membership/profile-page/AchievementsSection.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Calendar,
  Trophy,
  Star,
  Medal,
  Target,
  Clock,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { Card } from "../../../../components/ui/card";

interface AchievementData {
  title: string;
  description?: string;
  date?: string;
  createdAt?: string;
}

interface AchievementsSectionProps {
  achievements?: AchievementData[];
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements = [],
}) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short"
      });
    } catch (err) {
      return "";
    }
  };

  const getAchievementStyles = (index: number) => {
    const styles = [
      { bg: "bg-orange-100/50 dark:bg-orange-500/10", text: "text-orange-500", icon: Trophy, gradient: "from-orange-400 to-red-500" },
      { bg: "bg-blue-100/50 dark:bg-blue-500/10", text: "text-blue-500", icon: ShieldCheck, gradient: "from-blue-400 to-indigo-500" },
      { bg: "bg-purple-100/50 dark:bg-purple-500/10", text: "text-purple-500", icon: Sparkles, gradient: "from-purple-400 to-pink-500" },
      { bg: "bg-green-100/50 dark:bg-green-500/10", text: "text-green-500", icon: Target, gradient: "from-green-400 to-teal-500" },
      { bg: "bg-amber-100/50 dark:bg-amber-500/10", text: "text-amber-500", icon: Award, gradient: "from-amber-400 to-orange-500" },
    ];
    return styles[index % styles.length];
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-6"
    >
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Award className="text-[#FF7E5F] animate-pulse" size={24} />
          Achievements
        </h3>
        {achievements.length > 0 && (
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7E5F] bg-[#FF7E5F]/10 px-2 py-0.5 rounded-full border border-[#FF7E5F]/20">
            {achievements.length} Badges Earned
          </span>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {achievements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[3rem] text-center"
          >
            <Trophy size={48} className="text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No milestones yet</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => {
              const style = getAchievementStyles(index);
              const Icon = style.icon;
              return (
                <motion.div
                  key={`${achievement.title}-${index}`}
                  // variants={item}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative group"
                >
                  <Card className="p-2 h-full bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-white/40 dark:border-zinc-800/50 rounded-[2rem] hover:shadow-2xl hover:shadow-[#FF7E5F]/10 transition-all duration-500 overflow-hidden">
                    {/* Background Decorative Gradient */}
                    <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
                    
                    <div className="flex items-start gap-4">
                      {/* Icon Container */}
                      <div className={`relative flex-shrink-0 w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center group-hover:rotate-6 transition-transform duration-500`}>
                        <Icon size={22} className={style.text} />
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-20 transition-opacity`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col gap-1">
                          <h4 className="font-bold text-gray-900 dark:text-white text-[14px] leading-tight break-words">
                            {achievement.title}
                          </h4>
                          {achievement.date && (
                            <span className="text-[10px] font-black font-mono text-gray-400 uppercase">
                              {formatDate(achievement.date)}
                            </span>
                          )}
                        </div>
                        
                        {achievement.description && (
                          <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-snug">
                            {achievement.description}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 pt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Clock size={15} className="text-[#FF7E5F]" />
                          <span className="text-[9px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-tighter">
                            Added {formatDate(achievement.createdAt) || "Just Now"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AchievementsSection;
