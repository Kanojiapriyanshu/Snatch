import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";

export default function DatePicker4({
  value,
  onChange,
  placeholder,
  className,
  variant,
  width,
  format = "dd/mm/yyyy", 
  displayFormat = "numeric",
  onboarding
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const datepickerRef = useRef(null);

  const formatDate = (dateObj) => {
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yyyy = dateObj.getFullYear();

  if (format === "mm/yyyy") {
    if (displayFormat === "text") {
      const monthName = dateObj.toLocaleString("default", { month: "long" });
      return `${monthName}, ${yyyy}`; // 👉 July, 1993
    }
    return `${mm}/${yyyy}`; // 👉 07/1993
  }
  return `${dd}/${mm}/${yyyy}`;
};


  const parseDate = (str) => {
    const parts = str.split("/");
    if (format === "mm/yyyy" && parts.length === 2) {
      const [mm, yyyy] = parts.map(Number);
      if (!mm || !yyyy) return null;
      const date = new Date(yyyy, mm - 1, 1);
      return isNaN(date.getTime()) ? null : date;
    }
    const [dd, mm, yyyy] = parts.map(Number);
    if (!dd || !mm || !yyyy) return null;
    const date = new Date(yyyy, mm - 1, dd);
    return isNaN(date.getTime()) ? null : date;
  };

  const toggleDatepicker = () => setIsOpen(!isOpen);

  const handleCancel = () => {
    setSelectedDate(null);
    onChange("");
    setIsOpen(false);
  };

  const handleDocumentClick = (e) => {
    if (datepickerRef.current && !datepickerRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  const handleInputChange = (e) => {
    let typed = e.target.value.replace(/\D/g, "");

    if (format === "mm/yyyy") {
      if (typed.length > 2) typed = typed.slice(0, 2) + "/" + typed.slice(2, 6);
    } else {
      if (typed.length > 2 && typed.length <= 4) {
        typed = typed.slice(0, 2) + "/" + typed.slice(2);
      } else if (typed.length > 4) {
        typed =
          typed.slice(0, 2) +
          "/" +
          typed.slice(2, 4) +
          "/" +
          typed.slice(4, 8);
      }
    }

    onChange(typed);
    const parsed = parseDate(typed);
    if (parsed) {
      setSelectedDate(formatDate(parsed));
      setCurrentDate(parsed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleDayClick = (day) => {
    if (format === "mm/yyyy") return;
    const formatted = formatDate(day);
    setSelectedDate(formatted);
    onChange(formatted);
    setIsOpen(false);
  };

  // 🧠 Auto-close when both month & year selected
  const handleMonthChange = (month) => {
    const newDate = new Date(currentDate.getFullYear(), Number(month));
    setCurrentDate(newDate);
    if (format === "mm/yyyy") {
      const formatted = formatDate(newDate);
      setSelectedDate(formatted);
      onChange(formatted);
      setIsOpen(false);
    }
  };

  const handleYearChange = (year) => {
    const newDate = new Date(Number(year), currentDate.getMonth());
    setCurrentDate(newDate);
    if (format === "mm/yyyy") {
      const formatted = formatDate(newDate);
      setSelectedDate(formatted);
      onChange(formatted);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  // 🗓️ Calendar grid
  const renderCalendar = () => {
    if (format === "mm/yyyy") return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = [];

    for (let i = 0; i < firstDayOfMonth; i++) daysArray.push(<div key={`empty-${i}`}></div>);

    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      const dayString = formatDate(day);
      let classes =
        "flex items-center justify-center cursor-pointer w-[40px] 2xl:w-[35px] h-[46px] rounded-full text-dark-3 hover:bg-primary hover:text-white";
      if (selectedDate === dayString) classes += " bg-primary text-white";

      daysArray.push(
        <div key={i} className={classes} onClick={() => handleDayClick(day)}>
          {i}
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-2">{daysArray}</div>;
  };

  return (
    <section
      className={clsx(
        "relative rounded",
        variant === "white" ? "bg-white" : "bg-transparent",
        width === "full" ? "w-full" : "w-1/2",
        className
      )}
    >
      <div className="relative" ref={datepickerRef}>
        <div className="relative flex items-center">
          <span onClick={toggleDatepicker} className="absolute left-0 pl-5 text-dark-5 cursor-pointer">
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.5 3.3125H15.8125V2.625C15.8125 2.25 15.5 1.90625 15.0937 1.90625C14.6875 1.90625 14.375 2.21875 14.375 2.625V3.28125H5.59375V2.625C5.59375 2.25 5.28125 1.90625 4.875 1.90625C4.46875 1.90625 4.15625 2.21875 4.15625 2.625V3.28125H2.5C1.4375 3.28125 0.53125 4.15625 0.53125 5.25V16.125C0.53125 17.1875 1.40625 18.0937 2.5 18.0937H17.5C18.5625 18.0937 19.4687 17.2187 19.4687 16.125V5.25C19.4687 4.1875 18.5625 3.3125 17.5 3.3125ZM17.5 16.6562H2.5C2.1875 16.6562 1.9375 16.4062 1.9375 16.0937V8.71875H18.0312V16.125C18.0625 16.4375 17.8125 16.6562 17.5 16.6562Z" />
            </svg>
          </span>
          <input
            type="text"
            className={clsx(
              "w-full pl-[55px] pr-4 py-2.5 border rounded focus:outline-none border-gray-300",
              variant === "white" ? "bg-white" : "bg-transparent"
            )}
            placeholder={placeholder || (format === "mm/yyyy" ? "MM/YYYY" : "DD/MM/YYYY")}
            value={selectedDate || value}
            onChange={handleInputChange}
            onClick={toggleDatepicker}
            onKeyDown={handleKeyDown}
          />
        </div>

        {isOpen && (
          <div
            className={clsx(
              "absolute top-[100%] mt-2 px-8 py-2 border rounded shadow-md z-20 w-56 2xl:w-full",
              variant === "white" ? "bg-white" : "bg-white"
            )}
          >
        <div
          className={`flex items-center mb-4 ${
            onboarding == false ? "justify-start gap-3" : "justify-between"
          }`}
        >
          {/* YEAR SELECT with custom SVG */}
          <div className="relative inline-block">
            <select
              value={currentDate.getFullYear()}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-20 2xl:w-36 appearance-none px-2 2xl:px-4 py-2 border rounded pr-8 cursor-pointer"
            >
              {Array.from({ length: 2012 - 1926 + 1 }, (_, i) => 2012 - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* custom arrow icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* MONTH SELECT with custom SVG */}
          <div className="relative inline-block">
            <select
              value={currentDate.getMonth()}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="w-20 2xl:w-36 appearance-none px-2 2xl:px-4 py-2 border rounded pr-8 cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                </option>
              ))}
            </select>

            {/* custom arrow icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>


            {format !== "mm/yyyy" && renderCalendar()}

            {format !== "mm/yyyy" && (
              <div className="mt-4 flex justify-between">
                <button
                  className="px-4 py-2 bg-gray-300 text-dark-3 rounded"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
