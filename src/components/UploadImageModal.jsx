import React, { useState, useRef, useEffect } from "react";
import { fetchProfileData } from "@/utils/postQuestions";
import Image from "next/image";
import clsx from "clsx";

// Mapping object for image names
const imageNameMapping = {
  "https://res.cloudinary.com/dgk9ok5fx/image/upload/v1740396552/7_r6djcr.jpg": "Sunlit Studio",
  "https://res.cloudinary.com/dgk9ok5fx/image/upload/v1740392519/3_koofyi.jpg": "Urban Coffee Shop",
  "https://res.cloudinary.com/dgk9ok5fx/image/upload/v1740396410/4_fcsbyd.jpg": "Modern Workspace",
  "https://res.cloudinary.com/dgk9ok5fx/image/upload/v1740396474/2_svbihw.jpg": "Creative Corner",
  "https://res.cloudinary.com/dgk9ok5fx/image/upload/v1740397248/10_o9u87n.jpg": "Minimalist Desktop",
};

export default function UploadImageModal({ isOpen, onClose, onImageSelect, type, questionIndex }) {
  const imagesByType = [
    "https://res.cloudinary.com/dgk9ok5fx/image/upload/v1740396552/7_r6djcr.jpg",
    "https://res.cloudinary.com/dgk9ok5fx/image/upload/v1740392519/3_koofyi.jpg",
    "https://res.cloudinary.com/dgk9ok5fx/image/upload/v1740396410/4_fcsbyd.jpg",
    "https://res.cloudinary.com/dgk9ok5fx/image/upload/v1740396474/2_svbihw.jpg",
    "https://res.cloudinary.com/dgk9ok5fx/image/upload/v1740397248/10_o9u87n.jpg",
  ];

  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [iconSrc, setIconSrc] = useState("");
  const [tempSelectedImage, setTempSelectedImage] = useState(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollRef = useRef(null);

  const fetchData = async () => {
    try {
      const { aboutQuestions, audienceQuestions, brandQuestions } = await fetchProfileData();

      let defaultImage = "https://res.cloudinary.com/dgk9ok5fx/image/upload/v1740397248/10_o9u87n.jpg";
      let currentImage = defaultImage;
      let currentQuestion = "";
      let currentAnswer = "";

      let questionsArray;
      switch (type) {
        case "about":
          questionsArray = aboutQuestions;
          setIconSrc("/assets/images/aboutIcon.svg");
          break;
        case "audience":
          questionsArray = audienceQuestions;
          setIconSrc("/assets/images/audienceIcon.svg");
          break;
        case "brand":
          questionsArray = brandQuestions;
          setIconSrc("/assets/images/brandIcon.svg");
          break;
        default:
          console.warn("Invalid type provided");
          return;
      }

      if (questionsArray && questionsArray.length > 0) {
        const selectedQuestion = questionsArray[questionIndex];
        if (selectedQuestion) {
          currentImage = selectedQuestion.coverImage || defaultImage;
          currentQuestion = selectedQuestion.question || "";
          currentAnswer = selectedQuestion.answer || "";
        }
      }

      setSelectedImage(currentImage);
      setQuestion(currentQuestion);
      setAnswer(currentAnswer);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setTempSelectedImage(null);
      setShowLeftArrow(false);
      // Check if right arrow should be shown on initial load
      setTimeout(() => {
        if (scrollRef.current) {
          const { scrollWidth, clientWidth } = scrollRef.current;
          setShowRightArrow(scrollWidth > clientWidth);
        }
      }, 100);
    }
  }, [isOpen]);

  const handleImageSelect = (image) => {
    const imageName = imageNameMapping[image] || "Selected Image";
    setTempSelectedImage({ url: image, name: imageName });
    setSelectedImage(image);
  };

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 5); // Show left arrow when scrolled more than 5px
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 220; // Increased for better navigation
      const currentScroll = scrollRef.current.scrollLeft;
      const newScroll = direction === "left" 
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
      
      // Check scroll position after animation completes
      setTimeout(checkScrollPosition, 300);
    }
  };

  const typeColors = {
    about: { bg: "bg-lime-yellow", text: "text-graphite" },
    audience: { bg: "bg-electric-blue", text: "text-white" },
    brand: { bg: "bg-graphite", text: "text-lime-yellow" },
  };

  const cardType = typeColors[type] || typeColors.about;
  const predefinedImages = imagesByType || [];

  const handleClose = () => {
    onClose();
  };

  const handleConfirmUpload = () => {
    if (tempSelectedImage) {
      onImageSelect({
        url: tempSelectedImage.url,
        name: tempSelectedImage.name || imageNameMapping[tempSelectedImage.url] || "Selected Image",
      });
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h2 className="text-3xl text-electric-blue font-qimano">Upload Background</h2>
                <p className="font-apfel-grotezk-regular text-gray-500 mt-2">Select an image that matches the vibe of your question</p>
              </div>
              <button onClick={handleClose} className="text-red-500 text-lg">
                <Image src="/assets/images/close.svg" alt="Close" width={24} height={24} />
              </button>
            </div>

            {/* Image Collection */}
            <div className="flex items-center mb-6">
              <p className="font-qimano text-graphite">Choose from our collection</p>
              <div className="flex-1 ml-4 border-t border-gray-200"></div>
            </div>

            <div className="flex gap-6 mb-8">
              {/* Interactive Preview Card with Strap */}
              <div className="flex-shrink-0 relative">
                {/* Preview Card Strap */}
                
                
                <div
                  className="relative border rounded-md w-[200px] h-[280px] overflow-hidden cursor-pointer mt-4"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <Image
                    src={selectedImage || "https://res.cloudinary.com/dgk9ok5fx/image/upload/v1740397248/10_o9u87n.jpg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    width={200}
                    height={280}
                  /> 
                  <div
                    className={clsx(
                      `absolute left-0 bottom-0 w-full flex flex-col items-center justify-center transition-all duration-300 rounded-t-md p-4`,
                      cardType.bg,
                      cardType.text,
                      hovered ? "h-[100%]" : "h-[50%]"
                    )}
                    
                  >
                    <Image 
                      src={iconSrc || "/assets/images/aboutIcon.svg"} 
                      alt="about-icon" 
                      height={40} 
                      width={40} 
                      className="w-10 h-10 mb-4" 
                    />
                    <p className={clsx("text-center font-qimano text-sm", cardType.text)}>
                      {question}
                    </p>
                    {hovered && (
                      <p className={clsx("text-xs text-center font-apfel-grotezk-regular mt-4 px-2", cardType.text)}>
                        {answer}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable Image Row */}
              <div className="relative flex-1 overflow-hidden mt-4">
                {/* Left Scroll Button - Only show when scrolled right */}
                {showLeftArrow && (
                  <button
                    onClick={() => handleScroll("left")}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-transparent/60 border border-gray-200 p-3 rounded-full shadow-lg z-20 hover:bg-transparent hover:shadow-xl transition-all"
                  >
                    <Image
                      src="/assets/images/forwardArrowBlack.svg"
                      alt="Left Arrow"
                      width={20}
                      height={20}
                      className="w-5 h-5 transform rotate-180"
                    />
                  </button>
                )}

                <div
                  ref={scrollRef}
                  className="flex overflow-hidden space-x-4 px-3 py-2"
                  style={{ 
                    scrollbarWidth: "none", 
                    msOverflowStyle: "none",
                    overflowX: "hidden",
                    touchAction: "pan-y pinch-zoom"
                  }}
                  onScroll={checkScrollPosition}
                >
                  {[...uploadedImages, ...predefinedImages].map((image, index) => (
                    <div
                      key={index}
                      onClick={() => handleImageSelect(image)}
                      className={clsx(
                        "cursor-pointer rounded-md overflow-hidden flex-shrink-0 w-[200px] h-[280px] transition-all duration-200 hover:scale-105 relative",
                        (tempSelectedImage?.url === image || selectedImage === image)
                          ? "border-2 border-electric-blue"
                          : "border-0"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={200}
                        height={280}
                      />
                      {/* Selected banner */}
                      {(tempSelectedImage?.url === image || selectedImage === image) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-electric-blue text-white py-2 text-center">
                          <span className="text-sm font-semibold">Selected</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Right Scroll Button */}
                {showRightArrow && (
                  <button
                    onClick={() => handleScroll("right")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent/60 border border-gray-200 p-3 rounded-full shadow-lg z-20 hover:bg-transparent hover:shadow-xl transition-all"
                  >
                    <Image 
                      src="/assets/images/forwardArrowBlack.svg" 
                      alt="Right Arrow" 
                      width={20} 
                      height={20} 
                      className="w-5 h-5" 
                    />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleConfirmUpload}
                disabled={!tempSelectedImage}
                className={clsx(
                  "px-8 py-3 text-white rounded-md flex justify-center items-center transition-colors font-apfel-grotezk-regular text-lg",
                  tempSelectedImage 
                    ? "bg-electric-blue hover:bg-electric-blue/90" 
                    : "bg-gray-400 cursor-not-allowed"
                )}
              >
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}