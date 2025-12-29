//app/onboarding/layout.js
"use client";

import { FormProvider, useFormContext } from "./context";
import Image from "next/image";
import { useState, useEffect, useRef} from "react";
import Preview from "@/components/Preview";
import { useRouter, usePathname } from "next/navigation";
import NextButton from "@/components/NextButton";
import Button from "@/components/ui/Button";

function LayoutContent({ children }) {
  const { formData } = useFormContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const menuRef = useRef(null);
  const toggleMenu = () => setIsMenuVisible((prev) => !prev);

  const isStep1 = pathname === "/onboarding/step-1";
  const isStep2 = pathname === "/onboarding/step-2";
  const showMenu = formData?.hasCompletedOnboarding && (isStep1 || isStep2);

    // ✅ Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuVisible(false);
      }
    }

    if (isMenuVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuVisible]);

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
          className={`
          absolute sm:top-[87%] z-50 sm:left-[43%]
          h-[74px]
          flex items-center justify-center gap-3
          bg-white shadow-md rounded-md
          font-apfel-grotezk-regular p-3`}
        >

          {showMenu && (
          <div className="flex items-center gap-3" ref={menuRef}>
            {/* Snatch Logo */}
            <button
              onClick={() => router.push("/dashboard")}
              className="w-[90px] h-[56px]"
            >
              <Image
                src="/assets/images/snatch.svg"
                alt="snatch"
                width={40}
                height={40}
                className="mx-auto w-24 h-7"
              />
            </button>

            {/* Hamburger */}
            <button
              onClick={toggleMenu}
              className={`w-[61px] h-[50px] rounded-md
                ${
                  isMenuVisible
                    ? "bg-electric-blue"
                    : "bg-[#F2F2F2] hover:border-[1.6px] hover:border-electric-blue"
                }
              `}
            >
              <Image
                src={
                  isMenuVisible
                    ? "/assets/icons/onboarding/HamburgerWhite.svg"
                    : "/assets/icons/onboarding/Hamburger.svg"
                }
                alt="menu"
                width={18}
                height={18}
                className="mx-auto w-8"
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
            
          </div>
        )}

          {/* Back (ONLY step-2) */}
            {isStep2 && (
              <Button
                onClick={() => router.push("/onboarding/step-1")}
                className="px-6"
              >
                Back
              </Button>
            )}

              {/* Next */}
            <NextButton />
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



