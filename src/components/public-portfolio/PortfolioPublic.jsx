"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// Simple skeleton shimmer
const MediaSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="w-full h-full bg-gray-300 animate-pulse rounded-md absolute inset-0"
  />
);

const PortfolioPublic = () => {
  const [carouselIndexes, setCarouselIndexes] = useState({});
  const [loadingPostId, setLoadingPostId] = useState(null);
  const [hoveredPostId, setHoveredPostId] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadedMedia, setLoadedMedia] = useState({});
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAdminView = pathname.includes("/adminview");
  const username = pathname.split("/")[1] || "";

  const {
    data: statsMap = {},
    isLoading: loadingStats,
    isFetching,
  } = useQuery({
    queryKey: ["instagram-media-stats", username],
    queryFn: async () => {
      const res = await fetch(
        `/api/public-portfolio/all-media-insights?username=${username}`
      );
      const data = await res.json();

      if (!data?.success) {
        throw new Error("Failed to fetch stats");
      }

      // Convert array → map (cached result)
      const map = {};
      data.stats.forEach((s) => {
        map[s.mediaId] = s;
      });

      return map;
    },

    // 🔥 CACHE BEHAVIOR
    staleTime: 1000 * 60 * 30, // 30 minutes → no refetch
    cacheTime: 1000 * 60 * 60, // 1 hour in memory
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!username,
  });

  // 📦 Fetch public projects
  const {
    data: projects = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["publicProjects", username],
    queryFn: async () => {
      const res = await fetch(`/api/public-portfolio/posts?username=${username}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch projects");

      return [
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
            };
          }
          return {
            source: "instagram",
            mediaType: item.name || item.fileName,
            mediaUrl: item.mediaLink || item.fileUrl,
            mediaId: item.mediaId,
          };
        }),
        ...data.uploaded.map((item) => ({
          source: "uploaded",
          mediaType: item.mediaType || item.fileName,
          mediaUrl: item.mediaUrl || item.fileUrl,
          mediaId: item.mediaId,
        })),
      ];
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });

  const handleSlide = (e, mediaId, direction, totalSlides) => {
    e.stopPropagation();
    setCarouselIndexes((prev) => {
      const currentIndex = prev[mediaId] || 0;
      const newIndex =
        direction === "next"
          ? (currentIndex + 1) % totalSlides
          : currentIndex === 0
            ? totalSlides - 1
            : currentIndex - 1;
      return { ...prev, [mediaId]: newIndex };
    });
  };

  const handleMouseEnter = (mediaId) => {
    if (!isNavigating) setHoveredPostId(mediaId);
  };
  const handleMouseLeave = (mediaId) => {
    if (hoveredPostId === mediaId && !isNavigating) setHoveredPostId(null);
  };

  const handlePostClick = async (e, mediaId, url) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingPostId(mediaId);
    setIsNavigating(true);
    setHoveredPostId(null);
    try {
      router.push(url);
    } catch (err) {
      console.error("Error navigating:", err);
      setLoadingPostId(null);
      setIsNavigating(false);
    }
  };

  function format(num) {
    if (num >= 1_000_000_000) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1_000_000) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1_000) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(num);
  }


  // 🧱 Grid Skeleton while loading
  if (isLoading) {
    return (
      <div className=" grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] w-full relative">
            <MediaSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (isError)
    return <p className="text-center text-red-500">Error: {error.message}</p>;

  const renderMedia = (project, index) => {
    const mediaId = project.mediaId;
    const isLoaded = loadedMedia[mediaId];
    const stat = statsMap[mediaId];
    const isUploaded = project.source === "uploaded";

    return (
      <div
        key={index}
        className="relative w-full h-full rounded-xl overflow-hidden group"
        onMouseEnter={() => handleMouseEnter(mediaId)}
        onMouseLeave={() => handleMouseLeave(mediaId)}
      >
        {!isLoaded && <MediaSkeleton />}

        {/* MEDIA */}
        {project.mediaType === "CAROUSEL_ALBUM" && project.children ? (
          project.children.map((child, idx) => (
            <div
              key={child.mediaId}
              className={`absolute inset-0 transition-all duration-500 ${(carouselIndexes[mediaId] || 0) === idx
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0"
                }`}
            >
              {child.mediaType === "IMAGE" ? (
                <Image
                  src={child.mediaUrl}
                  alt=""
                  fill
                  className="object-cover"
                  onLoadingComplete={() =>
                    setLoadedMedia((p) => ({ ...p, [mediaId]: true }))
                  }
                />
              ) : (
                <video
                  className="w-full h-full object-cover"
                  src={child.mediaUrl}
                  muted
                  playsInline
                  onLoadedData={() =>
                    setLoadedMedia((p) => ({ ...p, [mediaId]: true }))
                  }
                />
              )}
            </div>
          ))
        ) : project.mediaType.includes("VIDEO") ? (
          <video
            className="w-full h-full object-cover"
            src={project.mediaUrl}
            muted
            playsInline
            onLoadedData={() =>
              setLoadedMedia((p) => ({ ...p, [mediaId]: true }))

            }
          />
        ) : (
          <Image
            src={project.mediaUrl}
            alt=""
            fill
            className="object-cover"
            onLoadingComplete={() =>
              setLoadedMedia((p) => ({ ...p, [mediaId]: true }))
            }
          />
        )}

        {/* 📱 MOBILE — Views only */}
        {stat?.views >= 0 && (
          <div
            className="
            md:hidden
            absolute bottom-2 left-1
            z-20
            flex items-center gap-1
            px-1 py-1
            rounded-md
            text-white text-xs
          "
          >
            <Image
              src="/assets/images/views.svg"
              alt="Views"
              width={14}
              height={14}
            />
            <span>{format(stat.views)}</span>
          </div>
        )}

        {/* 💻 DESKTOP HOVER OVERLAY */}
        <div
          className="
          hidden md:flex
          absolute inset-0
          items-center justify-center
          bg-black/40 backdrop-blur-sm
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          z-10 cursor-pointer
        "
          onClick={(e) =>
            handlePostClick(
              e,
              mediaId,
              isAdminView
                ? `/${username}/media-kit/adminview/post?postId=${mediaId}`
                : `/${username}/media-kit/post/?postId=${mediaId}`
            )
          }
        >
          <div className="flex flex-wrap justify-center gap-4 text-white text-lg max-w-[90%]">
            {!isUploaded && (
              <>
                {/* Likes */}
                <div className="flex items-center gap-1.5">
                  <Image src="/assets/images/like.svg" alt="Like" width={16} height={16} />
                  <span>{format(stat?.likes ?? 0)}</span>
                </div>

                {/* Comments */}
                <div className="flex items-center gap-1.5">
                  <Image src="/assets/images/comment.svg" alt="Comment" width={16} height={16} />
                  <span>{format(stat?.comments ?? 0)}</span>
                </div>

                {/* Views */}
                {stat?.views >= 0 && (
                  <div className="flex items-center gap-1.5">
                    <Image src="/assets/images/views.svg" alt="Views" width={16} height={16} />
                    <span>{format(stat.views)}</span>
                  </div>
                )}

                {/* Shares */}
                {stat?.shares >= 0 && (
                  <div className="flex items-center gap-1.5">
                    <Image src="/assets/images/shares.svg" alt="Shares" width={16} height={16} />
                    <span>{format(stat.shares)}</span>
                  </div>
                )}

              </>
            )}

            {loadingPostId === mediaId ? (
              <DotLottieReact
                src="https://lottie.host/81cc983b-b9c4-4f8a-a81b-f507e58770c5/xO16vOSRiQ.lottie"
                loop
                autoplay
                style={{ width: 80, height: 80 }}
              />
            ) : (
              <span className="hidden lg:block text-yellow-300 font-apfel-grotezk-regular underline text-[20px] ">
                Post Info & Insights ↗
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full justify-center items-center max-sm:mb-10">
      {/* border-2 border-red */}
      {/* <div className="container mx-auto max-w-[1400px] w-full justify-center items-center max-sm:mb-10 border-2 border-red">// if want some margin LF then  */}
      {projects.length > 0 ? (
        <>
          {/* 📱 Mobile / Tablet */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:hidden">
            {/* border-2 border-green  */}
            {projects.map((project, index) => (
              <div
                key={index}
                className="relative aspect-[3/4] rounded-md"
              >
                {renderMedia(project, index)}
              </div>
            ))}
          </div>

          {/* 💻 Desktop */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {projects.map((project, index) => (
              <div key={index} className="relative aspect-[3/4] rounded-xl ">
                {/* border-2 border-green */}
                {renderMedia(project, index)}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500 font-qimano">
          No projects found.
        </p>
      )}
    </div>
  );
};

export default PortfolioPublic;