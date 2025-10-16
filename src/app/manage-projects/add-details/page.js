"use client";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useSelectedProjects } from "../context";
import TitleWithCounter from "@/components/TitleWithCounter";
import FormInput from "@/components/FormInput";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { industryList, eventTypes } from "@/data/portfolio/industry";
import { fetchMediaInsights } from "@/utils/fetchMediaInsights";
import {generateFormDataFromUserInput} from "@/utils/generateFormDataFromUserInput";
import { cleanAIResponse } from "@/utils/aiResponseClear";
import MultiSelectInput from "@/components/MultiSelectInput";
import InfoNormalMultiSelect from "@/components/InfoNormalMultiSelect";
import ProjectCustomFileInput from "@/components/ProjectCustomFileInput";
import DateInput from "@/components/DateInput";
import BottomToolbar from "./bottomToolbar";
import ProjectSidebar from "./projectSidebar";
import ProjectMediaDisplay from "./projectMediaDisplay";
import BrandPopup from "./brandPopup";
// Component that uses useSearchParams wrapped in Suspense
function SearchParamsProvider({ setActiveTab, setActiveImageId }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Get URL parameters
    const urlActiveImageId = searchParams?.get('activeImageId');
    const urlActiveTab = searchParams?.get('tab');
    
    // Set active tab if provided in URL
    if (urlActiveTab && (urlActiveTab === 'instagram' || urlActiveTab === 'uploaded')) {
      setActiveTab(urlActiveTab);
    }
    
    // Set active image ID if provided in URL
    if (urlActiveImageId) {
      setActiveImageId(urlActiveImageId);
    }
  }, [searchParams, setActiveTab, setActiveImageId]);
  
  return null;
}

export default function AddDetails() {
  const {
    selectionState,
    updateFormDataForMedia,
  } = useSelectedProjects();

  const router = useRouter();

  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState("instagram");
  const [carouselIndexes, setCarouselIndexes] = useState([]);
  const [activeImageId, setActiveImageId] = useState(null);
  const [insights, setInsights] = useState([]);
  const [currentFormData, setCurrentFormData] = useState([
    {
      key: "",
      eventName: "",
      eventLocation: "",
      eventYear: "",
      companyName: "",
      companyLocation: "",
      titleName: "",
      description: "",
      companyLogo: null,
      industries: [],
      eventTypes: [],
      isBrandCollaboration: true,
    },
  ]);
  
  const [isBrandCollaboration, setIsBrandCollaboration] = useState(true);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [showBrandPopup, setShowBrandPopup] = useState(false);
  const [popupAnimating, setPopupAnimating] = useState(false);
  const [popupStep, setPopupStep] = useState(1);
  const [popupUserInput, setPopupUserInput] = useState('');
  const [popupGenerating, setPopupGenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [hasConsiderations, setHasConsiderations] = useState(false);
  const [showMinProjectsPopup, setShowMinProjectsPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [popupUserInputs, setPopupUserInputs] = useState({});

  // Add this helper function before the return statement
const checkOrientation = (width, height) => {
  return height > width;
};

  const requiredFields = [
    "titleName",
    "description",
    "industries",
  ];

  
  if (isBrandCollaboration) {
    requiredFields.push("companyName", "companyLocation", "eventName", "eventYear"); //type of location campaign, date of campaign Mandatroy
  }

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isProjectFilled = (formData) => {
  if (!formData) return false;
  const baseFields = ["titleName", "description", "industries"];
  const companyFields = ["companyName", "companyLocation", "eventName", "eventYear"];
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
      ? selectionState.formData.find((item) => item.key === project.mediaId?.toString())
      : null;
    return isProjectFilled(formData);
  }).length;
})();
  
  const projects =
    activeTab === "instagram"
      ? selectionState.instagramSelected
      : selectionState.uploadedFiles;


  // Convert activeImageId to string for comparison since URL parameters are strings
  const activeProject =
    activeImageId !== null
      ? projects.find((project) => String(project.mediaId) === String(activeImageId))
      : projects[0];

  // const isFirstProject = activeProject === projects[0]; // check if it’s the first project
  const activeCaption = activeProject?.caption
  const activeMediaLink = activeProject?.mediaLink
  
  // Auto-select first project's formData when no project is selected

