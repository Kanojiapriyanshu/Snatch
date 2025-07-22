"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { z } from "zod";
// Remove SVG imports

const SOCIAL_OPTIONS = [
  {
    value: "facebook",
    label: "Facebook",
    icon: "/assets/images/facebook_logo.svg",
    hoverIcon: "/assets/images/facebook_logo_h.svg",
    pattern: /^https:\/\/(www\.)?facebook\.com\/(?!pages\/)([a-zA-Z0-9.]+|(profile\.php\?id=\d+))$/,
    errorMessage: "Invalid Facebook profile URL",
  },
  {
    value: "x",
    label: "X (formerly Twitter)",
    icon: "/assets/images/X_logo.svg",
    hoverIcon: "/assets/images/X_logo_h.svg",
    pattern: /^https:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+$/,
    errorMessage: "Invalid X (Twitter) profile URL",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: "/assets/images/linkedin_logo.svg",
    hoverIcon: "/assets/images/linkedin_logo_h.svg",
    pattern: /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+$/,
    errorMessage: "Invalid LinkedIn profile URL",
  },
  {
    value: "youtube",
    label: "YouTube",
    icon: "/assets/images/youtube_logo.svg",
    hoverIcon: "/assets/images/youtube_logo_h.svg",
    pattern: /^https:\/\/(www\.)?youtube\.com\/(user\/[a-zA-Z0-9_-]+|channel\/[a-zA-Z0-9_-]+|\@[a-zA-Z0-9._-]+)$/,
    errorMessage: "Invalid YouTube profile URL",
  },
];


// Generate Zod schemas for each social platform
const urlSchemas = SOCIAL_OPTIONS.reduce((schemas, option) => {
  schemas[option.value] = z.string().regex(option.pattern, { message: option.errorMessage });
  return schemas;
}, {});

export default function SocialLinksDropdown({ initialData, onChange, onDelete }) {
  const [selectedOption, setSelectedOption] = useState(
    initialData?.icon
      ? SOCIAL_OPTIONS.find((opt) => opt.icon === initialData.icon) || SOCIAL_OPTIONS[0]
      : SOCIAL_OPTIONS[0]
  );
  const [url, setUrl] = useState(initialData?.url || "");
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState(null);
  const ref = useRef(null)
  useEffect(() => {
    if (onChange) {
      onChange({ icon: selectedOption.icon, url });
    }
  }, [selectedOption, url]);

  const validateUrl = (currentUrl) => {
  if (!currentUrl) {
    setError(null); // Don't show error if input is empty
    return;
  }
  try {
    urlSchemas[selectedOption.value].parse(currentUrl);
    setError(null);
  } catch (e) {
    setError(e.errors[0]?.message || "Invalid URL");
  }
};

  const handleIconSelect = (option) => {
    setSelectedOption(option);
    setUrl(""); // Clear the URL input when changing platform
    setError(null); // Clear any previous error
    setIsDropdownOpen(false);
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    validateUrl(newUrl);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(); // Call the onDelete function passed from the parent
    }
  };

  return (
    <div ref={ref} className="relative w-full mt-4">
      {/* Input container */}
      <div className="flex items-center w-full rounded-md border border-stroke px-2 py-1 relative">
        {/* Social Icon (SVG logo) */}
        <span className="text-[#7f7f7f] bg-transparent" style={{ background: "none" }}>
          {selectedOption.icon ? (
            <Image src={selectedOption.icon} alt={selectedOption.label} width={40} height={40} style={{ width: 40, height: 40, background: "none" }} />
          ) : null}
        </span>
        {/* Vertical Divider */}
        <div className="w-[1px] h-8 bg-stroke mx-1"></div>
        {/* URL Input */}
        <input
          type="url"
          placeholder="Enter Social Link URL"
          className={`flex-grow pl-2 bg-transparent text-graphite outline-none transition placeholder:text-dark-grey ${error ? "border-red-500" : ""}`}
          value={url}
          onChange={handleUrlChange}
        />
        {/* Delete Icon */}
        <div
          className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 cursor-pointer"
          onClick={handleDelete}
        >
          <Image
            src="/assets/images/delete.svg"
            alt="Delete"
            width={21}
            height={16}
          />
        </div>
        {/* Dropdown Icon (Arrow) */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-12 cursor-pointer"
          onClick={toggleDropdown}
        >
          <Image
            src="/assets/icons/onboarding/Dropdownarrow.svg"
            alt="Dropdown Arrow"
            width={16}
            height={16}
          />
        </div>
      </div>
      {/* Error Message */}
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
      {/* Dropdown List - Full Width of Input */}
      {isDropdownOpen && (
        <ul className="absolute mt-2 w-full rounded-lg border border-stroke bg-[#E2E2E2] py-2 z-10">
          {SOCIAL_OPTIONS.map((option, index) => (
            <React.Fragment key={option.value}>
              <li
                className="px-5 py-2 text-graphite hover:text-electric-blue cursor-pointer flex items-center gap-2 justify-between"
                onClick={() => handleIconSelect(option)}
                onMouseEnter={() => setHoveredOption(option.value)}
                onMouseLeave={() => setHoveredOption(null)}
              >
                <span className={selectedOption.value === option.value ? "text-electric-blue flex items-center gap-2" : "flex items-center gap-2"}>
                  {option.icon ? (
                    <Image
                      src={hoveredOption === option.value && option.hoverIcon ? option.hoverIcon : option.icon}
                      alt={option.label}
                      width={40}
                      height={40}
                      style={{ width: 40, height: 40, background: "none" }}
                    />
                  ) : null}
                  {option.label}
                </span>
                {selectedOption.value === option.value && (
                  <Image src="/assets/images/Hand_state.svg" alt="Selected" width={30} height={30} />
                )}
              </li>
              {index !== SOCIAL_OPTIONS.length - 1 && (
                <div className="border-t border-gray-300 mx-5" />
              )}
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  );
}
