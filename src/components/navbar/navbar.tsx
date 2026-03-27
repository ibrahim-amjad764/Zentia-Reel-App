// "use client"

// import { useEffect, useState } from "react" // Purpose: manage dark mode & search state
// import Link from "next/link" // Purpose: client-side navigation
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input" // Purpose: search bar
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
// import { Plus, Moon, Sun } from "lucide-react" // Icons for actions
// import LogoutButton from "@/src/components/membership/logout-page-03/logout-form"
// import { FiSearch } from "react-icons/fi";
// import { KeyboardEvent } from "react";

// //navigation 
// export function Navbar() {

//     const [dark, setDark] = useState(false)

//     const toggleDarkMode = () => {
//         setDark((prev) => !prev) // flip state
//         document.documentElement.classList.toggle("dark")
//     }

//     interface SearchBarProps {
//         onSearch?: (query: string) => void; // optional parent handler
//     }

//     const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
//         const [query, setQuery] = useState<string>("");

//         const handleSearch = () => {
//             if (onSearch) onSearch(query); // call parent handler if provided
//             console.log("Searching for:", query); // demo
//         };

//         const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
//             if (e.key === "Enter") handleSearch();
//         };


//         const handleCreate = (type: "text" | "photo" | "video") => {
//             // yahan aap redirect ya modal open kar sakte ho
//             alert(`Create a ${type} post!`)
//         }

//         return (
//             <div className="sticky top-0 z-50 border-b bg-white dark:bg-gray-900">
//                 {/* Container */}
//                 <div className="mx-auto max-w-5xl flex items-center gap-4 px-4 py-2">

//                     {/* Left: App Logo */}
//                     <Link href="/" className="font-bold text-lg">
//                         MySocial
//                     </Link>

//                     {/* Center: Search posts */}
//                     <div className="flex-1 flex justify-center gap-1 transform transition-transform duration-200 ease-in-out hover:scale-110">
//                         <div className="relative w-full max-w-sm">
//                             {/* Clickable search icon on right */}
//                             <button
//                                 type="button"
//                                 onClick={handleSearch}
//                                 className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                             >
//                                 <FiSearch size={25} />
//                             </button>

//                             {/* Input field */}
//                             <input
//                                 type="text"
//                                 placeholder="Search posts..."
//                                 value={query}
//                                 onChange={(e) => setQuery(e.target.value)}
//                                 onKeyDown={handleKeyPress}
//                                 className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition "
//                             />
//                         </div>
//                     </div>

//                     {/* Add Post Button */}
//                     <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                     <Button variant="secondary" size="sm" className="gap-1 transform transition-transform duration-200 ease-in-out hover:scale-110">
//                         <Plus className="h-4 w-4  hover:bg-zinc-900 active:bg-gray-200  cursor-grab" />
//                         Post
//                     </Button>
//                     </DropdownMenuTrigger>

//                     <DropdownMenuContent align="start" className="w-36">
//                          <DropdownMenuItem onClick={() => handleCreate("text")}>
//                           Text
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => handleCreate("photo")}>
//                           Photo
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => handleCreate("video")}>
//                            Video
//                         </DropdownMenuItem>
//                         </DropdownMenuContent>
//                         </DropdownMenu>

//                     {/* Dark Mode Toggle */}
//                     <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={toggleDarkMode}
//                     >
//                         {dark ? <Sun size={18} /> : <Moon size={18} />}
//                     </Button>

//                     {/* User Menu */}
//                     <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                             <Avatar className="cursor-pointer">
//                                 <AvatarImage src="https://github.com/yyx990803.png" />
//                                 <AvatarFallback>Y</AvatarFallback>
//                             </Avatar>
//                         </DropdownMenuTrigger>

//                         <DropdownMenuContent align="end" className="w-40">
//                             <DropdownMenuItem asChild>
//                                 <Link href="/profile">Profile</Link>
//                             </DropdownMenuItem>

//                             <DropdownMenuItem asChild>
//                                 <LogoutButton />
//                             </DropdownMenuItem>
//                         </DropdownMenuContent>
//                     </DropdownMenu>
//                 </div>
//             </div>
//         )
//     }
//     return <SearchBar />
// }

"use client"

import { useState, KeyboardEvent } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Button } from "../../../components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu"
import LogoutButton from "@/components/membership/logout-page-03/logout-form"
import { Plus, Moon, Sun } from "lucide-react"
import { FiSearch } from "react-icons/fi"
import { CreatePostModal } from "@/components/posts/CreatePostModal"
import { NotificationBell } from "@/components/notifications/NotificationBell" // <-- Import here

export function Navbar() {
  const [dark, setDark] = useState(false)
  const [query, setQuery] = useState("")
  const [openPost, setOpenPost] = useState(false)

  const toggleDarkMode = () => {
    setDark(prev => !prev)
    document.documentElement.classList.toggle("dark")
  }

  const handleSearch = () => {
    console.log("Searching for:", query)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <div className="sticky top-0 z-50 border-b bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-5xl flex items-center gap-4 px-4 py-2">
        <Link href="/" className="font-bold text-lg">
          MySocial
        </Link>

        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-sm">
            <button
              type="button"
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiSearch size={18} />
            </button>

            <input
              type="text"
              placeholder="Search posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full pr-10 pl-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Add Post Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary" className="gap-1">
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

        {/* Dark Mode Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <NotificationBell />
       
<p>Bell test</p>  {/* Temporary, just to check rendering */}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
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