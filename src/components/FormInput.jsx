import React, { useState } from 'react';

const FormInput = ({ consideration, value, onChange, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value && value.trim().length > 0;

  const isMissingInfo = consideration && !isFilled;
  const hasClarification = consideration && isFilled;

  let borderColor = 'border-gray-300';
  let considerationTextColor = '';

  if (isMissingInfo) {
    borderColor = 'border-red-500';
    considerationTextColor = 'text-red-500';
  } else if (hasClarification) {
    borderColor = isFocused ? 'border-electric-blue' : 'border-yellow-400'; // 👈 Yellow if not focused, blue if focused
    considerationTextColor = 'text-yellow-500';
  } else {
    borderColor = isFocused ? 'border-electric-blue' : 'border-gray-300';
  }

  const handleChange = (e) => {
    const inputValue = e.target.value;
    let capitalizedValue = inputValue;
    
    // Capitalize first letter if there's text
    if (inputValue.length > 0) {
      capitalizedValue = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
    }
    
    // Call the original onChange if it exists
    if (onChange) {
      e.target.value = capitalizedValue;
      onChange(e);
    }
  };

  return (
    <div className="w-full">
      <input
        {...props}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full bg-transparent rounded-md border py-[10px] px-5 outline-none transition 
          ${borderColor}
          disabled:cursor-default disabled:bg-gray-2`}
      />
      {consideration && (
        <p className={`mt-1 text-sm ${considerationTextColor}`}>
          {consideration}
        </p>
      )}
    </div>
  );
};

export default FormInput;
