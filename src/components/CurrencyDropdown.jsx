"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import { currencies } from "@/data/currencies";

export default function CurrencyDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelect = (currency) => {
    onChange(currency);
    setIsOpen(false);
    setSearch(""); // reset search after selection
  };

  // 🔍 Filter by currency NAME only (Afghani, Dollar, Rupee)
  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return currencies;

    return currencies.filter((currency) =>
      currency.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="relative w-64">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100"
      >
        {value?.code ? (
          <div className="flex items-center gap-2">
            <Image src={value.flag} alt={value.code} width={20} height={14} />
            <span className="text-sm font-medium">{value.code}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Select</span>
        )}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
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
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {/* 🔎 Search input */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search currency"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-blue-500"
            />
          </div>

          {/* Currency list */}
          <div className="max-h-48 overflow-y-auto overflow-x-hidden">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <div
                  key={`${currency.countryCode}-${currency.code}`}
                  onClick={() => handleSelect(currency)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <Image src={currency.flag} alt={currency.code} width={20} height={14} />
                  <span className="text-sm">{currency.name}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No currency found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
