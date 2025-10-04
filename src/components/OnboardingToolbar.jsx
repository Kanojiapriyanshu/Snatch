"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";

export default function OnboardingToolbar() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [showPresskitMenu, setShowPresskitMenu] = useState(false);
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const menuRef = useRef(null);
  const presskitRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuVisible(false);
      }
      if (presskitRef.current && !presskitRef.current.contains(event.target)) {
        setShowPresskitMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // React Query hooks
  const { data: portfolioData, isLoading: portfolioLoading } = useQuery({
    queryKey: ["portfolioCompletion"],
    queryFn: async () => (await fetch("/api/projects/filled-count")).json(),
    enabled: !!userId,
  });

  const filledCount = portfolioData?.filledCount || 0;
  const portfolioComplete = filledCount >= 4;

  const { data: aboutData, isLoading: aboutLoading } = useQuery({
    queryKey: ["aboutCompletion"],
    queryFn: async () => (await fetch("/api/projects/aboutCompletion")).json(),
    enabled: !!userId,
  });
  const aboutComplete = !!aboutData?.complete;

  const { data: audienceData, isLoading: audienceLoading } = useQuery({
    queryKey: ["audienceCompletion"],
    queryFn: async () =>
      (await fetch("/api/auth/check-instagram-connection")).json(),
    enabled: !!userId,
  });
  const audienceComplete = !!audienceData?.connected;

  const { data: viewedData, isLoading: viewedLoading } = useQuery({
    queryKey: ["hasViewedPortfolio"],
    queryFn: async () => (await fetch("/api/onboarding/viewed-status")).json(),
    enabled: !!userId,
  });
  const hasClickedPortfolio = !!viewedData?.hasViewedPortfolio;

  const allComplete = portfolioComplete && aboutComplete && audienceComplete;
  const presskitIncomplete = !portfolioComplete || !aboutComplete;
  const isRed = filledCount < 4;

  // 🚨 If auth not ready
  if (!isLoaded) return <div className="h-[74px]"></div>;
  if (!isSignedIn) {
    router.push("/signup");
    return null;
  }

  // 🚨 If queries are still loading → show skeleton
  const isLoadingAll =
    portfolioLoading || aboutLoading || audienceLoading || viewedLoading;

  if (isLoadingAll) {
    return (
      <div className="fixed top-[88%] left-[50%] translate-x-[-50%] w-[560px] h-[74px] flex justify-center items-center gap-3 shadow-md bg-white rounded-md z-20 p-5">
        {/* Skeleton effect */}
        <div className="animate-pulse flex gap-3 w-full">
          <div className="bg-gray-200 h-[56px] w-[145px] rounded-md"></div>
          <div className="bg-gray-200 h-[56px] w-[71px] rounded-md"></div>
          <div className="bg-gray-200 h-[56px] flex-1 rounded-md"></div>
        </div>
      </div>
    );
  }

    // Button handlers
  const handleHamburgerClick = () => setIsMenuVisible((prev) => !prev);
  const handleProfileClick = () => router.push("/onboarding/step-1");
  const handleNextClick = () => router.push("/manage-projects/pick-projects");
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

  // ✅ Show full toolbar only after everything is loaded
  return (
    <div
      className={`fixed top-[88%] left-[50%] translate-x-[-50%] ${
        allComplete ? "w-[545px]" : "w-[560px]"
      } h-[74px] flex justify-center items-center gap-3 shadow-md bg-white rounded-md z-20 p-5 font-apfel-grotezk-regular`}
    >
      {/* Snatch button */}
      <button
        onClick={handleDashboardClick}
        className="w-[145px] h-[56px] text-electric-blue text-2xl font-semibold text-center"
      >
        <Image
          src="/assets/images/snatch.svg"
          width={40}
          height={40}
          alt="snatchlogo"
          className="mx-auto w-32 h-10"
        />
      </button>

      {/* Hamburger */}
      <button
        onClick={handleHamburgerClick}
        className="w-[71px] h-[56px] bg-gray-100 text-electric-blue rounded-md mx-auto font-medium hover:bg-transparent relative"
      >
        <Image
          className="mx-auto w-8"
          src="/assets/icons/onboarding/Hamburger.svg"
          alt="hamburger"
          width={20}
          height={20}
        />
      </button>

      {/* Dropdown */}
      {isMenuVisible && (
        <div
          ref={menuRef}
          className="absolute top-[-210%] left-[-50px] w-[200px] bg-white shadow-lg rounded-md border border-light-grey z-50"
        >
          <ul className="flex flex-col p-3 gap-2">
            <li
              onClick={() => {
                handleDashboardClick();
                setIsMenuVisible(false);
              }}
              className="cursor-pointer p-2 hover:text-electric-blue hover:bg-gray-100 rounded-md"
            >
              Dashboard
            </li>
            <li
              onClick={() => {
                handleSettingClick();
                setIsMenuVisible(false);
              }}
              className="cursor-pointer p-2 hover:text-electric-blue hover:bg-gray-100 rounded-md"
            >
              Settings
            </li>
            <li
              onClick={() => {
                handleProfileClick();
                setIsMenuVisible(false); 
              }}
              className="cursor-pointer p-2 hover:text-electric-blue hover:bg-gray-100 rounded-md"
            >
              Profile
            </li>
          </ul>
        </div>
      )}

      {/* Presskit & Create Portfolio */}
      <div
        className={`${
          isRed ? "w-[370px]" : "w-[499px]"
        } h-[56px] gap-2 bg-gray-100 flex justify-between items-center rounded-md p-2`}
      >
        {/* Presskit toggle */}
        <div className="relative">
          <button
            onClick={() => setShowPresskitMenu((prev) => !prev)}
            className={`px-5 py-2 rounded-md border font-medium transition ${
              presskitIncomplete
                ? "text-[#EB3B00] border-[#EB3B00] hover:bg-[#EB3B00]/10"
                : "text-electric-blue border-electric-blue"
            }`}
          >
            {presskitIncomplete ? (
              "Complete press kit"
            ) : (
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/images/edit-pencil.svg"
                  alt="Edit"
                  width={16}
                  height={16}
                  className="w-5 h-5"
                />
                <p>Edit press kit</p>
              </div>
            )}
          </button>

          {/* Presskit dropdown */}
          {showPresskitMenu && (
            <div
              ref={presskitRef}
              className="absolute bottom-12 right-0 w-[220px] bg-white shadow-lg rounded-md border border-light-grey z-50"
            >
              <ul className="flex flex-col p-3 gap-2">
                <li
                  onClick={() => {
                    router.push("/onboarding/step-1");
                    setShowPresskitMenu(false);
                  }}
                  className="cursor-pointer rounded-md p-2 hover:text-electric-blue hover:bg-gray-100"
                >
                  Edit profile details
                </li>
                <li
                  onClick={() => {
                    router.push("/manage-projects/pick-projects");
                    setShowPresskitMenu(false);
                  }}
                  className={`cursor-pointer rounded-md p-2 ${
                    !portfolioComplete
                      ? "text-[#EB3B00]"
                      : "hover:text-electric-blue hover:bg-gray-100"
                  }`}
                >
                  {portfolioComplete
                    ? "Edit project details"
                    : "Complete project details"}
                </li>
                <li
                  onClick={() => {
                    router.push("?tab=about");
                    setShowPresskitMenu(false);
                  }}
                  className={`cursor-pointer rounded-md p-2 ${
                    !aboutComplete
                      ? "text-[#EB3B00]"
                      : "hover:text-electric-blue hover:bg-gray-100"
                  }`}
                >
                  {aboutComplete
                    ? "Edit about details"
                    : "Complete about details"}
                </li>
              </ul>
            </div>
          )}
        </div>

        {!isRed && (
          <button
            onClick={handlePortfolioClick}
            className={`px-2 flex items-center justify-center py-2 border rounded-md text-center font-medium transition ${
              allComplete
                ? "bg-electric-blue text-white border-electric-blue hover:bg-electric-blue hover:text-white"
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
              {portfolioComplete && hasClickedPortfolio
                ? "Preview Presskit"
                : "Create Presskit"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
