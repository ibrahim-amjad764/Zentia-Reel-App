"use client"

import { useState, KeyboardEvent } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu"
import LogoutButton from "@/components/membership/logout-page-03/logout-form"
import { Plus, Moon, Sun } from "lucide-react"
import { FiSearch } from "react-icons/fi"
import { CreatePostModal } from "@/components/posts/CreatePostModal"
import { NotificationBell } from "@/components/notifications/NotificationBell" // <-- Import here
import { ModeToggleButton } from "../../../components/ui/mode-toggle"

export function Navbar() {
  const [query, setQuery] = useState("")
  const [openPost, setOpenPost] = useState(false)

  const handleSearch = () => {
    console.log("Searching for:", query)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-white/4 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl flex items-center gap-3 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-gradient text-lg">
          Zentia
        </Link>

        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-lg group">
            {/* Search Icon */}
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors duration-200 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400">
              <FiSearch size={20} />
            </span>
            
            {/* Search Input */}
            <Input
              type="text"
              placeholder="Search users, posts, or topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="
                pl-12 pr-14 py-3.5
                bg-gray-50/80 dark:bg-gray-800/80
                border border-gray-200 dark:border-gray-700
                rounded-full
                text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                focus:bg-white dark:focus:bg-gray-900
                transition-all duration-300 ease-out
                shadow-sm hover:shadow-md focus:shadow-lg
                backdrop-blur-sm
              "
            />
            
            {/* Search Button */}
            <button
              type="button"
              onClick={handleSearch}
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                inline-flex h-10 w-10 items-center justify-center
                rounded-full
                bg-gradient-to-r from-blue-500 to-blue-600
                hover:from-blue-600 hover:to-blue-700
                text-white
                shadow-md hover:shadow-lg
                transition-all duration-300 ease-out
                hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              "
              aria-label="Execute search"
            >
              <FiSearch size={18} className="stroke-2" />
            </button>
          </div>
        </div>

        {/* Add Post Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary" className="gap-1 rounded-full">
              <Plus className="h-4 w-4" />
              Post
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36">
            <DropdownMenuItem onClick={() => setOpenPost(true)}>
              Text / Photo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dedicated mode toggle (sole controller) */}
        <ModeToggleButton />

        <NotificationBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer ring-1 ring-white/10">
              <AvatarImage src="https://github.com/yyx990803.png" />
              <AvatarFallback>Y</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <LogoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Modal to create post */}
      <CreatePostModal open={openPost} onClose={() => setOpenPost(false)} />
    </div>
  )
}