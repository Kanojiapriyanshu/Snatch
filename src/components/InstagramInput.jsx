"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import Image from "next/image";
import { useFormContext } from "@/app/onboarding/context";

// Only allow Instagram usernames (letters, numbers, periods, underscores, hyphens)
const usernameSchema = z.string().min(1, "Enter your Instagram username").regex(
  /^[a-zA-Z0-9._-]+$/,
  "Invalid Instagram username"
);

export default function InstagramInput({ placeholder = "Enter Instagram username", value, onChange }) {
  const [error, setError] = useState("");
  const { updateFormData } = useFormContext();

  // Extract username from full URL if value is a URL
  const extractUsername = (val) => {
    if (!val) return "";
    const match = val.match(/instagram\.com\/([a-zA-Z0-9._-]+)/);
    if (match && match[1]) return match[1];
    // If it's already a username, return as is
    if (/^[a-zA-Z0-9._-]+$/.test(val)) return val;
    return "";
  };

  // Show only username in the input
  const [username, setUsername] = useState(extractUsername(value));

  useEffect(() => {
    setUsername(extractUsername(value));
  }, [value]);

  const handleChange = (inputValue) => {
    setUsername(inputValue);

    // Validate username
    try {
      usernameSchema.parse(inputValue);
      setError("");
      const fullUrl = `https://www.instagram.com/${inputValue}`;
      onChange(fullUrl); // Pass full URL to parent
      updateFormData({ instagram: fullUrl, username: inputValue });
    } catch (e) {
      setError(e.errors[0].message);
      onChange(""); // Optionally clear parent value if invalid
    }
  };

  return (
    <div>
   <div className="flex items-center w-full rounded-md border border-stroke px-2 py-2">
      {/* Instagram Icon */}
      <span className="text-primary">
        <Image src="/assets/icons/onboarding/Instagram.svg" alt="Instagram" width={40} height={34} />
      </span>
      {/* Vertical Line */}
      <div className="w-[1px] h-8 bg-stroke mx-1"></div>
      {/* Static URL Prefix */}
      <span className="text-graphite text-md mx-1 select-none">
        https://instagram.com/
      </span>
      {/* Input Field */}
      <input
        type="text"
        placeholder={placeholder}
        className="flex-grow bg-transparent text-graphite outline-none transition placeholder:text-dark-grey ml-1"
        value={username}
        onChange={(e) => handleChange(e.target.value)}
        style={{ minWidth: 0 }}
      />
    </div>
    {/* Validation Error Message */}
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>

  );
}