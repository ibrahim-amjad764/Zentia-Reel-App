"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { UserIcon, SettingsIcon, LogOutIcon, Sparkles, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchUserProfile } from "../../app/api/profile-user/user";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/services/auth.service";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

type Props = {
  trigger: ReactNode;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
};

const ProfileDropdown = ({ trigger, defaultOpen, align = "end" }: Props) => {
  const router = useRouter();
  const [user, setUser] = useState<{ firstName?: string; lastName?: string; email: string; avatarUrl?: string } | null>(null);

  useEffect(() => {
    fetchUserProfile()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const fullName = user?.firstName || user?.lastName
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : user?.email?.split("@")[0] || "User";

  const handleLogout = async () => {
    const tid = toast.loading("Securely logging out...");
    try {
      await logout();
      toast.success("Signed out safely", { id: tid });
      router.push("/auth/login");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Logout failed";
      console.error("[ProfileDropdown] Logout failed:", e);
      toast.error(message, { id: tid });
    }
  };

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 p-0 overflow-hidden border border-[#FF7E5F]/15 bg-white/95 dark:bg-[#050505]/95 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]" 
        align={align}
        style={{
          '--popover-foreground': '#1a1a1a' as any,
          '--accent': '#FFA366' as any,
          '--accent-foreground': '#ffffff' as any,
        } as React.CSSProperties}
      >
        {/* PREMIUM HEADER */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-[#FF7E5F]/8 to-transparent">
          <DropdownMenuLabel className="flex items-center gap-4 p-0 font-normal">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#FF7E5F] to-[#FEB47B] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <Avatar className="size-12 border border-[#FF7E5F]/30">
                <AvatarImage src={user?.avatarUrl} alt={fullName} />
                <AvatarFallback className="bg-black text-[#FF7E5F] font-bold">
                  {fullName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="absolute right-0 bottom-0 block size-3 rounded-full bg-green-500 border-2 border-white dark:border-[#050505]" />
            </div>
            <div className="flex flex-1 flex-col items-start overflow-hidden">
              <span className="text-gray-900 dark:text-white text-lg font-bold tracking-tight truncate w-full">{fullName}</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium truncate w-full opacity-70">{user?.email || "—"}</span>
              <div className="mt-1 flex items-center gap-1">
                <Sparkles size={10} className="text-[#FF7E5F]" />
                <span className="text-[10px] uppercase tracking-widest text-[#FF7E5F] font-bold">Platinum Member</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </div>

        <DropdownMenuSeparator className="bg-[#FF7E5F]/10 mx-4" />

        <DropdownMenuGroup className="p-2">
          <DropdownMenuItem asChild>
            <Link href="/profile" className="group flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#FF7E5F]/5 outline-none">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 group-hover:text-[#FF7E5F] transition-colors">
                  <UserIcon size={18} />
                </div>
                <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Profile</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#FF7E5F]" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile/edit" className="group flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#FF7E5F]/5 outline-none">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-300 group-hover:text-[#FF7E5F] transition-colors">
                  <SettingsIcon size={18} />
                </div>
                <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">Personal Settings</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#FF7E5F]" />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-[#FF7E5F]/10 mx-4" />

        <div className="p-2 pb-3">
          <DropdownMenuItem
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#FF7E5F]/80 cursor-pointer 
               hover:bg-[#FF7E5F]/5 hover:text-[#FF7E5F] transition-all duration-300 outline-none group"
            onClick={handleLogout}
          >
            <div className="p-2 rounded-full bg-[#FF7E5F]/5 transition-colors">
              <LogOutIcon size={18} className="group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-sm font-bold tracking-tight">Exit Universe</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;