// components/public-portfolio/MorePosts.js
"use client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import VideoThumbnail from "@/components/VideoThumbnail";
import CarouselThumbnail from "@/components/CarouselThumbnail";

export default function MorePosts({ userPosts, username, isAdmin }) {
  const searchParams = useSearchParams();
  const selectedPostId = searchParams.get("postId");

  return (
    <div className="mx-auto mt-3 px-4 mb-10 w-full lg:w-[864px] lg:px-0 lg:group">
      <h3 className="text-xl font-qimano text-[#212121] mt-10">
        More from @{username}
      </h3>
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 justify-center items-center lg:justify-start lg:items-start w-full lg:group">
        {userPosts.length > 0 ? (
          userPosts.map((post, index) => {
            const isSelected = String(post.mediaId) === String(selectedPostId);

            // build href dynamically
            const href = isAdmin
              ? `/${username}/media-kit/adminview/post?postId=${post.mediaId}`
              : `/${username}/media-kit/post?postId=${post.mediaId}`;

            return (
              <Link key={index} href={href} className="block lg:relative">
                <div
                  className={`transition-all duration-300 ease-in-out lg:rounded-md mt-3
                    ${isSelected
                      ? "scale-125 opacity-100 z-10"
                      : "lg:opacity-60 lg:hover:opacity-100"
                    }`}
                >
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
            );
          })
        ) : (
          <p>No other posts available.</p>
        )}
      </div>
    </div>
  );
}
