"use client";
import React, { useEffect } from "react";

const PricingGuideModal = ({ isOpen, onClose }) => {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg p-8 max-w-5xl w-full mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Pricing Table Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-electric-blue text-center mb-6 font-qimano">
            Set Your Prices with Confidence
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Tier</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Followers</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Engagement Rate</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Post (Static)</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Story (1 Frame)</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Reel (Video)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">Nano</td>
                  <td className="px-4 py-3 text-gray-700">1k - 10k</td>
                  <td className="px-4 py-3 text-gray-700">5% - 10%</td>
                  <td className="px-4 py-3 text-gray-700">₹1,500 - ₹4,000</td>
                  <td className="px-4 py-3 text-gray-700">₹500 - ₹1,500</td>
                  <td className="px-4 py-3 text-gray-700">₹2,000 - ₹6,000</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">Micro</td>
                  <td className="px-4 py-3 text-gray-700">10k - 50k</td>
                  <td className="px-4 py-3 text-gray-700">4% - 8%</td>
                  <td className="px-4 py-3 text-gray-700">₹4,000 - ₹12,000</td>
                  <td className="px-4 py-3 text-gray-700">₹1,000 - ₹3,000</td>
                  <td className="px-4 py-3 text-gray-700">₹6,000 - ₹18k</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">Mid-Tier</td>
                  <td className="px-4 py-3 text-gray-700">50k - 200k</td>
                  <td className="px-4 py-3 text-gray-700">3% - 6%</td>
                  <td className="px-4 py-3 text-gray-700">₹12k - ₹30k</td>
                  <td className="px-4 py-3 text-gray-700">₹3,000 - ₹7,000</td>
                  <td className="px-4 py-3 text-gray-700">₹18k - ₹50k</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Higher Pricing Factors Section */}
        <div>
          <h3 className="text-xl font-bold text-electric-blue text-center mb-2 font-qimano">
            When Higher Pricing Makes Sense
          </h3>
          <p className="text-gray-600 text-center mb-6 text-sm">
            Because it's not just about the numbers
          </p>
          
          <div className="space-y-3 max-w-2xl mx-auto ">
            <div className="flex">
              <span className="text-black font-medium mr-3">1.</span>
              <p className="text-black">Niche community (health, finance, parenting,...)</p>
            </div>
            <div className="flex">
              <span className="text-black font-medium mr-3">2.</span>
              <p className="text-black">Content saves + shares (esp. for reels)</p>
            </div>
            <div className="flex">
              <span className="text-black font-medium mr-3">3.</span>
              <p className="text-black">High comment volume or active replies</p>
            </div>
            <div className="flex">
              <span className="text-black font-medium mr-3">4.</span>
              <p className="text-black">Brand storytelling or UGC-style authenticity</p>
            </div>
            <div className="flex">
              <span className="text-black font-medium mr-3">5.</span>
              <p className="text-black">Rights requested (brand wants to repost, use in ads..)</p>
            </div>
            <div className="flex">
              <span className="text-black font-medium mr-3">6.</span>
              <p className="text-black">Regional language audience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingGuideModal;
