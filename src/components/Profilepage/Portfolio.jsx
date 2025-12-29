"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Tooltip from "@/components/ui/Tooltip";
import { PLAN_TOOLTIPS } from "@/data/planTooltips";

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [carouselIndexes, setCarouselIndexes] = useState({});
  const [mutedStates, setMutedStates] = useState({});
  const [plan, setPlan] = useState(null);

  /* ---------------- FETCH PROJECTS ---------------- */
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects/all-projects");
        const data = await res.json();

        if (data.success) {
          const processed = [
            ...data.instagram.map((item) => {
              if (item.name === "CAROUSEL_ALBUM" && item.children?.length) {
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
          setProjects(processed);
        }
      } catch (err) {
        console.error("Error fetching projects", err);
      }
    }
    fetchProjects();
  }, []);

  /* ---------------- FETCH PLAN ---------------- */
  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch("/api/user/limits");
        const data = await res.json();
        setPlan(data.plan);
      } catch (err) {
        console.error("Failed to fetch plan", err);
      }
    }
    fetchPlan();
  }, []);

  const handleSlide = (e, mediaId, direction, total) => {
    e.preventDefault();
    e.stopPropagation();
    setCarouselIndexes((prev) => {
      const current = prev[mediaId] || 0;
      return {
        ...prev,
        [mediaId]:
          direction === "next"
            ? (current + 1) % total
            : current === 0
            ? total - 1
            : current - 1,
      };
    });
  };

  const isFreePlan = plan === "free";
  const tooltip = PLAN_TOOLTIPS[plan] || PLAN_TOOLTIPS.free;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-5xl p-6 overflow-y-auto max-h-[85vh]" style={{ maxHeight: 'calc(85vh - 96px)', scrollbarWidth: 'none', }}>
        {projects.length ? (
          <div className="grid grid-cols-3 gap-8">
            {projects.map((project, index) => {
              const isLocked =
                isFreePlan && projects.length > 8 && index >= 8;
              const activeImageId = project.mediaId;

              const Media = (
                <div className="relative w-[165px] h-[210px] rounded-md overflow-hidden">
                  {/* MEDIA */}
                  {project.mediaType === "CAROUSEL_ALBUM" &&
                  project.children ? (
                    <>
                      {project.children.map((child, idx) => (
                        <div
                          key={child.mediaId}
                          className={`absolute inset-0 transition-opacity duration-300 ${
                            (carouselIndexes[project.mediaId] || 0) === idx
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        >
                          {child.mediaType === "IMAGE" ? (
                            <Image
                              src={child.mediaUrl}
                              alt="media"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <video
                              src={child.mediaUrl}
                              muted
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}

                      {project.children.length > 1 && !isLocked && (
                        <div className="absolute inset-0 z-20 flex items-center justify-between px-1">
                          <button
                            onClick={(e) =>
                              handleSlide(
                                e,
                                project.mediaId,
                                "prev",
                                project.children.length
                              )
                            }
                            className="bg-black/60 text-white rounded-full w-6 h-6"
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
                            className="bg-black/60 text-white rounded-full w-6 h-6"
                          >
                            ❯
                          </button>
                        </div>
                      )}
                    </>
                  ) : project.mediaType?.includes("VIDEO") ||
                    project.mediaType?.endsWith(".mp4") ? (
                    <video
                      src={project.mediaUrl}
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={project.mediaUrl}
                      alt="project"
                      fill
                      className="object-cover"
                    />
                  )}

                  {/* 🔒 LOCK OVERLAY */}
                  {isLocked && (
                    <div className="absolute inset-0 z-30 bg-[#212121]/80 backdrop-blur-sm flex flex-col items-center justify-center text-center px-4">
                      <Tooltip body={tooltip?.body} placement="top">
                        <Image
                          src="/assets/images/pro-yellow.svg"
                          width={20}
                          height={20}
                          alt="Pro required"
                          className="cursor-pointer"
                        />
                      </Tooltip>
                      <p className="mt-3 text-sm text-white leading-snug font-apfel-grotezk-regular">
                       Your trial has ended. Upgrade to showcase all posts in your press kit.
                      </p>
                    </div>
                  )}
                </div>
              );

              return  (
                <Link
                  key={index}
                  href={`/manage-projects/preview?activeImageId=${activeImageId}`}
                  className="p-2"
                >
                  {Media}
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 font-qimano">
            Finding your projects...
          </p>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
