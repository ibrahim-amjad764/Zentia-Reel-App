import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LikeButton } from './likes/LikeButton';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import CommentSection from './comments/CommentSection';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
}

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface PostData {
  id: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  isLikedByUser: boolean;
  media?: MediaItem[];  // new: array of images/videos
  userId: string;       // post owner
}

interface PostProps {
  postId: string;
  currentUser: User;
}

export default function Post({ postId, currentUser }: PostProps) {
  const [post, setPost] = useState<PostData | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts?mine=1`);
        const data = await res.json();

        const foundPost = data.posts.find((p: PostData) => p.id === postId);
        setPost(foundPost || null);
      } catch (err) {
        console.error('[Post] Failed to fetch post:', err);
      }
    }

    fetchPost();
  }, [postId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/posts/${post?.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Delete failed');

      toast.success('Post deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setPost(null); // remove from UI immediately
    } catch (err: any) {
      console.error('[Post] Delete failed:', err);
      toast.error(err?.message || 'Delete failed');
    }
  };

  if (!post) return <p>Loading...</p>;

  return (
    <div className="post-card p-4 border rounded-lg bg-white dark:bg-zinc-800 shadow-sm mb-4">
      <p className="mb-4">{post.content}</p>

      {/* Render media (images/videos) */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.media?.map((m, i) =>
          m.type === 'image' ? (
            <img
              key={i}
              src={m.url}
              alt={`Post image ${i + 1}`}
              className="rounded-md object-cover w-48 h-48" />
          ) : (
            <video
              key={i}
              src={m.url}
              controls
              className="rounded-md object-cover w-64 h-64" />
          )
        )}
      </div>

      {/* Like & Delete Buttons */}
      <div className="flex items-center justify-between mb-4">
        <LikeButton
          postId={post.id}
          userId={currentUser.id}
          initialIsLiked={post.isLikedByUser}
          initialLikesCount={post.likesCount}/>
        {/* Show delete only for post owner */}
        {post.userId === currentUser.id && (
          <Button
            variant="destructive"
            onClick={handleDelete}>
            Delete Post
          </Button>
        )}
      </div>

      {/* Comments */}
      <CommentSection
        postId={post.id}
        userId={currentUser.id}/>
    </div>
  );
}