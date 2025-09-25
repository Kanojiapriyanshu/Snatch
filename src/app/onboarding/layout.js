"use client";

import { FormProvider, useFormContext } from "./context";
import Image from "next/image";
import { useState } from "react";
import Preview from "@/components/Preview";
import { useRouter, usePathname } from "next/navigation";
import NextButton from "@/components/NextButton";

function LayoutContent({ children }) {
  const { formData } = useFormContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  const toggleMenu = () => setIsMenuVisible((prev) => !prev);

  const handleMenuClick = (route) => {
    setIsMenuVisible(false);
    router.push(route);
  };

  const handlePrevClick = () => {
    if (pathname === "/onboarding/step-2") {
      router.push("/onboarding/step-1");
    }
  };

  return (
    <div className="max-w-screen h-screen max-h-screen mx-auto">
       {/* adding w percentage here keeps padding right side on evry screen */}
      <div className="flex h-screen 2xl:w-[85%] 4xl:w-[100%]">
        {/* Left side: Image with Preview */}
        <div className="w-1/2 lg:h-[100vh] xl:h-[100vh] relative flex items-center justify-center bg-white">
          <Image
            src="/assets/images/signup_background.png"
            alt="Background Image"
            fill
            className="absolute p-10 rounded-md top-0 left-0 w-full h-full object-left-bottom"
            loading="eager"
            priority
          />
          <div className="relative mb-20 z-10 p-0 mt-20 bg-white bg-opacity-90 rounded-xl shadow-lg font-apfel-grotezk-regular">
            <Preview />
          </div>
        </div>

        {/* Navigation Buttons */}
      <div
          className={`absolute sm:top-[87%] z-50 sm:left-[43%] h-[74px] flex justify-center items-center gap-3 bg-white shadow-md rounded-md font-apfel-grotezk-regular p-3
            ${
              formData?.hasCompletedOnboarding
                ? pathname === "/onboarding/step-1"
                  ? "w-[300px]" // Snatch + Hamburger + Next
                  : "w-[200px]" // Back + Next
                : pathname === "/onboarding/step-1"
                ? "w-[130px]" // Only Next
                : "w-[200px]" // Back + Next
            }
          `}
        >
      {formData.hasCompletedOnboarding ? (
        <>
          {pathname === "/onboarding/step-1" ? (
            <div className="flex items-center gap-3">
              {/* Snatch Button */}
              <button
                onClick={() => router.push("/dashboard")}
                className="w-[90px] h-[56px] text-electric-blue text-2xl font-semibold text-center"
              >
                <Image
                  src="/assets/images/snatch.svg"
                  width={40}
                  height={40}
                  alt="snatchlogo"
                  className="mx-auto w-24 h-7"
                />
              </button>

              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMenu}
                className="w-[61px] h-[44px] bg-gray-100 text-electric-blue rounded-md mx-auto font-medium hover:bg-transparent relative"
              >
                <Image
                  className="mx-auto w-8"
                  src="/assets/icons/onboarding/Hamburger.svg"
                  alt="hamburger"
                  width={20}
                  height={20}
                />
              </button>

              {/* Dropdown Menu */}
              {isMenuVisible && (
                <div className="absolute top-[-200%] left-[-50px] w-[200px] bg-white shadow-lg rounded-md border border-light-grey z-50">
                  <ul className="flex flex-col p-3 gap-2">
                    <li
                      onClick={() => handleMenuClick("/dashboard")}
                      className="cursor-pointer text-graphite hover:text-electric-blue hover:bg-gray-100 rounded-md p-2"
                    >
                      Dashboard
                    </li>
                    <li
                      onClick={() => handleMenuClick("/settings")}
                      className="cursor-pointer text-graphite hover:text-electric-blue hover:bg-gray-100 rounded-md p-2"
                    >
                      Settings
                    </li>
                    <li
                      onClick={() => handleMenuClick("/profile")}
                      className="cursor-pointer text-graphite hover:text-electric-blue hover:bg-gray-100 rounded-md p-2"
                    >
                      Profile
                    </li>
                  </ul>
                </div>
              )}

              {/* Next Button */}
              <NextButton />
            </div>
          ) : (
            // Step-2: Back + Next
            <>
              <button
                onClick={() => router.push("/onboarding/step-1")}
                className="w-[72px] h-[37px] bg-white text-electric-blue border border-electric-blue rounded-md text-center font-medium hover:bg-electric-blue hover:text-white"
              >
                Back
              </button>
              <NextButton />
            </>
          )}
        </>
      ) : (
        // First-time onboarding
        <>
          {pathname === "/onboarding/step-2" && (
            <button
              onClick={() => router.push("/onboarding/step-1")}
              className="w-[72px] h-[37px] bg-white text-electric-blue border border-electric-blue rounded-md text-center font-medium hover:bg-electric-blue hover:text-white"
            >
              Back
            </button>
          )}
          <NextButton />
        </>
      )}
    </div>


        {/* Right side: Form */}
        <div className="w-[40%] grid grid-cols-1 bg-white">
          <div className="">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingLayout({ children }) {
  return (
    <FormProvider>
      <LayoutContent>{children}</LayoutContent>
    </FormProvider>
  );
}


