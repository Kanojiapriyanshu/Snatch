// // (public-portfolio)/[username]/media-kit/page.js
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import posthog from "posthog-js";
// import { FormProvider } from "@/app/onboarding/context";
// import ProfileOverview from "@/components/public-portfolio/ProfileOverview";

// export default function PublicPortfolioPage() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [portfolio, setPortfolio] = useState(null);

//     useEffect(() => {
//     if (!pathname) return;

//     // Extract username from pathname
//     const username = pathname.split("/")[1];

//     if (!portfolio && username) {
//       // If no data passed in → always redirect to loading page first
//       router.replace(`/${username}/media-kit/loading?username=${username}&isAdmin=false`);
//     }
//   }, [pathname, portfolio, router]);

// useEffect(() => {
//   // Try to load from sessionStorage
//   const stored = sessionStorage.getItem("portfolio");
//   if (stored) {
//     setPortfolio(JSON.parse(stored));
//   }
// }, []);


//   useEffect(() => {
//     if (!portfolio) return;

//     // 🔹 PostHog tracking
//     posthog.capture("profile_visit", {
//       page: "public-portfolio",
//       portfolio_owner_id: portfolio.id,
//     });

//     const startTime = Date.now();

//     return () => {
//       const timeSpent = Math.round((Date.now() - startTime) / 1000);
//       posthog.capture("time_spent", {
//         page: "public-portfolio",
//         portfolio_owner_id: portfolio.id,
//         minutes: timeSpent / 60,
//       });
//     };
//   }, [portfolio]);

//   if (!portfolio) return null; // Nothing until data arrives

//   return (
//     <FormProvider>
//       <div className="h-[200vh] py-[1%] px-[1%] relative">
//         <ProfileOverview ownerId={portfolio.id} portfolio={portfolio} />
//       </div>
//     </FormProvider>
//   );
// }



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
    if (!checkedStorage) return; // don’t redirect until we checked storage

    if (!portfolio && pathname) {
      // No portfolio in storage → redirect back to loading
      const username = pathname.split("/")[1];
      if (username) {
        router.replace(`/${username}/media-kit/loading?username=${username}&isAdmin=false`);
      }
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
      <div className="h-[200vh] py-[1%] px-[1%] relative">
        <ProfileOverview ownerId={portfolio.id} portfolio={portfolio} />
      </div>
    </FormProvider>
  );
}
