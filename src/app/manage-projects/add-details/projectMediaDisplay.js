"use client";
import React from "react";
import Image from "next/image";

const ProjectMediaDisplay = ({
  activeTab,
  activeProject,
  activeImageId,
  projects,
  insights,
  isPortrait,
  setIsPortrait,
  carouselIndexes,
  handleSlide,
  checkOrientation,
}) => {
  return (
    <div className="w-[258px] ml-16 mt-0 relative">
      {/* Media and Insights Container */}
      <div className="3xl:w-[250px] w-[80%] h-auto overflow-hidden rounded-lg flex items-center">
        <div className="w-full rounded-lg overflow-hidden">
          {/* Media Display */}
          {(activeImageId !== null || projects.length > 0) &&
            (() => {
              if (!activeProject) {
                return (
                  <p className="text-graphite flex justify-center items-center h-full">
                    No project selected
                  </p>
                );
              }

              // 📸 Image post
              if (activeProject.name === "IMAGE") {
                return (
                  <Image
                    src={activeProject.mediaLink}
                    alt={activeProject.name}
                    width={1080}
                    height={1080}
                    className={`w-full ${
                      isPortrait ? "aspect-[4/6]" : "h-auto"
                    } object-cover rounded-lg`}
                    onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                      setIsPortrait(checkOrientation(naturalWidth, naturalHeight));
                    }}
                  />
                );
              }

              // 🎥 Video post
              if (activeProject.name === "VIDEO") {
                return (
                  <video
                    src={activeProject.mediaLink}
                    controls
                    disablePictureInPicture
                    controlsList="nofullscreen nodownload noplaybackrate noremoteplayback"
                    className={`w-full ${
                      isPortrait ? "aspect-[4/6]" : "h-auto"
                    } object-cover rounded-lg`}
                    onLoadedMetadata={(e) => {
                      setIsPortrait(
                        checkOrientation(e.target.videoWidth, e.target.videoHeight)
                      );
                    }}
                  />
                );
              }

              // 📸 Carousel post
              if (activeProject.name === "CAROUSEL_ALBUM") {
                return (
                  <div className="relative w-full aspect-[4/6]">
                    {activeProject.children.map((child, index) => (
                      <div
                        key={child.id}
                        className={`absolute inset-0 transition-opacity duration-500 ${
                          (carouselIndexes[activeProject.mediaId] || 0) === index
                            ? "opacity-100 z-0"
                            : "opacity-0 z-0"
                        }`}
                      >
                        {child.media_type === "IMAGE" ? (
                          <Image
                            src={child.media_url}
                            alt={`Media ${child.id}`}
                            fill
                            className="object-cover rounded-lg"
                            onLoadingComplete={({ naturalWidth, naturalHeight }) =>
                              setIsPortrait(checkOrientation(naturalWidth, naturalHeight))
                            }
                          />
                        ) : (
                          <video
                            src={child.media_url}
                            controls
                            disablePictureInPicture
                            controlsList="nofullscreen nodownload noplaybackrate noremoteplayback"
                            className="w-full h-full object-cover rounded-lg"
                            onLoadedMetadata={(e) =>
                              setIsPortrait(
                                checkOrientation(e.target.videoWidth, e.target.videoHeight)
                              )
                            }
                          />
                        )}

                        {/* Carousel navigation */}
                        {activeProject.children.length > 1 && (
                          <>
                            <button
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-6 h-6 flex justify-center items-center"
                              onClick={() =>
                                handleSlide(
                                  activeProject.mediaId,
                                  "prev",
                                  activeProject.children.length
                                )
                              }
                            >
                              ❮
                            </button>
                            <button
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-6 h-6 flex justify-center items-center"
                              onClick={() =>
                                handleSlide(
                                  activeProject.mediaId,
                                  "next",
                                  activeProject.children.length
                                )
                              }
                            >
                              ❯
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                );
              }

              // 📁 Uploaded file (not Instagram)
              if (activeProject.fileUrl) {
                const isImage = activeProject.fileUrl.match(/\.(jpeg|jpg|gif|png)$/);
                return (
                  <div className="w-full rounded-lg overflow-hidden">
                    {isImage ? (
                      <Image
                        src={activeProject.fileUrl}
                        alt={activeProject.fileName}
                        width={1080}
                        height={1080}
                        className={`w-full ${
                          isPortrait ? "aspect-[4/6]" : "h-auto"
                        } object-cover`}
                        onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                          setIsPortrait(checkOrientation(naturalWidth, naturalHeight));
                        }}
                      />
                    ) : (
                      <video
                        src={activeProject.fileUrl}
                        controls
                        className={`w-full ${
                          isPortrait ? "aspect-[4/6]" : "h-auto"
                        } object-cover rounded-lg`}
                        onLoadedMetadata={(e) =>
                          setIsPortrait(
                            checkOrientation(e.target.videoWidth, e.target.videoHeight)
                          )
                        }
                      />
                    )}
                  </div>
                );
              }

              return null;
            })()}
        </div>
      </div>

      {/* 📊 Insights Section */}
      {activeTab === "instagram" && insights && insights.length > 0 && (
        <div className="bg-white rounded-lg mt-2 p-4 flex gap-4 justify-center text-black">
          {insights.map((item) => (
            <div key={item.name} className="flex-col text-center">
              <p className="text-[19px]">{item.values[0]?.value || 0}</p>
              <p className="text-[12px] text-gray-500">{item.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectMediaDisplay;
