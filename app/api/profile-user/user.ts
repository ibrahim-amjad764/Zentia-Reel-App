// app/api/profile-user/user.ts

/** Fetch current user's posts (mine=1) */
export const fetchMyPosts = async (page: number = 1) => {
  const res = await fetch(`/api/posts?page=${page}&limit=5&mine=1`, {
    credentials: "include",
  });
  if (!res.ok) return { posts: [], hasMore: false };
  const data = await res.json();
  return { posts: data.posts || [], hasMore: data.hasMore || false };
};

// Fetch user profile from the API
export const fetchUserProfile = async () => {
  try {
    const res = await fetch("/api/profile-user/profile", {
      credentials: "include",  // Ensures cookies (auth-token) are included in the request
    });

    if (!res.ok) {
      const errorDetails = await res.text();
      console.error("[fetchUserProfile] API error:", errorDetails);
      throw new Error("Failed to fetch user profile");
    }
    const profileData = await res.json();
    console.log("[fetchUserProfile] Success:", profileData?.email);
    return profileData;
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    throw new Error("An unexpected error occurred while fetching the user profile.");
  }
};

// Update profile with new data
export const updateUserProfile = async (user: any) => {
  try {
    const res = await fetch("/api/profile-user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
      credentials: "include",
    });

    if (!res.ok) {
      const errorDetails = await res.text();
      console.error("[updateUserProfile] Error:", errorDetails);
      throw new Error("Failed to update profile");
    }

    const updatedProfile = await res.json();
    console.log("[updateUserProfile] Success:", updatedProfile?.email);
    return updatedProfile;
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw new Error("An unexpected error occurred while updating the user profile.");
  }
};