// This effect is now handled by SearchParamsProvider
useEffect(() => {
  // Only set activeImageId to first project if no projects are selected yet
  if (!activeImageId && projects?.length > 0) {
    const firstProjectId = projects[0].mediaId;
    setActiveImageId(firstProjectId);
  }
}, [projects, activeImageId]);

// Modify the useEffect that handles form data loading:
useEffect(() => {
  if (!activeImageId) return;

  const formDataArray = Array.isArray(selectionState?.formData)
    ? selectionState.formData
    : [];


  // Check if form data exists for this mediaId
  const existingFormData = formDataArray.find(
    (item) => item.key === activeImageId.toString()
  );
   
    if (existingFormData) {
        const savedBrandCollabState = existingFormData.isBrandCollaboration !== undefined 
      ? existingFormData.isBrandCollaboration 
      : true;

    setIsBrandCollaboration(savedBrandCollabState); // Update toggle state
      
    // If form data exists, load it and ensure all required fields are present
    setCurrentFormData({
      ...existingFormData,
      key: activeImageId.toString(),
      eventName: existingFormData.eventName || "",
      eventLocation: existingFormData.eventLocation || "",
      eventYear: existingFormData.eventYear || "",
      companyName: existingFormData.companyName || "",
      companyLocation: existingFormData.companyLocation || "",
      companyLogo: existingFormData.companyLogo || "",
      companyLogoFileName: existingFormData.companyLogoFileName || "",
      description: existingFormData.description || "",
      eventTypes: existingFormData.eventTypes || [],
      industries: existingFormData.industries || [],
      titleName: existingFormData.titleName || "",
      isDraft: existingFormData.isDraft !== undefined ? existingFormData.isDraft : true,
        isBrandCollaboration: savedBrandCollabState,
        
    });
  } else {
    // Initialize with empty values if no existing data
    setCurrentFormData({
      key: activeImageId.toString(),
      eventName: "",
      eventLocation: "",
      eventYear: "",
      companyName: "",
      companyLocation: "",
      companyLogo: "",
      companyLogoFileName: "",
      description: "",
      eventTypes: [],
      industries: [],
      titleName: "",
      isDraft: true,
      isBrandCollaboration: true,
    });
  }
}, [activeImageId, selectionState?.formData]);

useEffect(() => {
  if (activeImageId && popupUserInputs[activeImageId]) {
    // restore previously saved prompt
    setPopupUserInput(popupUserInputs[activeImageId]);
  } else {
    setPopupUserInput("");
  }
}, [activeImageId, showBrandPopup]);


const areFormFieldsEmpty = (formData) => {
  if (!formData) return true;
  // Always start with the base required fields
  const fieldsToCheck = ["titleName", "description", "industries"];
  // Only add company fields if this project is a brand collab
  if (formData.isBrandCollaboration) {
    fieldsToCheck.push("companyName", "companyLocation");
  }
  return fieldsToCheck.some((field) => {
    const value = formData[field];
    return !value || (Array.isArray(value) ? value.length === 0 : value.trim() === "");
  });
};

useEffect(() => {
  if (!activeProject) return;
  const formDataArray = Array.isArray(selectionState.formData)
    ? selectionState.formData
    : [];
  const formData = formDataArray.find(
    (item) => item.key === activeProject.mediaId?.toString()
  );
  if (areFormFieldsEmpty(formData)) {
    setTimeout(() => {
      setShowBrandPopup(true);
      setPopupStep(1); // Reset to first step
      setPopupAnimating(true);
      setTimeout(() => setPopupAnimating(false), 1000);
    }, 1000);
  } else {
    setShowBrandPopup(false);
  }
}, [activeProject?.mediaId]);


// Add this useEffect to your component fr uplaoded files form data
useEffect(() => {
  if (activeTab === "uploaded" && activeImageId) {
    // Ensure uploaded files form data is properly initialized
    const existingData = selectionState.formData.find(
      (item) => item.key === activeImageId.toString()
    );
    
    if (!existingData) {
      // Initialize form data for uploaded files
      const initialData = {
        key: activeImageId.toString(),
        titleName: "",
        description: "",
        industries: [],
        isBrandCollaboration: isBrandCollaboration,
        ...(isBrandCollaboration ? {
          companyName: "",
          companyLocation: "",
          eventName: "",
          eventTypes: [],
        } : {})
      };
      
      updateFormDataForMedia(activeImageId.toString(), initialData);
    }
  }
}, [activeTab, activeImageId]);


