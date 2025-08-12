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
        className="absolute inset-0 bg-black/70 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg p-8 max-w-5xl w-full mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30.148 42.1412C22.338 34.4482 19.888 31.4522 23.908 27.6632C27.928 23.8742 33.978 29.3162 39.458 34.0152C43.588 37.5602 49.018 42.0392 49.018 42.0392C49.018 42.0392 58.5381 32.0862 62.2181 27.0222C70.2281 15.9782 85.6281 24.8312 73.8481 37.3362C67.9481 43.5882 60.168 50.8052 60.168 50.8052C60.168 50.8052 66.4581 57.1202 73.8381 63.7752C80.0081 69.3372 70.978 82.1922 63.618 74.2622C56.258 66.3472 50.4779 61.0082 49.3579 61.7672C49.3579 61.7672 38.548 74.0832 36.048 76.1242C31.438 79.8922 24.928 73.0502 26.828 69.8392C29.778 64.8732 40.408 53.1442 39.928 52.3072C39.498 51.5522 33.938 45.8772 30.148 42.1412Z" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M62.6476 73.5262L38.5576 73.8682" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M42.0078 70.0196L49.4679 61.7346C49.4679 61.7346 50.5378 61.5116 53.6678 64.3416C56.3878 66.7926 59.1678 69.7546 59.1678 69.7546L42.0078 70.0196Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M68.1783 43.2246L68.2583 58.5446L60.2383 50.8216L68.1783 43.2246Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M31.0182 64.0269L30.1982 42.2549C30.1982 42.2549 39.7782 51.7459 39.8882 52.4129C40.0282 53.1879 31.0182 64.0269 31.0182 64.0269Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M72.2781 39.042L72.0381 61.6" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M26.9075 69.3307C26.8975 67.2937 25.9375 38.2627 25.9375 38.2627" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M35.918 30.9637L59.528 30.3877L49.0179 42.0507L35.918 30.9637Z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M30.168 26.9765C30.808 27.0715 38.718 26.7115 38.718 26.7115L62.5079 26.1865" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        {/* Pricing Table Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-md text-electric-blue text-center mb-6 font-qimano">
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
                  <td className="px-4 py-3 font-semibold text-gray-700">Nano</td>
                  <td className="px-4 py-3 text-gray-700">1k - 10k</td>
                  <td className="px-4 py-3 text-gray-700">5% - 10%</td>
                  <td className="px-4 py-3 text-gray-700">₹1,500 - ₹4,000</td>
                  <td className="px-4 py-3 text-gray-700">₹500 - ₹1,500</td>
                  <td className="px-4 py-3 text-gray-700">₹2,000 - ₹6,000</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-700">Micro</td>
                  <td className="px-4 py-3 text-gray-700">10k - 50k</td>
                  <td className="px-4 py-3 text-gray-700">4% - 8%</td>
                  <td className="px-4 py-3 text-gray-700">₹4,000 - ₹12,000</td>
                  <td className="px-4 py-3 text-gray-700">₹1,000 - ₹3,000</td>
                  <td className="px-4 py-3 text-gray-700">₹6,000 - ₹18k</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-700">Mid-Tier</td>
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
          <h3 className="text-xl font-md text-electric-blue text-center mb- font-qimano">
            When Higher Pricing Makes Sense
          </h3>
          <p className="text-gray-600 text-center mb-4 text-sm">
            Because it's not just about the numbers
          </p>
          
          <div className="max-w-2xl mx-auto font-apfel-grotezk-regular text-base items-center  leading-6 text-black">
  <div className="flex justify-center">
    {/* <span className="font-apfel-grotezk-mittel mr-3">1.</span> */}
    <p>Niche community (health, finance, parenting,...)</p>
  </div>
  <div className="flex justify-center">
    {/* <span className="font-apfel-grotezk-mittel mr-3">2.</span> */}
    <p>Content saves + shares (esp. for reels)</p>
  </div>
  <div className="flex justify-center">
    {/* <span className="font-apfel-grotezk-mittel mr-3">3.</span> */}
    <p>High comment volume or active replies</p>
  </div>
  <div className="flex justify-center">
    {/* <span className="font-apfel-grotezk-mittel mr-3">4.</span> */}
    <p>Brand storytelling or UGC-style authenticity</p>
  </div>
  <div className="flex justify-center">
    {/* <span className="font-apfel-grotezk-mittel mr-3">5.</span> */}
    <p>Rights requested (brand wants to repost, use in ads..)</p>
  </div>
  <div className="flex justify-center">
    {/* <span className="font-apfel-grotezk-mittel mr-3">6.</span> */}
    <p>Regional language audience</p>
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

export default PricingGuideModal;
