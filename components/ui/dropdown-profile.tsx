"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { UserIcon, SettingsIcon, LogOutIcon,} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchUserProfile } from "../../app/api/profile-user/user";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/services/auth.service";
import { toast } from "sonner";
import Link from "next/link";

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
    const tid = toast.loading("Logging out...");
    try {
      await logout();
      toast.success("Logout successful", { id: tid });
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
      <DropdownMenuContent className="w-80" align={align || "end"}>
        <DropdownMenuLabel className="flex items-center gap-4 px-4 py-2.5 font-normal">
          <div className="relative">
            <Avatar className="size-10">
              <AvatarImage src={user?.avatarUrl} alt={fullName} />
              <AvatarFallback>{fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2" />
          </div>
          <div className="flex flex-1 flex-col items-start">
            <span className="text-foreground text-lg font-semibold">{fullName}</span>
            <span className="text-muted-foreground text-base">{user?.email || "—"}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="px-4 py-2.5 text-base flex items-center cursor-pointer transition-all duration-200 ease-in-out hover:scale-95 active:scale-95">
              <UserIcon className="text-foreground size-5 mr-2" />
              My account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile/edit" className="px-4 py-2.5 text-base flex items-center cursor-pointer transition-all duration-200 ease-in-out hover:scale-95 active:scale-95">
              <SettingsIcon className="text-foreground size-5 mr-2" />
              Edit profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="flex items-center px-4 py-2.5 text-base text-red-500 cursor-pointer
             hover:text-red-900 transition-all duration-200 ease-in-out
             hover:scale-105 active:scale-95"
          onClick={handleLogout}
        >
          <LogOutIcon className="size-5 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;