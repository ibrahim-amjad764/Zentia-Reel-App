"use client";

import { fetchUserProfile, updateUserProfile } from "../../api/profile-user/user";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CreatePostModal } from "../../../src/components/posts/CreatePostModal";
import { SidebarProvider } from "../../../components/ui/sidebar";
import { searchUsers } from "../../../src/services/user.service";
import { useDebounce } from "../../../src/lib/useDebounce";
import { Button } from "../../../components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ProfileContent from "../../../src/components/membership/profile-page/ProfileContent";
import Loader from "../../../components/ui/Loader";
import PremiumNavbar from "../../../components/layout/PremiumNavbar";
import EditProfilePreview from "../../../src/components/membership/profile-page/EditProfilePreview";

interface ProfileUser {
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
  instagram?: string;
  facebook?: string;
  skills?: string[];
  hobbies?: string[];
  followersCount?: number;
  followingCount?: number;
}

const EditProfilePage = () => {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [previewUser, setPreviewUser] = useState<ProfileUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openPost, setOpenPost] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<
    { id: string | number; username: string; email: string; firstName?: string; lastName?: string }[]
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  // Determine where the user came from
  const fromPage = searchParams.get("from") || "";

  useEffect(() => {
    document.title = "Elite Edit Profile | Zentia Universe";
    console.log("[EditProfilePage] Initializing premium editing experience.");
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!debouncedQuery) {
        setUsers([]);
        return;
      }
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
        setPreviewUser(userProfile);
        console.log("[EditProfilePage] Success: User data loaded for edit.", userProfile.email);
      } catch (error) {
        console.error("[EditProfilePage] Fetch error:", error);
        toast.error("Failed to load profile.");
      }
    };
    void getUserData();
  }, []);

  const handleUpdatePreview = (updated: Partial<ProfileUser>) => {
    setPreviewUser(prev => prev ? { ...prev, ...updated } : null);
  };

  const handleSave = async (payload: any) => {
    setIsSaving(true);
    console.log("[EditProfilePage] Initiating profile save...", payload.email);
    try {
      await updateUserProfile(payload);
      toast.success("Golden updates saved successfully!", {
        description: "Your universe reflects these changes now.",
        icon: "✨"
      });
      router.push("/profile");
    } catch (error) {
      console.error("[EditProfilePage] Save error:", error);
      toast.error("Elite update failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    const results = await searchUsers(query);
    setUsers(results);
    setSearchLoading(false);
  };

  const handleBack = () => {
    console.log("[EditProfilePage] Navigation request: Back to", fromPage || "Profile");
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

  if (!user || !previewUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-950">
        <Loader 
          title="Preparing Editor" 
          subtitle="Aligning your universe..." 
          size="lg" 
        />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-zinc-50 dark:bg-[#050505] overflow-x-hidden">

        {/* PREMIUM NAVIGATION */}
        <PremiumNavbar 
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
          searchLoading={searchLoading}
          users={users}
        />

        {/* MAIN STAGE */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-16">
            
            {/* STICKY MOBILE HEADER */}
            <div className="flex items-center justify-between mb-12 sticky top-24 z-20 backdrop-blur-lg py-2 px-4 rounded-full bg-white/50 dark:bg-zinc-900/50 border border-white/20 sm:relative sm:top-0 sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:border-none sm:mb-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:scale-110 active:scale-95 transition-all"
                >
                  ←
                </Button>
                <div>
                  <h2 className="text-xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                    Edit Universe
                  </h2>
                  <p className="hidden md:block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest mt-1">
                    Refine your digital presence
                  </p>
                </div>
              </div>

              {/* SAVE SHORTCUT (Mobile Only) */}
              <div className="sm:hidden">
                <Button 
                   onClick={() => (document.getElementById("primary-save-btn") as HTMLButtonElement)?.click()}
                   disabled={isSaving}
                   className="rounded-full px-6 bg-[#FF7E5F] text-white text-xs font-black"
                >
                  {isSaving ? "..." : "Done"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
              
              {/* LIVE PREVIEW (4/12) - Left Column */}
              <aside className="order-2 lg:order-1 lg:col-span-4 h-fit">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <EditProfilePreview data={previewUser} />
                </motion.div>
              </aside>

              {/* EDITING FORM (8/12) - Right Column */}
              <div className="order-1 lg:order-2 lg:col-span-8 space-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                >
                  <ProfileContent
                    user={user}
                    onSave={handleSave}
                    onCancel={handleBack}
                    isSaving={isSaving}
                    onUpdate={handleUpdatePreview}
                  />
                </motion.div>
              </div>

            </div>
          </div>
        </main>

        <CreatePostModal open={openPost} onClose={() => setOpenPost(false)} />
      </div>
    </SidebarProvider>
  );
};

export default EditProfilePage;
