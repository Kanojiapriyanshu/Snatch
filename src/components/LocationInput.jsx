import React, { useState, useEffect } from 'react';
import { useFormContext } from '@/app/onboarding/context';

const LocationInput = ({ value, onSelectLocation, consideration, ...props }) => {
  const { formData, updateFormData } = useFormContext?.() || {};
  // Use context value if available, fallback to prop
  const contextLocation = formData?.location || '';
  const [query, setQuery] = useState(contextLocation || value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  // Keep input in sync with context (for refresh/persist)
  useEffect(() => {
    if (contextLocation && contextLocation !== query) {
      setQuery(contextLocation);
    }
    // eslint-disable-next-line
  }, [contextLocation]);

  let borderColor = isFocused ? 'border-electric-blue' : 'border-gray-300';

  // Fetch suggestions from Photon
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length >= 2) {
        fetchLocations(query);
      } else {
        setSuggestions([]);
      }
    }, 20);
    return () => clearTimeout(timeout);
  }, [query]);

const fetchLocations = async (q) => {
  try {
    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=15`);
    const data = await res.json();

    // Only consider features that are of type "city" or "town"
    const filtered = data.features.filter((f) =>
      ['city', 'town'].includes(f.properties.osm_value) && f.properties.name
    );

    // Deduplicate using "city-country" key
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

    setSuggestions([...uniqueMap.values()]);
  } catch (err) {
    console.error('Location fetch failed:', err);
  }
};



  const handleSelect = (loc) => {
    setQuery(loc.label);
    setSuggestions([]);
    // Save to context and DB
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
        onBlur={() => setTimeout(() => setIsFocused(false), 150)} // delay to allow click
        className={`w-full bg-transparent rounded-md border py-[10px] px-5 outline-none transition 
          ${borderColor} disabled:cursor-default disabled:bg-gray-2`}
        placeholder="Start typing city or country..."
        autoComplete="off"
      />

        {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full bg-[#E9E9E9] border border-gray-300 rounded max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {suggestions.map((loc) => (
            <li
                key={loc.id}
                className="p-2 cursor-pointer hover:text-electric-blue"
                onMouseDown={() => handleSelect(loc)} // use onMouseDown to prevent blur before select
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