

//(public-portfolio)/[username]/media-kit/loading/?username={}page.js
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingTransition from "@/components/public-portfolio/LoadingTransition";

export default function LoadingPage() {
  const router = useRouter();
  const params = useSearchParams();

  const username = params.get("username");
  const isAdmin = params.get("isAdmin") === "true";

  useEffect(() => {
    if (!username) return;

    const fetchAll = async () => {
      try {
        // 1️⃣ Fetch portfolio
        const portfolioRes = await fetch(`/api/public-portfolio/userinfo?username=${username}`);
        const portfolioResult = await portfolioRes.json();

        // 2️⃣ Fetch instagram stats
        const igRes = await fetch(`/api/public-portfolio/instagram-stats?username=${encodeURIComponent(username)}`);
        const igResult = await igRes.json();

        console.log("Portfolio result:", igResult);

        if (portfolioResult.success) {
          // Save both into sessionStorage
          sessionStorage.setItem("portfolio", JSON.stringify(portfolioResult.data));
          sessionStorage.setItem("instagramData", JSON.stringify(igResult));

          const route = isAdmin
            ? `/${username}/media-kit/adminview`
            : `/${username}/media-kit`;

          router.replace(route);
        } else {
          console.error("Portfolio fetch failed:", portfolioResult.error);
        }
      } catch (error) {
        console.error("Error fetching portfolio/instagram data:", error);
      }
    };

    fetchAll();
  }, [username, isAdmin, router]);

  return <LoadingTransition />;
}
