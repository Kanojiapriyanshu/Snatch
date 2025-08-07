import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useFormContext } from "@/app/onboarding/context";
import cloudinaryUpload from "@/utils/cloudinaryUpload";
import Cropper from "react-easy-crop";

const CustomFileInput = ({ onFileChange, placeholder, iconSrc, label, fileNameKey }) => {
  const [tempFileName, setTempFileName] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // <-- Added for "Set" button loading
  const { formData } = useFormContext();
  const fileInputRef = useRef(null);

  const uploadedImage = formData[iconSrc === "/assets/icons/onboarding/Upload.svg" ? "profilePicture" : "backgroundPicture"];
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

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const cropImage = async () => {
    setIsUploading(true); // Start uploading state
    try {
      const croppedImage = await getCroppedImage(imageSrc, croppedAreaPixels, tempFileName);
      const uploadedUrl = await cloudinaryUpload(croppedImage);
      onFileChange(uploadedUrl, tempFileName);
      setIsCropping(false);
      setImageSrc(null);
      setTempFileName("");
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false); // End uploading state
    }
  };

  const getCroppedImage = (imageSrc, croppedAreaPixels, originalFileName) => {
    return new Promise((resolve) => {
      const image = new window.Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );
        canvas.toBlob((blob) => {
          const file = new File([blob], originalFileName, { type: "image/jpeg" });
          resolve(file);
        }, "image/jpeg");
      };
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
        <span className="flex items-center">{uploadedFileName || placeholder}</span>
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
            <div className="relative w-full h-[300px] md:h-[400px]">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => {
                  if (!isUploading) {
                    setIsCropping(false);
                    setImageSrc(null);
                    setTempFileName("");
                  }
                }}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={cropImage}
                disabled={isUploading}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  isUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
                }`}
              >
                {isUploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Uploading...
                  </>
                ) : (
                  "Set"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFileInput;
