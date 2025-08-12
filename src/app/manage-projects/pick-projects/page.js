"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { fetchInstagramMedia } from "@/utils/fetchInstagramMedia";
import { getMediaFromDatabase } from "@/utils/getMediaFromDatabase";
import MediaDisplay from "@/components/MediaDisplay";
import { useSelectedProjects } from "../context";
import { useRouter } from "next/navigation";
import SvgComponent from "@/components/svg/Instagramsvg";
import Uploadsvg from "@/components/svg/Uploadsvg";

export default function PickProjects() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedTab, setSelectedTab] = useState("instagram");
  const [carouselIndexes, setCarouselIndexes] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 20;
  const router = useRouter();
  const [media, setMedia] = useState([]);
  const { 
    selectionState, 
    handleFileUpload, 
    addInstagramSelection,
    removeInstagramSelection, 
    removeFile
  } = useSelectedProjects();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [paging, setPaging] = useState(null);
const [isLoadingMore, setIsLoadingMore] = useState(false);

  
  useEffect(() => {
    setIsHydrated(true);
  }, []);


  useEffect(() => {
    const fetchMedia = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get("code");

      try {
        if (code) {
           const { media: mediaData, paging } = await fetchInstagramMedia(code);
            setMedia(mediaData);
            setPaging(paging);
        } else {
          // Call the server action to fetch media from the database have token and fetch posts from graph api
          const mediaData = await getMediaFromDatabase();
          console.log("media from database", mediaData)
          setMedia(mediaData);
        }
      } catch (error) {
        alert(error.message || "An error occurred while fetching media");
      }
    };

    fetchMedia();
  }, []); 

  if (!isHydrated) {
    return null;
  }


const handlePrev = () => {
  setCurrentPage((prev) => Math.max(prev - 1, 0));
};

const handleNext = async () => {
  // If next page is already loaded, just go to it
  if (mediaPages[currentPage + 1]) {
    setCurrentPage((prev) => prev + 1);
    return;
  }
  // If not loaded but more data exists, fetch next page
  if (paging?.next && paging?.cursors?.after) {
    setIsLoadingMore(true);
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");
    try {
      const { media: moreMedia, paging: newPaging } = await fetchInstagramMedia(code, paging.cursors.after);
      setMedia(prev => [...prev, ...moreMedia]);
      setPaging(newPaging);
      setCurrentPage((prev) => prev + 1);
    } catch (error) {
      alert(error.message || "Failed to load more media");
    } finally {
      setIsLoadingMore(false);
    }
  }
};

  const handleTabClick = (tab) => setSelectedTab(tab);

  
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


    // Handle file selection and upload (No SVG to base64 conversion here)
    const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        if (file) {
          handleFileUpload(file); 
        }
      });
    };

    const handleProjectClick = () => {

    const totalSelected =
    (selectionState?.instagramSelected?.length || 0) +
    (selectionState?.uploadedFiles?.length || 0);

      const canGoToAddDetails = totalSelected >= 4;

      console.log("Total selected:", totalSelected);
      
      if (totalSelected >= 4) {
        router.push("/manage-projects/add-details");
      } else {
        alert("Please select at least 4 projects before proceeding.");
      }
    };

    const isDisabled = selectionState.instagramSelected.length + selectionState.uploadedFiles.length < 4;
    
    function chunkArray(array, size) {
      const result = [];
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
      }
      return result;
    }
    const mediaPages = chunkArray(media, PAGE_SIZE);
    const currentMedia = mediaPages[currentPage] || [];
   
    const handleBackClick = () => {
     router.push("/profile")  
    }

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

