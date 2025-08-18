"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Portfolio from "@/components/Profilepage/Portfolio";
import About from "@/components/Profilepage/About";
import Audience from "@/components/Profilepage/Audience";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("work");
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [portfolioComplete, setPortfolioComplete] = useState(false);
  const [aboutComplete, setAboutComplete] = useState(false);
  const [audienceComplete, setAudienceComplete] = useState(false);
  const menuItems = ["work", "about", "audience"];
  const { userId } = useAuth();

  // Check if the user's Instagram account is already connected (for audience)
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/auth/check-instagram-connection");
        const data = await response.json();
        setIsConnected(!!data.connected);
        setAudienceComplete(!!data.connected); // <-- Only check IG connection for audience tick
      } catch (error) {
        setIsConnected(false);
        setAudienceComplete(false);
      }
    };
    checkConnection();
  }, []);

  // Portfolio tick
  useEffect(() => {
    const checkPortfolioComplete = async () => {
      try {
        const res = await fetch("/api/projects/filled-count");
        const data = await res.json();
        setPortfolioComplete(data.filledCount >= 4);
      } catch (err) {
        setPortfolioComplete(false);
      }
    };
    checkPortfolioComplete();
  }, [userId]);

  // About: check via /api/projects/aboutCompletion
  useEffect(() => {
    const checkAboutComplete = async () => {
      try {
        const res = await fetch("/api/projects/aboutCompletion");
        const data = await res.json();
        setAboutComplete(!!data.complete);
      } catch (err) {
        setAboutComplete(false);
      }
    };
    checkAboutComplete();
  }, [userId]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/instagram");
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to get Instagram login URL");
      }
    } catch (error) {
      alert("An error occurred while trying to log in.");
    } finally {
      setLoading(false);
    }
  };

  // Green tick icon (inline SVG, green circle with tick)
  const GreenTick = () => (
    <span className="inline-flex items-center mr-2">
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.06683 8.19967L4.6335 6.76634C4.51127 6.64412 4.35572 6.58301 4.16683 6.58301C3.97794 6.58301 3.82238 6.64412 3.70016 6.76634C3.57794 6.88856 3.51683 7.04412 3.51683 7.23301C3.51683 7.4219 3.57794 7.57745 3.70016 7.69967L5.60016 9.59967C5.7335 9.73301 5.88905 9.79967 6.06683 9.79967C6.24461 9.79967 6.40016 9.73301 6.5335 9.59967L10.3002 5.83301C10.4224 5.71079 10.4835 5.55523 10.4835 5.36634C10.4835 5.17745 10.4224 5.0219 10.3002 4.89967C10.1779 4.77745 10.0224 4.71634 9.8335 4.71634C9.64461 4.71634 9.48905 4.77745 9.36683 4.89967L6.06683 8.19967ZM7.00016 13.6663C6.07794 13.6663 5.21127 13.4913 4.40016 13.1413C3.58905 12.7913 2.8835 12.3163 2.2835 11.7163C1.6835 11.1163 1.2085 10.4108 0.858496 9.59967C0.508496 8.78856 0.333496 7.9219 0.333496 6.99967C0.333496 6.07745 0.508496 5.21079 0.858496 4.39967C1.2085 3.58856 1.6835 2.88301 2.2835 2.28301C2.8835 1.68301 3.58905 1.20801 4.40016 0.858008C5.21127 0.508008 6.07794 0.333008 7.00016 0.333008C7.92238 0.333008 8.78905 0.508008 9.60016 0.858008C10.4113 1.20801 11.1168 1.68301 11.7168 2.28301C12.3168 2.88301 12.7918 3.58856 13.1418 4.39967C13.4918 5.21079 13.6668 6.07745 13.6668 6.99967C13.6668 7.9219 13.4918 8.78856 13.1418 9.59967C12.7918 10.4108 12.3168 11.1163 11.7168 11.7163C11.1168 12.3163 10.4113 12.7913 9.60016 13.1413C8.78905 13.4913 7.92238 13.6663 7.00016 13.6663Z"
          fill="#14AE5C"
        />
      </svg>
    </span>
  );

  // Add these handlers to update completion states green tick in UI
  const handleAboutComplete = (complete) => setAboutComplete(complete);


  // Function to render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "work":
        return <Portfolio  />;
      case "about":
        return <About onComplete={handleAboutComplete} />;
      case "audience":
        return <Audience  />;
      default:
        return isConnected ? <Portfolio  /> : null;
    }
  };

  return (
    <div
      className={`flex flex-grow flex-col items-center h-screen bg-white relative font-qimano ${
        activeTab === "audience" ? "overflow-visible" : "overflow-hidden"
      }`}
    >
      {/* Tabs */}
      <div className="flex absolute top-10 space-x-9 border-b-2 border-gray-200  ">
     {menuItems.map((item) => {
    const isActive = activeTab === item;
    const isComplete =
      (item === "work" && portfolioComplete) ||
      (item === "about" && aboutComplete) ||
      (item === "audience" && audienceComplete);

    return (
      <div
        key={item}
        className={`relative cursor-pointer text-2xl flex items-center
          ${
            isActive
              ? "text-electric-blue" // active overrides all
              : isComplete
              ? "text-graphite" // complete but not active
              : "text-[#EB3B00]" // incomplete
          }`}
        onClick={() => setActiveTab(item)}
      >
        {/* Green tick if section is complete, to the left of the label */}
        {item === "work" && portfolioComplete && <GreenTick />}
        {item === "about" && aboutComplete && <GreenTick />}
        {item === "audience" && audienceComplete && <GreenTick />}

        <span>{item.charAt(0).toUpperCase() + item.slice(1)}</span>

        {/* underline effect */}
        <span
          className={`absolute bottom-0 left-0 w-full h-[2px] bg-electric-blue transition-all duration-300 ${
            isActive ? "scale-x-100" : "scale-x-0"
          }`}
        ></span>
      </div>
    );
  })}
      </div>

      <div
        className={`flex flex-grow justify-center mt-20 h-full bg-white ${
          activeTab === "audience" ? "w-[700px] 3xl:w-[800px]" : "w-[90%]"
        } ${activeTab === "audience" ? "overflow-none" : ""}`}
      >
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Profile;