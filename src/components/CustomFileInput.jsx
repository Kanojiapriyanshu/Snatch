import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useFormContext } from "@/app/onboarding/context";
import cloudinaryUpload from "@/utils/cloudinaryUpload";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const CustomFileInput = ({ onFileChange, placeholder, iconSrc, label, fileNameKey }) => {
  const [tempFileName, setTempFileName] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropping, setIsCropping] = useState(false); // Modal toggle
  const [isProcessing, setIsProcessing] = useState(false); // Loading state for Set button
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const { formData } = useFormContext();
  const uploadedImage =
    formData[iconSrc === "/assets/icons/onboarding/Upload.svg" ? "profilePicture" : "backgroundPicture"];
  const uploadedFileName = formData[fileNameKey];

  useEffect(() => {
    setTempFileName("");
    setImageSrc(null);
  }, [uploadedImage, uploadedFileName]);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      setTempFileName(selectedFile.name);
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        setImageSrc(reader.result);
        setIsCropping(true);
      };
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    // initialize a centered crop with 1:1 aspect ratio
    const crop = centerCrop(
      makeAspectCrop({ unit: "%", width: 50 }, 1, width, height),
      width,
      height
    );
    setCrop(crop);
  };

  const cropImage = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsProcessing(true);

    try {
      const croppedImage = await getCroppedImage(
        imgRef.current,
        completedCrop,
        tempFileName
      );
      const uploadedUrl = await cloudinaryUpload(croppedImage);
      onFileChange(uploadedUrl, tempFileName);
      setIsCropping(false);
      setImageSrc(null);
      setTempFileName("");
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsProcessing(false);
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

      canvas.toBlob(
        (blob) => {
          const file = new File([blob], originalFileName, { type: "image/jpeg" });
          resolve(file);
        },
        "image/jpeg",
        1
      );
    });
  };

  return (
    <div className="mt-4">
      <div
        className="mt-4 flex gap-3 cursor-pointer rounded-md border border-stroke px-5 py-3 text-dark-grey outline-none transition hover:border-primary active:border-primary"
        onClick={handleButtonClick}
      >
        {uploadedImage ? (
          <Image
            src={uploadedImage}
            alt="Preview"
            width={30}
            height={30}
            className="rounded-full object-cover w-10 h-10"
          />
        ) : (
          <Image src={iconSrc} alt="upload" width={30} height={20} />
        )}
        <div className="w-[1px] h-10 bg-stroke"></div>
        <span className="flex items-center">
          {uploadedFileName || placeholder}
        </span>
      </div>

      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
      />

      {isCropping && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] max-h-[90%] overflow-auto">
            <div className="relative w-full h-full md:h-full">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1} // force square crop, remove if you want free aspect
                minWidth={50}
              >
                <img
                  ref={imgRef}
                  alt="Crop source"
                  src={imageSrc}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  if (!isProcessing) {
                    setIsCropping(false);
                    setImageSrc(null);
                    setTempFileName("");
                  }
                }}
                className="px-4 py-2 bg-[#f7f7f7] text-electric-blue rounded-md border border-electric-blue"
                disabled={isProcessing}
              >
                Cancel
              </button>
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

export default CustomFileInput;
