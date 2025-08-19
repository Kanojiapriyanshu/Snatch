'use client';

import React from 'react';

const Accordion = ({ title, children, isOpen, onToggle }) => {
  return (
    <div
      className={`rounded-xl overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'bg-[#F9FBFF] shadow-lg' : 'bg-white shadow-sm'
      }`}
      style={{ 
        border: isOpen ? 'none' : '1px solid #E5E7EB',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex justify-between items-center transition-colors hover:bg-gray-50/50"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex flex-col">
          <span className="font-medium text-lg text-graphite font-qimano leading-tight">
            {title}
          </span>
        </div>
         
        <span className="text-4xl font-normal text-electric-blue ml-4 flex-shrink-0">
          {isOpen ? '−' : '+'}
        </span>
      </button>
       
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-1 pb-4 px-6">{isOpen && children}</div>
      </div>
    </div>
  );
};

export default Accordion;