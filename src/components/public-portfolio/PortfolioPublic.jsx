"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const PortfolioPublic = () => {
  const [carouselIndexes, setCarouselIndexes] = useState({});
  const pathname = usePathname();
  const isAdminView = pathname.includes("/adminview");

  // Extract username
  const pathnameParts = pathname.split("/");
  const username = pathnameParts[1] || "";

  // ✅ Use React Query instead of manual fetch
  const { data: projects = [], isLoading, isError, error } = useQuery({
    queryKey: ["publicProjects", username],
    queryFn: async () => {
      const url = `/api/public-portfolio/posts?username=${username}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch public projects");
      }

      // Process projects same as before:
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
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });

  // Carousel slide handler — unchanged
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

  // ✅ Loading and error states
  if (isLoading) {
    return <p className="text-center text-gray-500 font-qimano">Finding your projects...</p>;
  }

  if (isError) {
    return <p className="text-center text-red-500">Error: {error.message}</p>;
  }

  // ✅ Render same as before
  return (
    <div className="w-full mx-auto max-w-[600px] lg:max-w-[1600px] p-0 sm:p-4">
      {projects.length > 0 ? (
        <div className="grid grid-cols-3 gap-[1px] sm:grid-cols-4 sm:gap-2 lg:gap-8">
          {projects.map((project, index) => (
            <div key={index} className="relative w-full aspect-square p-0 sm:p-2">
              <Link
                href={`/${username}/media-kit/post/?postId=${project.mediaId}`}
                className="block w-full h-full"
              >
                <div className="relative w-full h-full group rounded-md overflow-hidden">
                  {project.mediaType === "CAROUSEL_ALBUM" && project.children ? (
                    <>
                      {project.children.map((child, idx) => (
                        <div
                          key={child.mediaId}
                          className={`absolute inset-0 transition-all duration-500 ${
                            (carouselIndexes[project.mediaId] || 0) === idx
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
                            />
                          ) : (
                            <video
                              className="w-full h-full object-cover"
                              src={child.mediaUrl}
                              muted
                              playsInline
                            />
                          )}
                        </div>
                      ))}

                      {project.children.length > 1 && (
                        <div className="absolute z-20 inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) =>
                              handleSlide(
                                e,
                                project.mediaId,
                                "prev",
                                project.children.length
                              )
                            }
                            className="bg-black/50 text-white rounded-full w-6 h-6 ml-1 z-30"
                          >
                            ❮
                          </button>
                          <button
                            onClick={(e) =>
                              handleSlide(
                                e,
                                project.mediaId,
                                "next",
                                project.children.length
                              )
                            }
                            className="bg-black/50 text-white rounded-full w-6 h-6 mr-1 z-30"
                          >
                            ❯
                          </button>
                        </div>
                      )}
                    </>
                  ) : project.mediaType.includes("VIDEO") ||
                    project.mediaType.endsWith(".mp4") ? (
                    <video
                      className="w-full h-full object-cover"
                      src={project.mediaUrl}
                      muted
                      playsInline
                    />
                  ) : (
                    <Image
                      src={project.mediaUrl}
                      alt={`Project ${index + 1}`}
                      fill
                      className="bg-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 z-30">
                    <span className="text-yellow-300 text-center text-decoration-underline text-[21px] font-apfel-grotezk-regular">
                      Post Info & Insights ↗
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 font-qimano">No projects found.</p>
      )}
    </div>
  );
};

export default PortfolioPublic;
