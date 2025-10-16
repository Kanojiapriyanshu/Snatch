"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

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
    <div ref={ref} className="relative w-1/2">
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
        <ul className="absolute mt-2 w-full rounded-lg border border-stroke bg-[#E9E9E9] py-2 text-graphite z-50">
          {options.map((option, index) => (
            <>
              <li
                key={option}
                className="px-5 py-2 text-graphite hover:text-electric-blue cursor-pointer flex items-center justify-between"
                onClick={() => handleOptionClick(option)}
              >
                <span className={selected === option ? "text-electric-blue" : ""}>{option}</span>
                {selected === option && (
                  <Image src="/assets/images/Hand_state.svg" alt="Selected" width={30} height={30} />
                )}
              </li>
              {index !== options.length - 1 && (
                <div className="border-t border-gray-300 mx-5" />
              )}
            </>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
