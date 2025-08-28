"use client";

import Image from "next/image";
import { useState } from "react";

export default function VideoThumbnail({ 
  src, 
  thumbnailUrl, 
  alt, 
  className = "",
  showPlayIcon = true // <-- can be ignored now, or remove entirely
}) {
  const [useVideo, setUseVideo] = useState(true);

  // If we have a thumbnail URL, always use that
  if (thumbnailUrl) {
    return (
      <div className={`relative ${className}`}>
        <Image
          width={180}
          height={180}
          src={thumbnailUrl}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Try video first, fallback to placeholder on error
  if (useVideo) {
    return (
      <div className={`relative bg-gray-200 overflow-hidden ${className}`}>
        <video
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          src={src}
          onError={() => setUseVideo(false)}
          poster="" // Empty poster to prevent default behavior
        />
      </div>
    );
  }

  // Fallback placeholder
  return (
    <div className={`bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center ${className}`}>
      <div className="text-center">
        
      </div>
    </div>
  );
}
