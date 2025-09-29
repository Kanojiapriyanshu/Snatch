"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import PostCard from "@/components/public-portfolio/PostCard";
import { usePostsContext } from "@/context/PostContext";

export default function PostDetailsPage() {
  const { allPosts, username: contextUsername } = usePostsContext();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const params = useParams();
  const postId = searchParams.get("postId");
  const username = params.username;

  useEffect(() => {
    if (!postId || !username) {
      console.error("Missing required params:", { postId, username });
      return;
    }

    const fetchPostData = async () => {
      try {
        const res = await fetch(`/api/public-portfolio/preview?postId=${postId}&username=${username}`);
        const data = await res.json();

        if (data.success) {
          // Find the matching post from allPosts
          const matchingPost = allPosts?.find(p => String(p.mediaId) === String(postId));

          // Default insights values when not available
          const defaultInsights = {
            engagement: 0,
            impressions: 0,
            reach: 0,
            saved: 0,
            likes: 0,
            comments: 0
          };

          // Combine API data with local data
          setPost({
            post: data.post,
            media: data.media,
            mediaType: matchingPost?.mediaType || data.media.type,
            mediaUrl: matchingPost?.mediaUrl || (data.media.files[0]?.url || ''),
            children: matchingPost?.children || data.media.files,
            insights: matchingPost?.insights || defaultInsights
          });
        } else {
          console.error("Error fetching post:", data.error);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId, username, allPosts]);


  if (!post) {
    return <div className="font-qimano h-[480px]  flex items-center text-md lg:text-2xl animate-pulse text-electric-blue">Hold on while we fetch the post!</div>;
  }

  return <PostCard key={postId} post={post} username={username} postId={postId} allPosts={allPosts}/>;
}