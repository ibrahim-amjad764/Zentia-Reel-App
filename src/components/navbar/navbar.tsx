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
          <div className="relative w-full max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/90">
              <FiSearch size={18} />
            </span>
            <Input
              type="text"
              placeholder="Search posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10 pr-12 rounded-full"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              aria-label="Search"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/6 border border-white/10 backdrop-blur-xl transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:bg-white/10 hover:border-white/16 hover:shadow-neon active:scale-[0.97]">
                <FiSearch size={18} />
              </span>
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