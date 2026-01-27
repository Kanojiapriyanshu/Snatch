// utils/helpers.js
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const extractUsernameFromPath = (pathname) => {
  // Remove leading and trailing slashes and split
  const parts = pathname.split("/").filter(Boolean);
  console.log("Current pathname: parts", parts);
  // For admin view URL: ['snatchsocial', 'media-kit', 'adminview']
  // For public view URL: ['snatchsocial', 'media-kit']

  // Always return the first segment as it's the username in both cases
  return parts[0] || null;
};

export const useFetchPortfolio = (ownerId) => {
  return useQuery({
    queryKey: ["portfolio", ownerId],
    queryFn: async () => {
      const pathname = window.location.pathname;
      const username = extractUsernameFromPath(pathname);

      const url = ownerId
        ? `/api/public-portfolio/userinfo?userId=${ownerId}`
        : `/api/public-portfolio/userinfo?username=${username}`;

      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch portfolio");
      }

      return result.data;
    },
    enabled: typeof window !== "undefined", // avoid SSR issues
    staleTime: 1000 * 60 * 5,
  });
};


export const useFetchPublicPosts = (ownerId) => {
  return useQuery({
    queryKey: ["publicPosts", ownerId],
    queryFn: async () => {
      const pathname = window.location.pathname;
      const username = extractUsernameFromPath(pathname);

      const url = ownerId
        ? `/api/public-portfolio/posts?userId=${ownerId}`
        : `/api/public-portfolio/posts?username=${username}`;

      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch posts");
      }

      return {
        instagram: result.instagram || [],
        uploaded: result.uploaded || [],
      };
    },
    enabled: typeof window !== "undefined",
    staleTime: 1000 * 60 * 5,
  });
};

export const useInstagramData = () => {
  return useQuery({
    queryKey: ["instagramData"],
    queryFn: async () => {
      const username = extractUsernameFromPath(window.location.pathname);
      if (!username) throw new Error("Username not found in URL");

      const response = await fetch(
        `/api/public-portfolio/instagram-stats?username=${encodeURIComponent(username)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch Instagram data");
      }

      const result = await response.json();
      return {
        followers_count: result.followers_count || 0,
        media_count: result.media_count || 0,
        reach: result.reach || 0,
      };
    },
    enabled: typeof window !== "undefined",
    staleTime: 1000 * 60 * 5,
  });
};

export const useCheckScreenSize = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize(); // Check on initial load
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return isMobile;
};


export const useCheckScreenSizeForTab = () => {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth <= 960);
    };

    checkScreenSize(); // Check on initial load
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return isTablet;
};

// 3️⃣ Loader Component
export const Loader = () => {
  return (
    <div className="h-screen flex items-center justify-center text-white">
      Loading...
    </div>
  );
};


// async function fetchPostPreview({ postId, username }) {
//   const res = await fetch(
//     `/api/public-portfolio/preview?postId=${postId}&username=${username}`
//   );

//   if (!res.ok) {
//     throw new Error("Failed to fetch post preview");
//   }

//   return res.json();
// }

// export function usePostPreview({ postId, username, allPosts }) {
//   return useQuery({
//     queryKey: ["post-preview", username, postId],
//     queryFn: async () => {
//       const data = await fetchPostPreview({ postId, username });

//       const matchingPost = allPosts?.find(
//         (p) => String(p.mediaId) === String(postId)
//       );

//       const defaultInsights = {
//         engagement: 0,
//         impressions: 0,
//         reach: 0,
//         saved: 0,
//         likes: 0,
//         comments: 0,
//       };

//       return {
//         post: data.post,
//         media: data.media,
//         mediaType: matchingPost?.mediaType || data.media.type,
//         mediaUrl:
//           matchingPost?.mediaUrl ||
//           data.media?.files?.[0]?.url ||
//           "",
//         children: matchingPost?.children || data.media?.files || [],
//         insights: matchingPost?.insights || defaultInsights,
//       };
//     },

//     enabled: !!postId && !!username,

//     // ✅ CACHE SETTINGS
//     staleTime: 5 * 60 * 1000, // 5 minutes (no refetch)
//     gcTime: 5 * 60 * 1000,    // keep in cache for 5 minutes
//     retry: 1,
//     refetchOnWindowFocus: false,
//   });
// }

async function fetchAllPostPreviews(username) {
  const res = await fetch(
    `/api/public-portfolio/preview?username=${username}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch portfolio posts");
  }

  return res.json();
}

export function useAllPostPreviews(username) {
  return useQuery({
    queryKey: ["portfolio-posts", username],
    queryFn: () => fetchAllPostPreviews(username),
    enabled: !!username,

    // ✅ Cache strategy
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // keep longer in memory
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function usePostFromCache({ postId, username }) {
  const { data, isLoading, error } = useAllPostPreviews(username);

  const post = data?.posts?.find(
    (p) => String(p.postId) === String(postId)
  );

  const defaultInsights = {
    engagement: 0,
    impressions: 0,
    reach: 0,
    saved: 0,
    likes: 0,
    comments: 0,
  };

  return {
    isLoading,
    error,
    post: post || null,
    media: post?.media || null,
    mediaType: post?.media?.type || null,
    mediaUrl: post?.media?.files?.[0]?.url || "",
    children: post?.media?.files || [],
    insights: post?.insights || defaultInsights,
  };
}


async function fetchMediaInsights({ username, postId }) {
  const res = await fetch(
    `/api/public-portfolio/media-insights?username=${encodeURIComponent(
      username
    )}&postId=${encodeURIComponent(postId)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch media insights");
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Insights API failed");
  }

  const insightsArray = data.insights?.data || [];
  const insightsMap = {};

  insightsArray.forEach((item) => {
    insightsMap[item.name] = item.values?.[0]?.value || 0;
  });

  return insightsMap;
}

export function useMediaInsights({ username, postId, isInstagram }) {
  return useQuery({
    queryKey: ["media-insights", username, postId],

    queryFn: () => fetchMediaInsights({ username, postId }),

    // 🔐 Only run for Instagram posts
    enabled: !!username && !!postId && isInstagram,

    // ✅ CACHE SETTINGS
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 5 * 60 * 1000,

    retry: 1,
    refetchOnWindowFocus: false,
  });
}

async function fetchAudienceDemographics(username) {
  const [genderRes, ageRes, countryRes] = await Promise.all([
    fetch(
      `/api/public-portfolio/audience/genderDemographics?username=${encodeURIComponent(
        username
      )}`
    ),
    fetch(
      `/api/public-portfolio/audience/allDemographics?username=${encodeURIComponent(
        username
      )}`
    ),
    fetch(
      `/api/public-portfolio/audience/countryDemographics?username=${encodeURIComponent(
        username
      )}`
    ),
  ]);

  if (!genderRes.ok || !ageRes.ok || !countryRes.ok) {
    throw new Error("Failed to fetch audience demographics");
  }

  const [genderData, ageData, countryData] = await Promise.all([
    genderRes.json(),
    ageRes.json(),
    countryRes.json(),
  ]);

  return {
    genderData: genderData.demographics || [],
    ageData: ageData.ageDistribution || [],
    countryData: countryData.countryDistribution || [],
  };
}

export function useAudienceDemographics(username) {
  return useQuery({
    queryKey: ["audience-demographics", username],

    queryFn: () => fetchAudienceDemographics(username),

    enabled: !!username,

    // ✅ CACHE (5 minutes)
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,

    retry: 1,
    refetchOnWindowFocus: false,
  });
}