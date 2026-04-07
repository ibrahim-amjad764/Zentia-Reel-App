// import { FiSearch } from "react-icons/fi";

// const SearchBar = ({
//   value,
//   onChange,
//   onSearch,
//   placeholder = "Search...",
// }) => {
//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       onSearch();
//     }
//   };

//   return (
//     <div className="flex-1 flex justify-center">
//       <div className="relative w-full max-w-sm">
//         <button
//           type="button"
//           onClick={onSearch}
//           className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-900 transition-all tracking-wide hover:brightness-125 duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-60">
//           <FiSearch size={25} />
//         </button>

//         <input
//           type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyPress}
//           className="w-full pr-10 pl-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
//       </div>
//     </div>
//   );
// };

// export default SearchBar;

import { FiSearch, FiMic } from "react-icons/fi";
import { useState, useRef } from "react";

const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = "Explore the universe...",
  onFocus = () => { },
  onBlur = () => { },
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // 🎤 Voice Search Logic
  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice search not supported in this browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;

      recognition.onstart = () => {
        console.log("[Voice] Listening...");
        setIsListening(true);
      };

      recognition.onend = () => {
        console.log("[Voice] Stopped");
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("[Voice] Result:", transcript);
        onChange(transcript);
        onSearch(transcript);
      };

      recognitionRef.current = recognition;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch(value);
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur(e);
  };

  return (
    <div className="flex-1 flex justify-center perspective-1000">
      <div
        className={`
    relative w-full max-w-xl transition-all duration-700 rounded-full 
    border-gray-300 dark:border-gray-600
    ${isFocused ? "scale-[1.02] -translate-y-1" : "scale-100"}
  `}
      >
        {/* 🎤 MIC BUTTON */}
        <button
          type="button"
          onClick={handleVoiceSearch}
          aria-label="Search by voice"
          className={`
            absolute right-5 top-1/2 -translate-y-1/2 z-20
            p-2 rounded-full transition-all
            ${isListening
              ? "bg-red-500 text-white animate-pulse"
              : "text-gray-500 hover:text-black dark:hover:text-white"}
          `}
        >
          <FiMic size={20} />
        </button>

        {/* 🔍 Search Button */}
        <button
          type="button"
          onClick={() => onSearch(value)}
          className="
            absolute left-2.5 top-1/2 -translate-y-1/2 
            p-3 rounded-full border border-gray-300 dark:border-gray-600
            text-gray-600 hover:text-gray-900 dark:hover:text-white
            z-20
          "
        >
          <FiSearch size={20} />
        </button>

        {/* INPUT */}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={` w-full pl-16 pr-16 py-4 rounded-2xl bg-white/70 dark:bg-black/40 backdrop-blur-3xl border-2
            text-[#222] dark:text-white placeholder-[#9E9E9E] dark:placeholder-gray-400 focus:outline-none transition-all duration-300 ${isFocused
              ? "border-white/30 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
              : "border-gray-300 dark:border-[#FF7E5F]/30 hover:border-gray-400 dark:hover:border-gray-400"}
`}
          {...props}
        />
      </div>
    </div>
  );
};

export default SearchBar;
