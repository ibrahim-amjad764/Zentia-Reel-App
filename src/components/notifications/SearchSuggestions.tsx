"use client";

import { User, Search, Clock, ChevronRight, X, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface UserType {
  id: string | number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string; // Potential addition for future-proofing
}

interface SearchSuggestionsProps {
  users: UserType[];
  loading: boolean;
  query: string;
  onClose?: () => void;
  isFloating?: boolean;
}

const escapeRegExp = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightText = (text?: string, query?: string) => {
  if (!text) return "";
  if (!query) return text;

  const safeQuery = escapeRegExp(query);
  const parts = text.split(new RegExp(`(${safeQuery})`, "gi"));

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="text-[#FF7E5F] font-black underline decoration-2 underline-offset-4">
        {part}
      </span>
    ) : (
      part
    )
  );
};

const SearchSuggestions = ({ users, loading, query, onClose, isFloating = true }: SearchSuggestionsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [recent, setRecent] = useState<UserType[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) setRecent(JSON.parse(stored));
    console.log("[SearchSuggestions] Local searches retrieved");
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isFloating) return; // Don't handle click outside if inline
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        console.log("[Search] Interaction detected outside - closing");
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, isFloating]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        console.log("[Search] ESC sequence triggered");
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const displayList = query ? users : recent;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: isFloating ? 10 : 0, scale: isFloating ? 0.98 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: isFloating ? 10 : 0, scale: isFloating ? 0.98 : 1 }}
      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
      className={`
        ${isFloating ? 'absolute top-full left-0 right-0 mt-4' : 'relative mt-4'}
        w-full
        max-w-xl
        mx-auto
        z-[100]
        rounded-[2rem]
        bg-white/80 dark:bg-[#0A0A0A]/90
        backdrop-blur-3xl
        shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]
        dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]
        border border-white/20 dark:border-white/5
        overflow-hidden
        flex flex-col
      `}
    >
      {/* Precision Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/50 dark:border-white/5">
        <div className="flex items-center gap-3">
          {query ? (
            <div className="p-2 rounded-xl bg-orange-100/50 dark:bg-orange-500/10 text-[#FF7E5F]">
              <Search size={16} strokeWidth={2.5} />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-orange-100/50 dark:bg-blue-500/10 text-orange-400">
              <Clock size={16} strokeWidth={2.5} />
            </div>
          )}
          <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            {query ? "Global Signals" : "Signal History"}
          </span>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-all active:scale-95"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto max-h-[450px] p-2 space-y-1 custom-scrollbar">
        {/* State Transitions */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center gap-4"
            >
              <div className="relative h-1 w-24 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                   animate={{ x: [-100, 100] }}
                   transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-[#FF7E5F] to-transparent"
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF7E5F]/60">Syncing Universe</span>
            </motion.div>
          ) : !displayList || displayList.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-16 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/2 mx-auto flex items-center justify-center mb-6">
                <Sparkles size={24} className="text-gray-300 dark:text-white/10" />
              </div>
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500 px-10">
                {query ? `No explorers found matching "${query}"` : "Your signal history is empty."}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="px-2"
            >
              {displayList.map((user: UserType, idx) => {
                const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Link
                      href={`/profile/${user.id}`}
                      onClick={() => {
                        console.log(`[SearchSuggestions] Navigating to explorer: ${user.id}`);
                        // Logic to save to local storage could go here
                        onClose?.();
                      }}
                      className="
                        group flex items-center gap-4
                        px-4 py-4
                        hover:bg-white dark:hover:bg-white/5
                        rounded-2xl
                        transition-all duration-300
                        hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]
                        dark:hover:shadow-none
                        hover:-translate-y-0.5
                      "
                    >
                      {/* Avatar System */}
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-[#FF7E5F] to-[#FEB47B] rounded-full opacity-0 group-hover:opacity-40 blur transition-all duration-500" />
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/20 relative z-10 overflow-hidden shadow-inner">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-black text-indigo-500">{user.username?.[0]?.toUpperCase() || "Z"}</span>
                          )}
                        </div>
                      </div>

                      {/* Content Engine */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                           <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100 truncate tracking-tight">
                            {highlightText(fullName || user.username, query)}
                          </p>
                          {idx === 0 && query && (
                            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#FF7E5F]/10 text-[#FF7E5F] border border-[#FF7E5F]/20">Best Match</span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 truncate mt-0.5">
                          {highlightText(user.email, query)}
                        </p>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 group-hover:translate-x-0">
                        <ChevronRight size={18} className="text-[#FF7E5F]" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Footer Accent */}
      {query && displayList.length > 0 && (
        <div className="px-6 py-4 bg-gray-50/30 dark:bg-white/2 flex items-center justify-center">
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-[#FF7E5F] transition-colors">
              Explore All Results
            </button>
        </div>
      )}
    </motion.div>
  );
};

export default SearchSuggestions;
