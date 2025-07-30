"use client";

import { useState, useEffect } from "react";
import Header from "@/components/settings/Header";
import Menu from "@/components/settings/Menu";
import SettingsLinks from "@/components/settings/SettingsLinks";
import Image from "next/image";

export default function Page() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true); 
  const [loading, setLoading] = useState(false);
  const [facebookPageName, setFacebookPageName] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");

useEffect(() => {
  const checkConnection = async () => {
    try {
      const response = await fetch("/api/auth/check-instagram-connection");
      const data = await response.json();
      if (data.connected) {
        setIsConnected(true);
        setFacebookPageName(data.facebookPageName || "");
        setInstagramUsername(data.instagramUsername || "");
      }
    } catch (error) {
      console.error("Error checking Instagram connection:", error);
    } finally {
      setCheckingStatus(false); // <-- Finish checking
    }
  };
  checkConnection();
}, []);

  const handleLoginRedirect = async () => {
    setIsRedirecting(true);
    try {
      const response = await fetch("/api/auth/instagram");
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to get Instagram login URL");
      }
    } catch (error) {
      console.error("Error during login redirect:", error);
      alert("An error occurred while trying to log in.");
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
   <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <div className="sticky top-0 z-50">
        <Header />
      </div>

      <main className="flex-grow overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 pt-20 pb-24 text-center">
          <h1 className="font-qimano font-normal text-[50px] leading-[90%] text-center align-middle">
            Settings
          </h1>

          <div className="text-left border-b border-gray-300 text-sm text-gray-700 pb-2 mb-6 font-medium font-apfel-grotezk-regular">
            Link social media
          </div>

          {checkingStatus ? (
            // 🔄 Loader while checking
            <div className="mt-6 text-center">
              <h2 className="text-lg font-apfel-grotezk-regular text-gray-600">
                Checking your Instagram connection...
              </h2>
              <div className="mt-4 flex justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-electric-blue rounded-full animate-spin"></div>
              </div>
            </div>
          ) : isConnected ? (
            // ✅ Connected state
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-qimano text-electric-blue mb-4">
                Your account is connected!
              </h2>

              <div className="flex justify-center gap-3 mb-4">
                {/* Facebook Button */}
                <div className="bg-[#0099510D] text-[#009951] px-2 py-1 rounded-lg flex items-center min-w-[160px]">
                  <Image
                    src="/assets/images/facebook-green.svg"
                    alt="Facebook"
                    width={16}
                    height={16}
                    className="w-10 h-9"
                  />
                  <span className="text-sm font-medium">
                    {facebookPageName || "N/A"}
                  </span>
                </div>

                {/* Instagram Button */}
                <div className="bg-[#0099510D] text-[#009951] px-2 py-1 rounded-lg flex items-center min-w-[160px]">
                  <Image
                    src="/assets/images/insta-green.svg"
                    alt="Instagram"
                    width={16}
                    height={16}
                    className="w-10 h-9"
                  />
                  <span className="text-sm font-medium">
                    {instagramUsername || "N/A"}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-md font-apfel-grotezk-regular">
                Your Instagram is now securely connected to Snatch, and your
                content will begin syncing automatically.
              </p>
            </div>
          ) : (
            // ❌ Not connected state
            <>
              <p className="text-xl font-medium font-qimano">
                Connect With Instagram To Add Your Projects
              </p>
              <p className="text-md text-gray-600 mt-2 font-apfel-grotezk-regular">
                Linking your Instagram account allows you to directly add your
                creations to your profile kit on Snatch.
              </p>
            </>
          )}

          {/* Refresh Button */}
          {!checkingStatus && (
            <button
              onClick={handleLoginRedirect}
              disabled={isRedirecting}
              className="px-12 py-2.5 mt-4 bg-electric-blue text-white text-md font-apfel-grotezk-regular font-medium transition rounded-md ml-8"
            >
              {isRedirecting ? "Redirecting..." : "Refresh Instagram login"}
            </button>
          )}

          {/* Settings Links */}
          <SettingsLinks />
        </div>
      </main>

      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-40">
        <Menu />
      </div>
    </div>
  );
}
