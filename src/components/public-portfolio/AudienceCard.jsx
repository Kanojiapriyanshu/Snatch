"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import PieChart from "../Profilepage/PieChart";
import SimpleWorldMap from "../Profilepage/Map";
import AgeRangeChart from "../Profilepage/AgeRangeChart";
import generateAudienceInsights from "@/utils/generateAudienceInsights";
import { usePathname } from "next/navigation";

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
  const username = pathname.split("/").filter(Boolean)[0];

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

// React Query hook for AI insights
const { data: insights, isLoading: isInsightsLoading } = useQuery({
  queryKey: ["audienceInsights", username, demographicData],
  queryFn: () => generateAudienceInsights(demographicData),
  enabled: !!demographicData,
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
    <div className="lg:mt-10 w-full flex flex-col justify-center items-center mb-10">
      <h3 className="text-[45px] lg:text-7xl text-[100px] font-qimano text-electric-blue text-center px-4 py-2 rounded-xl">
        Audience
      </h3>

      <div className="flex flex-col lg:flex-row gap-4 mt-6 w-full px-4 lg:px-20 justify-center items-stretch">

        {/* Gender */}
        {genderEndpoint && (
          <div className="bg-gray-100 shadow-md rounded-xl p-4 w-full lg:w-[370px] flex flex-col items-center min-h-[350px]">
            <h3 className="text-2xl font-qimano text-gray-700 mb-2">Gender</h3>

            {isDemographicsLoading || isInsightsLoading ? (
              <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200 mb-3" />
            ) : (
              <p className="text-gray-600 text-center text-sm font-apfel-grotezk-regular mb-3 px-2 mt-5">
                {insights?.gender}
              </p>
            )}

            <div className="mb-6 w-full flex justify-center">
              <PieChart apiEndpoint={genderEndpoint} />
            </div>
          </div>
        )}

        {/* Age Range */}
        {ageEndpoint && (
          <div className="bg-gray-100 shadow-md rounded-xl p-4 w-full lg:w-[370px] flex flex-col items-center justify-between min-h-[350px]">
            <h3 className="text-2xl font-qimano text-gray-700 mb-2">Age Range</h3>

            {isDemographicsLoading || isInsightsLoading ? (
              <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200 mb-3" />
            ) : (
              <p className="text-gray-600 text-center text-sm font-apfel-grotezk-regular mb-3 px-2 mt-5">
                {insights?.age}
              </p>
            )}

            <AgeRangeChart apiEndpoint={ageEndpoint} />
          </div>
        )}

        {/* Location */}
        {locationEndpoint && (
          <div className="bg-gray-100 shadow-md rounded-xl p-4 w-full lg:w-[370px] flex flex-col items-center justify-between min-h-[350px]">
            <h3 className="text-2xl font-qimano text-gray-700 mb-2">Top Locations</h3>

            {isDemographicsLoading || isInsightsLoading ? (
              <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200 mb-3" />
            ) : (
              <p className="text-gray-600 text-center text-sm font-apfel-grotezk-regular mb-3 px-2 ">
                {insights?.location}
              </p>
            )}

            <SimpleWorldMap apiEndpoint={locationEndpoint} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceCard;
