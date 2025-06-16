// app/public-portfolio/[username]/post/layout.js

import React from "react";
import PostCard from "@/components/public-portfolio/PostCard";
import Link from "next/link";
import Image from "next/image";
import { PostsProvider } from "@/context/PostContext";

export default async function PostLayout({ children, params }) {
  const { username } = params;
  let userPosts = [];
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || "http://localhost:3000";

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
        })),
      ];
    }
  } catch (error) {
    console.error("Failed to load user posts:", error);
  }

  return (
    <div className="w-full bg-[#F2F2F2] flex flex-col items-center justify-start lg:justify-center">
      <PostsProvider value={{ allPosts: userPosts, username }}>
        <div className="posts-container">{children}</div>

        {/* More posts */}
        <div className="mx-auto mt-4 px-4 mb-20 w-full lg:w-[864px] lg:px-0">
          <h3 className="text-xl font-qimano text-[#212121] mb-5 lg:pl-[px]">
            More from @{username}
          </h3>

          <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 justify-center items-center lg:justify-start lg:items-start ">

            {userPosts.length > 0 ? (
              userPosts.map((post, index) => (
                <Link
                  key={index}
                  href={`/${username}/media-kit/post/?postId=${post.mediaId}`}
                  className="block"
                >
                  {post.mediaType === "CAROUSEL_ALBUM" && post.children ? (
                    <div className="relative w-[120px] h-[120px] lg:w-[90px] lg:h-[90px] group">
                      <Image
                        src={post.children[0].mediaUrl}
                        alt={`Project ${index}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  ) : post.mediaType?.includes("VIDEO") || post.mediaUrl?.endsWith(".mp4") ? (
                    <video
                      muted
                      playsInline
                      className="w-[120px] h-[120px] lg:w-[90px] lg:h-[90px] object-cover rounded-md"
                      src={post.mediaUrl}
                    />
                  ) : (
                    <Image
                      width={180}
                      height={180}
                      src={post.mediaUrl}
                      alt={`Project ${index}`}
                      className="w-[120px] h-[120px] lg:w-[90px] lg:h-[90px] object-cover rounded-md"
                    />
                  )}
                </Link>
              ))
            ) : (
              <p>No other posts available.</p>
            )}
          </div>
        </div>
      </PostsProvider>
    </div>
  );
}
