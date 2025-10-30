"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NotFound() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const router = useRouter();

  const handleMenuClick = (path) => {
    router.push(path);
    setIsMenuVisible(false);
  };


  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#fafafa] text-center px-6 overflow-hidden font-qimano">
      {/* Big 404 background */}
    <h1 className="text-[220px] absolute top-10 md:text-[350px] font-bold text-[#f6b299] opacity-40 space-x-6 leading-none select-none z-0">
    4
    <span className="inline-block rotate-12 origin-center">0</span>
    4
    </h1>


      {/* Crossing ribbons */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative w-full max-w-full  h-[300px]">
          {/* Top ribbon */}
          <div className="absolute top-[15%] left-[-10%] w-[120%] rotate-[15deg] bg-white border border-[#f05a22] shadow-sm py-2">
            <p className="text-[#f05a22] text-xl font-medium flex items-center justify-center gap-2">
              🤖 Oops, this page could not be found 🤖 Oops, this page could not be found 🤖
            </p>
          </div>

          {/* Bottom ribbon */}
          <div className="absolute top-[30%] left-[-10%] w-[120%] -rotate-[15deg] bg-white border border-[#f05a22] shadow-sm py-2">
            <p className="text-[#f05a22] text-xl font-medium flex items-center justify-center gap-2">
              🤖 Oops, this page could not be found 🤖 Oops, this page could not be found 🤖
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="z-20 mt-64 md:mt-56">
        <p
          className="text-graphite text-xl md:text-2xl font-medium mb-6"
        >
          Your dashboard seems to have dashed away :/ <br />
          Try refreshing the page to bring it back
        </p>

        {/* Button - use my Button custom here for primary yellow from kit */}
        <Link
          href="/"
          className="bg-yellow-shade-600 transition text-graphite px-5 py-2 rounded-md  text-md font-semibold font-apfel-grotezk-regular"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Footer logo */}
       <div className="absolute bottom-10 flex items-center gap-3 bg-white shadow-sm rounded-2xl px-3 py-2">
      {/* Snatch Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center justify-center bg-[#F2F2F2]/50 rounded-xl w-[110px] h-[60px] hover:opacity-90 transition"
      >
        <Image
          src="/assets/images/snatch.svg"
          width={90}
          height={40}
          alt="snatchlogo"
          className="w-[90px] h-auto"
        />
      </button>

      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsMenuVisible((prev) => !prev)}
        className="flex items-center justify-center bg-[#F2F2F2]/50 rounded-xl w-[60px] h-[50px] hover:opacity-90 transition"
      >
        <Image
          src={"/assets/icons/onboarding/Hamburger.svg"}
          alt="hamburger"
          width={24}
          height={24}
          className="w-6 h-6"
        />
      </button>

      {/* Dropdown Menu */}
      {isMenuVisible && (
        <div className="absolute top-[-250%] right-0 w-[200px] bg-white shadow-lg rounded-xl border border-gray-100 z-50">
          <ul className="flex flex-col p-3 gap-2">
            <li
              onClick={() => handleMenuClick("/dashboard")}
              className="cursor-pointer text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md p-2 transition"
            >
              Dashboard
            </li>
            <li
              onClick={() => handleMenuClick("/settings")}
              className="cursor-pointer text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md p-2 transition"
            >
              Settings
            </li>
            <li
              onClick={() => handleMenuClick("/profile")}
              className="cursor-pointer text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md p-2 transition"
            >
              Profile
            </li>
          </ul>
        </div>
      )}
    </div>
    </div>
  );
}
