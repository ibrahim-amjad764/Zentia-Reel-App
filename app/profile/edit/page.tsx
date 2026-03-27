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
import ThemeDropdown from "../../../components/ui/dropdown-theme";
import SearchBar from "../../../src/components/notifications/SearchBar";
import Link from "next/link";
import Loader from "../../../components/ui/Loader";
import Image from "next/image";

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
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openPost, setOpenPost] = useState(false);
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<any[]>([]);
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
  const handleSave = async (updatedUser: any) => {
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

  if (!user)
    return <Loader title="Loading form..." subtitle="Preparing your profile data" size="lg" />;

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full flex-col">

        <header className="bg-card sticky top-0 z-50 border-b">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6">

            <Link href="/feed" className="flex items-center gap-2">
              <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="object-cover w-full h-full scale-150" />
              </div>
              <span className="lg:text-lg font-extrabold text-black italic tracking-wider animate-pulse dark:text-slate-600">
                Zentia
              </span>
            </Link>

            <div className="relative w-full max-w-sm">
              <SearchBar
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                placeholder="Search users..." />

              {(query || searchLoading) && (
                <SearchSuggestions users={users} loading={searchLoading} query={query} />
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <NotificationBell />

              <ThemeDropdown
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Moon className="size-5" />
                  </Button>
                } />

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setOpenPost(true)}
                className="transition-all duration-200 ease-in-out hover:scale-105 active:scale-95">
                New Post
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="min-h-screen bg-slate-200 text-gray-800 dark:bg-zinc-900 dark:text-gray-300">
            <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">

              <div className="max-w-4xl mx-auto px-4 pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="dark:bg-zinc-900 dark:hover:bg-zinc-700 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 text-md">
                  ← Back
                </Button>
              </div>

              <div>
                <h2 className="text-2xl font-semibold">Edit profile</h2>
                <p className="text-sm text-slate-400 mt-2 italic">
                  Personal, Account, Security & Notifications. Changes reflect on your profile page.
                </p>
              </div>

              <ProfileContent
                user={user}
                onSave={handleSave}
                onCancel={handleBack}
                isSaving={isSaving} />
            </div>
          </div>
        </main>
      </div>
      <CreatePostModal open={openPost} onClose={() => setOpenPost(false)} />
    </SidebarProvider>
  );
};
export default EditProfilePage;