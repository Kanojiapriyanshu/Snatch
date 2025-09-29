
// app/public-portfolio/[username]/media-kit/adminview/post/layout.js
import React from "react";
import { PostsProvider } from "@/context/PostContext";
import MorePosts from "@/components/public-portfolio/MorePosts";

export default async function PostLayout({ children, params, searchParams }) {
  const { username } = params;
  const selectedPostId = searchParams?.postId?.toString();
  let userPosts = [];

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000";

  try {
    const res = await fetch(
      `${baseUrl}/api/public-portfolio/posts?username=${username}`,
      { cache: "no-store" }
    );
    const data = await res.json();

    if (data.success && data.instagram && data.uploaded) {
      userPosts = [
        ...data.instagram.map((item) => {
          if (item.name === "CAROUSEL_ALBUM" && item.children?.length > 0) {
            return {
              mediaType: "CAROUSEL_ALBUM",
              children: item.children.map((child) => ({
                mediaType: child.media_type,
                mediaUrl: child.media_url,
                mediaId: child.id,
              })),
              mediaId: item.mediaId,
              title: item.name,
            };
          }

          return {
            mediaType: item.name || item.fileName,
            mediaUrl: item.mediaLink || item.fileUrl,
            mediaId: item.mediaId,
            title: item.name,
          };
        }),
        ...data.uploaded.map((item) => ({
         mediaType: item.mediaType || (item.fileName?.endsWith('.mp4') ? 'VIDEO' : 'IMAGE'),
          mediaUrl: item.fileUrl || item.mediaUrl,
          // Fix: Ensure mediaId is converted to string for comparison
          mediaId: String(item.mediaId || item.id),
          title: item.name || item.fileName,
          thumbnailUrl: item.thumbnailUrl
        })),
      ];
    }
  } catch (error) {
    console.error("Failed to load user posts:", error);
  }

  return (
    <div className="w-full min-h-screen bg-[#D9D9D9] flex flex-col items-center justify-center">
      {/* Desktop Layout */}
      <div className="hidden md:flex w-full max-w-[1100px] max-h-[660px] bg-[#F2F2F2] rounded-2xl shadow-lg flex-col items-center justify-center mx-auto my-2 p-0">
        <PostsProvider value={{ allPosts: userPosts, username }}>
          <div className="posts-container">{children}</div>

          {/* More posts */}
          <div className="hidden md:block">
          <MorePosts userPosts={userPosts} username={username} isAdmin={true} />
          </div>
        </PostsProvider>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden w-full bg-[#F2F2F2] flex flex-col items-center justify-start lg:justify-center">
        <PostsProvider value={{ allPosts: userPosts, username }}>
          <div className="posts-container">{children}</div>
        </PostsProvider>
      </div>
    </div>
  );
}
