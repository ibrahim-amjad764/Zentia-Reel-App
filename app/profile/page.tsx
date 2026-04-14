// app/profile/page.tsx
"use client";
import { initializeApp, getApps, getApp } from "firebase/app";
import { fetchUserProfile, fetchMyPosts } from "../../app/api/profile-user/user";
import { useState, useEffect } from "react";
import { getAuth, getIdToken } from "firebase/auth";
import { PremiumModeToggle } from "../../components/ui/premium-mode-toggle";
import { NotificationBell } from "../../src/components/notifications/NotificationBell";
import { SidebarProvider } from "../../components/ui/sidebar";
import { CreatePostModal } from "../../src/components/posts/CreatePostModal";
import { useSearchParams } from "next/navigation";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { searchUsers } from "../../src/services/user.service";
import { useDebounce } from "../../src/lib/useDebounce";
import { useRouter } from "next/navigation";
import { Avatar } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Moon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../../components/ui/card";
import SearchSuggestions from "../../src/components/notifications/SearchSuggestions";
import ProfileDropdown from "../../components/ui/dropdown-profile";
import ProfileContent from "../../src/components/membership/profile-page/ProfileContent";
import ProfileHeader from "../../src/components/membership/profile-page/ProfileHeader";
import ProfileCard from "../../src/components/membership/profile-page/ProfileCard";
import SearchBar from "../../src/components/notifications/SearchBar";
import Loader from "../../components/ui/Loader";
import Image from "next/image";
import Link from "next/link";
import PremiumNavbar from "../../components/layout/PremiumNavbar";


interface User {
  id: string;
  firstName?: string;
  lastName?: string | null;
  email: string;
}

interface FetchPostsResponse {
  posts: Post[];
  hasMore: boolean;
}

// -----------------------------
// Types
// -----------------------------
interface ProfileUser {
  firstName?: string;
  lastName?: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  createdAt?: string;
  followersCount?: number;
  followingCount?: number;
}

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    firstName: string;
    lastName?: string;
  };
  createdAt: string;
}

interface Post {
  id: string;
  content: string;
  images?: string[];
  createdAt: string;
  user?: User;
  likesCount?: number;      // optional
  comments?: Comment[];
  commentsCount?: number;
  time?: string;
}

// -----------------------------
// Firebase Config
// -----------------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// -----------------------------
// Helper: Merge likes & comments into posts
// -----------------------------
const mergeLikesCommentsIntoPosts = (
  posts: Post[],
  likesData: { postid: string; count: number }[],
  commentsData: { postid: string; commentid: string; content: string; userid: string; firstName: string; lastName?: string; createdAt: string }[]
) => {
  const likesMap: Record<string, number> = {};
  likesData.forEach(like => {
    likesMap[like.postid] = like.count; // <-- use actual count
  });

  const commentsMap: Record<string, Comment[]> = {};
  commentsData.forEach(comment => {
    if (!commentsMap[comment.postid]) commentsMap[comment.postid] = [];
    commentsMap[comment.postid].push({
      id: comment.commentid,
      content: comment.content,
      user: { id: comment.userid, firstName: comment.firstName, lastName: comment.lastName },
      createdAt: comment.createdAt,
    });
  });

    return posts.map(post => ({
      ...post,
      likesCount: likesMap[post.id] || 0,
      comments: commentsMap[post.id] || [],
      commentsCount: commentsMap[post.id]?.length || 0,
    }));
};

