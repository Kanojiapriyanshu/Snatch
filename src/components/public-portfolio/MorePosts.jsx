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
            const isSelected = String(post.postId) === String(selectedPostId);

            // Build href dynamically
            const href = isAdmin
              ? `/${username}/media-kit/adminview/post?postId=${post.postId}`
              : `/${username}/media-kit/post?postId=${post.postId}`;

            // Extract media info
            const mediaSource = post.media?.source; // "instagram" or "uploaded"
            const mediaType = post.media?.type; // "CAROUSEL", "VIDEO", or "IMAGE"
            const mediaUrl = post.media?.files?.[0]?.url;
            const children = post.media?.files; // For carousel

            return (
              <Link key={post.postId || index} href={href} className="block lg:relative">
                <div
                  className={`transition-all duration-300 ease-in-out lg:rounded-md mt-3
                    ${isSelected
                      ? "scale-125 opacity-100 z-10"
                      : "lg:opacity-60 lg:hover:opacity-100"
                    }`}
                >
                  {/* Handle Instagram Carousel */}
                  {mediaSource === "instagram" && mediaType === "CAROUSEL" && children ? (
                    <CarouselThumbnail
                      post={{ children }}
                      index={index}
                      className="w-[120px] h-[120px] lg:w-[60px] lg:h-[60px]"
                    />
                  ) : 
                  /* Handle any VIDEO (Instagram or Uploaded) */
                  mediaType === "VIDEO" ? (
                    <VideoThumbnail
                      src={mediaUrl}
                      thumbnailUrl={null}
                      alt={`Video ${index}`}
                      className="w-[120px] h-[120px] lg:w-[60px] lg:h-[60px] rounded-md"
                      showPlayIcon={true}
                    />
                  ) : 
                  /* Handle any IMAGE (Instagram or Uploaded) */
                  mediaType === "IMAGE" && mediaUrl ? (
                    <Image
                      width={180}
                      height={180}
                      src={mediaUrl}
                      alt={post.formData?.titleName || `Project ${index}`}
                      className="w-[120px] h-[120px] lg:w-[60px] lg:h-[60px] object-cover rounded-md"
                    />
                  ) : (
                    /* Fallback for missing media */
                    <div className="w-[120px] h-[120px] lg:w-[60px] lg:h-[60px] bg-gray-300 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">No media</span>
                    </div>
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