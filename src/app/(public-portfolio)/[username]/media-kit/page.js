// /app/(public-portfolio)/[username]/media-kit/page.js
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import posthog from "posthog-js";
import { FormProvider } from "@/app/onboarding/context";
import ProfileOverview from "@/components/public-portfolio/ProfileOverview";

export default function PublicPortfolioPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    // Load once from sessionStorage
    const stored = sessionStorage.getItem("portfolio");
    if (stored) {
      setPortfolio(JSON.parse(stored));
    }
    setCheckedStorage(true); // now we know whether storage had data or not
  }, []);
  
  useEffect(() => {
  if (!checkedStorage) return;

  if (!portfolio && pathname) {
    const username = pathname.split("/")[1];
    if (!username) return;

    const prefetchAndRedirect = async () => {
      try {
        const res = await fetch(
          `/api/public-portfolio/userinfo?username=${username}`
        );
        const result = await res.json();

        if (!result?.success) {
          router.replace(`/${username}/media-kit/not-found`);
          return;
        }

        const { firstName, lastName } = result.data;
        const displayName = `${firstName} ${lastName ?? ""}`.trim();

        router.replace(
          `/${username}/media-kit/loading?username=${username}&displayName=${encodeURIComponent(displayName)}`
        );
      } catch (e) {
        router.replace(`/${username}/media-kit/not-found`);
      }
    };

    prefetchAndRedirect();
  }
}, [checkedStorage, portfolio, pathname, router]);

  useEffect(() => {
    if (!portfolio) return;

    // 🔹 PostHog tracking
    posthog.capture("profile_visit", {
      page: "public-portfolio",
      portfolio_owner_id: portfolio.id,
    });

    const startTime = Date.now();

    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      posthog.capture("time_spent", {
        page: "public-portfolio",
        portfolio_owner_id: portfolio.id,
        minutes: timeSpent / 60,
      });
    };
  }, [portfolio]);

  if (!portfolio) return null; // Nothing until data arrives

  return (
    <FormProvider>
      <div className=" ">
        <ProfileOverview ownerId={portfolio.id} portfolio={portfolio} />
      </div>
    </FormProvider>
  );
}