// -----------------------------
// Fetch likes & comments for posts
// -----------------------------
const fetchLikesForPosts = async (postIds: string[]) => {
  const res = await fetch(`/api/posts/like?postIds=${postIds.join(",")}`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  return await res.json();
};

const fetchCommentsForPosts = async (postIds: string[]) => {
  const res = await fetch(`/api/posts/comment?postIds=${postIds.join(",")}`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  return await res.json();
};

import ProfileAboutPanel from "../../src/components/membership/profile-page/ProfileAboutPanel";

// -----------------------------
// Component
// -----------------------------
const ProfilePage = () => {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [openPost, setOpenPost] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<{ id: string | number; username: string; email: string; firstName?: string; lastName?: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 400);

  const loadProfile = async () => {
    if (loading) return;
    setLoading(true);
    console.log(`[ProfilePage] Loading profile and posts (page ${page})...`);

    try {
      const userProfile = await fetchUserProfile();
      const { posts: rawPosts, hasMore: more } = await fetchMyPosts(page);

      setUser({
        ...userProfile,
        email: userProfile.email || "unknown@example.com",
      });

      const postIds: string[] = rawPosts.map((p: Post) => p.id);
      const [likesData, commentsData] = await Promise.all([
        fetchLikesForPosts(postIds),
        fetchCommentsForPosts(postIds)
      ]);

      const postsWithEngagement: Post[] = mergeLikesCommentsIntoPosts(rawPosts, likesData, commentsData);

      setPosts(prev => (page === 1 ? postsWithEngagement : [...prev, ...postsWithEngagement]));
      setHasMore(more);
      console.log("[ProfilePage] Data loaded successfully.");
    } catch (error) {
      console.error("[ProfilePage] Error fetching profile/posts:", error);
      toast.error("Failed to load your elite profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("[ProfilePage] Component mounted. Initializing luxury experience.");
    document.title = "Elite Profile | Zentia Universe";
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

  useEffect(() => {
    loadProfile();
  }, [page]); // Remove 'loading' dependency to prevent continuous rendering

  useEffect(() => {
    const checkForProfileUpdate = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const fromEdit = urlParams.get('from') === 'edit';
      const profileUpdated = urlParams.get('updated') === 'true';
      
      if (fromEdit && profileUpdated) {
        console.log("[ProfilePage] Detected profile update, refreshing data...");
        
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname);
        
        // Refresh profile data
        loadProfile();
      }
    };

    checkForProfileUpdate();
  }, []);

  const handleSearch = async () => {
    setSearchLoading(true);
    const results = await searchUsers(query);
    setUsers(results);
    setSearchLoading(false);
  };

  const handleEditProfile = () => {
    console.log("[ProfilePage] Redirecting to profile edit...");
    router.push("/profile/edit");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-950">
        <Loader 
          title="Preparing Experience" 
          subtitle="Building your universe..." 
          size="lg" 
        />
      </div>
    );
  }

  const loadMorePosts = async () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-zinc-50 dark:bg-[#050505] overflow-x-hidden">
        
        <PremiumNavbar 
          query={query}
          setQuery={setQuery}
          handleSearch={handleSearch}
          searchLoading={searchLoading}
          users={users}
        />

        <main className="flex-1">
          {/* HEADER SECTION (Full Width) */}
          <section className="w-full">
            <ProfileHeader
              user={user}
              onEdit={handleEditProfile}
              showEditButton
              postsCount={posts.length}
              followersCount={user.followersCount || 0}
              followingCount={user.followingCount || 0}
            />
          </section>

          {/* CONTENT GRID */}
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column: Activity & Posts (8/12) */}
              <div className="lg:col-span-8 space-y-8 border-full">
                <ProfileCard
                  posts={posts}
                  hasMore={hasMore}
                  loadMore={loadMorePosts}
                  user={user} // Passed for mobile About view
                />
              </div>

              {/* Right Column: About & Stats (4/12) - Desktop Only */}
              <aside className="hidden lg:block lg:col-span-4 sticky top-36 h-fit space-y-8">
                <ProfileAboutPanel user={user} />
                
                {/* Visual Completeness Card */}
                <Card className="p-8 bg-gradient-to-br from-[#FF7E5F] to-[#FEB47B] rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform duration-500">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-widest mb-2">Universe Status</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase opacity-80">
                      <span>Profile Strength</span>
                      <span>85%</span>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden p-[1px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                      />
                    </div>
                    <p className="text-[10px] italic opacity-70 leading-relaxed font-medium">
                      Your profile is shining bright. Complete your bio to reach Platinum status.
                    </p>
                  </div>
                </Card>
              </aside>
            </div>
          </div>
        </main>

        <CreatePostModal
          open={openPost}
          onClose={() => setOpenPost(false)}
        />
        
        {/* MOBILE STICKY CREATE BUTTON (TikTok Style) */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 lg:hidden">
          <Button 
            onClick={() => setOpenPost(true)}
            className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#FF7E5F] to-[#FEB47B] text-white shadow-[0_10px_30px_rgba(255,126,95,0.4)] border-4 border-white/20 hover:scale-110 active:scale-95 transition-all"
          >
            <Sparkles size={28} />
          </Button>
        </div>

      </div>
    </SidebarProvider>
  );
};


export default ProfilePage;