"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PLAN_TOOLTIPS } from "@/data/planTooltips";
import Tooltip from "@/components/ui/Tooltip";

const ProjectsGrid = ({
  projects,
  activeTab,
  onProjectClick,
  showStatus = true,
  containerClassName = "grid grid-cols-2 gap-2 mt-4 overflow-y-scroll overflow-x-hidden max-h-[45vh] 5xl:max-h-[55vh]",
}) => {
  const [carouselIndexes, setCarouselIndexes] = useState({});
  // Mapping status to custom styling
  const statusStyles = {
    Done: "bg-[#e9e9e9] text-electric-blue",
    Editing: "bg-electric-blue text-white",
    Draft: "bg-[#e9e9e9] text-red-500",
    Selected: "bg-electric-blue text-white",
  };
    const [limits, setLimits] = useState(null);   
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function load() {
          try {
            const res = await fetch("/api/user/limits");
            const data = await res.json();
            console.log("Fetched plan and limits:", data);
    
            setLimits(data);
          } catch (err) {
            console.error("Error fetching plan:", err);
          } finally {
            setLoading(false);
          }
        }
    
        load();
    }, [])
    if (!limits || limits.error) return <p></p>;
  
    const { plan } = limits;
    const isProPlan = plan === "pro" || plan === "early_bird" || plan === "trial";
    const tooltip = PLAN_TOOLTIPS.number_of_projects[plan] ?? PLAN_TOOLTIPS.number_of_projects.free;

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

  return (
    <div className={containerClassName} style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
     {projects.map((project, index) => {
    const isFreeUser = !isProPlan;
    const isBeyondFreeLimit = index >= 8;
    const isLocked = isFreeUser && isBeyondFreeLimit;

  return (
    <div
      key={project.mediaId || index}
      className="flex justify-center items-center cursor-pointer"
      onClick={() => {
        if (isLocked) {
          // optional: open upgrade modal instead of doing nothing
          openUpgradeModal?.();
          return;
        }
        onProjectClick?.(project.mediaId || index);
      }}
    >
      <div className="w-[200px] h-[150px] rounded-md relative">
        {/* 🔒 LOCK OVERLAY — FREE USERS AFTER 8 */}
        {isLocked && (
          <div className="absolute inset-0 z-30 bg-[#212121]/80 backdrop-blur-sm
            flex flex-col items-center justify-center text-center px-3 rounded-md">

            <div className="relative group cursor-pointer mb-20">
              <Image
                src="/assets/images/pro-yellow.svg"
                width={16}
                height={16}
                alt="Upgrade required"
              />

              <div
                className="absolute top-6 left-1/2 -translate-x-1/2
                text-white text-[12px] px-1 py-1 w-28 
                 tracking-wide"
              >
                Your trial has ended, upgrade to showcase all posts in your press kit.
              </div>
            </div>
          </div>
        )}

        {/* 🏷️ PRO BADGE — PRO USERS ONLY (optional) */}
        {isProPlan && index >= 8 && (
          <div className="absolute top-2 right-2 z-20">
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-smoke">
               <Tooltip body={tooltip.body} placement="bottom">
              <Image
                src="/assets/images/pro-grey.svg"
                width={13}
                height={13}
                alt="pro"
              />
              </Tooltip>
            </div>
          </div>
        )}

        {/* 🎥 MEDIA RENDERING */}
        {project.name === "VIDEO" ? (
          <video
            src={project.mediaLink || project.fileUrl}
            className="object-cover w-full h-full rounded-md"
          />
        ) : project.name === "CAROUSEL_ALBUM" && project.children ? (
          <div className="relative w-full h-full">
            {project.children.map((child, childIndex) => (
              <div
                key={child.id}
                className={`absolute inset-0 transition-transform duration-500 ${
                  (carouselIndexes[project.mediaId] || 0) === childIndex
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
                }`}
              >
                {child.media_type === "IMAGE" ? (
                  <Image
                    src={child.media_url}
                    alt=""
                    fill
                    className="object-cover rounded-md"
                  />
                ) : (
                  <video
                    className="w-full h-full object-cover rounded-md"
                    src={child.media_url}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <Image
            src={project.mediaLink || project.fileUrl}
            alt=""
            fill
            className="object-cover rounded-md"
          />
        )}

        {/* 📌 STATUS BAR */}
        {showStatus && (
          <div
            className={`absolute bottom-0 left-0 right-0 flex items-center justify-center
            text-sm py-1 rounded-b-md font-apfel-grotezk-regular
            ${statusStyles[project.status]}`}
          >
            <Image
              src={
                project.status === "Done"
                  ? "/assets/images/okayblue.svg"
                  : project.status === "Editing"
                  ? "/assets/images/write.svg"
                  : project.status === "Selected"
                  ? "/assets/images/okay.svg"
                  : "/assets/images/redwrite.svg"
              }
              alt={project.status}
              width={12}
              height={12}
              className="mr-2"
            />
            {project.status}
          </div>
        )}
      </div>
    </div>
  );
})}

    </div>
  );
};

export default ProjectsGrid;