if (!isHydrated) {
    return null;
}

const handleProjectClick = async (mediaId) => {
  if (mediaId === activeImageId) return;
  setActiveImageId(mediaId);
  
  // Only fetch insights for Instagram files
  if (activeTab === "instagram") {
    const response = await fetchMediaInsights(mediaId);
    setInsights(response?.insights?.data || []);
  } else {
    // Clear insights for uploaded files
    setInsights([]);
  }
};

const handlePromptChange = (val) => {
  setPopupUserInput(val);
  setPopupUserInputs((prev) => ({
    ...prev,
    [activeImageId]: val,
  }));
};


const handleInputChange = (e, mediaId) => {
  const { name, value } = e.target;
  const formDataKey = mediaId.toString();
  setCurrentFormData((prevData) => {
    const updatedData = { 
      ...prevData,
      key: mediaId, // Ensure key is set
      [name]: value 
    };
    // Only send to backend when user actually changes something
    updateFormDataForMedia(formDataKey, updatedData);
    return updatedData;
  });
};

const handleAddValue = (fieldName, value, mediaId) => {
  const formDataKey = mediaId.toString(); //string convert for update 20 may
  setCurrentFormData((prevData) => {
    const updatedEntry = { 
      ...prevData,
      key: mediaId, // Ensure key is set
      [fieldName]: [...(prevData[fieldName] || []), value] 
    };
    // Only send to backend when user actually adds a value
    updateFormDataForMedia(formDataKey, updatedEntry);
    return updatedEntry;
  });
};

const handleRemoveValue = (fieldName, value, mediaId) => {
   const formDataKey = mediaId.toString();
  setCurrentFormData((prevData) => {
    const currentEntry = Array.isArray(prevData) ? prevData[0] : prevData;
    const currentValues = Array.isArray(currentEntry[fieldName]) ? currentEntry[fieldName] : [];
    const updatedValues = currentValues.filter(item => item !== value);
    
    const updatedEntry = {
      ...currentEntry,
      key: mediaId, // Ensure key is set
      [fieldName]: updatedValues
    };
    
    // Only send to backend when user actually removes a value
    updateFormDataForMedia(formDataKey, updatedEntry);
    return updatedEntry;
  });
};

