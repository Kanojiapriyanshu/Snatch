"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { pricingGuides } from "@/data/pricingGuides";
import CurrencyDropdown from "./CurrencyDropdown";
import { currencies } from "@/data/currencies";
import Button from "./ui/Button";

const PricingGuideModal = ({
  isOpen,
  onClose,
  selectedCurrency,
  setSelectedCurrency,
}) => {
  const [modalCurrency, setModalCurrency] = useState(selectedCurrency);

  useEffect(() => {
    if (isOpen) setModalCurrency(selectedCurrency);
  }, [isOpen, selectedCurrency]);

  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && onClose();
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

  const pricingData = pricingGuides[modalCurrency?.code];
  const hasPricingData = Boolean(pricingData && pricingData.tiers?.length);
  const availableCountries = currencies.filter((currency) =>
    Object.keys(pricingGuides).includes(currency.code)
  );


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg p-8 max-w-5xl w-full mx-4 shadow-lg overflow-y-auto max-h-[90vh]">
        {/* Header: Dropdown + Close */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <CurrencyDropdown
            value={modalCurrency}
            onChange={(currency) => setModalCurrency(currency)}
          />
          <button onClick={onClose} className="text-gray-700 hover:text-black">
          <Image src="/assets/icons/cross-mark.svg" className="w-8 h-10" width={10} height={10} alt="cross" />
          </button>
        </div>

        {/* Title — always visible */}
        <h2 className="text-3xl font-qimano text-electric-blue  mb-10">
          The Creator’s Pricing Playbook
        </h2>

        {/* Conditional Rendering Below */}
        {!hasPricingData ? (
          // ❌ No data available
          <div className="text-center mt-32 mb-12 font-apfel-grotezk-regular h-[320px]">
            <p className="text-2xl font-qimano text-electric-blue mb-4">
              Sorry! We don’t have pricing data for this country yet!
            </p>
            <p className="text-gray-700 mb-6">
              We’re still gathering verified creator rates here.
              <br />
              You can check guides for these countries instead:
            </p>

            <div className="flex flex-wrap max-w-3xl justify-center mx-auto gap-4 text-gray-800">
              {availableCountries.map((country) => (
                <Button
                  key={country.code}
                  onClick={() =>
                    setModalCurrency({
                      code: country.code,
                      country: country.name,
                      flag: country.flag,
                    })
                  }
                  variant="hyperlink"
                  size=""
                  className="text-graphite !font-extralight "
                >
                <Image
                  src={country.flag}
                  alt={country.name}
                  className="w-5 h-3 object-cover "
                  width={20}
                  height={10}
                />
                 <span className="ml-1">{country.name}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // ✅ Pricing Data Table
          <>
            {/* Table */}
            <div className="overflow-x-auto mb-8 font-apfel-grotezk-regular">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-gray-700">
                      Tier
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700">
                      Followers
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700">
                      Engagement Rate
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700">
                      Post (Static)
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700">
                      Story (1 Frame)
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700">
                      Reel (Video)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pricingData.tiers.map((tier, i) => (
                    <tr key={i} className="border-b border-gray-100 font-apfel-grotezk-regular">
                      <td className="px-4 py-3 font-[600] text-gray-700">
                        {tier.tier}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {tier.followers}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {tier.engagement}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{tier.post}</td>
                      <td className="px-4 py-3 text-gray-700">{tier.story}</td>
                      <td className="px-4 py-3 text-gray-700">{tier.reel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* “When Higher Pricing Makes Sense” */}
            <div>
              <h3 className="text-xl font-md text-electric-blue text-center font-qimano">
                When higher pricing makes sense:
              </h3>
              <p className="text-gray-600 text-center mb-4 text-sm">
                Because it's not just about the numbers
              </p>
              <div className="max-w-2xl mx-auto font-apfel-grotezk-regular text-base leading-6 text-black space-y-2">
                <p className="text-center">
                  1. Niche community (health, finance, parenting...)
                </p>
                <p className="text-center">
                  2. Content saves + shares (esp. for reels)
                </p>
                <p className="text-center">
                  3. High comment volume or active replies
                </p>
                <p className="text-center">
                  4. Brand storytelling or UGC-style authenticity
                </p>
                <p className="text-center">
                  5. Rights requested (brand wants to repost, use in ads...)
                </p>
                <p className="text-center">6. Regional language audience</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PricingGuideModal;
