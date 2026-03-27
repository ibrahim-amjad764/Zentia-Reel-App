// Fetch raw likes for posts (returns array of objects with postid and userid etc.)
export const fetchLikesForPosts = async (postIds: string[]) => {
  try {
    const res = await fetch(`/api/posts/like?postIds=${postIds.join(",")}`, {
      credentials: "include",
    });
    if (!res.ok) return [];
    return await res.json(); // returns [{ postid: string, userid: string, ... }]
  } catch (err) {
    console.error("Error fetching raw likes:", err);
    return [];
  }
};

// Fetch raw comments for posts (returns array of objects with postid, commentid, content, userid etc.)
export const fetchCommentsForPosts = async (postIds: string[]) => {
  try {
    const res = await fetch(`/api/posts/comment?postIds=${postIds.join(",")}`, {
      credentials: "include",
    });
    if (!res.ok) return [];
    return await res.json(); // returns [{ postid: string, commentid, content, userid, ... }]
  } catch (err) {
    console.error("Error fetching comments:", err);
    return [];
  }
};

// Helper to fetch likes counts for multiple posts in a convenient map: { [postId]: likesCount }
export const fetchLikes = async (postIds: string[]): Promise<Record<string, number>> => {
  try {
    const res = await fetch(`/api/posts/like?postIds=${postIds.join(",")}`, {
      credentials: "include",
    });
    if (!res.ok) return {};
    const data: { postid: string; count: number }[] = await res.json();
    const likesMap: Record<string, number> = {};
    data.forEach(like => {
      likesMap[like.postid] = like.count;
    });
    return likesMap;
  } catch (err) {
    console.error("Error fetching likes counts:", err);
    return {};
  }
};