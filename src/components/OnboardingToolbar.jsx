"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";

export default function OnboardingToolbar() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  // React Query hooks
  const { data: portfolioData } = useQuery({
    queryKey: ["portfolioCompletion"],
    queryFn: async () => (await fetch("/api/projects/filled-count")).json(),
    enabled: !!userId,
  });

  const filledCount = portfolioData?.filledCount || 0;
  const portfolioComplete = filledCount >= 4;

  const { data: aboutData } = useQuery({
    queryKey: ["aboutCompletion"],
    queryFn: async () => (await fetch("/api/projects/aboutCompletion")).json(),
    enabled: !!userId,
  });
  const aboutComplete = !!aboutData?.complete;

  const { data: audienceData } = useQuery({
    queryKey: ["audienceCompletion"],
    queryFn: async () => (await fetch("/api/auth/check-instagram-connection")).json(),
    enabled: !!userId,
  });
  const audienceComplete = !!audienceData?.connected;

  const { data: viewedData } = useQuery({
    queryKey: ["hasViewedPortfolio"],
    queryFn: async () => (await fetch("/api/onboarding/viewed-status")).json(),
    enabled: !!userId,
  });
  const hasClickedPortfolio = !!viewedData?.hasViewedPortfolio;

  const allComplete = portfolioComplete && aboutComplete && audienceComplete;
  const isRed = filledCount < 4;

  if (!isLoaded) return <div className="flex justify-center items-center h-screen"></div>;
  if (!isSignedIn) {
    router.push("/signup");
    return null;
  }

  // Button handlers
  const handleHamburgerClick = () => setIsMenuVisible((prev) => !prev);
  const handleProfileClick = () => router.push("/onboarding/step-1");
  const handleNextClick = () => router.push("/dashboard");
  const handleDashboardClick = () => router.push("/dashboard");
  const handleSettingClick = () => router.push("/settings");

  const handlePortfolioClick = async () => {
    if (!userId) return;
    await fetch("/api/onboarding/viewed", { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["hasViewedPortfolio"] });

    const storedFormData = localStorage.getItem(`formData_${userId}`);
    if (storedFormData) {
      const parsedData = JSON.parse(storedFormData);
      const username = parsedData?.username;
      if (username) {
        const isAdmin = userId === parsedData.userId;
        const loadingUrl = `/${username}/media-kit/loading?username=${username}&isAdmin=${isAdmin}&userId=${userId}`;
        window.open(loadingUrl, "_blank");
      }
    }
  };

  return (
    <div
      className={`fixed top-[85%] left-[50%] translate-x-[-50%] ${
        isRed ? "w-[430px]" : "w-[630px]"
      } h-[74px] flex justify-center items-center gap-3 shadow-md bg-white rounded-md z-20 p-5 font-apfel-grotezk-regular`}
    >
      <button
        onClick={handleNextClick}
        className="w-[115px] h-[56px] text-electric-blue text-2xl font-semibold text-center"
      >
        <Image
          src="/assets/images/snatch.svg"
          width={40}
          height={40}
          alt="snatchlogo"
          className="mx-auto w-32 h-10"
        />
      </button>

      <button
        onClick={handleHamburgerClick}
        className="w-[61px] h-[56px] bg-gray-100 text-electric-blue rounded-md mx-auto font-medium hover:bg-transparent relative"
      >
        <Image
          className="mx-auto w-8"
          src="/assets/icons/onboarding/Hamburger.svg"
          alt="hamburger"
          width={20}
          height={20}
        />
      </button>

      {isMenuVisible && (
        <div className="absolute top-[-280%] left-[-50px] w-[200px] bg-white shadow-lg rounded-md border border-light-grey z-50">
          <ul className="flex flex-col p-3 gap-2">
            <li onClick={handleDashboardClick} className="cursor-pointer text-electric-blue hover:bg-gray-100 rounded-md p-2">Dashboard</li>
            <li onClick={handleSettingClick} className="cursor-pointer text-electric-blue hover:bg-gray-100 rounded-md p-2">Settings</li>
            <li onClick={() => alert("Explore clicked")} className="cursor-pointer text-electric-blue hover:bg-gray-100 rounded-md p-2">Explore</li>
            <li onClick={handleProfileClick} className="cursor-pointer text-electric-blue hover:bg-gray-100 rounded-md p-2">Profile</li>
          </ul>
        </div>
      )}

      <div
        className={`${
          isRed ? "w-[370px]" : "w-[499px]"
        } h-[56px] gap-2 bg-gray-100 flex justify-between items-center rounded-md p-2`}
      >
        <button
          onClick={handleProfileClick}
          className="px-2 py-2 bg-transparent text-electric-blue border border-electric-blue rounded-md text-center font-medium hover:bg-electric-blue hover:text-white"
        >
          Edit Profile
        </button>

        <button
          className={`px-2 py-2 border rounded-md font-medium transition ${
            isRed
              ? "bg-white text-[#EB3B00] border-[#EB3B00]"
              : "bg-transparent text-electric-blue border-electric-blue hover:bg-electric-blue hover:text-white"
          }`}
          onClick={handleNextClick}
        >
          Manage Projects
        </button>

        {!isRed && (
          <button
            onClick={handlePortfolioClick}
            className={`px-2 flex items-center justify-center py-2 border rounded-md text-center font-medium transition ${
              allComplete
                ? "bg-electric-blue text-white border-electric-blue hover:bg-electric-blue hover:text-white cursor-pointer"
                : "bg-[#0037EB]/50 text-smoke cursor-not-allowed"
            }`}
            disabled={!allComplete}
          >
            <Image
              src={
                portfolioComplete && hasClickedPortfolio
                  ? "/assets/images/preview.svg"
                  : "/assets/images/create.svg"
              }
              alt="portfolio action"
              width={20}
              height={20}
            />
            <span className="text-white ml-1">
              {portfolioComplete && hasClickedPortfolio ? "Preview Presskit" : "Create Portfolio"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
