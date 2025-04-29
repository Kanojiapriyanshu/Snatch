"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useFormContext } from "@/app/onboarding/context";
import Portfolio from "@/components/Profilepage/Portfolio";
import About from "@/components/Profilepage/About";
import Audience from "@/components/Profilepage/Audience";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const menuItems = ["portfolio", "about", "audience"];
  const { userId } = useAuth();
  const { formData } = useFormContext();

  // Check if the user's Instagram account is already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/auth/check-instagram-connection");
        const data = await response.json();

        if (data.connected) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error checking Instagram connection:", error);
      }
    };

    checkConnection();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/instagram");
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Instagram OAuth via fb
      } else {
        alert("Failed to get Instagram login URL");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while trying to log in.");
    } finally {
      setLoading(false);
    }
  };

  // Function to render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "portfolio":
        return <Portfolio />;
      case "about":
        return <About />;
      case "audience":
        return <Audience />;
      default:
        return <Portfolio />;
    }
  };

  return (
    <div className={`flex flex-grow flex-col items-center h-screen bg-white relative font-qimano ${activeTab === "audience" ? "overflow-visible" : "overflow-hidden"}`}>
      {/* Tabs */}
      <div className="flex absolute top-10 space-x-6 ">
        {menuItems.map((item) => (
          <div
            key={item}
            className={`relative cursor-pointer text-2xl ${
              activeTab === item ? "text-electric-blue" : "text-black"
            }`}
            onClick={() => setActiveTab(item)}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
            <span
              className={`absolute bottom-0 left-0 w-full h-[2px] bg-electric-blue transition-all duration-300 ${
                activeTab === item ? "scale-x-100" : "scale-x-0"
              }`}
            ></span>
          </div>
        ))}
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center ">
          <h1 className="text-3xl absolute top-1/3 transform -translate-y-1/3">
            Connect with Instagram to add projects
          </h1>
          <p className="text-md absolute top-[40%] transform -translate-y-1/3 h-auto max-w-[380px] text-center leading-relaxed">
            Link your Instagram account here to add projects to
            <span className="block max-w-[300px] text-center mx-auto">
              make your portfolio and show to brands
            </span>
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-[230px] h-[47px] mt-5 bg-electric-blue text-white border border-light-grey rounded-md text-center font-medium hover:bg-electric-blue hover:text-white absolute top-[50%] transform -translate-y-1/2"
          >
            {loading ? "Redirecting..." : "Login to Instagram"}
          </button>
        </div>
      ) : (
        <div
        className={`flex flex-grow justify-center mt-20 h-full bg-white ${
          activeTab === "audience" ? "w-[800px]" : "w-[90%]"
        } ${activeTab === "audience" ? "overflow-none" : ""}`}
        >
          {renderTabContent()}
        </div>
      )}
    </div>
  );
};

export default Profile;