const handleToggle = () => {
  const newIsBrandCollaboration = !isBrandCollaboration;
  setIsBrandCollaboration(newIsBrandCollaboration);

  // Only update if we have an activeImageId
  if (activeImageId) {
    // Create a new form data entry if it doesn't exist
    const updatedEntry = {
      ...currentFormData,
      key: activeImageId.toString(),
      isBrandCollaboration: newIsBrandCollaboration,
      // Add required empty fields if switching to brand collaboration
      ...(newIsBrandCollaboration ? {
        companyName: currentFormData.companyName || "",
        companyLocation: currentFormData.companyLocation || "",
        eventName: currentFormData.eventName || "",
        eventTypes: currentFormData.eventTypes || [],
        eventYear: currentFormData.eventYear || "",
      } : {})
    };

    // Force string conversion for mediaId and ensure it's passed correctly
    const mediaIdString = activeImageId.toString();
    
    // Call updateFormDataForMedia with string ID
    updateFormDataForMedia(mediaIdString, updatedEntry);

    // Update local state
    setCurrentFormData(updatedEntry);
  }
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


  const handlePreviewClick = () => {
    if (isHydrated && filledProjectsCount < 4) {
      setShowMinProjectsPopup(true);
    } else if (isHydrated && filledProjectsCount >= 4) {
      setShowSuccessPopup(true);
    } else {
      router.push(`/manage-projects/preview/?activeImageId=${activeImageId}&tab=${activeTab}`);
    }
  };
 
  const isFormComplete = (project) => {
  if (!project?.mediaId) return false;

  const projectKey = String(project.mediaId);

  // Get the form data for this specific project
  const formData = currentFormData.key === projectKey
    ? currentFormData
    : selectionState.formData.find((item) => item.key === projectKey);

  if (!formData) {
    console.log("No form data found for project:", projectKey);
    return false;
  }

  // Check required fields
  const fieldsToCheck = [...requiredFields];
  if (formData.isBrandCollaboration) {
    fieldsToCheck.push("companyName", "companyLocation");
  }

  const areRequiredFieldsFilled = fieldsToCheck.every((field) => {
    const value = formData[field];
    const isValid = value && (Array.isArray(value) ? value.length > 0 : value.trim() !== "");
    return isValid;
  });

  return areRequiredFieldsFilled;
};

// ✅ Check if ANY project is complete
const isAnyProjectCompleted = projects.some((project) => isFormComplete(project));

  const handleBackClick = () => {
   router.push("/manage-projects/pick-projects");
  }

const getProjectStatus = (project) => {
  // Active project should always show "Editing"
  if (activeProject && project.mediaId === activeProject.mediaId) {
    return "Editing";
  }

  // Find saved form data for this project
  const formEntry = Array.isArray(selectionState.formData)
    ? selectionState.formData.find((item) => item.key === project.mediaId.toString())
    : null;

  if (!formEntry) {
    return "Draft"; // no form started yet
  }

  // Build required fields dynamically
  const baseFields = ["titleName", "description", "industries"];
  const companyFields = ["companyName", "companyLocation"];
  const fieldsToCheck = [...baseFields];
  if (formEntry.isBrandCollaboration) {
    fieldsToCheck.push(...companyFields);
  }

  // Check if all required fields are filled
  const isComplete = fieldsToCheck.every((field) => {
    const value = formEntry[field];
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim() !== "";
    return true;
  });

  return isComplete ? "Done" : "Draft";
};

const computedProjects = projects.map(project => ({
  ...project,
  status: getProjectStatus(project),
}));

const handleDateChange = (dateStr, mediaId) => {
  // Create the updated form data
  const updatedData = {
    ...currentFormData,
    eventYear: dateStr,
    key: mediaId.toString() // Ensure mediaId is string
  };

  // Update local state
  setCurrentFormData(updatedData);

  // Send to backend via context
  updateFormDataForMedia(mediaId.toString(), updatedData);
};


const handlePrevious = () => {
  const currentIndex = projects.findIndex(project => project.mediaId === activeImageId);
  const newIndex = currentIndex > 0 ? currentIndex - 1 : projects.length - 1;
  const prevProject = projects[newIndex];
  if (prevProject) {
    setActiveImageId(prevProject.mediaId);
  }
};

const handleNext = () => {
  const currentIndex = projects.findIndex(project => project.mediaId === activeImageId);
  const newIndex = currentIndex < projects.length - 1 ? currentIndex + 1 : 0;
  const nextProject = projects[newIndex];
  if (nextProject) {
    setActiveImageId(nextProject.mediaId);
  }
};

  const handleHamburgerClick = () => {
    setIsMenuVisible((prev) => !prev); // Toggle menu visibility
  };

const handleBrandPopupChoice = (isBrand) => {
  setIsBrandCollaboration(isBrand);
  // Update form data for this project
  if (activeImageId) {
    const updatedEntry = {
      ...currentFormData,
      key: activeImageId.toString(),
      isBrandCollaboration: isBrand,
      ...(isBrand ? {
        companyName: currentFormData.companyName || "",
        companyLocation: currentFormData.companyLocation || "",
        eventName: currentFormData.eventName || "",
        eventTypes: currentFormData.eventTypes || [],
      } : {})
    };
    updateFormDataForMedia(activeImageId.toString(), updatedEntry);
    setCurrentFormData(updatedEntry);
  }
  // Animate to step 2
  setPopupAnimating(true);
  setTimeout(() => {
    setPopupStep(2);
    setPopupAnimating(false);
  }, 400); // Animation duration
};

const handlePopupGenerate = async () => {
  if (!popupUserInput.trim()) return;
  setPopupGenerating(true);
  try {
    const result = await generateFormDataFromUserInput(popupUserInput, isBrandCollaboration);
    const cleanedResult = cleanAIResponse(result);
    if (!cleanedResult) throw new Error('No data received from AI');
    const updatedData = {
      ...currentFormData,
      titleName: cleanedResult.title || currentFormData.titleName,
      description: cleanedResult.description || currentFormData.description,
      industries: cleanedResult.industries || currentFormData.industries,
      considerations: cleanedResult.considerations || {}, // <-- ADD THIS LINE
      ...(isBrandCollaboration ? {
        companyName: cleanedResult.companyName === 'needs_confirmation' ? '' : cleanedResult.companyName,
        companyLocation: cleanedResult.companyLocation === 'needs_confirmation' ? '' : cleanedResult.companyLocation,
        eventName: cleanedResult.eventName === 'needs_confirmation' ? '' : cleanedResult.eventName,
        eventTypes: cleanedResult.eventTypes ? [cleanedResult.eventTypes] : currentFormData.eventTypes,
      } : {})
    };
    if (activeImageId) {
      updateFormDataForMedia(activeImageId.toString(), updatedData);
    }
    setCurrentFormData(updatedData);
    setShowBrandPopup(false);
    setPopupUserInput('');
    setPopupStep(1);
    // Check for considerations
    if (cleanedResult.considerations && Object.keys(cleanedResult.considerations).length > 0) {
      setHasConsiderations(true);
    } else {
      setHasConsiderations(false);
    }
    setShowToast(true);
    // auto-hide after 5 sec:
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  } catch (err) {
    alert(`Failed to generate form data: ${err.message}`);
  } finally {
    setPopupGenerating(false);
  }
};

  return (
    <div className=" flex flex-col items-start space-x-8 h-[77vh] w-full overflow-x-hidden overflow-y-hidden">
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsProvider setActiveTab={setActiveTab} setActiveImageId={setActiveImageId} />
      </Suspense>
      <div className="relative w-full h-full flex flex-col items-center top-3 justify-center">
      {showSuccessPopup && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative bg-white rounded-xl p-6 sm:p-8 max-w-xl w-full text-center">
        
        {/* Close Icon */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
          onClick={() => setShowSuccessPopup(false)}
          aria-label="Close"
        >
          <Image
          src="/assets/icons/cross-mark.svg"
          alt="Go to Portfolio"
          width={28}
          height={28}
          className="w-7 h-7 object-contain"
        />
        </button>

        {/* Title */}
        <h2 className="text-xl text-graphite mb-4 text-left text-[#108B4A] font-qimano">You’re Good to Go!</h2>

        <hr className="border-gray-200 mb-4" />

        {/* Message */}
        <p className="text-base text-black font-sans mb-6 text-left font-apfel-grotezk-regular">
        Nice work! You’ve completed the required project details. Any unfinished ones have been saved as drafts and won’t appear in your portfolio (yet!).
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 font-apfel-grotezk-regular">
          <button
            onClick={() => setShowSuccessPopup(false)}
            className="border border-electric-blue text-electric-blue px-6 py-2 rounded-xl hover:bg-blue-50 transition"
          >
            Keep Editing
          </button>
          <button
            onClick={() => {
              setShowSuccessPopup(false);
              router.push(`/manage-projects/preview/?activeImageId=${activeImageId}&tab=${activeTab}`);
            }}
            className="bg-electric-blue text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </div>
      )}

      {showMinProjectsPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="relative bg-white rounded-xl p-6 sm:p-8 max-w-xl w-full text-center">
            
            {/* Close Icon */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
              onClick={() => setShowMinProjectsPopup(false)}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-[Georgia] text-[#EB3B00] mb-4 text-left font-qimano">Disclaimer</h2>

            <hr className="border-gray-200 mb-4" />

            {/* Message */}
            <p className="text-base text-black font-sans mb-6 text-left font-apfel-grotezk-regular">
              You need at least <strong>4 projects</strong> to create your portfolio. Until then, previews will look incomplete. Your progress will be saved, but your profile won&apos;t be shareable just yet.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 font-apfel-grotezk-regular">
              <button
                onClick={() => setShowMinProjectsPopup(false)}
                className="border border-electric-blue text-electric-blue px-6 py-2 rounded-xl hover:bg-blue-50 transition"
              >
                Keep Editing
              </button>
              <button
                onClick={() => {
          setShowMinProjectsPopup(true);
          setTimeout(() => {
            setShowMinProjectsPopup(false);
            router.push(`/manage-projects/preview/?activeImageId=${activeImageId}&tab=${activeTab}`);
          }, 2000);}}
                className="bg-electric-blue text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
              >
                Save and Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <BrandPopup
      showBrandPopup={showBrandPopup}
      popupAnimating={popupAnimating}
      popupStep={popupStep}
      activeCaption={activeCaption}
      activeMediaLink={activeMediaLink}
      isBrandCollaboration={isBrandCollaboration}
      popupUserInput={popupUserInput}
      popupGenerating={popupGenerating}
      setShowBrandPopup={setShowBrandPopup}
      setPopupAnimating={setPopupAnimating}
      setPopupStep={setPopupStep}
      setPopupUserInput={setPopupUserInput}
      handleBrandPopupChoice={handleBrandPopupChoice}
      handlePromptChange={handlePromptChange}
      handlePopupGenerate={handlePopupGenerate}
    />


       <div className="absolute left-1/2 top-1/2 transform -translate-y-1/2 w-full -translate-x-1/2 flex flex-col items-center mx-auto justify-center text-center mt-3  mb-10 "> 
         <p className="text-2xl text-black font-qimano">
         Pick at least 4 posts that wish to highlight in your press kit
        </p>
        <p className="mx-auto text-graphite font-apfel-grotezk-regular">
          Fill in details for at least 4 projects
        </p>
       </div>
       </div>
       
    

     <div className="flex justify-center 7xl:min-w-[93%] mx-auto mt-10">

     <div className="flex flex-row font-apfel-grotezk-regular mt-8">
      <ProjectSidebar
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectionState={selectionState}
      computedProjects={computedProjects}
      handleProjectClick={handleProjectClick}
    />
          
      <div className="flex">
    
        <ProjectMediaDisplay
          activeTab={activeTab}
          activeProject={activeProject}
          activeImageId={activeImageId}
          projects={projects}
          insights={insights}
          isPortrait={isPortrait}
          setIsPortrait={setIsPortrait}
          carouselIndexes={carouselIndexes}
          handleSlide={handleSlide}
          checkOrientation={checkOrientation}
        />

        <div className="-ml-8 3xl:ml-20 mt-0 flex flex-col gap-8 overflow-y-scroll overflow-x-hidden h-[70vh]  7xl:h-[80vh] 9xl:h-[80vh]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="flex items-center justify-between ">

  <span className="text-graphite font-apfel-grotezk-mittel">Was it a brand collaboration?</span>

  <div
    className={`flex items-center rounded-full p-1 cursor-pointer w-[60px] ${
      isBrandCollaboration ? 'bg-electric-blue justify-end' : 'bg-gray-300 justify-start'
    }`}
    onClick={handleToggle}
  >
    <div className="bg-white rounded-full w-5 h-5 shadow-sm flex items-center justify-center">
      {isBrandCollaboration ? (
        <Image
          src="/assets/images/thumb-up.svg"
          alt="Thumbs Up"
          width={10}
          height={10}
          className="w-4 h-4"
        />
      ) : (
        <Image
          src="/assets/images/thumb-down.svg"
          alt="Thumbs Down"
          width={10}
          height={10}
          className="w-4 h-4"
        />
      )}
    </div>
  </div>
</div>

<button className="group flex items-center justify-between gap-2 px-6 py-2  text-electric-blue bg-white rounded-lg font-qimano text-lg hover:bg-blue-50 transition-all duration-200" onClick={() => {
  if (showBrandPopup) {
    setShowBrandPopup(false);
    setPopupAnimating(true);
    setTimeout(() => setPopupAnimating(false), 500);
  } else {
    setShowBrandPopup(true);
  }
}}>
  <span className="flex items-center gap-2">
    <Image src="/assets/images/aiLogo.svg" alt="ai logo" className="w-6 h-10" width={20} height={20} />
    <span>Talk about your work like a pro, AI&rsquo;s got your back!</span>
  </span>
  <span className="text-xl transition-transform duration-200 group-hover:translate-x-1">→</span>
</button>
   
         <div className="border-b  border-light-grey"></div>

          <MultiSelectInput
            label="Choose Industry* (Max 3)"
            data={industryList}
            selectedValues={
              currentFormData?.industries?.length > 0
                ? currentFormData?.industries
                : Array.isArray(selectionState?.formData)
                ? selectionState?.formData.find(item => item.key === activeProject?.mediaId)?.industries || []
                : []
            }
            onAddValue={(value) => handleAddValue("industries", value, activeImageId)}
            onRemoveValue={(value) => handleRemoveValue("industries", value, activeImageId)}
          />

          <TitleWithCounter
            label={"Give it a title*"}
            name="titleName"
            value={currentFormData?.titleName || selectionState?.formData[activeProject?.mediaId]?.titleName || ""}
            onChange={(e) => handleInputChange(e, activeImageId)}
             consideration={currentFormData.considerations?.title}
            considerationType={currentFormData.considerations?.title_type}
          />

          <TitleWithCounter
            name="description"
            label={"Add description* "}
            value={currentFormData?.description || selectionState?.formData[activeProject?.mediaId]?.description || ""}
            onChange={(e) => handleInputChange(e, activeImageId)}
            consideration={currentFormData.considerations?.description}
            considerationType={currentFormData.considerations?.description_type}
          />

          {isBrandCollaboration && (
            <>
              <div className="text-black flex flex-col gap-5">
                <div className="flex flex-row gap-2">
                <p className=" text-md whitespace-nowrap">About brand / company</p>
                <div className="border-b  border-light-grey w-full mb-3"></div>
                </div>
                <FormInput
                  placeholder="Name of the brand / company*"
                  name="companyName"
                  value={currentFormData?.companyName || selectionState?.formData[activeProject?.mediaId]?.companyName || ""}
                  onChange={(e) => handleInputChange(e, activeImageId)}
                  consideration={currentFormData.considerations?.companyName}
                  considerationType={currentFormData.considerations?.companyName_type}
                />
              </div>

              <div className="text-black flex flex-col gap-5">
              <ProjectCustomFileInput
                onFileChange={(uploadedUrl) => console.log("Uploaded URL:", uploadedUrl)}
                placeholder="Upload brand / company logo"
                iconSrc="/assets/icons/onboarding/Upload.svg"
                activeImageId={activeImageId} 
              />
              </div>

              <div className="text-black flex flex-col gap-5">

              <div className="flex flex-row gap-2">
                <p className=" text-md whitespace-nowrap">About campaign / collaboration</p>
                <div className="border-b  border-light-grey w-full mb-3"></div>
                </div>
                
                <InfoNormalMultiSelect
                label="Type of campaign / collaboration (Select at least 1)"
                options={eventTypes}
                selectedValues={
                currentFormData?.eventTypes?.length > 0
                  ? currentFormData?.eventTypes
                  : (selectionState?.formData[activeProject?.mediaId]?.eventTypes?.length > 0
                    ? selectionState?.formData[activeProject?.mediaId].eventTypes
                    : [])
                  }
                  onAddValue={(value) => handleAddValue("eventTypes", value, activeImageId)}
                  onRemoveValue={(value) => handleRemoveValue("eventTypes", value, activeImageId)}
                />
                
                 <FormInput
                  placeholder="Name of the campaign"
                  name="eventName"
                  value={currentFormData?.eventName || selectionState?.formData[activeProject?.mediaId]?.eventName || ""}
                  onChange={(e) => handleInputChange(e, activeImageId)}
                  consideration={currentFormData.considerations?.eventName}
                  considerationType={currentFormData.considerations?.eventName_type}
                />
                 <FormInput
                  placeholder="Location"
                  name="companyLocation"
                  value={currentFormData?.companyLocation || selectionState?.formData[activeProject?.mediaId]?.companyLocation || ""}
                  onChange={(e) => handleInputChange(e, activeImageId)}
                  consideration={currentFormData.considerations?.companyLocation}
                  considerationType={currentFormData.considerations?.companyLocation_type}
                />
                <DateInput
                  placeholder="Date of collaboration (MM/YYYY)"
                  value={currentFormData?.eventYear || selectionState?.formData[activeProject?.mediaId]?.eventYear || ""}
                  onChange={(value) => handleDateChange(value, activeImageId)}
                  variant="transparent"
                  width="full"
                  className="my-2"
                  format="mm/yyyy"
                />
                
                <div className="bg-transparent h-20"></div>
              
              </div>
            </>
          )}

          {showToast && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#0037EB]/60 text-white px-6 py-3 rounded-md shadow-md font-apfel-grotezk-regular z-50 transition-all duration-500">
              {hasConsiderations
                ? "Most details are filled! Some sections are missing due to missing info, please review!"
                : "Project details added! Give it a quick look before moving on."}
            </div>
          )}

 

    <div className="border-b border-light-grey"></div>
    <BottomToolbar
      isMenuVisible={isMenuVisible}
      handleHamburgerClick={handleHamburgerClick}
      handlePrevious={handlePrevious}
      handleNext={handleNext}
      handleBackClick={handleBackClick}
      handlePreviewClick={handlePreviewClick}
      isAnyProjectCompleted={isAnyProjectCompleted}
      projects={projects}
        />
    </div>

  </div>

      </div>
     </div> 
    </div>
  );
}

