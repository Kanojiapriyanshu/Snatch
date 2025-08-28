// app/public-portfolio/[username]/post/layout.js
import React from "react";
import Link from "next/link";
import Image from "next/image";
import VideoThumbnail from "@/components/VideoThumbnail";
import CarouselThumbnail from "@/components/CarouselThumbnail"; // Add this import
import { PostsProvider } from "@/context/PostContext";

export default async function PostLayout({ children, params }) {
  const { username } = params;
  let userPosts = [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || "http://localhost:3000";

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
          mediaType: item.mediaType || item.fileName,
          mediaUrl: item.mediaUrl || item.fileUrl,
          mediaId: item.mediaId,
          title: item.name,
          thumbnailUrl: item.thumbnailUrl || null,
        })),
      ];
    }
  } catch (error) {
    console.error("Failed to load user posts:", error);
  }

  return (
    <div className="w-full min-h-screen bg-[#D9D9D9] flex flex-col items-center justify-center">
      <div className="hidden md:flex w-full max-w-[1100px] max-h-[660px] bg-[#F2F2F2] rounded-2xl shadow-lg flex-col items-center justify-center mx-auto my-2 p-0">
        <PostsProvider value={{ allPosts: userPosts, username }}>
          <div className="posts-container">{children}</div>

          {/* More posts - hidden on mobile, visible on desktop only */}
          <div className="hidden md:block">
            <div className="mx-auto mt-3 px-4 mb-10 w-full lg:w-[864px] lg:px-0 lg:group">
              <h3 className="text-xl font-qimano text-[#212121] mt-10">
                More from @{username}
              </h3>
              <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 justify-center items-center lg:justify-start lg:items-start w-full lg:group">
                {userPosts.length > 0 ? (
                  userPosts.map((post, index) => (
                    <Link
                      key={index}
                      href={`/${username}/media-kit/post/?postId=${post.mediaId}`}
                      className="block lg:relative"
                    >
                      <div className="transition-opacity duration-200 ease-in-out lg:opacity-60 lg:group-hover:opacity-10 lg:hover:opacity-100 lg:rounded-md">
                        {post.mediaType === "CAROUSEL_ALBUM" && post.children ? (
                          <CarouselThumbnail 
                            post={post}
                            index={index}
                            className="w-[120px] h-[120px] lg:w-[60px] lg:h-[60px]"
                          />
                        ) : post.mediaType?.includes("VIDEO") ||
                          post.mediaUrl?.endsWith(".mp4") ? (
                          <VideoThumbnail
                            src={post.mediaUrl}
                            thumbnailUrl={post.thumbnailUrl}
                            alt={`Video ${index}`}
                            className="w-[120px] h-[120px] lg:w-[60px] lg:h-[60px] rounded-md"
                            showPlayIcon={true}
                          />
                        ) : (
                          <Image
                            width={180}
                            height={180}
                            src={post.mediaUrl}
                            alt={`Project ${index}`}
                            className="w-[120px] h-[120px] lg:w-[60px] lg:h-[60px] object-cover rounded-md"
                          />
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p>No other posts available.</p>
                )}
              </div>
            </div>
          </div>
        </PostsProvider>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden w-full bg-[#F2F2F2] flex flex-col items-center justify-start lg:justify-center">
        <PostsProvider value={{ allPosts: userPosts, username }}>
          <div className="posts-container">{children}</div>
        </PostsProvider>
      </div>
    </div>
  );
}