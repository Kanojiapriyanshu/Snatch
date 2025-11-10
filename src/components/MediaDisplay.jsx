import React, { useState } from "react";
import Image from "next/image";
import { useSelectedProjects } from "@/app/manage-projects/context";

const MediaDisplay = ({ media, uploadedFiles, displayType, showLoader, loading  }) => {
  const [carouselIndexes, setCarouselIndexes] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); 
  const [mutedStates, setMutedStates] = useState({});

  const {
    selectionState,
    addInstagramSelection,
    removeInstagramSelection,
    removeFile,
    addFile,
  } = useSelectedProjects();
  const MAX_SELECTION = 12;

  // Check if a media item is selected
  const isMediaSelected = (mediaId) =>
    selectionState?.instagramSelected?.some((item) => item.mediaId === mediaId);

  const isUploadedFileSelected = (mediaId) =>
    selectionState?.uploadedFiles?.some((file) => file.mediaId === mediaId);

  // Find the selected project/file by id
  const getSelectedInstagramProject = (mediaId) =>
    selectionState?.instagramSelected?.find((item) => item.mediaId === mediaId);

  const getSelectedUploadedFile = (mediaId) =>
    selectionState?.uploadedFiles?.find((file) => file.mediaId === mediaId);

  // Toggle select/deselect for Instagram media
  const handleSelect = (mediaItem) => {
    const totalSelected =
    (selectionState.instagramSelected?.length || 0) +
    (selectionState.uploadedFiles?.length || 0);

      // Otherwise, check the limit
    if (totalSelected >= MAX_SELECTION) {
      alert(`You can select up to ${MAX_SELECTION} projects only.`);
      return;
    }
    
    if (isMediaSelected(mediaItem.id)) {
        const hasFormData = selectionState.formData?.some(
      (item) => item.key === String(mediaItem.id)
    );
    if (hasFormData) {
      setPendingDelete({ type: "instagram", id: mediaItem.id });
      setShowConfirm(true);
    } else {
      removeInstagramSelection(mediaItem.id);
    }
      return;
    }
    // Add logic (unchanged)
    if (mediaItem.media_type === "CAROUSEL_ALBUM" && mediaItem.children) {
      addInstagramSelection(
        mediaItem.media_url,
        mediaItem.id,
        mediaItem.media_type,
        mediaItem.caption || "",   // ✅ Pass caption
        mediaItem.children.map((child) => ({
          id: child.id,
          media_url: child.media_url,
          media_type: child.media_type,
        }))
      );
    } else {
      addInstagramSelection(
        mediaItem.media_url,
        mediaItem.id,
        mediaItem.media_type,
        mediaItem.caption || ""   // ✅ Pass caption
      );
    }
  };

  // Toggle select/deselect for uploaded files
  const handleFileSelect = (file) => {
    if (isUploadedFileSelected(file.mediaId)) {
      const hasFormData = selectionState.formData?.some(
        (item) => item.key === String(file.mediaId)
      );
      if (hasFormData) {
        setPendingDelete({ type: "uploaded", id: file.mediaId });
        setShowConfirm(true);
      } else {
        removeFile(file.mediaId);
      }
    } else {
      addFile && addFile(file);
    }
  };

  // Handle confirmation popup actions
  const handleConfirmDelete = () => {
    if (pendingDelete) {
      if (pendingDelete.type === "instagram") {
        removeInstagramSelection(pendingDelete.id);
      } else if (pendingDelete.type === "uploaded") {
        removeFile(pendingDelete.id);
      }
    }
    setShowConfirm(false);
    setPendingDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setPendingDelete(null);
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

  const toggleMute = (id) => {
  setMutedStates((prev) => ({
    ...prev,
    [id]: !prev[id], // toggle this specific video
  }));
};


  return (
    <div className="mb-20 flex 7xl:justify-center" >
      {/* Confirmation Popup */}
      {showConfirm && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white rounded-2xl w-[490px] p-6 shadow-xl relative">
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-black"
        onClick={() => setShowConfirm(false)}
      >
        <Image src="/assets/images/close.svg" alt="close" className="w-4 h-5" height={10} width={10}/>
      </button>

      {/* Title */}
      <h2 className="text-lg font-medium text-gray-600 mb-2 font-qimano">Disclaimer</h2>

      {/* Horizontal Line */}
      <hr className="my-3" />

      {/* Body Text */}
      <p className="text-graphite text-sm mb-6 font-apfel-grotezk-regular">
       This project and its related information will be deleted. Are you sure you want to continue?
      </p>

      {/* Buttons */}
      <div className="flex justify-center gap-5 font-apfel-grotezk-regular">
        <button
          className="px-10 py-2 border border-electric-blue text-electric-blue rounded-lg hover:bg-electric-blue hover:text-white text-sm"
          onClick={handleCancelDelete}
        >
         No
        </button>
        <button
          className="px-10 py-2 bg-electric-blue text-white rounded-lg text-sm "
          onClick={handleConfirmDelete}
        >
          Yes, Continue
        </button>
      </div>
    </div>
  </div>
)}

    {/* Responsive grid with rectangular aspect ratio */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 w-full max-w-7xl">
      {/* Instagram Media */}
      {displayType === "instagram" && media?.length > 0 ? (
        media.map((mediaItem) => (
          <div
            key={mediaItem.id}
            className="relative w-full aspect-[4/5] border border-gray-300 rounded-md overflow-hidden cursor-pointer"
            onClick={() => handleSelect(mediaItem)}
          >
            {/* Circle on Top Left */}
            <div
              className={`absolute top-2 left-2 w-4 h-4 rounded-full flex items-center justify-center z-10 ${
                isMediaSelected(mediaItem.id)
                  ? "bg-electric-blue"
                  : "bg-transparent border border-black"
              }`}
            >
              {/* Optional: Add text or icon inside the circle */}
            </div>

            {/* Media Content */}
            {mediaItem.media_type === "IMAGE" ? (
              <img
                src={mediaItem.media_url}
                alt={mediaItem.id || "Media"}
                className="object-cover w-full h-full"
              />
            ) : mediaItem.media_type === "VIDEO" ? (
            <video
              controls
              disablePictureInPicture
              controlsList="nofullscreen nodownload noplaybackrate noremoteplayback"
              muted={mutedStates[mediaItem.id] ?? true} // default true
              className="object-cover w-full h-full"
              src={mediaItem.media_url}
            />
            ) : mediaItem.media_type === "CAROUSEL_ALBUM" &&
              mediaItem.children ? (
              <div className="relative w-full h-full">
                {mediaItem.children.map((child, index) => (
                  <div
                    key={child.id}
                    className={`absolute inset-0 transition-transform duration-500 ${
                      (carouselIndexes[mediaItem.id] || 0) === index
                        ? "translate-x-0 opacity-100"
                        : "translate-x-full opacity-0"
                    }`}
                  >
                    {child.media_type === "IMAGE" ? (
                      <img
                        src={child.media_url}
                        alt={`Media ${child.id}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        controls
                        disablePictureInPicture
                        controlsList="nofullscreen nodownload noplaybackrate noremoteplayback"
                        muted={mutedStates[child.id] ?? true} 
                        className="w-full h-full object-cover"
                        src={child.media_url}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                ))}

                {/* Navigation Dots */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  {mediaItem.children.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        (carouselIndexes[mediaItem.id] || 0) === index
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <button
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-6 h-6 flex justify-center items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlide(
                      mediaItem.id,
                      "prev",
                      mediaItem.children.length
                    );
                  }}
                >
                  ❮
                </button>
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-6 h-6 flex justify-center items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlide(
                      mediaItem.id,
                      "next",
                      mediaItem.children.length
                    );
                  }}
                >
                  ❯
                </button>
              </div>
            ) : (
              <p>Unsupported media type</p>
            )}

            {/* Selected Line */}
            {isMediaSelected(mediaItem.id) && (
              <div className="absolute bottom-0 left-0 right-0 bg-electric-blue h-[35px] flex items-center justify-center font-apfel-grotezk-regular">
                <Image
                  src="/assets/images/okay.svg"
                  alt="okay"
                  width={10}
                  height={10}
                  className="w-[15px] h-[12px] mr-7"
                />
                <span className="text-white -ml-5" style={{ fontWeight: 10 }}>
                  Selected
                </span>
              </div>
            )}
          </div>
        ))
      ) : displayType === "uploaded" && uploadedFiles?.length > 0 ? (
    uploadedFiles.map((file) => {
      const isSelected = isUploadedFileSelected(file.mediaId);

      // Detect whether it's an image or video
      const isVideo = file.fileType?.startsWith("video/") || file.fileUrl?.match(/\.(mp4|webm|ogg)$/i);
      const isImage = file.fileType?.startsWith("image/") || file.fileUrl?.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/i);

      return (
        <div
          key={file.mediaId}
          className="relative aspect-[4/5] w-full border border-gray-300 rounded-md overflow-hidden cursor-pointer"
          onClick={() => handleFileSelect(file)}
        >
          {/* ✅ File Preview */}
          {isImage ? (
            <img
              src={file.fileUrl}
              alt={file.fileName || "uploaded image"}
              className="w-full h-full object-cover "
            />
          ) : isVideo ? (
            <video
              src={file.fileUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Unsupported file
            </div>
          )}

          {/* ✅ Selection Circle */}
          <div
            className={`absolute top-2 left-2 w-4 h-4 rounded-full flex items-center justify-center z-10 ${
              isSelected ? "bg-electric-blue" : "bg-transparent border border-black"
            }`}
          ></div>

          {/* ✅ Selected Overlay */}
          {isSelected && (
            <div className="absolute bottom-0 left-0 right-0 bg-electric-blue h-[35px] flex items-center justify-center font-apfel-grotezk-regular">
              <img
                src="/assets/images/okay.svg"
                alt="okay"
                className="w-[15px] h-[12px] mr-7"
              />
              <span className="text-white -ml-5" style={{ fontWeight: 10 }}>
                Selected
              </span>
            </div>
          )}
        </div>
      );
    })

      ) : displayType === "instagram" && (!media || media.length === 0) ? (
       <div className="col-span-full flex flex-col items-center justify-center w-full h-96 mx-auto">
    <Image
      src="/assets/icons/sandwatch.svg"
      alt="Loading"
      width={52}
      height={73}
      className="animate-pulse"
    />
    <p className="text-electric-blue font-qimano text-md lg:text-2xl animate-pulse text-center mt-4">
      Hold on while we fetch your posts!
    </p>
  </div>
      ) : null}
    </div>
  </div>
  );
};

export default MediaDisplay;