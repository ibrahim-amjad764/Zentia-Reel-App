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
      <div className="relative w-full max-w-sm">
        <button
          type="button"
          onClick={onSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-900 transition-all tracking-wide hover:brightness-125 duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-60">
          <FiSearch size={25} />
        </button>

        <input
          type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyPress}
          className="w-full pr-10 pl-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      </div>
    </div>
  );
};

export default SearchBar;