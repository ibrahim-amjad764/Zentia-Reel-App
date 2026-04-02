//SearchSuggestion.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface UserType {
  id: string | number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface SearchSuggestionsProps {
  users: UserType[];
  loading: boolean;
  query: string;
  onClose?: () => void;
}

const highlightText = (text: string, query: string) => {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="text-blue-500 font-semibold">
        {part}
      </span>
    ) : (
      part
    )
  );
};

const SearchSuggestions = ({ users, loading, query, onClose }: SearchSuggestionsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [recent, setRecent] = useState<UserType[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) setRecent(JSON.parse(stored));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        console.log("[Search] Clicked outside - closing suggestions");
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close dropdown on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        console.log("[Search] ESC pressed - closing suggestions");
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const displayList = query ? users : recent;

  return (
    <div
      ref={containerRef}
      className="
        absolute top-full left-0 right-0
        mt-2
        w-full
        max-w-xs
        sm:max-w-md
        md:max-w-lg
        lg:max-w-xl
        left-1/2 -translate-x-1/2
        sm:left-auto sm:translate-x-0
        z-[9999]
        rounded-2xl
        bg-white dark:bg-gray-900
        shadow-2xl
        border border-gray-200 dark:border-gray-700
        overflow-hidden
        animate-in fade-in slide-in-from-top-2 duration-200
        max-h-[70vh]
        sm:max-h-[75vh]
        md:max-h-[80vh]
      "
    >
      {/* Sticky Header */}
      <div className="sticky top-0 flex items-center justify-between bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700 z-10">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {query ? "Users" : "Recent Searches"}
        </span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close search suggestions"
            className="
              flex items-center justify-center
              w-8 h-8
              rounded-full
              bg-gray-200 dark:bg-gray-800
              text-gray-800 dark:text-white
              border border-gray-300 dark:border-gray-600
              hover:bg-gray-300 dark:hover:bg-gray-700
              transition-all duration-200
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            ✕
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Searching...
        </div>
      )}

      {/* Empty state */}
      {!loading && (!displayList || displayList.length === 0) && (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No results found
        </div>
      )}

      {/* User list */}
      <div
        className="
          overflow-y-auto
          max-h-[calc(70vh-56px)]
          sm:max-h-[calc(75vh-56px)]
          md:max-h-[calc(80vh-56px)]
          scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
          dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800
        "
      >
        {displayList.map((user: UserType) => {
          const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

          return (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="
                flex items-center gap-3
                px-4 py-3
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition-all duration-150
                focus:outline-none focus:bg-gray-200 dark:focus:bg-gray-700
                rounded-md
                cursor-pointer
              "
            >
              {/* Avatar */}
              <div
                className="
                  w-10 h-10 rounded-full
                  bg-gradient-to-br from-blue-500 to-indigo-500
                  flex items-center justify-center
                  text-white font-semibold text-sm
                  select-none
                "
              >
                {user.username?.[0]?.toUpperCase() || "U"}
              </div>

              {/* Info */}
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {highlightText(fullName || user.username, query)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {highlightText(user.email, query)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SearchSuggestions;