"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import DashboardCardwrapper from "@/components/DashboardCardwrapper";
import LocationWrapper from "@/components/LocationWrapper";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardContext } from "../DashboardContext";

const DashboardPage = () => {
  const [selectedLocationType, setSelectedLocationType] = useState("city");
  const [isInstagramLinked, setIsInstagramLinked] = useState(false);
  const [hasMinFollowers, setHasMinFollowers] = useState(false);
  const [totalRequests, setTotalRequests] = useState(0); 
  const [isCheckingInstagram, setIsCheckingInstagram] = useState(true);
  const pathname = usePathname();
  const username = pathname.split("/").pop();

  // React Query to fetch analytics  only fetch if user is logged in 
  const {
    data: analytics = {
      totalVisitors: 0,
      totalAvgTimeSpent: 0,
      topCountries: [],
      topStates: [],
      topCities: [],
    },
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["analytics", username],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?username=${username}`);
      if (!res.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return res.json();
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const fetchInfluencerData = async () => {
      try {
        // 1. Check if Instagram is linked
        const instagramResponse = await fetch("/api/auth/check-instagram-connection");
        const instagramData = await instagramResponse.json();
        
        setIsInstagramLinked(instagramData.connected);
        
        if (instagramData.connected) {
          // 2. Only check followers if Instagram is connected
          const followerResponse = await fetch("/api/auth/instagram-followers");
          const followerData = await followerResponse.json();
          setHasMinFollowers(followerData.count >= 10);
        }

        // 4. Fetch collaboration requests
        const requestsResponse = await fetch(`/api/influencer-requests?username=${username}`);
        const requestsData = await requestsResponse.json();
        if (requestsData.totalRequests !== undefined) {
          setTotalRequests(requestsData.totalRequests);
        }
      } catch (error) {
        console.error("Error fetching influencer data:", error);
        setIsInstagramLinked(false);
      } finally {
        setIsCheckingInstagram(false); // Always stop loading after the check
      }
    };

    if (username) {
      fetchInfluencerData();
    }
  }, [username]);
  
  const handleLogin = async () => {
    try {
      const response = await fetch("/api/auth/instagram");
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to get Instagram login URL");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while trying to log in.");
    }
  };

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

  if (isLoading) {
    return (
      <div className="h-screen bg-smoke flex justify-center items-center font-qimano text-3xl text-electric-blue">
        Loading...
      </div>
    );
  }

  if (isCheckingInstagram) {
  return (
    <div className="h-screen bg-smoke flex justify-center items-center font-qimano text-3xl text-electric-blue">
      Checking account status...
    </div>
  );
}


  if (isError) {
    return (
      <div className="h-screen bg-smoke flex justify-center items-center font-qimano text-3xl text-red-500">
        Failed to load analytics.
      </div>
    );
  }

  return (
     <DashboardContext.Provider value={{ isInstagramLinked }}>
    <div className="mt-2 relative p-3">
      {/* Blur wrapper when conditions are not met */}
      <div className={`${(!isInstagramLinked || !hasMinFollowers) ? "blur-sm pointer-events-none select-none" : ""}`}>
        {/* Top Analytics Cards */}
        <div className="mb-[430px] 3xl:mb-[490px] flex gap-3 ">
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
          <div className="mt-1 3xl:mt-2 w-full max-w-[98%] mr-5 mx-auto bg-white rounded-xl shadow relative font-qimano overflow-hidden  px-4 md:px-8 xl:px-16 py-[clamp(20px,calc(8px+5vh+1vw),100px)] min-h-[250px] xl:min-h-[90px] 2xl:min-h-[200px] 5xl:min-h-[400px] flex ">

           
            <div
              className="absolute top-0 -left-12 w-80 z-30 bg-[#e7e300]"
              style={{ transform: "rotate(-30deg)" }}
            >
              <p className=" text-black text-center text-2xl py-2 shadow-md mr-24">
                Coming Soon!
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-10">
              {/* Left Text */}
              <div className="md:w-[50%] w-full text-center">
                <h2 className="text-2xl 3xl:text-3xl text-gray-800">Explore the Creator Circle</h2>
                <p className="mt-4 text-sm 3xl:text-base text-center font-apfel-grotezk-regular text-gray-700 leading-relaxed min-w-80 3xl:min-w-0">
                  Get inspired by fellow influencers on the platform. Browse profiles,
                  see how they’re showcasing themselves, and discover fresh ways to shine.
                </p>
              </div>

              {/* Right Images */}
              <div className="flex justify-center items-end relative bottom-8">
                <div className="w-32 h-40 rounded-xl overflow-hidden shadow-md z-10 translate-y-4 -mr-4">
                  <Image
                    src="/assets/images/dashboard/influencer1.svg"
                    alt="Influencer 1"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="w-32 h-44 rounded-xl overflow-hidden shadow-xl z-20 relative">
                  <Image
                    src="/assets/images/dashboard/influencer2.svg"
                    alt="Influencer 2"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="w-32 h-40 rounded-xl overflow-hidden shadow-md z-10 translate-y-4 -ml-4">
                  <Image
                    src="/assets/images/dashboard/influencer3.svg"
                    alt="Influencer 3"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

          </div>


        </div>
      </div>

      {/* Conditional Overlays */}
      {/* Case 1: Instagram not connected */}
      {!isInstagramLinked && (
        <div className="absolute inset-0 z-40 bg-black bg-opacity-90 flex flex-col items-center justify-center text-center px-6 rounded-xl" style={{ height: "680px" }}>
          <h2 className="text-3xl md:text-4xl text-[#e7e300] font-qimano mb-4">
            Dashboard Inactive
          </h2>
          <p className="text-white mb-6 max-w-lg font-apfel-grotezk-regular">
            Complete your Press Kit by adding your work and their details to activate the dashboard
          </p>
          <button
            onClick={handleLogin}
            className="bg-[#e7e300] text-black px-6 py-3 rounded-lg hover:bg-yellow-300 transition-all duration-200 flex items-center gap-2"
          >
            Get Started / Complete Press Kit
            <span className="text-xl">→</span>
          </button>
        </div>
      )}

      {/* Case 2: Instagram connected but less than 1000 followers */}
      {isInstagramLinked && !hasMinFollowers && (
        <div className="absolute inset-0 z-40 bg-black bg-opacity-90 flex flex-col items-center justify-center text-center px-6 rounded-xl" style={{ height: "680px" }}>
          <h2 className="text-3xl md:text-4xl text-[#e7e300] font-qimano mb-4">
            Dashboard Not Accessible
          </h2>
          <p className="text-white mb-6 max-w-lg font-apfel-grotezk-regular">
            Uh oh, looks like you&#39;re just shy of the 1k mark! Snatch features unlock once you hit that milestone. 
            We&#39;re rooting for you, can&#39;t wait to welcome you back once you&#39;re there! 🚀
          </p>
          <button
            onClick={handleLogin}
            className="bg-lime-yellow text-black px-6 py-3 rounded-lg hover:bg-yellow-300 transition-all duration-200 flex items-center gap-2 font-apfel-grotezk-regular"
          >
            Try Again
            <span className="text-xl">→</span>
          </button>
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