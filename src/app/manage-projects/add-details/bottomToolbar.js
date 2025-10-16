// components/BottomToolbar.js
"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
export default function BottomToolbar({
  isMenuVisible,
  handleHamburgerClick,
  handlePrevious,
  handleNext,
  handleBackClick,
  handlePreviewClick,
  isAnyProjectCompleted,
  projects,
}) {

   const router = useRouter();

    const handleProfileClick = () => {
    router.push("/profile");
    };

  const handleNextClick = () => {
    router.push("/dashboard");
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
  }

  const handleSettingClick = () => {
   router.push("/settings")
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 h-[74px] bg-white rounded-lg shadow-lg py-1 px-3 font-apfel-grotezk-regular">
      <div className="flex gap-2">
        <div className="flex gap-[9px] px-3 py-1.5 w-[750px] items-center rounded-md">
          {/* Logo + Hamburger */}
          <div className="flex items-center justify-center gap-[9px]">
            <button
              onClick={handleNextClick}
              className="w-[105px] h-[56px] text-electric-blue text-2xl font-semibold text-center px-2"
            >
              <Image
                src="/assets/images/snatch.svg"
                width={40}
                height={40}
                alt="snatchlogo"
                className="w-32 h-10"
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
          </div>

          {/* Dropdown Menu */}
          {isMenuVisible && (
            <div className="absolute top-[-210%] left-[13%] w-[200px] bg-white shadow-lg rounded-md border border-light-grey z-50 font-apfel-grotezk-regular">
              <ul className="flex flex-col p-3 gap-2">
                <li
                  onClick={handleDashboardClick}
                  className="cursor-pointer text-graphite hover:text-electric-blue hover:bg-gray-100 rounded-md p-2"
                >
                  Dashboard
                </li>
                <li
                  onClick={handleSettingClick}
                  className="cursor-pointer text-graphite hover:text-electric-blue hover:bg-gray-100 rounded-md p-2"
                >
                  Settings
                </li>
                <li
                  onClick={handleProfileClick}
                  className="cursor-pointer text-graphite hover:text-electric-blue hover:bg-gray-100 rounded-md p-2"
                >
                  Profile
                </li>
              </ul>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-start items-start">
            <button
              className="px-2 py-1.5 w-[149px] h-[38px] text-electric-blue rounded hover:opacity-80 transition-colors underline underline-offset-4 flex items-center justify-between"
              onClick={handlePrevious}
              disabled={projects.length <= 1}
            >
              <Image
                src="/assets/images/projectsLeftarrow.svg"
                alt="back arrow"
                width={14}
                height={14}
                className="w-[14px] h-[14px]"
              />
              <span className="text-md">Previous Project</span>
            </button>

            <button
              className="px-2 py-1.5 w-[119px] h-[38px] flex items-center justify-between text-electric-blue rounded hover:opacity-80 transition-colors underline underline-offset-4"
              onClick={handleNext}
              disabled={projects.length <= 1}
            >
              <span className="text-md">Next Project</span>
              <Image
                src="/assets/images/projectRightarrow.svg"
                alt="back arrow"
                width={14}
                height={14}
                className="w-[14px] h-[14px]"
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-100 px-3 py-2 h-[56px] rounded-lg flex items-center gap-[8px]">
            <button
              className="px-4 h-[38px] rounded-lg border-electric-blue border-[1px] text-electric-blue hover:bg-electric-blue hover:text-white transition-colors"
              onClick={handleBackClick}
            >
              Previous Step
            </button>

            <button
              className={`px-4 h-[38px] rounded-lg transition-colors ${
                !isAnyProjectCompleted
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-electric-blue text-white hover:bg-blue-shade-700"
              }`}
              onClick={handlePreviewClick}
              disabled={!isAnyProjectCompleted}
            >
              Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
