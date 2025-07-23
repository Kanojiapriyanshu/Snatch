"use client";

import { useState, useEffect } from "react";
import Header from "@/components/settings/Header";
import Menu from "@/components/settings/Menu";
import SettingsLinks from "@/components/settings/SettingsLinks";

export default function Page() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true); 
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const checkConnection = async () => {
    try {
      const response = await fetch("/api/auth/check-instagram-connection");
      const data = await response.json();
      if (data.connected) setIsConnected(true);
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

          <p className="text-xl font-medium font-qimano">
            Connect With Instagram To Add Your Projects
          </p>
          <p className="text-md text-gray-600 mt-2 font-apfel-grotezk-regular">
            Linking your Instagram account allows you to directly add your creations to your profile kit on Snatch.
          </p>
          <p className="text-md text-gray-600 mt-2 font-apfel-grotezk-regular">
            To disconnect your Instagram from Snatch: Go to your Facebook account settings → Settings & Privacy → Settings → Business Integrations. Find Snatch, click Remove, and confirm.
          </p>

          {/* Shows status only */}
         <button
          onClick={!isConnected ? handleLoginRedirect : null}
          disabled={loading || isConnected || checkingStatus}
          className={`px-5 py-2.5 mt-5 ${
            checkingStatus
              ? "bg-gray-300 text-gray-600"
              : isConnected
              ? "bg-green-500 text-white"
              : "bg-electric-blue text-white hover:bg-blue-600"
          } border border-light-grey rounded-md text-md font-apfel-grotezk-regular font-medium transition`}
        >
          {checkingStatus
            ? "Checking connection..."
            : isConnected
            ? "Your account is connected"
            : "Your account is not connected"}
        </button>


          {/* Triggers redirect */}
          <button
            onClick={handleLoginRedirect}
            disabled={isRedirecting}
            className="px-5 py-2.5 bg-electric-blue text-white text-md font-apfel-grotezk-regular font-medium transition rounded-md ml-8"
          >
            {isRedirecting ? "Redirecting..." : "Refresh Instagram login"}
          </button>

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
