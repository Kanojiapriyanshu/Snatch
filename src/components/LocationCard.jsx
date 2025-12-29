"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import useFontSize from "@/hooks/useFontSize";
import { useUser } from "@/context/UserContext";
import { isFree } from "@/utils/planUtils";
import Tooltip from "@/components/ui/Tooltip";
import { PLAN_TOOLTIPS } from "@/data/planTooltips";

const LocationCard = ({
  topLocations,
  selectedLocationType,
  setSelectedLocationType,
}) => {
  const [filteredLocations, setFilteredLocations] = useState([]);

  // font sizes
  const headingSize = useFontSize(24, 30, 1100, 1920);
  const buttonSize = useFontSize(15, 18, 1100, 1920);
  const locationSize = useFontSize(20, 28, 1100, 1920);
  const percentageSize = useFontSize(14, 18, 1100, 1920);
  const emptyMessageSize = useFontSize(14, 18, 1100, 1920);

  const { plan } = useUser();

  // ✅ SINGLE SOURCE OF TRUTH
  const isFreePlan = isFree(plan);
  const tooltip =
  PLAN_TOOLTIPS.dashboard_analytics[plan] ??
  PLAN_TOOLTIPS.dashboard_analytics.free;

  useEffect(() => {
    const filteredData = topLocations?.slice(0, 3) || [];
    setFilteredLocations(filteredData);
  }, [selectedLocationType, topLocations]);

  return (
    <div>
      {/* ================= PRO VIEW ================= */}
      {!isFreePlan && (
        <div className="relative h-[27vh] bg-white rounded-md font-qimano  overflow-visible w-full">
          <div className="absolute inset-0 flex justify-between px-2  overflow-visible">
            
            {/* Pro Grey Icon */}
            <div className="absolute top-3 left-3">
            <Tooltip title={tooltip.title} body={tooltip.body} placement={"bottom"}>
              <Image
                src="/assets/images/pro-grey.svg"
                alt="pro"
                width={22}
                height={22}
                className="cursor-pointer"
              />
            </Tooltip>
          </div>


            {/* LEFT */}
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
                      } border border-light-grey rounded-md font-medium hover:bg-electric-blue hover:text-white`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col w-[50%] h-[80%] mt-2 ml-3 p-4">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((item, index) => (
                  <div
                    key={item.id || index}
                    style={{ fontSize: locationSize }}
                    className={`flex items-center h-[48px] ${
                      index !== filteredLocations.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-center w-[70%]">
                      <span className="text-gray-500 mr-2">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-graphite">
                        {item.location || "N/A"}
                      </span>
                    </div>

                    <span
                      style={{ fontSize: percentageSize }}
                      className="text-blue-600 w-[50px] text-right font-medium"
                    >
                      {item.percentage ?? 0}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-5">
                  <p
                    style={{ fontSize: emptyMessageSize }}
                    className="text-center"
                  >
                    Share your portfolio to unlock
                    <br />
                    location insights as soon as
                    <br />
                    people start viewing it.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= FREE PLAN OVERLAY ================= */}
      {isFreePlan && (
        <div className="relative h-[27vh] bg-white rounded-md flex font-qimano px-10 py-6">
          
          {/* LEFT */}
          <div className="flex flex-col w-[50%] justify-center items-center">
            <Image
              className="mb-2"
              width={36}
              height={20}
              src="/assets/images/email-grey.svg"
              alt="email"
            />

            <p
              style={{ fontSize: headingSize }}
              className="text-[#878787]"
            >
              Top 3 Locations
            </p>

            <div className="flex gap-5 mt-3">
              {["country", "state", "city"].map((filter) => (
                <button
                  key={filter}
                  style={{ fontSize: buttonSize }}
                  className="w-[72px] h-[37px] bg-[#212121]/10 text-[#BFBFBF] rounded-md"
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT CTA */}        
          <Tooltip title={tooltip.title} body={tooltip.body} placement={"top"} offset={-40} >
          <div className="flex flex-col items-center justify-center text-center mx-auto cursor-pointer ml-20 mt-8">
            <Image
              src="/assets/images/pro-black.svg"
              alt="upgrade"
              width={20}
              height={20}
              className="mb-3"
            />
            <p className="text-graphite text-[20px] leading-6">
              Get Snatch Pro to unlock
              <br />
              advanced metrics
            </p>
          </div>
        </Tooltip>


        </div>
      )}
    </div>
  );
};

export default LocationCard;
