//src/lib/useDebounce.ts 

import { useEffect, useState } from "react";

//  Prevent too many API calls (Instagram-style)
export const useDebounce = (value: string, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    console.log(" Debouncing:", value);

    const handler = setTimeout(() => {
      setDebounced(value);
      console.log(" Debounced value:", value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};