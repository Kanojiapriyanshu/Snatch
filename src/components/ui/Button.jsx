import React from "react";
import { cn } from "@/lib/utils";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className,
  ...props
}) {
  const baseStyles =
    "rounded-md font-apfel-grotezk-mittel transition-colors duration-200 flex items-center justify-center disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variants = {
    primary: cn(
      "text-white",
      "bg-blue-shade-600",
      "hover:bg-blue-shade-700",
      "active:bg-blue-shade-800",
      "disabled:bg-blue-shade-400"
    ),
    secondary: cn(
      "border border-graphite-shade-600 text-graphite-shade-600",
      "hover:border-blue-shade-700 hover:text-blue-shade-700",
      "active:border-blue-shade-800 active:text-blue-shade-800",
      "disabled:border-blue-shade-400 disabled:text-blue-shade-400"
    ),
    hyperlink: cn(
      "bg-transparent text-blue-shade-600 underline underline-offset-2",
      "hover:text-blue-shade-700",
      "active:text-blue-shade-800",
      "disabled:text-blue-shade-400"
    ),
    success: cn(
      "text-white bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-green-400"
    ),
    yellowPrimary: cn(
      "text-graphite-shade-600 bg-yellow-shade-600",
      "hover:bg-yellow-shade-500",
      "active:bg-yellow-shade-400"
    )
  };

  return (
    <button
      className={cn(baseStyles, sizes[size], variants[variant], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
