import { motion } from "framer-motion";
import { useCheckScreenSize } from "@/utils/public-portfolio/portfolio";
import { useRouter, usePathname } from "next/navigation";
import { useMotionValue } from "framer-motion";

const HeaderForMobile = ({ formData, headerOpacityPrimary, headerOpacitySecondary, isAdminView, showGoBackButton = true, showHeaderButton = true, isScrolled = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminViewRoute = pathname.includes('/adminview');

  // if (isMobile) return null;

  const handleRequest = () => {
    if (isAdminViewRoute) {
      const parts = pathname.split("/");
      const username = parts[1];
      const portfolioUrl = `${window.location.origin}/${username}/media-kit`;

      try {
        navigator.clipboard.writeText(portfolioUrl);
        alert("Portfolio link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy link:", err);
        alert("Failed to copy link");
      }
    } else {
      const parts = pathname.split("/");
      const influencerUsername = parts[1];
      router.push(`/request-popup?username=${influencerUsername}`);
    }
  };

  const handleGoBack = () => {
    router.push('/profile');
  };

  return (
    <motion.div className="container flex md:w-[98%] top-0 sm:w-[97.5%] w-[96.5%] left-2 max-w-[960px] z-20 bg-white fixed h-[84px] rounded-b-xl lg:hidden shadow-xl"
      style={{
        opacity: headerOpacityPrimary
      }}
    >


      <motion.div
        className="md:w-[98%] sm:w-[97.5%] w-[96.5%] left-2 top-1 px-4 fixed flex flex-row-reverse items-center justify-between z-20 lg:hidden rounded-xl  bg-[#7f7f7f]/80 h-[80px] "
        // className="container mx-auto max-w-[1280px] fixed hidden top-1 w-[99%] z-20 left-2 py-2 px-6 mt-2 justify-between lg:flex items-center rounded-3xl backdrop-blur-3xl bg-[#7f7f7f]/80"
        style={{
          opacity: headerOpacitySecondary
        }}
      >

        {/* <div className="container mx-auto flex items-center justify-between"> */}
        {/* Left side - CTA button only when scrolled, both buttons when not scrolled */}
        <motion.div
          className="flex w-[116px] "
        >
          {/* Show go back button only when not scrolled and is admin view */}
          {/* {!isScrolled && isAdminView && (

          <motion.button
            className="p-2 rounded-full bg-gray-500 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
            onClick={handleGoBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </motion.button>
        )} */}

          {/* Always show the CTA button */}
          <motion.button
            className="w-full bg-yellow-shade-600 text-graphite font-outline py-3 rounded-lg font-apfel-grotezk-regular text-base font-medium  text-center"
            onClick={handleRequest}
          >
            {isAdminViewRoute ? "Copy Portfolio link" : "Get in touch"}
          </motion.button>
        </motion.div>

        {/* Center - Name - Always show */}
        <motion.div className="w-1/2 flex flex-wrap pt-[6px]  border-red">
          <h1 className="text-3xl md:text-4xl leading-none font-qimano text-white flex items-center gap-1">
            {formData?.firstName
              ? formData.firstName.charAt(0).toUpperCase() + formData.firstName.slice(1)
              : ""}
            {" "}
            {formData?.lastName
              ? formData.lastName.charAt(0).toUpperCase() + formData.lastName.slice(1)
              : ""}
          </h1>
        </motion.div>

      </motion.div>
    </motion.div>
  );
};

export default HeaderForMobile;