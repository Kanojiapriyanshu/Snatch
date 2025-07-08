"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSelectedProjects } from "../context";
import TitleWithCounter from "@/components/TitleWithCounter";
import FormInput from "@/components/FormInput";
import MultiSelectInput from "@/components/MultiSelectInput";
import CustomFileInput from "@/components/CustomFileInput";
import { useRouter } from "next/navigation";
import NormalMultiSelect from "@/components/NormalMultiSelect";
import ProjectsGrid from "@/components/ProjectsGrid";
import { industryList, eventTypes } from "@/data/portfolio/industry";
import { fetchMediaInsights } from "@/utils/fetchMediaInsights";
import ProjectCustomFileInput from "@/components/ProjectCustomFileInput";
import SvgComponent from "@/components/svg/Instagramsvg";
import Uploadsvg from "@/components/svg/Uploadsvg";
import {generateFormDataFromUserInput} from "@/utils/generateFormDataFromUserInput";
import { cleanAIResponse } from "@/utils/aiResponseClear";

export default function AddDetails() {
  const {
    selectionState,
    handleFileUpload,
    updateFormDataForMedia,
    handleCompanyLogoUpload,
    toggleIsBrandCollaboration 
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
  const [showBrandPopup, setShowBrandPopup] = useState(false)
  const [popupAnimating, setPopupAnimating] = useState(false);
  // ...existing code...
const [popupStep, setPopupStep] = useState(1);
const [popupUserInput, setPopupUserInput] = useState('');
const [popupGenerating, setPopupGenerating] = useState(false);
const [showToast, setShowToast] = useState(false);
const [hasConsiderations, setHasConsiderations] = useState(false);
const [showMinProjectsPopup, setShowMinProjectsPopup] = useState(false);

// ...existing code...

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
    requiredFields.push("companyName", "companyLocation");
  }

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
      ? selectionState.formData.find((item) => item.key === project.mediaId?.toString())
      : null;
    return isProjectFilled(formData);
  }).length;
})();

  // Extracting projects logic here
  const projects =
    activeTab === "instagram"
      ? selectionState.instagramSelected
      : selectionState.uploadedFiles;

      console.log("PROJECTS ON ADD DETAILS PAGE", projects, selectionState.instagramSelected);

      useEffect(() => {
        if (!activeImageId && projects?.length) {
          setActiveImageId(projects[0].mediaId);
        }
      }, []);  
      
      console.log("actieimageid for first time", activeImageId)

  const activeProject =
    activeImageId !== null
      ? projects.find((project) => project.mediaId === activeImageId)
      : projects[0];

  // Auto-select first project's formData when no project is selected

useEffect(() => {
  // Set activeImageId to first project's mediaId on initial load
  if (!activeImageId && projects?.length > 0) {
    const firstProjectId = projects[0].mediaId;
    setActiveImageId(firstProjectId);
    console.log("Setting initial activeImageId:", firstProjectId);
  }
}, [projects]);



// Modify the useEffect that handles form data loading:
useEffect(() => {
  if (!activeImageId) return;

  console.log("Loading form data for mediaId:", activeImageId);
  
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
    console.log("Loaded existing form data:", existingFormData);
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

// ...existing code...
useEffect(() => {
  if (!activeProject) return;
  const formData = selectionState.formData.find((item) => item.key === activeProject.mediaId?.toString());
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
// ...existing code...


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
      } : {})
    };

    // Force string conversion for mediaId and ensure it's passed correctly
    const mediaIdString = activeImageId.toString();
    console.log("Updating form data for mediaId:", mediaIdString, updatedEntry);
    
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
    const timer = setTimeout(() => {
      setShowMinProjectsPopup(false);
      router.push(`/manage-projects/preview/?activeImageId=${activeImageId}&tab=${activeTab}`);
    }, 2000);
    return () => clearTimeout(timer);
  } else {
    router.push(`/manage-projects/preview/?activeImageId=${activeImageId}&tab=${activeTab}`);
  }
  };
 
