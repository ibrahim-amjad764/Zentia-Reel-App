//src/components/notifications/SearchSuggestions.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
}

const highlightText = (text: string, query: string) => {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="bg-blue-100 text-black px-1 rounded">
        {part}
      </span>
    ) : (
      part
    )
  );
};

const SearchSuggestions = ({ users, loading, query }: SearchSuggestionsProps) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [recent, setRecent] = useState<UserType[]>([]);

  //  Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) setRecent(JSON.parse(stored));
  }, []);

  //  Save recent search
  const saveRecent = (user: UserType) => {
    const updated = [user, ...recent.filter((u) => u.id !== user.id)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  //  Keyboard navigation
  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const list = query ? users : recent;
    if (!list.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % list.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + list.length) % list.length);
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      const selected = list[activeIndex];
      saveRecent(selected);
      window.location.href = `/profile/${selected.id}`;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);

// Use JSON.stringify(users/recent) to track content changes
}, [activeIndex, query, JSON.stringify(users), JSON.stringify(recent)]);

  //  Loading UI
  if (loading) {
    return (
      <div className="absolute w-full mt-2 rounded-xl bg-white/90 backdrop-blur-md shadow-xl z-50 p-4 space-y-3">
        <p className="text-xs text-gray-400 text-center">Searching users...</p>
      </div>
    );
  }

  //  Show users if query exists, otherwise show recent
  const displayList = query ? users : recent;

  if (!displayList || displayList.length === 0) {
    return (
      <div className="absolute w-full mt-2 rounded-xl bg-white shadow-xl z-50 p-6 text-center">
        <p className="text-gray-600 font-medium">
          {query ? "No users found" : "No recent searches yet"}
        </p>
        {!query && (
          <p className="text-xs text-gray-400 mt-1">
            Start searching to see recent users here
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="absolute w-full mt-2 rounded-xl bg-white shadow-2xl z-50 overflow-hidden border">
      {/*  Header */}
      <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b bg-gray-50">
        {query ? "Users" : "Recent Searches"}
      </div>

      {/*  List */}
      {displayList.map((user: UserType, index) => {
        const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
        const isActive = index === activeIndex;

        return (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            onClick={() => saveRecent(user)}
            className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
              isActive ? "bg-blue-100" : "hover:bg-gray-100"
            }`}>
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              {user.username?.[0]?.toUpperCase() || "U"}
            </div>

            {/* User info */}
            <div className="flex flex-col overflow-hidden">
              <p className="font-medium text-sm truncate">
                {highlightText(fullName || user.username, query)}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {highlightText(user.email, query)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SearchSuggestions;