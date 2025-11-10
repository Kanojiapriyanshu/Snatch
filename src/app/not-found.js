// "use client";

// import Link from "next/link";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export default function NotFound() {
//   const [isMenuVisible, setIsMenuVisible] = useState(false);
//   const router = useRouter();
//   const messages = Array(6).fill("Oops, this page could not be found");

//   const handleMenuClick = (path) => {
//     router.push(path);
//     setIsMenuVisible(false);
//   };

//   return (
//     <div className="relative flex flex-col items-center min-h-screen bg-[#fafafa] text-center overflow-hidden font-qimano">
//       {/* Group 404 + ribbon together */}
//       <div className="relative flex items-center justify-center w-full h-[200px] lg:h-[300px]   mt-10 5xl:mt-20">
//         {/* 404 SVG */}
//         <div className="relative z-0">
//           <Image
//             src="/assets/images/404.svg"
//             alt="404"
//             width={800}
//             height={300}
//             className="w-[35vw] max-w-[800px] h-auto opacity-40"
//           />
//         </div>

//         {/* Animated Ribbon (on top) */}
//         <div className="absolute top-10 inset-0 flex items-center justify-center z-10 pointer-events-none">
//           <div className="relative w-[130%] -rotate-[15deg] bg-white shadow-sm py-2 overflow-hidden">
//             <motion.div
//               className="flex items-center gap-10 whitespace-nowrap text-[#EB3B00] text-xl font-medium"
//               animate={{ x: ["0%", "-50%"] }}
//               transition={{
//                 ease: "linear",
//                 duration: 10,
//                 repeat: Infinity,
//               }}
//             >
//               {[...messages, ...messages].map((text, i) => (
//                 <p key={i} className="flex items-center gap-2 shrink-0">
//                   <Image
//                     src="/assets/images/red-error.svg"
//                     width={24}
//                     height={24}
//                     alt="error-icon"
//                     className="w-6 h-6"
//                   />
//                   {text}
//                 </p>
//               ))}
//             </motion.div>
//           </div>
//         </div>
//       </div>

//       {/* Message */}
//       <div className="z-20  mt-10 5xl:mt-28 ">
//         <p className="text-graphite text-xl 3xl:text-2xl 5xl:text-3xl font-medium mb-6">
//           Your dashboard seems to have <br /> dashed away :/ Try refreshing the
//           <br /> page to bring it back
//         </p>

//         <Link
//           href="/"
//           className="bg-blue-shade-600 transition text-white px-5 py-2 rounded-md text-md font-apfel-grotezk-regular"
//         >
//           Back to Dashboard
//         </Link>
//       </div>

//       {/* Footer Logo + Menu */}
//       <div className="absolute bottom-10 flex items-center gap-3 bg-white shadow-sm rounded-2xl px-3 py-2">
//         <button
//           onClick={() => router.push("/dashboard")}
//           className="flex items-center justify-center rounded-xl w-[110px] h-[60px] hover:opacity-90 transition"
//         >
//           <Image
//             src="/assets/images/snatch.svg"
//             width={90}
//             height={40}
//             alt="snatchlogo"
//             className="w-[90px] h-auto"
//           />
//         </button>

//         <button
//           onClick={() => setIsMenuVisible((prev) => !prev)}
//           className="relative z-20 flex items-center justify-center bg-[#F2F2F2]/50 rounded-xl w-[60px] h-[50px] cursor-pointer hover:opacity-90 transition"
//         >
//           <Image
//             src="/assets/icons/onboarding/Hamburger.svg"
//             alt="hamburger"
//             width={24}
//             height={24}
//             className="w-6 h-6"
//           />
//         </button>

