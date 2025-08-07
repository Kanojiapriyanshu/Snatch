"use client";

import { useState } from "react";
import Image from "next/image";
import DashboardCardwrapper from "@/components/DashboardCardwrapper";
import LocationWrapper from "@/components/LocationWrapper";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardContext } from "../DashboardContext";

const DashboardPage = () => {
  const [selectedLocationType, setSelectedLocationType] = useState("city");
  const pathname = usePathname();
  const username = pathname.split("/").pop();

  // Fetch Analytics
  const {
    data: analytics = {
      totalVisitors: 0,
      totalAvgTimeSpent: 0,
      topCountries: [],
      topStates: [],
      topCities: [],
    },
    isLoading: isAnalyticsLoading,
    isError: isAnalyticsError,
  } = useQuery({
    queryKey: ["analytics", username],
    queryFn: () => fetch(`/api/analytics?username=${username}`).then((res) => res.json()),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch Instagram Connection
  const {
    data: instagramConnection,
    isLoading: isInstagramLoading,
    isError: isInstagramError,
  } = useQuery({
    queryKey: ["instagramConnection", username],
    queryFn: () => fetch("/api/auth/check-instagram-connection").then((res) => res.json()),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });

    // Fetch Instagram Followers only if connected
  const {
    data: followerData,
    isLoading: isFollowersLoading,
    isError: isFollowersError,
  } = useQuery({
    queryKey: ["instagramFollowers", username],
    queryFn: () => fetch("/api/auth/instagram-followers").then((res) => res.json()),
    enabled: !!username && instagramConnection?.connected, // only run if connected
    staleTime: 1000 * 60 * 5,
  });


  // Fetch Influencer Requests
  const {
    data: influencerRequests,
    isLoading: isRequestsLoading,
    isError: isRequestsError,
  } = useQuery({
    queryKey: ["influencerRequests", username],
    queryFn: () => fetch(`/api/influencer-requests?username=${username}`).then((res) => res.json()),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });

  // Derived values
  const isInstagramLinked = instagramConnection?.connected || false;
  const hasMinFollowers = followerData?.count >= 10;
  const totalRequests = influencerRequests?.totalRequests || 0;

  const getTopLocations = () => {
    switch (selectedLocationType) {
      case "state":
        return analytics.topStates || [];
      case "city":
        return analytics.topCities || [];
      default:
        return analytics.topCountries || [];
    }
  };

  // Loading State (when any query is still fetching)
  if (isAnalyticsLoading || isInstagramLoading || isRequestsLoading ||
    (isInstagramLinked && isFollowersLoading) ) {
    return (
      <div className="h-screen bg-smoke flex justify-center items-center font-qimano text-3xl text-electric-blue">
        Loading...
      </div>
    );
  }

  // Error State (if any query fails)
  if (
    isAnalyticsError || isInstagramError || isRequestsError || isFollowersError
  ) {
    return (
      <div className="h-screen bg-smoke flex justify-center items-center font-qimano text-3xl text-red-500">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ isInstagramLinked }}>
      <div className="mt-2 relative p-3">
        {/* Blur wrapper when conditions are not met */}
        <div className={`${(!isInstagramLinked || !hasMinFollowers) ? "blur-sm pointer-events-none select-none" : ""}`}>
          {/* Top Analytics Cards */}
          <div className="mb-[430px] 3xl:mb-[490px] flex gap-3">
            <DashboardCardwrapper count={analytics.totalVisitors} label="Profile Visits" />
            <DashboardCardwrapper count={totalRequests} label="Request Received" />
            <DashboardCardwrapper
              count={Number(analytics?.totalAvgTimeSpent)?.toFixed(1) || "0.0"}
              label="Avg Time Spent (Mins)"
              className="flex-auto"
            />
          </div>

          {/* Location Analytics */}
          <div className="absolute top-[22%] w-full">
            <LocationWrapper
              topLocations={getTopLocations()}
              setSelectedLocationType={setSelectedLocationType}
              selectedLocationType={selectedLocationType}
            />

            {/* Creator Circle Section */}
            <div className="mt-1 3xl:mt-2 w-full max-w-[98%] mr-5 mx-auto bg-white rounded-xl shadow relative font-qimano overflow-hidden px-4 md:px-8 xl:px-16 py-[clamp(20px,calc(8px+5vh+1vw),100px)] min-h-[250px] xl:min-h-[90px] 2xl:min-h-[200px] 5xl:min-h-[400px] flex">
              <div
                className="absolute top-0 -left-12 w-80 z-30 bg-[#e7e300]"
                style={{ transform: "rotate(-30deg)" }}
              >
                <p className="text-black text-center text-2xl py-2 shadow-md mr-24">Coming Soon!</p>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-10">
                {/* Left Text */}
                <div className="md:w-[50%] w-full text-center">
                  <h2 className="text-2xl 3xl:text-3xl text-gray-800">Explore the Creator Circle</h2>
                  <p className="mt-4 text-sm 3xl:text-base text-center font-apfel-grotezk-regular text-gray-700 leading-relaxed min-w-80 3xl:min-w-0">
                    Get inspired by fellow influencers on the platform. Browse profiles,
                    see how they&#39;re showcasing themselves, and discover fresh ways to shine.
                  </p>
                </div>

                {/* Right Images */}
                <div className="flex justify-center items-end relative bottom-8">
                  <div className="w-32 h-40 rounded-xl overflow-hidden shadow-md z-10 translate-y-4 -mr-4">
                    <Image src="/assets/images/dashboard/influencer1.svg" alt="Influencer 1" fill className="object-cover" />
                  </div>
                  <div className="w-32 h-44 rounded-xl overflow-hidden shadow-xl z-20 relative">
                    <Image src="/assets/images/dashboard/influencer2.svg" alt="Influencer 2" fill className="object-cover" />
                  </div>
                  <div className="w-32 h-40 rounded-xl overflow-hidden shadow-md z-10 translate-y-4 -ml-4">
                    <Image src="/assets/images/dashboard/influencer3.svg" alt="Influencer 3" fill className="object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional Overlays */}
        {!isInstagramLinked && (
          <div className="absolute inset-0 z-40 bg-black bg-opacity-90 flex flex-col items-center justify-center text-center px-6 rounded-xl" style={{ height: "680px" }}>
            <h2 className="text-3xl md:text-4xl text-[#e7e300] font-qimano mb-4">Get Started</h2>
            <p className="text-white mb-6 max-w-lg font-apfel-grotezk-regular">
              For creators with 1K+ followers, Snatch allows you to directly connect your Instagram.
              Select your best posts, past collabs, stats, and turn it into a professional press kit within minutes.
            </p>
            <a href="https://www.snatchsocial.com/connect-instagram-via-facebook-step1" target="_blank" rel="noopener noreferrer">
              <button className="bg-[#e7e300] text-black px-6 py-3 rounded-lg hover:bg-yellow-300 transition-all duration-200 flex items-center gap-2 font-apfel-grotezk-regular">
                Connect Instagram via Facebook <span className="text-xl">→</span>
              </button>
            </a>
          </div>
        )}

        {isInstagramLinked && !hasMinFollowers && (
          <div className="absolute inset-0 z-40 bg-black bg-opacity-90 flex flex-col items-center justify-center text-center px-6 rounded-xl" style={{ height: "680px" }}>
            <h2 className="text-3xl md:text-4xl text-[#e7e300] font-qimano mb-4">You&#39;re almost there!</h2>
            <p className="text-white mb-6 max-w-lg font-apfel-grotezk-regular">
              Once your Instagram crosses 1,000 followers, you&#39;ll get full access to Snatch&#39;s dashboard and tools.
              Keep growing your audience, we&#39;ll be here when you&#39;re ready.
            </p>
          </div>
        )}
      </div>
    </DashboardContext.Provider>
  );
};

export default DashboardPage;


// // {
// //     "totalVisitors": 100,
// //     "topCountries": [
// //       { "location": "India", "percentage": "60.00" },
// //       { "location": "US", "percentage": "25.00" },
// //       { "location": "UK", "percentage": "10.00" }
// //     ],
// //     "topStates": [
// //       { "location": "Delhi", "percentage": "40.00" },
// //       { "location": "California", "percentage": "35.00" },
// //       { "location": "Maharashtra", "percentage": "15.00" }
// //     ],
// //     "topCities": [
// //       { "location": "Mumbai", "percentage": "30.00" },
// //       { "location": "San Francisco", "percentage": "25.00" },
// //       { "location": "New Delhi", "percentage": "20.00" }
// //     ],
// //     "totalAvgTimeSpent": "4.32"
// //   }