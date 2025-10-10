"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useSelectedProjects } from "@/app/manage-projects/context";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ProjectCustomFileInput = ({
  placeholder,
  iconSrc,
  label,
  onFileChange,
  activeImageId,
}) => {
  const [confirmedFileName, setConfirmedFileName] = useState("");
  const [pendingFileName, setPendingFileName] = useState("");
  const [pendingImageSrc, setPendingImageSrc] = useState(null);
  const [confirmedImageSrc, setConfirmedImageSrc] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // ✅ loader state

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  const { handleCompanyLogoUpload, updateFormDataForMedia, selectionState } =
    useSelectedProjects();

  useEffect(() => {
    if (!activeImageId) return;

    const formDataEntry = Array.isArray(selectionState.formData)
      ? selectionState.formData.find(
          (item) => item.key === activeImageId.toString()
        )
      : null;

    setConfirmedFileName(formDataEntry?.companyLogoFileName || "");
    setConfirmedImageSrc(formDataEntry?.companyLogo || null);
  }, [activeImageId, selectionState.formData]);

  const handleButtonClick = () => fileInputRef.current.click();

  const handleFileChange = (event) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        setPendingImageSrc(reader.result);
        setIsCropping(true);
        setPendingFileName(selectedFile.name);
      };
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: "%", width: 50 }, 1, width, height),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const cropImage = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsProcessing(true); // start loader

    const croppedImage = await getCroppedImage(
      imgRef.current,
      completedCrop,
      pendingFileName
    );

    try {
      const uploadedUrl = await handleCompanyLogoUpload(
        croppedImage,
        activeImageId
      );

      updateFormDataForMedia(activeImageId, {
        companyLogo: uploadedUrl,
        companyLogoFileName: pendingFileName,
      });

      onFileChange(uploadedUrl);

      setConfirmedImageSrc(uploadedUrl);
      setConfirmedFileName(pendingFileName);
      setIsCropping(false);
      setPendingImageSrc(null);
      setPendingFileName("");
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsProcessing(false); // stop loader
    }
  };

  const getCroppedImage = (image, crop, originalFileName) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob((blob) => {
        const file = new File([blob], originalFileName, { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg");
    });
  };

  return (
    <div className="mt-0">
      {/* Upload Container */}
      <div
        className="mt-0 flex items-center gap-4 cursor-pointer rounded-md border border-stroke px-5 py-3 text-dark-grey outline-none transition hover:border-primary active:border-primary"
        onClick={handleButtonClick}
      >
        {confirmedImageSrc ? (
          <img
            src={confirmedImageSrc}
            alt="Logo Preview"
            className="w-8 h-8 rounded-full object-cover border"
          />
        ) : (
          <Image src={iconSrc} alt="upload" width={30} height={30} />
        )}
        <span className="text-sm text-gray-700">
          {confirmedFileName || placeholder}
        </span>
      </div>

      {/* Hidden Input */}
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
      />

      {/* Crop Modal */}
      {isCropping && pendingImageSrc && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] max-h-[90%] overflow-auto">
            <div className="relative w-full h-[90%]">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                minWidth={40}
                circularCrop={true}
              >
                <img
                  ref={imgRef}
                  alt="Crop source"
                  src={pendingImageSrc}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
            <div className="flex gap-4 mt-4 justify-start">
              <button
                onClick={() => {
                  setIsCropping(false);
                  setPendingImageSrc(null);
                  setPendingFileName("");
                }}
                className="px-4 py-2 rounded-md border-[1px] border-electric-blue bg-[#f7f7f7] text-electric-blue transition-colors"
                disabled={isProcessing} // prevent cancel while uploading
              >
                Cancel
              </button>
              {/* <button
                onClick={cropImage}
                className="px-4 py-2 bg-electric-blue border text-white rounded-md flex items-center justify-center min-w-[60px]"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Set"
                )}
              </button> */}
              <button
              onClick={cropImage}
              disabled={isProcessing}
              className="px-4 py-2 bg-electric-blue text-white rounded-md flex items-center justify-center min-w-[60px]"
            >
              {isProcessing ? "Uploading..." : "Upload"}
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCustomFileInput;
