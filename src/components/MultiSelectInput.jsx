"use client";

import { useState, useEffect, useRef } from "react";

const MultiSelectInput = ({ label, data, selectedValues, onAddValue, onRemoveValue }) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value) {
      const filteredSuggestions = data.filter((item) =>
        item.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions.slice(0, 5)); // Limit to 5 suggestions
    } else {
      setSuggestions([]);
    }
  };

  const handleAddChip = (value) => {
  let newValue = value !== undefined ? value : inputValue.trim();
  // If user pressed Enter and input matches a suggestion, use the suggestion
  if (!value && suggestions.length > 0) {
    newValue = suggestions[0];
  }
  if (newValue && !selectedValues.includes(newValue)) {
    onAddValue(newValue);
    setInputValue("");
    setSuggestions([]);
  }
};

  const handleRemoveChip = (e,value) => {
    e.stopPropagation(); // Prevent 
    console.log("Removing value:", value); // Debugging line
    onRemoveValue(value);
  };

  const handleKeyDown = (event) => {
  if (event.key === "Enter" || event.key === ",") {
    event.preventDefault();
    handleAddChip();
  }
};

  return (
    <div ref={ref} className="multi-select-input text-black">
      <label className="block mb-2 font-apfel-grotezk-regular">{label}</label>
      <div className="flex flex-wrap gap-2 p-2 rounded-md border border-gray-300 focus-within:border-electric-blue">
        {selectedValues.map((value, index) => (
          <div
            key={index}
            className="flex items-center px-3 py-1 text-sm text-graphite bg-[#0037EB] bg-opacity-10 rounded-md "
          >
            <span>{value}</span>
            <button
              type="button"
              className="ml-2 text-xs text-gray-500 hover:text-red-500"
              onClick={(e) => handleRemoveChip(e,value)}
            >
              ✕
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          className="flex-1 p-1 focus:outline-none bg-transparent text-graphite"
          placeholder="Type and press Enter"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)} // <-- Add this line
        />
      </div>
      {/* Dropdown suggestions */}
      {open && suggestions.length > 0 && ( // <-- Change here
        <ul className="border border-gray-300 bg-[#E9E9E9] rounded mt-2 max-h-40 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="p-2 cursor-pointer hover:text-electric-blue"
              onClick={() => handleAddChip(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MultiSelectInput;
