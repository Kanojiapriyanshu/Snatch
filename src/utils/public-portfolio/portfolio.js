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
  return parts[0] || null;``                      
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
        followers: result.followers_count || 0,
        posts: result.media_count || 0,
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

// 3️⃣ Loader Component
export const Loader = () => {
  return (
    <div className="h-screen flex items-center justify-center text-white">
      Loading...
    </div>
  );
};