const isFormComplete = () => {
  if (!activeImageId) return false;

  console.log("Checking form completion for activeImageId:", activeImageId);
  console.log("Current form data:", currentFormData);
  console.log("Selection state form data:", selectionState.formData);

  // Get the form data either from current form data or selection state
  const formData = currentFormData.key === activeImageId.toString() 
    ? currentFormData 
    : selectionState.formData.find((item) => item.key === activeImageId.toString());

  if (!formData) {
    console.log("No form data found for activeImageId:", activeImageId);
    return false;
  }

  // Check if all required fields are filled
  const fieldsToCheck = [...requiredFields];
  if (formData.isBrandCollaboration) {
    fieldsToCheck.push("companyName", "companyLocation");
  }

  const areRequiredFieldsFilled = fieldsToCheck.every((field) => {
    const value = formData[field];
    const isValid = value && (Array.isArray(value) ? value.length > 0 : value.trim() !== "");
    console.log(`Field ${field}: ${isValid ? 'valid' : 'invalid'} - Value:`, value);
    return isValid;
  });

  console.log("Form completion result:", areRequiredFieldsFilled);
  return areRequiredFieldsFilled;
};

  const handleBackClick = () => {
   router.push("/manage-projects/pick-projects");
  }

  const getProjectStatus = (project) => {
    if (activeProject && project.mediaId === activeProject.mediaId) {
      return "Editing";
    }
    const formEntry = selectionState.formData.find(
      (item) => item.key === project.mediaId
    );
    if (formEntry) {
      const isComplete = requiredFields.every((field) => !!formEntry[field]);
      console.log("iscomplete project", isComplete)
      return isComplete ? "Done" : "Draft";
    }
    return "Draft";
  };

  // Map projects to add a status property
  const computedProjects = projects.map(project => ({
    ...project,
    status: getProjectStatus(project),
  }));

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

// ...existing code...
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
   <div className="relative w-full h-full flex flex-col items-center top-3 justify-center">
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
      <h2 className="text-xl sm:text-2xl font-[Georgia] text-black mb-4 text-left font-qimano">Disclaimer</h2>

      <hr className="border-gray-200 mb-4" />

      {/* Message */}
      <p className="text-base text-black font-sans mb-6 text-left font-apfel-grotezk-regular">
        You need at least <strong>4 projects</strong> to create your portfolio. Until then, previews will look incomplete. Your progress will be saved, but your profile won’t be shareable just yet.
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

