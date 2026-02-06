"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PieChart from "../Profilepage/PieChart";
import SimpleWorldMap from "../Profilepage/Map";
import AgeRangeChart from "../Profilepage/AgeRangeChart";
import generateAudienceInsights from "@/utils/generateAudienceInsights";
import { usePathname } from "next/navigation";
import { PLAN_TOOLTIPS } from "@/data/planTooltips";
import Tooltip from "@/components/ui/Tooltip";
import Image from "next/image";
import useFontSize from "@/hooks/useFontSize";

// Fetch function for demographics
const fetchDemographics = async (username) => {
  const [genderRes, ageRes, countryRes] = await Promise.all([
    fetch(`/api/public-portfolio/audience/genderDemographics?username=${username}`),
    fetch(`/api/public-portfolio/audience/allDemographics?username=${username}`),
    fetch(`/api/public-portfolio/audience/countryDemographics?username=${username}`),
  ]);

  const [genderData, ageData, countryData] = await Promise.all([
    genderRes.json(),
    ageRes.json(),
    countryRes.json(),
  ]);


  return {
    genderData: genderData.demographics,
    ageData: ageData.ageDistribution,
    countryData: countryData.countryDistribution,
  };
};

const AudienceCard = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(null)
  const username = segments[0];
  const isAdminView = segments.includes("adminview");
  const plan = limits?.plan;
  const isProPlan = plan === "pro" || plan === "trial" || plan === "early_bird";
  const canSeeInsights = isProPlan || isAdminView;
  const tooltip = PLAN_TOOLTIPS.audience_insights[plan] ?? PLAN_TOOLTIPS.number_of_projects.free;



  const labelSize = useFontSize(22, 28, 1100, 1920); // label scales from 16px → 24px


  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/user/public/user-plan?username=${username}`
        );
        const data = await res.json();
        setLimits(data);
      } catch (err) {
        console.error("Error fetching plan:", err);
      } finally {
        setLoading(false);
      }
    }

    if (username) load();
  }, [username]);

  // React Query hook for demographics
  const { data: demographicData, isLoading: isDemographicsLoading } = useQuery({
    queryKey: ["audienceDemographics", username],
    queryFn: () => fetchDemographics(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // React Query hook for AI insights  - no for free plan without adminview link
  const { data: insights, isLoading: isInsightsLoading } = useQuery({
    queryKey: ["audienceInsights", username, demographicData],
    queryFn: () => generateAudienceInsights(demographicData),
    enabled: !!demographicData && canSeeInsights,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });


  const genderEndpoint = username
    ? `/api/public-portfolio/audience/genderDemographics?username=${username}`
    : "";
  const ageEndpoint = username
    ? `/api/public-portfolio/audience/allDemographics?username=${username}`
    : "";
  const locationEndpoint = username
    ? `/api/public-portfolio/audience/countryDemographics?username=${username}`
    : "";

  return (
    <div className=" w-full flex flex-col justify-center items-center  border-green ">
      {/*  border-red-dark */}
      <h3 className="text-4xl min-[960px]:max-[1280px]:text-5xl min-[1300px]:text-7xl  font-qimano text-electric-blue text-center px-4  rounded-xl">
        Audience
      </h3>

      <div className="mx-auto w-full  flex flex-col px-2 lg:px-10 lg:flex-row gap-6  mt-6 justify-center  border-red">

        {/* Gender */}
        {genderEndpoint && (
          <div className="bg-gray-100 shadow-sm rounded-xl py-3 w-full max-[960px]:w-full max-[960px]:h-[512px] max-[1280px]:h-[500px] max-[1280px]:w-[390px] min-[1300px]:w-[422px] min-[1300px]:h-[640px]  flex flex-col items-center">
            <h3 className="text-lg min-[1300px]:text-xl font-qimano text-gray-700 mb-2">Gender</h3>

            {/* Skeleton */}
            {isDemographicsLoading && (
              <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200 mb-3" />
            )}

            {/* Insights Section */}
            {canSeeInsights && !isInsightsLoading && insights?.gender && (
              <div
                className={`group w-full rounded-lg px-1.5 py-1.5 transition-all duration-200
                ${isAdminView
                    ? isProPlan
                      ? "hover:bg-white"
                      : "hover:bg-graphite"
                    : ""
                  }`}
              >
                {/* ICON ONLY gets tooltip */}
                {isAdminView && (
                  <div className="flex justify-center mb-2">
                    <Tooltip body={tooltip.body} placement="top">
                      <div className="cursor-pointer">
                        {isProPlan ? (
                          <>
                            <Image
                              src="/assets/images/pro-grey.svg"
                              width={15}
                              height={15}
                              alt="Pro"
                              className="group-hover:hidden"
                            />
                            <Image
                              src="/assets/images/pro-black.svg"
                              width={15}
                              height={15}
                              alt="Pro Active"
                              className="hidden group-hover:block"
                            />
                          </>
                        ) : (
                          <>
                            <Image
                              src="/assets/images/pro-black.svg"
                              width={15}
                              height={15}
                              alt="Locked"
                              className="group-hover:hidden"
                            />
                            <Image
                              src="/assets/images/pro-yellow.svg"
                              width={15}
                              height={15}
                              alt="Upgrade"
                              className="hidden group-hover:block"
                            />
                          </>
                        )}
                      </div>
                    </Tooltip>
                  </div>
                )}

                {/* Insights text — NO tooltip */}
                <p
                  className={`text-center text-sm font-apfel-grotezk-regular mb-3 px-2 transition-colors
                  ${isAdminView && !isProPlan
                      ? "text-black-100 group-hover:text-white"
                      : "text-black-100"
                    }`}
                >
                  {insights.gender}
                </p>
              </div>
            )}

            {/* Chart */}
            <div className="mt-6 w-full h-full flex border-red">
              <PieChart apiEndpoint={genderEndpoint} />
            </div>
          </div>
        )}

        {/* Age Range */}
        {ageEndpoint && (
          <div className="bg-gray-100 shadow-sm rounded-xl py-3  w-full max-[960px]:w-full max-[960px]:h-[512px] max-[1280px]:h-[500px] max-[1280px]:w-[390px] min-[1300px]:w-[422px] min-[1300px]:h-[640px]   flex flex-col items-center  border-green">
            <h3 className="text-lg min-[1300px]:text-xl font-qimano text-gray-700 mb-2">Age Range</h3>

            {/* {isDemographicsLoading && (
              <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200 mb-3" />
            )} */}

            {/* Insights Section */}
            {canSeeInsights && !isInsightsLoading && insights?.age && (
              <div
                className={`group w-full rounded-lg px-1.5 py-1.5 transition-all duration-200
                ${isAdminView
                    ? isProPlan
                      ? "hover:bg-white"
                      : "hover:bg-graphite"
                    : ""
                  }`}
              >
                {/* ICON ONLY gets tooltip */}
                {isAdminView && (
                  <div className="flex justify-center mb-2">
                    <Tooltip body={tooltip.body} placement="top">
                      <div className="cursor-pointer">
                        {isProPlan ? (
                          <>
                            <Image
                              src="/assets/images/pro-grey.svg"
                              width={15}
                              height={15}
                              alt="Pro"
                              className="group-hover:hidden"
                            />
                            <Image
                              src="/assets/images/pro-black.svg"
                              width={15}
                              height={15}
                              alt="Pro Active"
                              className="hidden group-hover:block"
                            />
                          </>
                        ) : (
                          <>
                            <Image
                              src="/assets/images/pro-black.svg"
                              width={15}
                              height={15}
                              alt="Locked"
                              className="group-hover:hidden"
                            />
                            <Image
                              src="/assets/images/pro-yellow.svg"
                              width={15}
                              height={15}
                              alt="Upgrade"
                              className="hidden group-hover:block"
                            />
                          </>
                        )}
                      </div>
                    </Tooltip>
                  </div>
                )}

                {/* Insights text — NO tooltip */}
                <p
                  className={`text-center text-sm font-apfel-grotezk-regular mb-3 px-2 transition-colors
                  ${isAdminView && !isProPlan
                      ? "text-black-100 group-hover:text-white"
                      : "text-black-100"
                    }`}
                >
                  {insights.age}
                </p>
              </div>
            )}


            <AgeRangeChart apiEndpoint={ageEndpoint} />
          </div>
        )}

        {/* Location */}
        {locationEndpoint && (
          <div className="bg-gray-100 shadow-sm rounded-xl py-3 w-full min-[450px]:max-[960px]:h-[625px] max-[960px]:w-full max-[960px]:h-[512px] max-[1280px]:h-[500px] max-[1280px]:w-[390px] min-[1300px]:w-[422px] min-[1300px]:h-[640px]  flex flex-col items-center justify-between">
            <h3 className="text-lg min-[1300px]:text-xl font-qimano text-gray-700 mb-2">Top Locations</h3>

            {isDemographicsLoading && (
              <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200 mb-3" />
            )}

            {/* Insights Section */}
            {canSeeInsights && !isInsightsLoading && insights?.location && (
              <div
                className={`group w-full rounded-lg px-1.5 py-1.5 transition-all duration-200
                ${isAdminView
                    ? isProPlan
                      ? "hover:bg-white"
                      : "hover:bg-graphite"
                    : ""
                  }`}
              >
                {/* ICON ONLY gets tooltip */}
                {isAdminView && (
                  <div className="flex justify-center mb-2">
                    <Tooltip body={tooltip.body} placement="top">
                      <div className="cursor-pointer">
                        {isProPlan ? (
                          <>
                            <Image
                              src="/assets/images/pro-grey.svg"
                              width={15}
                              height={15}
                              alt="Pro"
                              className="group-hover:hidden"
                            />
                            <Image
                              src="/assets/images/pro-black.svg"
                              width={15}
                              height={15}
                              alt="Pro Active"
                              className="hidden group-hover:block"
                            />
                          </>
                        ) : (
                          <>
                            <Image
                              src="/assets/images/pro-black.svg"
                              width={15}
                              height={15}
                              alt="Locked"
                              className="group-hover:hidden"
                            />
                            <Image
                              src="/assets/images/pro-yellow.svg"
                              width={15}
                              height={15}
                              alt="Upgrade"
                              className="hidden group-hover:block"
                            />
                          </>
                        )}
                      </div>
                    </Tooltip>
                  </div>
                )}

                {/* Insights text — NO tooltip */}
                <p
                  className={`text-center text-sm font-apfel-grotezk-regular mb-6 px-2 transition-colors
                  ${isAdminView && !isProPlan
                      ? "text-black-100 group-hover:text-white"
                      : "text-black-100"
                    }`}
                >
                  {insights.location}
                </p>
              </div>
            )}


            <SimpleWorldMap apiEndpoint={locationEndpoint} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceCard;
