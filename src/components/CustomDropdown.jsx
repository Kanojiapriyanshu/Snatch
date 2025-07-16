"use client";

import { useState, useEffect, useRef } from "react";

const CustomDropdown = ({ options, placeholder, onSelect, selected }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
   // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false); // Use isOpen here
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);


  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleOptionClick = (option) => {
    onSelect(option); 
    setIsOpen(false); 
  };

  return (
    <div ref={ref} className="relative w-[369px]">
      {/* Display selected option or placeholder */}
      <div
       className={`rounded-lg border border-stroke bg-transparent py-[10px] px-5 cursor-pointer ${
        selected ? "text-graphite" : "text-gray-400"
      }`}
        onClick={toggleDropdown}
      >
        {selected || placeholder}
      </div>

      {isOpen && (
        <ul className="z-50 absolute mt-2 w-[369px] rounded-lg border border-stroke bg-[#E9E9E9] py-2 text-graphite">
          {options.map((option, index) => (
            <li
              key={index}
              className="px-5 py-2 text-graphite hover:text-electric-blue cursor-pointer"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;

