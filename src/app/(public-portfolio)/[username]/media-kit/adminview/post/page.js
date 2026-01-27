"use client";

import { useSearchParams, useParams } from "next/navigation";
import PostCard from "@/components/public-portfolio/PostCard";
import { usePostsContext } from "@/context/PostContext";
import { usePostFromCache } from "@/utils/public-portfolio/portfolio";

export default function PostDetailsPage() {
  const { allPosts } = usePostsContext();
  const searchParams = useSearchParams();
  const params = useParams();

  const postId = searchParams.get("postId");
  const username = params.username;

  const { post, media, isLoading, isError } = usePostFromCache({
  postId,
  username,
});


  if (isLoading) {
    return (
      <div className="font-qimano h-[480px] flex items-center text-md lg:text-2xl animate-pulse text-electric-blue">
        Hold on while we fetch the post!
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Failed to load post: {error.message}
      </div>
    );
  }

  return (
    <PostCard
      key={postId}
      post={post}
      media={media}
      username={username}
      postId={postId}
      allPosts={allPosts}
    />
  );
}
