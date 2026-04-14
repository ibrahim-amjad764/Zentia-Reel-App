"use client";

import { Search, Home, Compass, MessageSquare, Sparkles, Bell, Menu, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { PremiumModeToggle } from "../ui/premium-mode-toggle";
import { NotificationBell } from "../../src/components/notifications/NotificationBell";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import ProfileDropdown from "../ui/dropdown-profile";;
import SearchBar from "@/components/notifications/SearchBar";
import SearchSuggestions from "@/components/notifications/SearchSuggestions";

interface PremiumNavbarProps {
  query: string;
  setQuery: (q: string) => void;
  handleSearch: () => void;
  searchLoading?: boolean;
  users?: any[];
}

export default function PremiumNavbar({
  query,
  setQuery,
  handleSearch,
  searchLoading = false,
  users = []
}: PremiumNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    console.log("[PremiumNavbar] Initialized with Luxury Theme & Responsive Mode");
  }, []);

  const handleQueryChange = (q: string) => {
    console.log(`[PremiumNavbar] Search query updated: "${q}"`);
    setQuery(q);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full navbar-glass-luxury shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="mx-auto flex max-w-8xl h-20 md:h-24 items-center justify-between gap-4 md:gap-8 px-4 md:px-8 lg:px-12">

        {/* MOBILE MENU TOGGLE */}
        <div className="flex xl:hidden items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#FF7E5F] hover:bg-[#FF7E5F]/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* LOGO SECTION */}
        <Link
          href="/feed"
          className="flex items-center gap-3 md:gap-4 group shrink-0"
          onClick={() => console.log("[PremiumNavbar] Logo clicked")}
        >
          <div className="relative h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-xl border border-[#FF7E5F]/40 p-[1px] transition-all duration-500 group-hover:border-[#FEB47B] shadow-gold-soft rotate-3 group-hover:rotate-0">
            <div className="h-full w-full rounded-[10px] bg-black overflow-hidden relative">
              <Image
                src="/logos1.png"
                alt="Zentia"
                fill
                priority
                className="object-contain scale-220 transition-transform duration-700 group-hover:scale-220"
                onError={(e) => {
                  console.error('[PremiumNavbar] Logo failed to load:', e);
                }}
                onLoad={() => {
                  console.log('[PremiumNavbar] Logo loaded successfully');
                }}
              />
            </div>
          </div>
          <div className="hidden sm:flex flex-col gap-0 uppercase">
            <span className="text-lg md:text-2xl font-bold tracking-[0.2em] text-[#FF7E5F] leading-none">
              Zentia
            </span>
            <span className="text-[7px] md:text-[8px] tracking-[0.4em] text-[#FF7E5F]/60 font-medium whitespace-nowrap">
              Platinum Universe
            </span>
          </div>
        </Link>

        <div className="flex-1 flex justify-center items-center">
          <div className="relative w-full max-w-xl hidden lg:block">
            <SearchBar
              value={query}
              onChange={handleQueryChange}
              onSearch={handleSearch}
              onFocus={() => {
                console.log("[PremiumNavbar] Search focused - showing suggestions");
                setShowSuggestions(true);
              }}
              onBlur={() => {
                // Delay hiding to allow clicks on search results
                setTimeout(() => {
                  console.log("[PremiumNavbar] Search blurred");
                  setShowSuggestions(false);
                }, 200);
              }}
              placeholder="Explore the universe..."
            />
            <AnimatePresence>
              {showSuggestions && (
                <SearchSuggestions
                  users={users}
                  loading={searchLoading}
                  query={query}
                  onClose={() => {
                    console.log("[PremiumNavbar] Closing suggestions via callback");
                    setShowSuggestions(false);
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* UTILITIES SECTION */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="flex items-center gap-1 md:gap-2">
            <div >
              <NotificationBell />
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <PremiumModeToggle />
            </motion.div>
          </div>

          <div className="h-6 w-[1px] bg-[#FF7E5F]/20 mx-1 hidden xs:block" />

          <ProfileDropdown trigger={
            <Button variant="ghost" size="icon" className="group relative rounded-full h-8 w-8 md:h-10 md:w-10 border border-[#FF7E5F]/20 hover:border-[#FEB47B] transition-all duration-500">
              <Avatar className="h-full w-full">
                <AvatarFallback className="bg-[#111] text-[#FF7E5F] font-light text-[10px] md:text-xs">UA</AvatarFallback>
              </Avatar>
            </Button>
          } />
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-white dark:bg-[#050505] border-t border-[#bf953f]/20 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              <div className="lg:hidden w-full">
                {/* <AdvancedSearchBar
                  value={query}
                  onChange={handleQueryChange}
                  onSearch={handleSearch}
                  placeholder="Search Zentia..."
                /> */}
                <SearchBar
                value={query}
                  onChange={handleQueryChange}
                  onSearch={handleSearch}
                  onFocus={() => {
                    console.log("[PremiumNavbar] Mobile Search focused - showing suggestions");
                    setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  placeholder="Search Zentia..."
                />
                <AnimatePresence>
                  {showSuggestions && (
                    <SearchSuggestions
                      users={users}
                      loading={searchLoading}
                      query={query}
                      isFloating={false}
                      onClose={() => {
                        console.log("[PremiumNavbar] Mobile Closing suggestions via callback");
                        setShowSuggestions(false);
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
              <div className="flex flex-col gap-4">
                {/* <MobileNavLink href="/feed" icon={<Home />} label="Refined Feed" active /> */}
                {/* <MobileNavLink href="/explore" icon={<Compass />} label="Discover" />
                <MobileNavLink href="/messages" icon={<MessageSquare />} label="Private Lounge" />
                <MobileNavLink href="/premium" icon={<Sparkles className="text-[#d4af37]" />} label="Elite Status" /> */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function NavLink({ href, icon, label, active = false, gold = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean; gold?: boolean }) {
  return (
    <Link href={href} className={`luxury-nav-link flex items-center gap-2 ${active ? 'text-white' : ''} ${gold ? 'hover:text-[#d4af37]' : ''}`}>
      <span className={active ? 'text-[#d4af37]' : 'text-inherit opacity-70'}>{icon}</span>
      <span className="tracking-widest uppercase text-[10px] font-semibold">{label}</span>
      {active && (
        <motion.div layoutId="activeNav" className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      )}
    </Link>
  );
}

function MobileNavLink({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-4 py-2 border-b border-[#bf953f]/5 text-white/80 hover:text-white transition-colors">
      <span className={active ? 'text-[#d4af37]' : 'text-inherit opacity-50'}>{icon}</span>
      {/* <span className="tracking-widest uppercase text-xs font-semibold">{label}</span> */}
    </Link>
  );
}
