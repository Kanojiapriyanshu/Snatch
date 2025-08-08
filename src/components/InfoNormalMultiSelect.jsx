
"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const InfoNormalMultiSelect = ({ label, options, selectedValues, onAddValue, onRemoveValue }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(null);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleOptionSelect = (option) => {
    if (!selectedValues.includes(option)) {
      onAddValue(option);
    } else {
      onRemoveValue(option);
    }
    // Do not close the dropdown on selection
  };

  const getTooltipText = (option) => {
    switch (option) {
      case "Sponsorships":
        return "Influencers are paid a fixed amount for each piece of content they create.";
      case "Gifting":
        return "Compensating Influencers with products or services instead of money.";
        case "Affiliate":
      return (
        <>
          Influencers promote a product or service and receive a commission<br />
           for every sale made through a unique   affiliate link they share. <br />
        </>
      );
      case "Hosted":
        return (
          <>
          Influencers are invited to events or trips, often in exchange for creating and <br /> sharing content related to the experience.
          </>)
      case "Collaboration":
        return "Influencers sometimes collaborate with brands to create a product.";
      default:
        return "";
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Label and Info Icon */}
      <div className="flex items-center mb-2">
        <label htmlFor={label} className="block text-md font-medium text-graphite">
          {label}
        </label>
      </div>

      {/* Input container */}
      <div
        className="relative z-20 w-full bg-transparent rounded-md border border-gray-300 p-[2px] pr-8 text-graphite outline-none transition focus:border-primary active:border-primary cursor-pointer"
        onClick={toggleDropdown}
      >
        <div className="flex flex-wrap items-center gap-2 min-h-[40px]" style={{ padding: "0px" }}>
          {Array.isArray(selectedValues) &&
            selectedValues.map((value, index) => (
              <span
                key={`${label}-${index}`}
                className="flex items-center px-3 py-1 text-sm text-graphite bg-[#0037EB] bg-opacity-10 rounded-md m-[5px]"
              >
                <span>{value}</span>
                <button
                  type="button"
                  className="ml-2 text-xs text-gray-500 hover:text-red-500"
                  onClick={e => { e.stopPropagation(); onRemoveValue(value); }}
                >
                  ✕
                </button>
              </span>
            ))}
        </div>
        {/* Dropdown Icon */}
        <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity={0.8}>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                fill="#6B7280"
              />
            </g>
          </svg>
        </span>
      </div>

      {/* Dropdown List */}
      {isDropdownOpen && (
        <ul className="absolute mt-2 w-full rounded-lg border border-stroke bg-[#E9E9E9] py-2 z-50">
          {options.map((option, idx) => (
            <li
              key={idx}
              className="px-5 py-2 text-graphite hover:text-electric-blue cursor-pointer flex items-center gap-2"
              onClick={(e) => { e.stopPropagation(); handleOptionSelect(option); }}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => handleOptionSelect(option)}
                className="mr-2 accent-electric-blue hover:border-electric-blue focus:ring-electric-blue border border-gray-300 transition-colors duration-150"
                onClick={e => e.stopPropagation()} // Prevent dropdown toggle
              />
              <span>{option}</span>
              <div
                className="relative"
                onMouseEnter={() => setIsTooltipVisible(idx)}
                onMouseLeave={() => setIsTooltipVisible(null)}
              >
                <Image
                  src={isTooltipVisible === idx ? "/assets/images/info_h.svg" : "/assets/images/info.svg"}
                  alt="info"
                  width={16}
                  height={16}
                  className="cursor-pointer"
                />
                {isTooltipVisible === idx && (
                  <div className="absolute left-full top-0 text-start px-2 pb-8 text-sm text-graphite rounded-lg whitespace-nowrap max-w-[800px] ">
                    {getTooltipText(option)}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InfoNormalMultiSelect;