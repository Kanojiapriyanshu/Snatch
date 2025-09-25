import { useState, useEffect } from "react";

function useFontSize(min, max, minWidth = 1100, maxWidth = 1920, initial = min) {
  // Start with the initial value passed from SSR (instead of always min)
  const [fontSize, setFontSize] = useState(initial);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      // normalize between 0 and 1
      const scale = Math.min(
        Math.max((width - minWidth) / (maxWidth - minWidth), 0),
        1
      );
      // interpolate font size
      setFontSize(min + (max - min) * scale);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [min, max, minWidth, maxWidth]);

  return fontSize;
}

export default useFontSize;
