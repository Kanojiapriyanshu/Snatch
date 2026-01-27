"use client";
import React, { useRef } from "react";

export default function Otp({ otp, setOtp, onKeyDown }) {
  const inputRefs = useRef([]);

    const handleKeyDown = async (e) => {
    // ✅ Intercept Ctrl+V or Cmd+V (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
      e.preventDefault();
      try {
        const text = await navigator.clipboard.readText(); // use async clipboard API
        if (/^\d{6}$/.test(text.trim())) {
          const digits = text.trim().split("");
          setOtp(digits);

          // focus the last box after paste
          if (inputRefs.current[otp.length - 1]) {
            inputRefs.current[otp.length - 1].focus();
          }
        }
      } catch (err) {
        console.error("Clipboard read failed:", err);
      }
      return;
    }

    // ✅ Block non-numeric
    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab"
    ) {
      e.preventDefault();
    }

    // ✅ Handle backspace/delete
    if (e.key === "Delete" || e.key === "Backspace") {
      const index = inputRefs.current.indexOf(e.target);
      if (index > 0) {
        setOtp((prevOtp) => [
          ...prevOtp.slice(0, index - 1),
          "",
          ...prevOtp.slice(index),
        ]);
        inputRefs.current[index - 1].focus();
      }
    }

    // ✅ Allow parent Enter handling
    if (e.key === "Enter") {
      onKeyDown(e);
    }
  };

  const handleInput = (e) => {
    const { target } = e;
    const index = inputRefs.current.indexOf(target);
    if (target.value) {
      setOtp((prevOtp) => [
        ...prevOtp.slice(0, index),
        target.value,
        ...prevOtp.slice(index + 1),
      ]);
      if (index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  // ✅ Handles both mouse paste and Ctrl+V paste
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(text)) return; // only allow exactly 6 digits

    const digits = text.split("");
    setOtp(digits);

    // focus the last box after paste
    if (inputRefs.current[otp.length - 1]) {
      inputRefs.current[otp.length - 1].focus();
    }
  };

  return (
    <section className="py-1">
      <div className="container">
        <form id="otp-form" className="flex gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onPaste={handlePaste}
              ref={(el) => (inputRefs.current[index] = el)}
              className="shadow-xs flex w-[54px] h-[64px] items-center justify-center rounded-md border border-gray-300 text-center text-2xl font-medium text-electric-blue outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue sm:text-4xl bg-smoke"
            />
          ))}
        </form>
      </div>
    </section>
  );
}