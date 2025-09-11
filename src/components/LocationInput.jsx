import React, { useState, useEffect } from "react";
import { useFormContext } from "@/app/onboarding/context";

const LocationInput = ({ value, onSelectLocation, consideration, ...props }) => {
  const { formData, updateFormData } = useFormContext?.() || {};
  const contextLocation = formData?.location || "";
  const [query, setQuery] = useState(contextLocation || value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  // Keep input synced with context
  useEffect(() => {
    if (contextLocation && contextLocation !== query) {
      setQuery(contextLocation);
    }
    // eslint-disable-next-line
  }, [contextLocation]);

  let borderColor = isFocused ? "border-electric-blue" : "border-gray-300";

  // Fetch suggestions
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length >= 2) {
        fetchLocations(query);
      } else {
        setSuggestions([]);
      }
    }, 50); // increased delay for fewer requests
    return () => clearTimeout(timeout);
  }, [query]);

  const fetchLocations = async (q) => {
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

      // Deduplicate by "city-country"
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
      const lowerQ = q.toLowerCase();

      // Prioritize results if query matches country
      results.sort((a, b) => {
        const aMatch =
          a.country.toLowerCase().includes(lowerQ) ||
          a.label.toLowerCase().includes(lowerQ);
        const bMatch =
          b.country.toLowerCase().includes(lowerQ) ||
          b.label.toLowerCase().includes(lowerQ);

        // put exact country matches above substring matches
        if (a.country.toLowerCase() === lowerQ && b.country.toLowerCase() !== lowerQ) {
          return -1;
        }
        if (b.country.toLowerCase() === lowerQ && a.country.toLowerCase() !== lowerQ) {
          return 1;
        }

        return bMatch - aMatch;
      });

      setSuggestions(results);
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
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setTimeout(() => {
            setIsFocused(false);

            // Auto-select first suggestion if available and no exact match chosen
            if (suggestions.length > 0 && query.trim() !== suggestions[0].label) {
              const first = suggestions[0];
              setQuery(first.label);
              if (updateFormData) updateFormData({ location: first.label });
              if (onSelectLocation) onSelectLocation(first);
            }
          }, 150);
        }}
        className={`w-full bg-transparent rounded-md border py-[10px] px-5 outline-none transition 
          ${borderColor} disabled:cursor-default disabled:bg-gray-2`}
        placeholder="Which city are you from? (e.g: Mumbai, India)"
        autoComplete="off"
      />

      {isFocused && suggestions.length > 0 && (
        <ul
          className="absolute z-10 mt-2 w-full bg-[#E9E9E9] border border-gray-300 rounded max-h-40 overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
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
