"use client";

import { fetchUserProfile, updateUserProfile } from "../../api/profile-user/user";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { NotificationBell } from "../../../src/components/notifications/NotificationBell";
import { CreatePostModal } from "../../../src/components/posts/CreatePostModal";
import { SidebarProvider } from "../../../components/ui/sidebar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { searchUsers } from "../../../src/services/user.service";
import { useDebounce } from "../../../src/lib/useDebounce";
import { authFetch } from "../../../src/services/auth.service";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../../components/ui/button";
import { Avatar } from "../../../components/ui/avatar";
import { toast } from "sonner";
import { Moon } from "lucide-react";
import SearchSuggestions from "../../../src/components/notifications/SearchSuggestions";
import ProfileDropdown from "../../../components/ui/dropdown-profile";
import ProfileContent from "../../../src/components/membership/profile-page/ProfileContent";
import SearchBar from "../../../src/components/notifications/SearchBar";
import Link from "next/link";
import Loader from "../../../components/ui/Loader";
import Image from "next/image";
import { ModeToggleButton } from "../../../components/ui/mode-toggle";
import { PremiumModeToggle } from "../../../components/ui/premium-mode-toggle";

interface User {
  id: string;
  firstName?: string;
  lastName?: string | null;
  email: string;
}
interface Post {
  id: string;
  content: string;
  images?: string[];
  createdAt: string;
  user: User;
  likesCount?: number;
  time?: string;
}
interface FetchPostsResponse {
  posts: Post[];
  hasMore: boolean;
}
const EditProfilePage = () => {
  const [user, setUser] = useState<{
    id?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    jobTitle?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    skills?: string[];
    hobbies?: string[];
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openPost, setOpenPost] = useState(false);
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<
    { id: string | number; username: string; email: string; firstName?: string; lastName?: string }[]
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query, 400);
  const { data, isLoading, isError } = useQuery<FetchPostsResponse>({
    queryKey: ["posts", page],
    queryFn: () => fetchPosts(page),
    retry: 2,
    placeholderData: (prev: FetchPostsResponse | undefined) => prev,
  });
  // Determine where the user came from
  const fromPage = searchParams.get("from") || "";
  const fetchPosts = async (page: number): Promise<FetchPostsResponse> => {
    try {
      const res = await authFetch(`/api/posts?page=${page}&limit=5`);
      if (!res.ok) {
        throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response but received HTML");
      }

      const data = await res.json();
      if (Array.isArray(data)) return { posts: data, hasMore: true };
      return { posts: data.posts || [], hasMore: data.hasMore || false };
    } catch (error) {
      console.error("Error fetching posts:", error);
      return { posts: [], hasMore: false };
    }
  };

  useEffect(() => {
    document.title = "Edit Profile | My Next JS App";
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!debouncedQuery) {
        console.log(" Clearing search results");
        setUsers([]);
        return;
      }

      console.log(" Debounced search:", debouncedQuery);
      setSearchLoading(true);
      const results = await searchUsers(debouncedQuery);
      setUsers(results);
      setSearchLoading(false);
    };
    fetchUsers();
  }, [debouncedQuery]);

  // Fetch user data
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userProfile = await fetchUserProfile();
        setUser(userProfile);
        console.log("[EditProfilePage] User data loaded", userProfile);
      } catch (error) {
        console.error("[EditProfilePage] Fetch error:", error);
        toast.error("Failed to load profile.");
      }
    };
    void getUserData();
  }, []);

  // Save updated profile
  const handleSave = async (updatedUser: unknown) => {
    setIsSaving(true);
    try {
      await updateUserProfile(updatedUser);
      toast.success("Profile saved successfully!");
      router.push("/profile"); // always go to profile after saving
    } catch (error) {
      console.error("[EditProfilePage] Save error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = async () => {
    console.log(" Manual search:", query);
    setSearchLoading(true);
    const results = await searchUsers(query);
    setUsers(results);
    setSearchLoading(false);
  };

  // Cancel / Back button
  const handleBack = () => {
    console.log("[EditProfilePage] Handling back navigation, fromPage:", fromPage);

    // If there is a from query param, go there
    if (fromPage) {
      router.push(fromPage);
      return;
    }

    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/profile");
    }
  };

  // if (!user)
  //   return <Loader title="Loading form..." subtitle="Preparing your profile data" size="lg" />;

  if (!user) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader 
        title="Loading profile..." 
        subtitle="Preparing your profile data" 
        size="lg" 
      />
    </div>
  );
}
return (
  <SidebarProvider>
    <div className="flex min-h-dvh w-full flex-col bg-[#F8FAFC] dark:bg-zinc-950">

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-b border-gray-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-8xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Zentia
            </span>
          </Link>

          {/* Search */}
          <div className="relative w-full max-w-md hidden sm:block">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={handleSearch}
              placeholder="Search the universe..."
            />

            {(query || searchLoading) && (
              <SearchSuggestions
                users={users}
                loading={searchLoading}
                query={query}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <PremiumModeToggle/>

            <Button
              size="sm"
              onClick={() => setOpenPost(true)}
              className="rounded-full px-4 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-all active:scale-95"
            >
              New Post
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3 sm:hidden">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            placeholder="Search users..."
          />

          {(query || searchLoading) && (
            <SearchSuggestions
              users={users}
              loading={searchLoading}
              query={query}
            />
          )}
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className="rounded-full px-4 py-2 text-sm border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
            >
              ← Back
            </Button>
          </div>

          {/* Header Text */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
              Edit Profile
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Update your personal info, account settings, and preferences.
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 sm:p-8">
            <ProfileContent
              user={user}
              onSave={handleSave}
              onCancel={handleBack}
              isSaving={isSaving}
            />
          </div>

        </div>
      </main>

      {/* Modal */}
      <CreatePostModal
        open={openPost}
        onClose={() => setOpenPost(false)}
      />
    </div>
  </SidebarProvider>
);
};
export default EditProfilePage;