const renderInstagramTab = () => (
  <div className="flex justify-center gap-10 mt-5">  

    <div className="w-[278px] h-full bg-white text-black p-3 rounded-lg" >
      <p className="text-md font-apfel-grotezk-regular">Selected projects from Instagram</p>
      <p className="text-light-grey font-apfel-grotezk-regular">{selectionState?.instagramSelected?.length || "0"} Selected</p>

      <div className="mt-[18px] w-auto border-b border-1 border-gray-200  "> 
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-7 overflow-y-auto max-h-[40vh]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {selectionState?.instagramSelected?.map((project) => (
          <div key={project.mediaId} className="flex flex-col items-center">
            {/* Project Container */}
            <div className="relative w-[120px] h-[120px] rounded-md overflow-hidden">
              {project.name === "VIDEO" ? (
                // Video Content
                <video
                 
                  className="w-full h-full object-cover"
                  src={project.mediaLink}
                >
                  Your browser does not support the video tag.
                </video>
              ) : project.name === "CAROUSEL_ALBUM" && project.children ? (
                // Carousel Content
                <div className="relative w-full h-full">
                  {project.children.map((child, index) => (
                    <div
                      key={child.id}
                      className={`absolute inset-0 transition-transform duration-500 ${
                        (carouselIndexes[project.mediaId] || 0) === index
                          ? "translate-x-0 opacity-100"
                          : "translate-x-full opacity-0"
                      }`}
                    >
                      {child.media_type === "IMAGE" ? (
                        <Image
                          src={child.media_url}
                          alt={`Media ${child.id}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <video
                        
                          className="w-full h-full object-cover"
                          src={child.media_url}
                        />
                      )}
                    </div>
                  ))}

                  {/* Carousel Navigation */}
                  <button
                    className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    onClick={() => handleSlide(project.mediaId, "prev", project.children.length)}
                  >
                    ❮
                  </button>
                  <button
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    onClick={() => handleSlide(project.mediaId, "next", project.children.length)}
                  >
                    ❯
                  </button>
                </div>
              ) : (
                <Image
                  src={project.mediaLink}
                  alt={`Project ${project.mediaId}`}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Delete Button - Outside and below the content */}
            <button
              onClick={() => removeInstagramSelection(project.mediaId)}
              className="mt-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Image
                src="/assets/images/delete.svg"
                alt="delete"
                width={16}
                height={16}
                className="cursor-pointer w-20 h-6"
              />
            </button>
          </div>
        ))}
        <div className="-mb-10"></div>
      </div>
    </div>

    {/* right side rendered projects graph api fetch  */}
    <div className="w-[70vw] h-[50vh] 7xl:h-[70vh] text-black rounded-md overflow-y-auto"  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
    <MediaDisplay media={currentMedia} displayType="instagram"/>

    {/* {paging?.next && ( */}
   <div className="flex justify-center font-apfel-grotezk-regular items-center space-x-2 mt-4">
  {/* Previous Button */}
  <button
    onClick={handlePrev}
    disabled={currentPage === 0}
    className={`px-4 py-2 border-electric-blue border-[1px] text-electric-blue rounded-lg hover:bg-electric-blue hover:text-white ${
      currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    Previous
  </button>

  {/* Page Numbers */}
  {mediaPages.map((_, index) => (
    <button
      key={index}
      onClick={() => setCurrentPage(index)}
      className={`px-3 py-1 rounded-lg border border-gray-300 ${
        currentPage === index
          ? "bg-electric-blue text-white border-electric-blue"
          : "bg-white text-black hover:bg-gray-100"
      }`}
    >
      {index + 1}
    </button>
  ))}

  {/* Next Button */}
  <button
    onClick={handleNext}
    disabled={isLoadingMore || (!mediaPages[currentPage + 1] && !paging?.next)}
    className={`px-4 py-2 border-electric-blue border-[1px] text-electric-blue rounded-lg hover:bg-electric-blue hover:text-white ${
      (!mediaPages[currentPage + 1] && !paging?.next)
        ? "opacity-50 cursor-not-allowed"
        : ""
    }`}
  >
    {isLoadingMore ? "Loading..." : "Next"}
  </button>
</div>

    {/* )} */}
    </div>


  </div>
);

const renderUploadTab = () => (
  <div className="flex gap-10 mt-5">
    <div className="w-[278px] h-[60vh] bg-white text-black p-3 rounded-lg">
      {/* Header section */}
      <div>
        <p className="text-md font-apfel-grotezk-regular">Selected Files for Upload</p>
        <p className="text-light-grey font-apfel-grotezk-regular">{selectionState?.uploadedFiles?.length || "0"} selected</p>
      </div>

      {/* Border line */}
      <div className="mt-[18px] w-auto border-b border-1 border-gray-200"></div>

      {/* Scrollable area */}
      <div className="mt-5 h-[calc(60vh-120px)] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="grid grid-cols-2 gap-2">
          {selectionState.uploadedFiles.map((file, index) => (
            <div key={index} className="flex flex-col justify-center items-center">
              <div className="w-full h-full  border-light-grey rounded-lg flex justify-center items-center">
                {/* Check if the file is an image */}
                {file.fileUrl?.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i) ? (
                  <Image
                    src={file.fileUrl}
                    alt={file.fileName}
                    width={200}
                    height={50}
                    className="bg-cover h-36"
                  />
                ) : file.fileUrl?.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  /* Check if the file is a video */
                  <video
                    src={file.fileUrl}
                    controls
                    width={200}
                    height={50}
                    className="object-cover h-36"
                  />
                ) : (
                  <span>Invalid file type</span>
                )}
              </div>

              <button
                onClick={() => removeFile(file.mediaId)}
                className="mt-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Image
                  src="/assets/images/delete.svg"
                  alt="delete"
                  width={16}
                  height={16}
                  className="cursor-pointer w-20 h-6"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Upload area */}
    <div className="w-[70vw] h-[70vh] text-black rounded-md pt-1 b">
      <div className="flex gap-6 7xl:justify-center  h-full">
        <label
          htmlFor="file-upload"
          className="cursor-pointer w-[200px] h-[205px]  bg-gray-200 rounded-md flex justify-center items-center"
        >
          <div className="flex flex-col justify-center items-center">
          <span className="font-qimano text-xl mt-4">Upload your files</span>
          <span className="font-apfel-grotezk-regular text-sm text-gray-500 px-3">Only png, jpg, and .mp4 files <span className="mx-auto ml-10 font-apfel-grotezk-regular">of max limit 5mb</span></span>
          <span className="mt-4 text-dark-grey text-2xl border-[1.6px] border-dashed border-gray-400 rounded-md p-1 m-6">
            <Image
              src="/assets/images/upload-folder.svg"
              alt="Upload Icon"
              width={44}
              height={44}
              className="h-20 w-[200px]"
              loading="eager"
              priority
            />
          </span>
          </div>
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*,video/*,image/svg+xml"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {/* right side rendered uplaod projects */}
         <MediaDisplay uploadedFiles={selectionState.uploadedFiles}  displayType="uploaded"/>
      </div>
    </div>
  </div>
);


return (
    <div className="flex flex-col h-[77vh] max-w-[1800px] 7xl:max-w-[2500px] mx-auto bg-smoke w-full space-x-8 overflow-hidden" >
      
      <div className="flex flex-col mx-auto items-start text-graphite">
        <p className="text-2xl text-black font-qimano">
          Pick content that you wish to highlight in your profile kit
        </p>
        <span className="mx-auto font-qimano ">
  {(selectionState?.instagramSelected?.length || 0) + (selectionState?.uploadedFiles?.length || 0)} / 12 Selected
   *Minimum 4 required to continue
</span>

      </div>

      <div className="flex w-full border-b border-gray-300 mt-0 items-center ">
      <button
          onClick={() => handleTabClick("instagram")}
          className={`flex-1 py-2 text-md font-medium text-center flex items-center justify-center ${
            selectedTab === "instagram"
              ? "text-electric-blue border-b-2 border-electric-blue"
              : "text-gray-500"
          }`}
        >
        <SvgComponent
        style={{
          color: selectedTab === "instagram" ? "blue" : "",
        }}
      />
      Instagram
        </button>

        <button
          onClick={() => handleTabClick("upload")}
          className={`flex-1 py-2 text-md font-medium text-center flex items-center justify-center ${
            selectedTab === "upload"
              ? "text-electric-blue border-b-2 border-electric-blue"
              : "text-gray-500"
          }`}
        >
        <Uploadsvg
        style={{
          color: selectedTab === "upload" ? "blue" : "", height: "35px",
        }}
      />  
          Upload
        </button>
      </div>

    {/* left side insta and upload projects */}
      {selectedTab === "instagram" ? renderInstagramTab() : renderUploadTab()}

<div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg w-[530px] px-4 py-1.5 shadow-xl z-50 h-[11%] font-apfel-grotezk-regular">
  <div className="flex items-center gap-[9px] w-full h-full">
    
    {/* Logo + Hamburger */}
    <div className="flex items-center justify-center gap-2 relative px-2 py-2">
      <button onClick={handleNextClick} className="w-[105px] h-[56px] text-electric-blue text-2xl font-semibold text-center">
        <Image 
          src="/assets/images/snatch.svg"
          width={40}
          height={40}
          alt="snatchlogo"
          className="mx-auto w-32 h-10"
        />
      </button>

      <button
        onClick={handleHamburgerClick}
        className="w-[60px] h-[56px] bg-gray-100 text-electric-blue rounded-md mx-auto font-medium hover:bg-transparent relative"
      >
        <Image
          className="mx-auto w-8"
          src="/assets/icons/onboarding/Hamburger.svg"
          alt="hamburger"
          width={20}
          height={20}
        />
      </button>

      {/* Dropdown Menu */}
      {isMenuVisible && (
        <div className="absolute top-[-220%] left-[50%] w-[200px] bg-white shadow-lg rounded-md border border-light-grey z-50 font-apfel-grotezk-regular">
          <ul className="flex flex-col p-3 gap-2">
            <li onClick={handleDashboardClick} className="cursor-pointer text-electric-blue hover:bg-gray-100 rounded-md p-2">
              Dashboard
            </li>
            <li onClick={handleSettingClick} className="cursor-pointer text-electric-blue hover:bg-gray-100 rounded-md p-2">
              Settings
            </li>
            <li onClick={handleProfileClick} className="cursor-pointer text-electric-blue hover:bg-gray-100 rounded-md p-2">
              Profile
            </li>
          </ul>
        </div>
      )}
    </div>

    {/* Final Action Buttons */}
    <div className=" h-[56px] bg-gray-100 px-2 py-2 rounded-lg flex justify-between items-center gap-[8px]">
     <button
  className=" h-[38px] flex  items-center  gap-1 px-3 py-2 border-electric-blue border-[1px] text-electric-blue rounded-lg hover:bg-electric-blue hover:text-white transition-colors"
  onClick={handleBackClick}
>
  <Image
    src="/assets/images/projectsLeftarrow.svg"
    alt="back arrow"
    width={14}
    height={14}
    className="w-[14px] h-[14px]"
  />
  <span className="text-md">Back</span>
</button>


      <button
        className={` h-[38px] flex items-center justify-between gap-1 px-4 py-2 rounded-lg text-md transition-colors ${
          isDisabled
            ? "bg-[#6C7FA5] text-light-grey cursor-not-allowed"
            : "bg-electric-blue text-white hover:bg-blue-700"
        }`}
        onClick={handleProjectClick}
        disabled={isDisabled}
      >
         <span className="text-md">Add Project Details</span>
          <Image
          src="/assets/images/projectRightWhiteArrow.svg"
          alt="back arrow"
          width={14}
          height={14}
          className="w-[14px] h-[14px]"
        />
      </button>
      
    </div>

  </div>
</div>

    </div>
  );
}
