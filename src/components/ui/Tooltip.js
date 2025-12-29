"use client";
import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

const Tooltip = ({
  body,
  children,
  placement = "top",
  offset = 6, // 👈 NEW
}) => {
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const lines = body
    .split(".")
    .map(l => l.trim())
    .filter(Boolean);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    let top = 0;
    let left = rect.left + rect.width / 2;

    if (placement === "top") {
      top = rect.top - offset;
    } else if (placement === "bottom") {
      top = rect.bottom + offset;
    }

    setPos({ top, left });
  }, [open, placement, offset]);

  return (
    <>
      {/* Trigger */}
      <span
        ref={triggerRef}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex"
      >
        {children}
      </span>

      {/* Tooltip */}
      {open &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform:
                placement === "top"
                  ? "translate(-50%, -100%)"
                  : "translate(-50%, 0)",
              zIndex: 999999,
            }}
            className="pointer-events-none"
          >
            <div className="w-[280px] p-2 bg-[#F2F2F2] text-graphite rounded-md shadow-xl font-apfel-grotezk-regular">
              <div className="text-sm ">
                {lines.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
