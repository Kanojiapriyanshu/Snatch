"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import useFontSize from "@/hooks/useFontSize";

const LocationCard = ({
  topLocations,
  selectedLocationType,
  setSelectedLocationType,
}) => {
  const [filteredLocations, setFilteredLocations] = useState([]);
    // font sizes with smooth scaling (adjust values if needed)
  const headingSize = useFontSize(24, 30, 1100, 1920); // "Top 3 Locations"
  const buttonSize = useFontSize(15, 18, 1100, 1920); // filter buttons
  const locationSize = useFontSize(20, 28, 1100, 1920); // city/state/country
  const percentageSize = useFontSize(14, 18, 1100, 1920); // %
  const emptyMessageSize = useFontSize(14, 18, 1100, 1920); // fallback message
  //Update location data based on selected filter
  useEffect(() => {
    const getFilteredData = () => {
      const filteredData = topLocations?.slice(0, 3) || [];
      setFilteredLocations(filteredData);
    };

    getFilteredData();
  }, [selectedLocationType, topLocations]);

  return (
    <div className=" h-[27vh] bg-white rounded-md flex justify-between px-2 space-x-1 font-qimano">
      {/* Left Section */}
      <div className="flex flex-row w-[50%] h-[90%] mt-2 ml-3">
        <div className="flex flex-col justify-center items-center mx-auto">
          <Image
            className="mb-5"
            width={36}
            height={20}
            src="/assets/icons/dashboard/email.svg"
            alt="email"
          />
          <p style={{ fontSize: headingSize }}>Top 3 Locations</p>
          <div className="flex gap-5 mt-3">
            {["country", "state", "city"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedLocationType(filter)}
                style={{ fontSize: buttonSize }}
                className={`w-[72px] h-[37px] ${
                  selectedLocationType === filter
                    ? "bg-electric-blue text-white"
                    : "bg-light-grey text-graphite"
                } border border-light-grey rounded-md text-center font-medium hover:bg-electric-blue hover:text-white`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

{/* Right Section - Dynamic Location Data */}
<div className="flex flex-col w-[50%] h-[80%] mt-2 ml-3 p-4 ">
  {filteredLocations.length > 0 ? (
    filteredLocations.map((item, index) => (
      <div
        key={item.id || index}
        style={{ fontSize: locationSize }}
        className={`flex flex-row w-[96%] h-[48px] items-center  ${
          index !== filteredLocations.length - 1 ? 'border-b border-gray-200' : ''
        }`}
      >
        {/* ID and Location Together */}
        <div className="flex items-center w-[70%]">
          <span className="text-gray-500 font-medium mr-2">{String(index + 1).padStart(2, '0')}</span>
          <span className="text-graphite font-qimano ">{item.location || 'N/A'}</span>
        </div>
        {/* Percentage on the right */}
        <span  style={{ fontSize: percentageSize }} className="text-blue-600 w-[50px] text-right font-medium">{item.percentage+"%" || '0%'}</span>
      </div>
    ))
  ) : (
    <div className="flex flex-col items-center justify-center h-full h-90 text-gray-500 mr-20 mt-[20px]">
    <p style={{ fontSize: emptyMessageSize }}
 className="text-center font-apfel-grotezk-regular">Share your portfolio to unlock 
      <p>location insights as soon as</p> 
      <p>people start viewing it.</p></p>
    </div>
  )}
</div>

    </div>
  );
};

export default LocationCard;