{showBrandPopup && (
  <div
    className="fixed top-0 left-0 z-50 h-full"
    style={{
      width: "35vw",
      minWidth: 320,
      maxWidth: 800,
      pointerEvents: "auto",
    }}
  >
    <div
      className={`h-full w-full bg-white shadow-lg rounded-r-3xl flex flex-col items-center transition-all duration-500`}
      style={{
        borderTopRightRadius: 32,
        borderBottomRightRadius: 32,
        boxShadow: "2px 0 24px rgba(0,0,0,0.08)",
        transition: "transform 0.5s cubic-bezier(.4,0,.2,1)",
      }}
    >
     <div className="p-8 mt-20 flex flex-col items-center w-full max-w-lg mx-auto transition-all duration-500">
      {popupStep === 1 ? (
        <>
          <div className="flex justify-center mb-6">
            <Image src="/assets/images/aiLogo.svg" className="w-28 h-10" width={10} height={10} alt="AI Logo" />
          </div>

          <h2 className="text-2xl text-electric-blue font-qimano mb-2 text-blue-600 text-center">
            Was this a brand post or a personal one?
          </h2>
          <p className="text-center text-gray-600 mb-8 font-apfel-grotezk-regular">
            Let us know if this post was in collaboration with a brand or something you shared independently.
            We&rsquo;ll tailor the details accordingly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              className="w-full text-md sm:w-auto px-4 py-2 rounded-lg border border-electric-blue text-electric-blue  hover:bg-electric-blue hover:text-white transition"
              onClick={() => handleBrandPopupChoice(true)}
            >
              It is a brand post
            </button>
            <button
              className="w-full text-md sm:w-auto px-4 py-2 rounded-lg border border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white transition"
              onClick={() => handleBrandPopupChoice(false)}
            >
              It is a personal post
            </button>
          </div>
        </>
      ) : (
        <>
         <Image src="/assets/images/aiLogo.svg" className="w-28 h-10" width={10} height={10} alt="AI Logo" />
          <h2 className="text-2xl font-qimano text-electric-blue mb-6 mt-7 text-center">
            Tell us about the post, we&rsquo;ll do the rest!
          </h2>
          <textarea
            className="w-full text-gray-700 p-4 border border-gray-300 rounded-lg min-h-[100px] mb-4 focus:outline-none focus:border-blue-600 font-apfel-grotezk-regular"
            placeholder="Describe your project or brand collaboration..."
            value={popupUserInput}
            onChange={(e) => setPopupUserInput(e.target.value)}
          />
      
      <div className="flex gap-5">
  {/* Skip AI & enter manually */}
  <button
    className={`px-4 py-2 rounded-lg border-2 bg-white border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white text-md font-apfel-grotezk-regular transition`}
    onClick={() => setShowBrandPopup(false)}
    disabled={popupGenerating}
  >
    Skip AI & enter manually
  </button>

  {/* Generate my project */}
  <button
    className={`px-4 py-2 rounded-lg ${
      popupGenerating
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "border-2 bg-electric-blue text-white hover:bg-white hover:text-electric-blue"
    } text-md font-apfel-grotezk-regular transition cursor-pointer`}
    onClick={handlePopupGenerate}
    disabled={popupGenerating || !popupUserInput.trim()}
  >
    {popupGenerating ? "Generating..." : "Generate my project details"}
  </button>
</div>
  
        </>
      )}
    </div>
    </div>
  </div>
)}

       <div className="absolute left-1/2 top-1/2 transform -translate-y-1/2 w-full -translate-x-1/2 flex flex-col items-center mx-auto justify-center text-center mt-3  mb-10 "> 
         <p className="text-2xl text-black font-qimano">
          Pick content that you wish to highlight in your profile kit
        </p>
        <p className="mx-auto text-graphite font-apfel-grotezk-regular">
          Fill in details for at least 4 projects
        </p>
       </div>
       </div>
       
    

     <div className="flex justify-center 7xl:min-w-[93%] mx-auto mt-10">

     <div className="flex flex-row font-apfel-grotezk-regular mt-8">
        <div className="w-[278px] bg-white text-black p-3 rounded-lg">
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

       
  <div className=" flex ">
    
<div className="w-[258px] ml-20 mt-0 relative  ">

