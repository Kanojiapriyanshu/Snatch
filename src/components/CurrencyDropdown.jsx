"use client";
import { useState } from "react";
import Image from "next/image";
import { currencies } from "@/data/currencies";

export default function CurrencyDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (currency) => {
    onChange(currency); // ✅ Call onChange here
    setIsOpen(false);
  };

  return (
    <div className="relative w-32">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100"
      >
       {value && value.code ? (
      <div className="flex items-center gap-2">
        <Image
          src={value.flag}
          alt={value.code}
          width={20} 
          height={14}
        />
        <span className="text-sm font-medium">{value.code}</span>
      </div>
    ) : (
      <span className="text-sm text-gray-500">Select</span>
    )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-52 overflow-y-auto overflow-x-hidden">
          {currencies.map((currency) => (
            <div
              key={currency.code}
              onClick={() => handleSelect(currency)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <Image src={currency.flag} alt={currency.code} width={20} height={14} />
              <span className="text-sm">{currency.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
