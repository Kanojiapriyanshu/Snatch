"use client"
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSelectedProjects } from "../context";
import ProjectsGrid from "@/components/ProjectsGrid";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchMediaInsights } from "@/utils/fetchMediaInsights";
import Popup from "@/components/Popup";
import Uploadsvg from "@/components/svg/Uploadsvg";
import SvgComponent from "@/components/svg/Instagramsvg";

 function PreviewContent() {
  const {
    selectionState,
    handleFileUpload,
    updateFormDataForImage,
    isBrandCollaboration,
    setIsBrandCollaboration
  } = useSelectedProjects();
  const [carouselIndexes, setCarouselIndexes] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [insights, setInsights] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeImageId = searchParams.get("activeImageId");
  const initialTab = searchParams.get("tab") || "instagram";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const isBrandCollaboration = searchParams.get('isBrandCollaboration');

  const requiredFields = ["titleName", "description", "industries"];
  // Add these near the top of PreviewContent function
  const [isPortrait, setIsPortrait] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [status, setStatus] = useState("idle"); 
  const checkOrientation = (width, height) => {
    return height > width;
  };

  const handleSubmit = () => {
      if (filledProjectsCount < 4) {
        setPopupMessage(
          "Your portfolio needs at least 4 project details to be created. Don't worry, your progress is saved, and you can come back anytime to finish."
        );
      } else {
        setPopupMessage(""); // Use default message in Popup
      }
        setIsModalOpen(true);

  };

  const handleContinueEditing = () => {
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNextStep = () => {
  setIsModalOpen(false);
  setStatus("loading"); // button shows loading state immediately

  // Collect all filled project mediaIds
  const filledProjectIds = [
    ...(selectionState.instagramSelected || []),
    ...(selectionState.uploadedFiles || [])
  ]
    .filter(project => {
      const formData = Array.isArray(selectionState.formData)
        ? selectionState.formData.find(item => String(item.key) === String(project.mediaId))
        : null;
      return isProjectFilled(formData);
    })
    .map(project => project.mediaId);

  console.log("SENDING FILLED PROJECT IDS TO SAVE all", filledProjectIds);

  const finalSubmit = async () => {
    try {
      const response = await fetch("/api/projects/final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaIds: filledProjectIds })
      });

      if (!response.ok) throw new Error("Failed to save projects");

      // setStatus("success"); 

      if (filledProjectsCount < 4) {
        router.push("/profile?incompleteProjects=1");
      } else {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error saving projects:", error);
      setStatus("error"); 
    }
  };

  finalSubmit();
};

  const projects = activeTab === "instagram"
  ? selectionState.instagramSelected
  : selectionState.uploadedFiles;

  console.log("CURRENT PROJECTS", projects)
   
const activeProject =
  activeImageId !== null
    ? projects.find((project) => String(project.mediaId) === String(activeImageId))
    : projects[0];

    // Update useEffect to set initial index when activeProject changes
useEffect(() => {
  if (activeProject) {
    const index = projects.findIndex(
      (project) => String(project.mediaId) === String(activeProject.mediaId)
    );
    setCurrentIndex(index >= 0 ? index : 0);
  }
}, [activeProject, projects]);


console.log("preview activeimageid", activeProject,  activeImageId);

  useEffect(() => {
    setIsHydrated(true);
  }, []);


 // Compute status for each project
  const getProjectStatus = (project) => {
    if (activeProject && String(project.mediaId) === String(activeProject.mediaId)) {
      return "Selected";
    }
    const formEntry = selectionState.formData.find(
      (item) => String(item.key) === String(project.mediaId)
    );
    if (formEntry) {
      const isComplete = requiredFields.every((field) => !!formEntry[field]);
      return isComplete ? "Done" : "Draft";
    }
    return "Draft";
  };

  const computedProjects = projects.map((project) => ({
    ...project,
    status: getProjectStatus(project),
  }));

    // Fetch insights whenever the active project changes
 // Modify the existing useEffect for insights
    useEffect(() => {
      const fetchInsights = async () => {
        // Only fetch insights for Instagram content
        if (activeProject && activeTab === "instagram") {
          const response = await fetchMediaInsights(activeProject.mediaId);
          setInsights(response?.data || []);
        } else {
          // Clear insights for uploaded files
          setInsights([]);
        }
      };

      fetchInsights();
    }, [activeProject, activeTab]);

  if (!isHydrated) {
    return null;
  }

  const handleProjectClick = (projectId) => {
    // Update the URL with the new activeImageId
    router.push(`/manage-projects/preview?activeImageId=${projectId}`);
  };

  const handleSlide = (mediaId, direction, totalSlides) => {
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

  
  const handleBackClick = () => {
   router.push("/manage-projects/add-details")
  }

  // Add these navigation functions
const handlePrevious = () => {
  const newIndex = currentIndex > 0 ? currentIndex - 1 : projects.length - 1;
  const prevProject = projects[newIndex];
  if (prevProject) {
    router.push(`/manage-projects/preview/?activeImageId=${prevProject.mediaId}`);
    setCurrentIndex(newIndex);
  }
};

const handleNext = () => {
  const newIndex = currentIndex < projects.length - 1 ? currentIndex + 1 : 0;
  const nextProject = projects[newIndex];
  if (nextProject) {
    router.push(`/manage-projects/preview/?activeImageId=${nextProject.mediaId}`);
    setCurrentIndex(newIndex);
  }
};

// Helper to check if a project is "filled"
const isProjectFilled = (formData) => {
  if (!formData) return false;
  const baseFields = ["titleName", "description", "industries"];
  const companyFields = ["companyName", "companyLocation"];
  const fieldsToCheck = [...baseFields];
  if (formData.isBrandCollaboration) fieldsToCheck.push(...companyFields);
  return fieldsToCheck.every((field) => {
    const value = formData[field];
    return value && (Array.isArray(value) ? value.length > 0 : value.trim() !== "");
  });
};

// Count filled projects (Instagram + Uploaded)
const filledProjectsCount = (() => {
  const allProjects = [
    ...(selectionState.instagramSelected || []),
    ...(selectionState.uploadedFiles || []),
  ];
  return allProjects.filter((project) => {
    const formData = Array.isArray(selectionState.formData)
      ? selectionState.formData.find((item) => String(item.key) === String(project.mediaId))
      : null;
    return isProjectFilled(formData);
  }).length;
})();

const handleHamburgerClick = () => {
    setIsMenuVisible((prev) => !prev); // Toggle menu visibility
  };


  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleNextClick = () => {
    router.push("/manage-projects/pick-projects");
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
  }

  const handleSettingClick = () => {
   router.push("/settings")
  }

  return (
    <div className={`flex flex-col items-start h-[77vh] w-full space-x-8 overflow-x-hidden overflow-y-auto ${isModalOpen ? 'bg-transparent pointer-events-none' : 'bg-transparent'}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="flex flex-col mx-auto items-start">
        <p className="text-2xl text-black font-qimano">
        Pick at least 4 posts that wish to highlight in your press kit.
        </p>
        <p className="mx-auto h-7 text-black font-apfel-grotezk-regular">
          
        </p>
      </div>

      <div className="flex justify-center 7xl:min-w-[93%] mx-auto">
        
      <div className="flex flex-row font-apfel-grotezk-regular">
      <div className="w-[278px] bg-white text-black p-3 rounded-lg 5xl:h-[700px]">
          <div className="flex justify-between items-center border-b w-[260px]  border-light-grey">
            <button
              className={`relative px-4 py-2 text-lg font-medium ${
                activeTab === "instagram" ? "text-electric-blue" : "text-light-grey"
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
                activeTab === "uploaded" ? "text-electric-blue" : "text-light-grey"
              }`}
              onClick={() => setActiveTab("uploaded")}
            >
             <div className="flex justify-center items-center font-apfel-grotezk-regular">
             <Uploadsvg
            style={{
              color: activeTab === "upload" ? "blue" : "", height: "35px"
            }}
          />  
              Uploaded
              </div>
              {activeTab === "uploaded" && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-electric-blue"></span>
              )}
            </button>
          </div>

          <div className="mt-4 h-full  " style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} >
            <p className="text-md">Selected Projects</p>
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

        {/* Fixed dimensions preview card */}
        <div className="w-[864px] h-[430px] p-2 bg-white ml-28 mt-1 rounded-lg flex flex-col">
          <div className="flex gap-5 h-full">
           <div className="w-[300px] h-full pl-5 pt-5">

            <div className={`w-[250px] ${isPortrait ? 'aspect-[4/6]' : 'h-auto'} overflow-hidden rounded-lg flex items-center`}>
                   {activeImageId !== null && (
                (() => {
                  const activeProject = projects.find(
                    (project) => String(project.mediaId) === activeImageId
                  );
            
                  if (!activeProject) {
                    return <p className="text-graphite flex justify-center items-center h-[50vh]">No project selected</p>;
                  }

                  if (activeProject.name === "IMAGE") {
                    return (
                      <div className="relative w-[300px]">
                        <Image
                          src={activeProject.mediaLink}
                          alt={activeProject.name}
                          width={300}
                          height={1200}
                          className={`w-full ${isPortrait ? 'aspect-[4/6]' : 'h-auto'} object-cover rounded-lg`}
                          onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                            setIsPortrait(checkOrientation(naturalWidth, naturalHeight));
                          }}
                        />
                      </div>
                    );
                  }  if (activeProject.name === "VIDEO") {
                    return (
                      <div className="relative p-0 w-[300px]">
                        <video
                          src={activeProject.mediaLink}
                          controls
                          width={300}
                          height={1200}
                          className={`w-full ${isPortrait ? 'aspect-[4/6]' : 'h-auto'} object-cover rounded-lg`}
                          onLoadedMetadata={(e) => {
                            setIsPortrait(checkOrientation(e.target.videoWidth, e.target.videoHeight));
                          }}
                        />
                      </div>
                    );
                  } // Replace the CAROUSEL_ALBUM case with:

              if (activeProject.name === "CAROUSEL_ALBUM") {
              return (
                <div className="relative w-full aspect-[4/6]"> {/* Set container ratio */}
                  {activeProject.children.map((child, index) => (
                    <div
                      key={child.id}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        (carouselIndexes[activeProject.mediaId] || 0) === index
                          ? "opacity-100 z-10"
                          : "opacity-0 z-0"
                      }`}
                    >
                      {child.media_type === "IMAGE" ? (
                        <Image
                          src={child.media_url}
                          alt={`Media ${child.id}`}
                          fill
                          className="object-cover rounded-lg"
                          onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                            setIsPortrait(checkOrientation(naturalWidth, naturalHeight));
                          }}
                        />
                      ) : (
                        <video
                          src={child.media_url}
                          controls
                          className="w-full h-full object-cover rounded-lg"
                          onLoadedMetadata={(e) => {
                            setIsPortrait(
                              checkOrientation(
                                e.target.videoWidth,
                                e.target.videoHeight
                              )
                            );
                          }}
                        />
                      )}
      
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
            }else if (activeProject.fileUrl) {
                                        return (
                                          <div className="relative h-auto p-0 w-[300px]">
                                            {activeProject.fileUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                              <Image
                                                src={activeProject.fileUrl}
                                                alt={activeProject.fileName}
                                                width={200}
                                                height={150}
                                                className={`w-full ${isPortrait ? 'aspect-[4/6]' : 'h-auto'} object-cover rounded-lg`}
                                                onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                                                  setIsPortrait(checkOrientation(naturalWidth, naturalHeight));
                                                }}
                                              />
                                            ) : (
                                              <video
                                                src={activeProject.fileUrl}
                                                controls
                                                width={200}
                                                height={150}
                                                className={`w-full ${isPortrait ? 'aspect-[4/6]' : 'h-auto'} object-cover rounded-lg`}
                                                onLoadedMetadata={(e) => {
                                                  setIsPortrait(checkOrientation(e.target.videoWidth, e.target.videoHeight));
                                                }}
                                              >
                                                Your browser does not support the video tag.
                                              </video>
                                            )}
                                          </div>
                                        );
                                      }
            
                  return null;
                })()
              )}
              </div>

      
           </div>

           {/* Fixed content area with consistent structure */}
           <div className="flex-1 h-full mt-5 flex flex-col">
            <div className="flex justify-between items-center min-h-[32px]">
              <p className="text-2xl text-graphite font-qimano">
                {(() => {
                  // Find the form data for the active project
                  const formData = Array.isArray(selectionState?.formData)
                    ? selectionState.formData.find(item => String(item.key) === String(activeImageId))
                    : null;

                  // If we have form data, show the title
                  if (formData?.titleName) {
                    return formData.titleName;
                  }

                  // If no form data or no title, show placeholder
                  return "Title of the project";
                })()}
              </p>
              <Image
              src="/assets/images/edit-pencil.svg" // Your SVG file path
              alt="Edit"
              width={20}
              height={20}
              className="w-10 h-7 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() =>
                router.push(`/manage-projects/add-details?activeImageId=${activeImageId}&tab=${activeTab}`)
              }
            />
            </div>

            {/* Fixed height industries section */}
            <div className="flex gap-1 flex-wrap max-w-xl mr-10 h-[40px] items-start">
              {Array.isArray(selectionState?.formData) &&
                selectionState.formData.find((item) => item.key === activeImageId)?.industries?.length > 0 ? (
                  selectionState.formData
                    .find((item) => item.key === activeImageId)
                    ?.industries.map((industry, index) => (
                      <span
                        key={index}
                        className="bg-[#0037EB]/5 text-graphite my-2 inline-block rounded border border-transparent py-1 px-2.5 text-xs font-medium"
                      >
                        {industry}
                      </span>
                    ))
                ) : (
                  <span>Industry</span>
                )}
            </div>

          {/* Fixed position horizontal line */}
          <div className="w-full border-b-[0.5px] border-gray-300 mt-2"></div>

          {/* Fixed height brand collaboration section */}
          <div className="min-h-[60px] flex items-start mt-4">
            <div className="pointer-events-auto">
                {isModalOpen && (
                  <Popup onClose={handleCloseModal} onContinueEditing={handleCloseModal} onNextStep={handleNextStep}  message={popupMessage} />
                )}
            </div> 

            {Array.isArray(selectionState?.formData) && (() => {
            const selectedItem = selectionState.formData.find(item => item.key === activeImageId);
            if (!selectedItem?.isBrandCollaboration) return null;

            // Only render the section if there's at least one piece of brand collaboration data
            const hasAnyBrandData = selectedItem.companyLogo || 
                                   selectedItem.companyName || 
                                   selectedItem.eventName ||
                                   selectedItem.companyLocation || 
                                   (selectedItem.eventTypes?.length > 0);

            if (!hasAnyBrandData) return null;

            return (
              <div className="brand-collaboration-section flex gap-3">
                {/* Logo section with conditional rendering */}
                {selectedItem.isBrandCollaboration && (
                  <>
                    <Image
                      src={selectedItem.companyLogo || "/assets/images/logo.svg"} // Default logo if no company logo
                      width={50}
                      height={50}
                      alt={selectedItem.companyLogo ? "Company Logo" : "Default Logo"}
                      className="h-12 w-12 bg-cover rounded-full"
                    />
                    {/* Only show divider if we have both logo and other details */}
                    {(selectedItem.companyName || selectedItem.companyLocation || selectedItem.eventTypes?.length > 0) && (
                      <div className="h-12 border-l border-gray-400"></div>
                    )}
                  </>
                )}

                {/* Rest of the brand collaboration content */}
                {(selectedItem.companyName || selectedItem.companyLocation || selectedItem.eventTypes?.length > 0) && (
                  <div className="text-gray-500 text-sm space-y-1">
                    {/* Company name and location line */}
                    {(selectedItem.companyName || selectedItem.companyLocation) && (
                      <p>
                        {selectedItem.companyName && (
                          <> <span className="text-graphite">{selectedItem.companyName}</span></>
                        )}
                        {selectedItem.companyLocation && (
                          <> • {selectedItem.companyLocation}</>
                        )}
                      </p>
                    )}

                    <div className="flex gap-2">
                    {/* Event name line */}
                    {selectedItem.eventName && (
                      <p> <span className="text-graphite">{selectedItem.eventName}</span></p>
                    )}

                    {/* Event types line */}
                    {selectedItem.eventTypes?.length > 0 && (
                      <p className="">
                        {selectedItem.eventTypes.map((eventType, index) => (
                          <span key={index} className="px-1 -ml-2 text-sm">
                            {index > 0 ? " | " : " • "}{eventType}
                          </span>
                        ))}
                      </p>
                    )}
                      </div>
                  </div>
                )}
              </div>
            );
          })()}
          </div>

          {/* Fixed height description section */}
          <div className="flex-1 flex flex-col justify-between min-h-[120px]">
            <div className="flex-1">
              {Array.isArray(selectionState?.formData) && (() => {
                const selectedItem = selectionState.formData.find(item => item.key === activeImageId);
                return (
                  <p className="text-graphite mr-3 mt-2">
                    {selectedItem?.description || "Description of the project"}
                  </p>
                );
              })()}
            </div>

            {/* Fixed position second horizontal line */}
            {activeTab === "instagram" && (
              <div className="w-full border-b-[0.5px] border-gray-300 mt-4"></div>
            )}

            {/* Fixed position insights section at bottom */}
            {activeTab === "instagram" && (
              <div className="mt-3 pb-2">
                {insights && insights.length > 0 ? (
                  <div className="flex justify-between text-graphite w-full max-w-[500px]">
                    {insights.map((item) => (
                      <div
                        key={item.name}
                        className="flex flex-col items-center min-w-[40px] text-center"
                      >
                        <div className="text-[22px] leading-none font-qimano text-graphite">
                          {item.values[0]?.value ?? 0}
                        </div>
                        <div className="text-[12px] text-gray-500 font-apfel-grotezk-regular mt-1">
                          {item.title}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[40px]"></div> // Placeholder to maintain spacing
                )}
              </div>
            )}
          </div>

           </div>           
            
          </div>
        </div>

<div className="fixed bottom-4 left-1/2 transform -translate-x-1/2  bg-white rounded-lg w-[823px] h-[74px] px-4 py-1.5 shadow-lg z-50 ">
  <div className="flex items-center gap-[9px] w-full h-full">
    {/* Logo + Hamburger */}
          <div className="flex w-[175px] h-[56px] gap-[8px] items-center ">
               <button onClick={handleNextClick} className="w-[105px] h-[56px]  text-electric-blue text-2xl font-semibold  text-center px-2">
                           <Image 
                            src="/assets/images/snatch.svg"
                            width={40}
                            height={40}
                            alt="snatchlogo"
                            className=" w-32 h-10"
                          />
                        </button>
                <button
                      onClick={handleHamburgerClick}
                      className="w-[61px] h-[56px]  text-electric-blue bg-gray-100  rounded-md mx-auto font-medium hover:bg-transparent relative"
                    >
                      <Image
                        className="mx-auto w-8"
                        src="/assets/icons/onboarding/Hamburger.svg"
                        alt="hamburger"
                        width={20}
                        height={20}
                      />
              </button>
          </div>

          {/* Dropdown Menu */}
                {isMenuVisible && (
                  <div className="absolute top-[-220%] left-[13%] w-[200px] bg-white shadow-lg rounded-md border border-light-grey z-50 font-apfel-grotezk-regular">
                    <ul className="flex flex-col p-3 gap-2">
                      <li
                        onClick={handleDashboardClick}
                        className="cursor-pointer text-electric-blue hover:bg-gray-100 rounded-md p-2"
                      >
                        Dashboard
                      </li>
                      <li
                        onClick={handleSettingClick}
                        className="cursor-pointer text-electric-blue hover:bg-gray-100 rounded-md p-2"
                      >
                        Settings
                      </li>
                      <li
                        onClick={handleProfileClick}
                        className="cursor-pointer text-electric-blue hover:bg-gray-100 rounded-md p-2"
                      >
                        Profile
                      </li>
                    </ul>
                  </div>
                )}

        <div className="flex justify-start items-start">
            <button
          className="px-2 py-1.5 w-[149px] h-[38px] text-electric-blue rounded hover:opacity-80 transition-colors underline underline-offset-4 flex items-center justify-between"
          onClick={handlePrevious}
          disabled={projects.length <= 1}
        >
           <Image
            src="/assets/images/projectsLeftarrow.svg"
            alt="back arrow"
            width={14}
            height={14}
            className="w-[14px] h-[14px]"
          />
          <span className="text-md">Previous Project</span>
        </button>
        
            <button
                className="px-2 py-1.5 w-[119px] h-[38px] flex items-center justify-between text-electric-blue rounded hover:opacity-80 transition-colors underline underline-offset-4"
                onClick={handleNext}
                disabled={projects.length <= 1}
              >
                  <span className="text-md">Next Project</span>
                   <Image
                          src="/assets/images/projectRightarrow.svg"
                          alt="back arrow"
                          width={14}
                          height={14}
                          className="w-[14px] h-[14px]"
                  />
              </button>
        </div>

    {/* Right Buttons: Previous Step + See Previews */} 
    <div className="bg-gray-100 px-2 py-2 h-[56px] rounded-lg flex justify-between items-start gap-[8px]">
        <button className="px-2 h-[38px] border-electric-blue border-[1px] text-electric-blue rounded-lg hover:bg-electric-blue hover:text-white transition-colors" onClick={handleBackClick}>
        Previous Step
      </button>
    <button
  className={`
    px-3 h-[38px] rounded-lg text-md transition-colors
    ${
      status === "loading"
        ? "bg-electric-blue text-white cursor-not-allowed"
        : status === "success"
        ? "bg-green-600 text-white"
        : status === "error"
        ? "bg-red-600 text-white"
        : "bg-electric-blue text-white hover:bg-blue-700"
    }
  `}
  onClick={handleNextStep}
  disabled={status === "loading"} // prevent multiple clicks
>
  {status === "loading"
    ? "Completing..."
    : status === "success"
    ? "Completed ✅"
    : status === "error"
    ? "Retry ❌"
    : "Complete Project Details"}
</button>

    </div>

  </div>
</div>
       
      </div>
      </div>
    </div>
  );
}



export default function Preview() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreviewContent />
    </Suspense>
  );
}