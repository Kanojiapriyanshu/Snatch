// components/CarouselThumbnail.js
"use client";

import Image from "next/image";
import VideoThumbnail from "./VideoThumbnail";

export default function CarouselThumbnail({ post, index, className = "" }) {
  if (!post.children || post.children.length === 0) {
    return null;
  }

  const firstChild = post.children[0];

  return (
    <div className={`relative group ${className}`}>
      {/* Main thumbnail - show first item */}
      {firstChild.mediaType?.includes("VIDEO") ? (
        <VideoThumbnail
          src={firstChild.mediaUrl}
          alt={`Carousel Video ${index}`}
          className="w-full h-full rounded-md"
          showPlayIcon={true}
        />
      ) : (
        <Image
          src={firstChild.mediaUrl}
          alt={`Carousel ${index}`}
          fill
          className="object-cover rounded-md"
        />
      )}
    </div>
  );
}
