"use client";

import React, { useState, useEffect } from "react";
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

  // 🔁 Refresh expired media logic
  useEffect(() => {
    if (!username) return;

    const refreshExpiredMedia = async () => {
      try {
        
        // await fetch(`/api/auth/refreshInstagram?username=${username}`);
        // let attempts = 0;
        // let freshFound = false;

        // while (attempts < 5 && !freshFound) {
     
            // break;
          // }

          // attempts++;
          // await new Promise((res) => setTimeout(res, 5000));

          const res = await fetch(`/api/public-portfolio/posts?username=${username}`);
          const data = await res.json();

          if (data?.success && data.instagram?.length > 0) {
            freshFound = true;
            queryClient.invalidateQueries(["publicProjects", username]);
          }
         } catch (err) {
            console.error("Failed to refresh media:", err);
          }
    };

    refreshExpiredMedia();
  }, [username, queryClient]);

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
            mediaType: item.name || item.fileName,
            mediaUrl: item.mediaLink || item.fileUrl,
            mediaId: item.mediaId,
          };
        }),
        ...data.uploaded.map((item) => ({
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

  // 🧱 Grid Skeleton while loading
  if (isLoading) {
    return (
      <div className="w-full mx-auto max-w-[1600px] p-4 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[5/8] lg:aspect-[5/7] w-full relative">
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

    return (
      <div
        key={index}
        className="relative w-full h-full rounded-md overflow-hidden group"
        onMouseEnter={() => handleMouseEnter(mediaId)}
        onMouseLeave={() => handleMouseLeave(mediaId)}
      >
        {!isLoaded && <MediaSkeleton />}

        {/* Handle Video / Image / Carousel */}
        {project.mediaType === "CAROUSEL_ALBUM" && project.children ? (
          project.children.map((child, idx) => (
            <div
              key={child.mediaId}
              className={`absolute inset-0 transition-all duration-500 ${
                (carouselIndexes[mediaId] || 0) === idx
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0"
              }`}
            >
              {child.mediaType === "IMAGE" ? (
                <Image
                  src={child.mediaUrl}
                  alt={`Media ${child.mediaId}`}
                  fill
                  className="object-cover"
                  onLoadingComplete={() =>
                    setLoadedMedia((prev) => ({ ...prev, [mediaId]: true }))
                  }
                />
              ) : (
                <video
                  className="w-full h-full object-cover"
                  src={child.mediaUrl}
                  muted
                  playsInline
                  onLoadedData={() =>
                    setLoadedMedia((prev) => ({ ...prev, [mediaId]: true }))
                  }
                />
              )}
            </div>
          ))
        ) : project.mediaType.includes("VIDEO") ||
          project.mediaType.endsWith(".mp4") ? (
          <video
            className="w-full h-full object-cover"
            src={project.mediaUrl}
            muted
            playsInline
            onLoadedData={() =>
              setLoadedMedia((prev) => ({ ...prev, [mediaId]: true }))
            }
          />
        ) : (
          <Image
            src={project.mediaUrl}
            alt={`Project ${index + 1}`}
            fill
            className="object-cover"
            onLoadingComplete={() =>
              setLoadedMedia((prev) => ({ ...prev, [mediaId]: true }))
            }
          />
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 z-10 cursor-pointer"
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
          {loadingPostId === mediaId ? (
            <DotLottieReact
              src="https://lottie.host/81cc983b-b9c4-4f8a-a81b-f507e58770c5/xO16vOSRiQ.lottie"
              loop
              autoplay
              style={{ width: 80, height: 80 }}
            />
          ) : (
            <span className="text-yellow-300 text-center underline text-[21px] font-apfel-grotezk-regular">
              Post Info & Insights ↗
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto max-w-[1600px] p-2 sm:p-4">
      {projects.length > 0 ? (
        <>
          {/* 📱 Mobile / Tablet */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-4 lg:hidden">
            {projects.map((project, index) => (
              <div
                key={index}
                className="relative aspect-[5/8] sm:aspect-[5/7] w-full"
              >
                {renderMedia(project, index)}
              </div>
            ))}
          </div>

          {/* 💻 Desktop */}
          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8">
            {projects.map((project, index) => (
              <div key={index} className="relative w-full aspect-[5/7]">
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


// Listen for route changes to stop loading when navigation is complete
// Refresh media once when username is available
//   useEffect(() => {
//   if (!username) return;

//   const refreshExpiredMedia = async () => {
//     try {
//       await fetch(`/api/auth/refreshInstagram?username=${username}`);
//       console.log("✅ Refresh call triggered for username:", username);
//     } catch (err) {
//       console.error("❌ Failed to refresh media:", err);
//     }
//   };

//   refreshExpiredMedia();
// }, [username]);