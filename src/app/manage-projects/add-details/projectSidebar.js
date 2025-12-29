"use client";
import React from "react";
import SvgComponent from "@/components/svg/Instagramsvg";
import Uploadsvg from "@/components/svg/Uploadsvg";
import ProjectsGrid from "@/components/ProjectsGrid";

export default function ProjectSidebar({
  activeTab,
  setActiveTab,
  selectionState,
  computedProjects,
  handleProjectClick,
}){
  return (
    <div className="w-[278px] bg-white text-black p-3 rounded-lg">
      {/* Tabs header */}
      <div className="flex justify-between items-center border-b w-[260px] border-light-grey">
        <button
          className={`relative px-4 py-2 text-lg font-medium ${
            activeTab === "instagram"
              ? "text-electric-blue"
              : "text-light-grey"
          }`}
          onClick={() => setActiveTab("instagram")}
        >
          <div className="flex justify-center items-center ml-4 font-apfel-grotezk-regular">
            <SvgComponent
              style={{
                color: activeTab === "instagram" ? "blue" : "",
              }}
            />
            IG
          </div>
          {activeTab === "instagram" && (
            <span className="absolute bottom-[-1px] left-0 w-32 h-[2px] bg-electric-blue"></span>
          )}
        </button>

        <button
          className={`relative px-4 py-2 text-lg font-medium ${
            activeTab === "uploaded"
              ? "text-electric-blue"
              : "text-light-grey"
          }`}
          onClick={() => setActiveTab("uploaded")}
        >
          <div className="flex justify-center items-center font-apfel-grotezk-regular">
            <Uploadsvg
              style={{
                color: activeTab === "uploaded" ? "blue" : "",
                height: "35px",
              }}
            />
            Uploaded
          </div>
          {activeTab === "uploaded" && (
            <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-electric-blue"></span>
          )}
        </button>
      </div>

      {/* Projects list */}
      <div
        className="mt-4 h-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <p className="text-md">Fill details for at least 4 projects</p>
        <p className="text-light-grey text-sm">
          {activeTab === "instagram"
            ? selectionState.instagramSelected.length
            : selectionState.uploadedFiles.length}{" "}
        </p>
        <ProjectsGrid
          projects={computedProjects}
          activeTab={activeTab}
          onProjectClick={handleProjectClick}
          showStatus={true}
        />
      </div>
    </div>
  );
}
