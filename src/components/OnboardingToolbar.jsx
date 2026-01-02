"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import Button from "./ui/Button";

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
        allComplete ? "w-[545px]" : "w-[370px]"
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
          isRed ? "w-[300px]" : "w-[590px]"
        } h-[56px] gap-2 bg-gray-100 flex justify-between items-center rounded-md p-2`}
      >
        {/* Presskit toggle */}
        <div className="relative">

            <Button
                onClick={() => setShowPresskitMenu((prev) => !prev)}
                variant="secondary"
                className={`${
                  presskitIncomplete
                    ? "text-[#EB3B00] border-[#EB3B00] hover:border-[#EB3B00] hover:text-[#EB3B00] active:text-[#EB3B00] active:border-[#EB3B00]"
                    : ""
                } flex justify-center items-center gap-2`}
              >
                {presskitIncomplete ? (
                  "Complete press kit"
                ) : (
                  <>
                    {/* Inline SVG that inherits text color */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 30 30"
                      fill="currentColor"
                      className="transition-colors duration-200"
                    >
                      <path d="M6.25 23.75H7.82688L20.6225 10.9544L19.0456 9.3775L6.25 22.1731V23.75ZM5.505 25.625C5.18479 25.625 4.91646 25.5167 4.7 25.3C4.48333 25.0835 4.375 24.8152 4.375 24.495V22.3294C4.375 22.0246 4.43354 21.7341 4.55062 21.4578C4.6675 21.1816 4.82854 20.9408 5.03375 20.7356L20.8631 4.91344C21.0521 4.74177 21.2607 4.60917 21.4891 4.51562C21.7176 4.42188 21.9572 4.375 22.2078 4.375C22.4584 4.375 22.7011 4.41948 22.9359 4.50844C23.1709 4.5974 23.379 4.73885 23.56 4.93281L25.0866 6.47844C25.2805 6.65948 25.4187 6.86781 25.5012 7.10344C25.5837 7.33906 25.625 7.57469 25.625 7.81031C25.625 8.06177 25.5821 8.30167 25.4963 8.53C25.4104 8.75854 25.2739 8.96729 25.0866 9.15625L9.26437 24.9662C9.05917 25.1715 8.81844 25.3325 8.54219 25.4494C8.26594 25.5665 7.97542 25.625 7.67063 25.625H5.505ZM19.8203 10.1797L19.0456 9.3775L20.6225 10.9544L19.8203 10.1797Z" />
                    </svg>
                    <p>Edit press kit</p>
                  </>
                    )}
            </Button>


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

        {!isRed && (  <Button
          onClick={handlePortfolioClick}
          disabled={!allComplete}
          variant="primary"
          className="flex items-center justify-center w-44"
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
          <span className="ml-1">
            {portfolioComplete && hasClickedPortfolio
              ? "Preview press kit"
              : "Create press kit"}
          </span>
        </Button>)}

      </div>
    </div>
  );
}