{/* Media and Insights Container */}
<div className="w-[250px] h-auto overflow-hidden rounded-lg  flex items-center">
  <div className="w-full rounded-lg overflow-hidden">
    {/* Media Display */}
    {(activeImageId !== null || projects.length > 0) && (() => {
      if (!activeProject) {
        return (
          <p className="text-graphite flex justify-center items-center h-full">
            No project selected
          </p>
        );
      }

      if (activeProject.name === "IMAGE") {
        return (
          <Image
            src={activeProject.mediaLink}
            alt={activeProject.name}
            width={1080}
            height={1080}
            className={`w-full ${isPortrait ? 'aspect-[4/6]' : 'h-auto'}  object-cover rounded-lg`}
            onLoadingComplete={({ naturalWidth, naturalHeight }) => {
              setIsPortrait(checkOrientation(naturalWidth, naturalHeight));
            }}
          />
        );
      }

      if (activeProject.name === "VIDEO") {
        return (
          <video
            src={activeProject.mediaLink}
            controls
            className={`w-full  ${isPortrait ? 'aspect-[4/6]' : 'h-auto'} object-cover rounded-lg`}
            onLoadedMetadata={(e) => {
              setIsPortrait(checkOrientation(e.target.videoWidth, e.target.videoHeight));
            }}
          />
        );
      }

      if (activeProject.name === "CAROUSEL_ALBUM") {
        return (
          <div className="relative w-full h-auto">
            {activeProject.children.map((child, index) => (
              <div
                key={child.id}
                className={`transition-opacity duration-500 ${
                  (carouselIndexes[activeProject.mediaId] || 0) === index
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              >
                {child.media_type === "IMAGE" ? (
                  <Image
                    src={child.media_url}
                    alt={`Media ${child.id}`}
                    fill
                    className={`w-full object-cover rounded-lg  ${isPortrait ? 'aspect-[4/6]' : 'h-auto'}`}
                    onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                      setIsPortrait(checkOrientation(naturalWidth, naturalHeight));
                    }}
                  />
                ) : (
                  <video
                    src={child.media_url}
                    controls
                    className={`w-full  ${isPortrait ? 'aspect-[4/6]' : 'h-auto'} object-cover rounded-lg`}
                    onLoadedMetadata={(e) => {
                      setIsPortrait(checkOrientation(e.target.videoWidth, e.target.videoHeight));
                    }}
                  />
                )}
              </div>
            ))}
            {/* Navigation buttons remain the same */}
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
          </div>
        );
      }

      if (activeProject.fileUrl) {
        return (
          <div className=" w-full rounded-lg overflow-hidden">
            {activeProject.fileUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
              <Image
                src={activeProject.fileUrl}
                alt={activeProject.fileName}
                width={1080}
                height={1080}
                className={` w-full  ${isPortrait ? 'aspect-[4/6]' : 'h-auto'} object-cover`}
                onLoadingComplete={({ naturalWidth, naturalHeight }) => {
                  setIsPortrait(checkOrientation(naturalWidth, naturalHeight));
                }}
              />
            ) : (
              <video
                src={activeProject.fileUrl}
                controls
                className={`  w-full  ${isPortrait ? 'aspect-[4/6]' : 'h-auto'} object-cover rounded-lg`}
                onLoadedMetadata={(e) => {
                  setIsPortrait(checkOrientation(e.target.videoWidth, e.target.videoHeight));
                }}
              />
            )}
          </div>
        );
      }

      return null;
    })()}
  </div>
</div>

 {/* Insights Section - Only for Instagram content */}
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



        <div className="ml-20 mt-0 flex flex-col gap-8 overflow-y-scroll overflow-x-hidden h-[70vh]  7xl:h-[80vh] 9xl:h-[80vh]   " style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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

<button className="group flex items-center justify-between gap-2 px-6 py-2  text-electric-blue bg-white rounded-lg font-qimano text-lg hover:bg-blue-50 transition-all duration-200" onClick={() => setShowBrandPopup(true)}>
  <span className="flex items-center gap-2">
    <Image src="/assets/images/aiLogo.svg" alt="ai logo" className="w-6 h-10" width={20} height={20} />
    <span>Talk about your work like a pro, AI&rsquo;s got your back!</span>
  </span>
  <span className="text-xl transition-transform duration-200 group-hover:translate-x-1">→</span>
</button>

<div className="border-b  border-light-grey"></div>

          <MultiSelectInput
            label="Choose Industry (Max 5)"
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
            label={"Give it a title"}
            name="titleName"
            value={currentFormData?.titleName || selectionState?.formData[activeProject?.mediaId]?.titleName || ""}
            onChange={(e) => handleInputChange(e, activeImageId)}
             consideration={currentFormData.considerations?.title}
            considerationType={currentFormData.considerations?.title_type}
          />

          <TitleWithCounter
            name="description"
            label={"Add description"}
            value={currentFormData?.description || selectionState?.formData[activeProject?.mediaId]?.description || ""}
            onChange={(e) => handleInputChange(e, activeImageId)}
            consideration={currentFormData.considerations?.description}
            considerationType={currentFormData.considerations?.description_type}
          />

          {isBrandCollaboration && (
            <>
              <div className="text-black flex flex-col gap-5">
                <div className="flex flex-row gap-2">
                <p className=" text-md whitespace-nowrap">About Company</p>
                <div className="border-b  border-light-grey w-full mb-3"></div>
                </div>
                <FormInput
                  placeholder="Enter name of company"
                  name="companyName"
                  value={currentFormData?.companyName || selectionState?.formData[activeProject?.mediaId]?.companyName || ""}
                  onChange={(e) => handleInputChange(e, activeImageId)}
                  consideration={currentFormData.considerations?.companyName}
                  considerationType={currentFormData.considerations?.companyName_type}
                />
                <FormInput
                  placeholder="Enter location of company"
                  name="companyLocation"
                  value={currentFormData?.companyLocation || selectionState?.formData[activeProject?.mediaId]?.companyLocation || ""}
                  onChange={(e) => handleInputChange(e, activeImageId)}
                  consideration={currentFormData.considerations?.companyLocation}
                  considerationType={currentFormData.considerations?.companyLocation_type}
                />
              </div>

              <div className="text-black flex flex-col gap-5">
              <div className="flex flex-row gap-2">
                <p className=" text-md whitespace-nowrap">Upload logo of the Company</p>
                <div className="border-b  border-light-grey w-full mb-3"></div>
                </div>

              <ProjectCustomFileInput
                onFileChange={(uploadedUrl) => console.log("Uploaded URL:", uploadedUrl)}
                placeholder="Upload a company logo from your device"
                iconSrc="/assets/icons/onboarding/Upload.svg"
                label="Upload company logo"
                activeImageId={activeImageId} 
              />
              </div>

              <div className="text-black flex flex-col gap-5">

              <div className="flex flex-row gap-2">
                <p className=" text-md whitespace-nowrap">About the Event</p>
                <div className="border-b  border-light-grey w-full mb-3"></div>
                </div>
                <FormInput
                  placeholder="Name of the event"
                  name="eventName"
                  value={currentFormData?.eventName || selectionState?.formData[activeProject?.mediaId]?.eventName || ""}
                  onChange={(e) => handleInputChange(e, activeImageId)}
                    consideration={currentFormData.considerations?.eventName}
  considerationType={currentFormData.considerations?.eventName_type}
                />

                <NormalMultiSelect
                  label="Choose Event type"
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

<div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[743px] h-[74px] bg-white rounded-lg shadow-lg  py-1.5 px-4 mb-2 font-apfel-grotezk-regular h-[10%]">
  <div className="flex gap-2">

    <div className="flex gap-[9px] px-3 py-1.5 w-[750px] items-center  rounded-md">

      <div className="flex items-center justify-center gap-[9px]">
         <button onClick={handleNextClick} className="w-[105px] h-[56px]  text-electric-blue text-2xl font-semibold  text-center">
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
                  className="w-[61px] h-[56px] bg-gray-100 text-electric-blue  rounded-md mx-auto font-medium hover:bg-transparent relative"
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
                  <div className="absolute top-[-210%] left-[13%] w-[200px] bg-white shadow-lg rounded-md border border-light-grey z-50 font-apfel-grotezk-regular">
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


        <div className="flex justify-start items-start ">
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
          

      <div className="bg-gray-100 px-3 py-2 w-[247px] h-[56px] rounded-lg flex items-start gap-[8px] w-fit">
  <button
    className="px-4 py-1.5 rounded-lg border-electric-blue border-2 text-electric-blue hover:bg-electric-blue hover:text-white transition-colors"
    onClick={handleBackClick}
  >
    Previous Step
  </button>
  <button
    className={`px-4 py-2 rounded-lg ${
      isFormComplete()
        ? "bg-electric-blue text-white hover:bg-blue-700"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    } rounded transition-colors`}
    onClick={handlePreviewClick}
    disabled={!isFormComplete()}
  >
    Preview
  </button>
     </div>

    </div>
  </div>
</div>
        </div>

  </div>

      </div>
     </div> 
    </div>
  );
}

