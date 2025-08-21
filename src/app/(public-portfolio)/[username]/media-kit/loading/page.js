// "use client";

// import { useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import LoadingTransition from "@/components/public-portfolio/LoadingTransition";

// export default function LoadingPage() {
//   const router = useRouter();
//   const params = useSearchParams();

//   const username = params.get("username");
//   const isAdmin = params.get("isAdmin") === "true";

//   useEffect(() => {
//     if (!username) return;

//     // Redirect after a small delay for smooth loading effect
//     const timer = setTimeout(() => {
//       const route = isAdmin
//         ? `/${username}/media-kit/adminview`
//         : `/${username}/media-kit`;

//       router.replace(route);
//     }, 2000); // 2 seconds loading animation

//     return () => clearTimeout(timer);
//   }, [username, isAdmin, router]);

//   // Only show the loader
//   return <LoadingTransition />;
// }

//(public-portfolio)/[username]/media-kit/loading/?username={}page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingTransition from "@/components/public-portfolio/LoadingTransition";

export default function LoadingPage() {
  const router = useRouter();
  const params = useSearchParams();

  const username = params.get("username");
  const isAdmin = params.get("isAdmin") === "true";

  const [portfolioData, setPortfolioData] = useState(null);

  useEffect(() => {
    if (!username) return;

    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`/api/public-portfolio/userinfo?username=${username}`);
        const result = await res.json();

      if (result.success) {
        // Save in sessionStorage the userinfo data and portfolio page public and admin would just fetch it from there
        sessionStorage.setItem("portfolio", JSON.stringify(result.data));

        const route = isAdmin
          ? `/${username}/media-kit/adminview`
          : `/${username}/media-kit`;

        router.replace(route);
      }
        else {
          console.error("Portfolio fetch failed:", result.error);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }
    };

    fetchPortfolio();
  }, [username, isAdmin, router]);

  return <LoadingTransition />;
}
