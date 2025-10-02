import React, { useState, useEffect, useRef } from "react";
import { useFormContext } from "@/app/onboarding/context";

const LocationInput = ({ value, onSelectLocation, ...props }) => {
  const { formData, updateFormData } = useFormContext?.() || {};
  const contextLocation = formData?.location || "";

  const [query, setQuery] = useState(contextLocation || value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  // Track whether value came from typing or autofill
  const userTypingRef = useRef(false);

  // Sync query with contextLocation whenever it changes
    useEffect(() => {
      if (!userTypingRef.current) {
        setQuery(contextLocation || "");
      }
    }, [contextLocation]);


  // When Chrome autofills: input has value, but userTypingRef = false
    useEffect(() => {
      if (query && !userTypingRef.current && query.length >= 2) {
        // Fetch suggestions and auto-select first if no exact match
        fetchLocations(query, true);
      }
    }, [query]);

  // Fetch suggestions normally when user types
  useEffect(() => {
    if (!userTypingRef.current) return; // skip autofill detection here

    const timeout = setTimeout(() => {
      if (query.length >= 2) {
        fetchLocations(query, false);
      } else {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  const fetchLocations = async (q, autofillCheck = false) => {
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=15`
      );
      const data = await res.json();

      const allowedTypes = [
        "city",
        "town",
        "village",
        "hamlet",
        "municipality",
        "locality",
      ];

      let filtered = data.features.filter(
        (f) => allowedTypes.includes(f.properties.osm_value) && f.properties.name
      );

      const uniqueMap = new Map();
      filtered.forEach((f) => {
        const city = f.properties.name;
        const country = f.properties.country;
        const key = `${city.toLowerCase()},${country.toLowerCase()}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, {
            id: f.properties.osm_id,
            city,
            country,
            label: `${city}, ${country}`,
          });
        }
      });

      let results = [...uniqueMap.values()];
      setSuggestions(results);

      if (autofillCheck && results.length > 0) {
        // Only auto-apply if autofill didn't exactly match any suggestion
        const exactMatch = results.some(
          (r) => r.label.toLowerCase() === q.trim().toLowerCase()
        );
        if (!exactMatch) {
          handleSelect(results[0]);
        }
      }
    } catch (err) {
      console.error("Location fetch failed:", err);
    }
  };

  const handleSelect = (loc) => {
    setQuery(loc.label);
    setSuggestions([]);
    if (updateFormData) updateFormData({ location: loc.label });
    if (onSelectLocation) onSelectLocation(loc);
  };

  return (
    <div className="w-full relative">
      <input
        {...props}
        value={query}
        onChange={(e) => {
          userTypingRef.current = true; // mark as manual typing
          setQuery(e.target.value);
        }}
        onFocus={() => {
          userTypingRef.current = false; // reset typing tracker
          setIsFocused(true);
        }}
        onBlur={() => {
          setTimeout(() => {
            setIsFocused(false);
            // For manual typing: if blurred & no exact match → auto-pick first
            if (userTypingRef.current && suggestions.length > 0) {
              const exactMatch = suggestions.some(
                (r) => r.label.toLowerCase() === query.trim().toLowerCase()
              );
              if (!exactMatch) {
                handleSelect(suggestions[0]);
              }
            }
          }, 150);
        }}
        className={`w-full bg-transparent rounded-md border py-[10px] px-5 outline-none transition ${
          isFocused ? "border-electric-blue" : "border-gray-300"
        } disabled:cursor-default disabled:bg-gray-2`}
        placeholder="Which city are you from? (e.g: Mumbai, India)"
        autoComplete="on" // let Chrome autofill
      />

      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full bg-[#E9E9E9] border border-gray-300 rounded max-h-40 overflow-y-auto">
          {suggestions.map((loc) => (
            <li
              key={loc.id}
              className="p-2 cursor-pointer hover:text-electric-blue"
              onMouseDown={() => handleSelect(loc)}
            >
              {loc.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationInput;
