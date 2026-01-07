//app/dashboard/[username]/page.js
"use client";

import { useState } from "react";
import Image from "next/image";
import DashboardCardwrapper from "@/components/DashboardCardwrapper";
import LocationWrapper from "@/components/LocationWrapper";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardContext } from "../DashboardContext";
import useFontSize from "@/hooks/useFontSize"; 
import Button from "@/components/ui/Button";
import { useUser } from "@/context/UserContext";

const DashboardPage = () => {
  const [selectedLocationType, setSelectedLocationType] = useState("city");
  const headingSize = useFontSize(20, 38);  // h2 grows from 20px → 36px
  const paragraphSize = useFontSize(15, 20); // p grows from 15px → 20px

  const pathname = usePathname();
  const username = pathname.split("/").pop();
  const { plan } = useUser();

   // 🧠 Helper function to DRY error-handling logic
const safeFetch = async (url, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Fetch failed for ${url}: ${res.status}`);
    return res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`Request timed out: ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
};

  // Fetch Analytics - put subscription check here only then show analytics
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
    error: analyticsError,
  } = useQuery({
    queryKey: ["analytics", username],
      queryFn: () => safeFetch(`/api/analytics?username=${username}`),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
    throwOnError: true,
  });

  // Fetch Instagram Connection
  const {
    data: instagramConnection,
    isLoading: isInstagramLoading,
    isError: isInstagramError,
    error: instagramError,
  } = useQuery({
    queryKey: ["instagramConnection", username],
     queryFn: () => safeFetch("/api/auth/check-instagram-connection"),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });

    // Fetch Instagram Followers only if connected
  const {
    data: followerData,
    isLoading: isFollowersLoading,
    isError: isFollowersError,
    error: followersError,
  } = useQuery({
    queryKey: ["instagramFollowers", username],
      queryFn: () => safeFetch("/api/auth/instagram-followers"),
    enabled: !!username && instagramConnection?.connected, // only run if connected
    staleTime: 1000 * 60 * 5,
    throwOnError: true,
  });


  // Fetch Influencer Requests
  const {
    data: influencerRequests,
    isLoading: isRequestsLoading,
    isError: isRequestsError,
    error: requestsError,
  } = useQuery({
    queryKey: ["influencerRequests", username],
    queryFn: () => safeFetch(`/api/influencer-requests?username=${username}`),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
    throwOnError: true,
  });

  // Derived values
  const isInstagramLinked = instagramConnection?.connected || false;
  const hasMinFollowers = followerData?.count >= 0;
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

    // 💥 Error — send it to Next.js error boundary
  if (
    isAnalyticsError ||
    isInstagramError ||
    isRequestsError ||
    isFollowersError
  ) {
    // Combine all errors
    const errorDetails =
      analyticsError?.message ||
      instagramError?.message ||
      requestsError?.message ||
      followersError?.message ||
      "Unknown dashboard error";

    // Throw to trigger Next.js’s `error.js`
    throw new Error(errorDetails);
  }


  return (

      <DashboardContext.Provider value={{ isInstagramLinked }}>
      {/* Grid container: Row1 (analytics), Row2 (locations), Row3 (creator circle) */}
      <div className="mt-2 relative pt-3 pb-0 px-3 h-full grid grid-rows-[9rem,27vh,1fr] gap-3">
        {/* ROW 1: Top Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full h-full">
          <DashboardCardwrapper count={analytics.totalVisitors} label="Profile visits"  plan={plan}/>
          <DashboardCardwrapper count={totalRequests} label="Request received" plan={"pro"} />
          <DashboardCardwrapper
            count={Number(analytics?.totalAvgTimeSpent)?.toFixed(1) || "0.0"}
            label="Avg time spent (Mins)"
            className="w-full" plan={plan}
          />
        </div>

        {/* ROW 2: Location Analytics */}
        <div className="w-full h-full">
          <LocationWrapper
            topLocations={getTopLocations()}
            setSelectedLocationType={setSelectedLocationType}
            selectedLocationType={selectedLocationType}
          />
        </div>

        {/* ROW 3: Creator Circle (fills remaining height) */}
        <div className="w-full bg-white rounded-xl shadow relative font-qimano overflow-hidden px-4 md:px-8 xl:px-16 py-6 md:py-10 h-[95%] min-h-0 flex items-center justify-between">
          <div
            className="absolute top-0 -left-12 w-80 z-30 bg-lime-yellow"
            style={{ transform: "rotate(-30deg)" }}
          >
            <p className="text-black text-center text-2xl py-2 shadow-md mr-24">
              Coming Soon!
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            {/* Left Text */}
            <div className="md:w-[50%] w-full text-center">
              <h2 className="" style={{ fontSize: headingSize, lineHeight: 1.3 }}>
              Explore the Creator Circle
            </h2>

            <p
            style={{ fontSize: paragraphSize }}
       className="mt-2 text-center font-apfel-grotezk-regular text-gray-700 min-w-56 3xl:min-w-0"
        >
          Get inspired by fellow influencers on the platform. Browse profiles,
          see how they’re showcasing themselves, and discover fresh ways to shine.
        </p>

            </div>

            {/* Right Images */}
            <div className="flex justify-center items-end">
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

        {/* Conditional Overlays */}
        {!isInstagramLinked && (
          <div
            className="absolute h-[96%] w-[98.6%]  inset-0 z-40 bg-black bg-opacity-90 flex flex-col items-center justify-center text-center ml-1.5 mt-3 px-6 rounded-xl"
          >
            <h2 className="text-3xl md:text-4xl text-lime-yellow font-qimano mb-4">Get Started</h2>
            <p className="text-white mb-6 max-w-lg font-apfel-grotezk-regular">
              For creators with 1K+ followers, Snatch allows you to directly connect your Instagram.
              Select your best posts, past collabs, stats, and turn it into a professional press kit within minutes.
            </p>
            <a
              href="https://www.snatchsocial.com/connect-instagram-via-facebook-step1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="yellowPrimary">
                Connect Instagram via Facebook <span className="text-xl">→</span>
              </Button>
            </a>
          </div>
        )}

        {isInstagramLinked && !hasMinFollowers && (
          <div
            className="absolute inset-0 z-40 bg-black bg-opacity-90 flex flex-col items-center justify-center text-center px-6 ml-1.5 mt-3 rounded-xl h-[96%] w-[98.6%]"
          >
            <h2 className="text-3xl md:text-4xl text-lime-yellow font-qimano mb-4">You&#39;re almost there!</h2>
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

