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

import { FiSearch } from "react-icons/fi";

const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
}) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex-1 flex justify-center">
      <div className="relative w-full max-w-md">

        {/* 🔍 Search Button */}
        <button
          type="button"
          onClick={onSearch}
          className="
            absolute right-2 top-1/2 -translate-y-1/2 
            p-2 rounded-full
            bg-gray-200/70 dark:bg-gray-700/60
            text-gray-600 dark:text-gray-300
            hover:bg-slate-900 hover:text-white
            dark:hover:bg-white dark:hover:text-black
            transition-all duration-300 ease-in-out
            shadow-sm hover:shadow-md
            active:scale-95
            backdrop-blur-md
          "
        >
          <FiSearch size={18} />
        </button>

        {/* ✨ Input */}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          className="
            w-full pl-5 pr-12 py-3
            rounded-full
            
            bg-white/70 dark:bg-gray-800/70
            backdrop-blur-md
            
            border border-gray-200 dark:border-gray-700
            
            text-gray-800 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            
            shadow-sm hover:shadow-md
            
            focus:outline-none
            focus:ring-2 focus:ring-blue-500/60
            focus:border-transparent
            
            transition-all duration-300 ease-in-out
          "
        />
      </div>
    </div>
  );
};

export default SearchBar;