//         {isMenuVisible && (
//           <div className="absolute bottom-full right-0 w-[200px] bg-white rounded-md shadow-md z-50 font-apfel-grotezk-regular">
//             <ul className="flex flex-col items-start p-3 gap-2">
//               <li
//                 onClick={() => handleMenuClick("/dashboard")}
//                 className="cursor-pointer text-graphite hover:text-electric-blue rounded-md p-2"
//               >
//                 Dashboard
//               </li>
//               <li
//                 onClick={() => handleMenuClick("/settings")}
//                 className="cursor-pointer text-graphite hover:text-electric-blue rounded-md p-2"
//               >
//                 Settings
//               </li>
//               <li
//                 onClick={() => handleMenuClick("/profile")}
//                 className="cursor-pointer text-graphite hover:text-electric-blue rounded-md p-2"
//               >
//                 Profile
//               </li>
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function NotFound() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isMediaKit, setIsMediaKit] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const messages = Array(6).fill("Oops, this page could not be found");

  useEffect(() => {
    // Detect if current route is from media-kit context
    if (pathname?.includes("/media-kit")) {
      setIsMediaKit(true);
    }
  }, [pathname]);

  const handleMenuClick = (path) => {
    router.push(path);
    setIsMenuVisible(false);
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-[#fafafa] text-center overflow-hidden font-qimano">
      {/* 404 Section */}
      <div className="relative flex items-center justify-center w-full h-[200px] lg:h-[300px] mt-10 5xl:mt-20">
        <div className="relative z-0">
          <Image
            src="/assets/images/404.svg"
            alt="404"
            width={800}
            height={300}
            className="w-[35vw] max-w-[800px] h-auto opacity-40"
          />
        </div>

        <div className="absolute top-10 -inset-10 flex items-center justify-center z-10 pointer-events-none">
          <div className="relative w-[130%] -rotate-[15deg] bg-white shadow-sm py-2 overflow-hidden">
            <motion.div
              className="flex items-center gap-3 whitespace-nowrap text-[#EB3B00] text-xl font-medium"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 10, repeat: Infinity }}
            >
              {[...messages, ...messages].map((text, i) => (
                <p key={i} className="flex items-center gap-2 shrink-0">
                  <Image
                    src="/assets/images/red-error.svg"
                    width={24}
                    height={24}
                    alt="error-icon"
                    className="w-6 h-7 mb-1"
                  />
                  {text}
                </p>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="z-20 mt-10 5xl:mt-28">
        <p className="text-graphite text-xl 3xl:text-2xl 5xl:text-3xl font-medium mb-6">
          {isMediaKit
            ? "No results for that one, try checking the creator’s handle again."
            : (
              <>
                Your dashboard seems to have <br /> dashed away :/ Try refreshing the
                <br /> page to bring it back
              </>
            )}
        </p>

        <Link
          href={isMediaKit ? "https://snatchsocial.com" : "/"}
          className="bg-blue-shade-600 transition text-white px-5 py-2 rounded-md text-md font-apfel-grotezk-regular"
        >
          {isMediaKit ? "Back to home" : "Back to Dashboard"}
        </Link>
      </div>

      {/* Footer nav — only for non-media-kit pages */}
      {!isMediaKit && (
        <div className="absolute bottom-10 flex items-center gap-3 bg-white shadow-sm rounded-2xl px-3 py-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center justify-center rounded-xl w-[110px] h-[60px] hover:opacity-90 transition"
          >
            <Image
              src="/assets/images/snatch.svg"
              width={90}
              height={40}
              alt="snatchlogo"
              className="w-[90px] h-auto"
            />
          </button>

          <button
            onClick={() => setIsMenuVisible((prev) => !prev)}
            className="relative z-20 flex items-center justify-center bg-[#F2F2F2]/50 rounded-xl w-[60px] h-[50px] cursor-pointer hover:opacity-90 transition"
          >
            <Image
              src="/assets/icons/onboarding/Hamburger.svg"
              alt="hamburger"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>

          {isMenuVisible && (
            <div className="absolute bottom-full right-0 w-[200px] bg-white rounded-md shadow-md z-50 font-apfel-grotezk-regular">
              <ul className="flex flex-col items-start p-3 gap-2">
                <li
                  onClick={() => handleMenuClick("/dashboard")}
                  className="cursor-pointer text-graphite hover:text-electric-blue rounded-md p-2"
                >
                  Dashboard
                </li>
                <li
                  onClick={() => handleMenuClick("/settings")}
                  className="cursor-pointer text-graphite hover:text-electric-blue rounded-md p-2"
                >
                  Settings
                </li>
                <li
                  onClick={() => handleMenuClick("/profile")}
                  className="cursor-pointer text-graphite hover:text-electric-blue rounded-md p-2"
                >
                  Profile
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
