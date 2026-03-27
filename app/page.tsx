// "use client";

// import { useStore } from "../src/store/useStore";
// import clsx from "clsx";

// export default function Home() {
//   const darkMode = useStore((state) => state.dark);
//   const toggleDarkMode = useStore((state) => state.toggleDark);

//   return (
//     <main
//       className={clsx(
//         "flex min-h-screen items-center justify-center px-4",
//         darkMode
//           ? "dark bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-700"
//           : "bg-gray-50"
//       )}>
//       <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-zinc-500 bg-[#F5F2F2] dark:bg-[#233D4D] p-8 shadow-lg">
//         <h1 className="text-3xl  text-gray-600 font-extrabold text-center dark:text-gray-300">
//           Welcome to
//         </h1>
//         <h1 className="text-3xl text-zinc-900 font-extrabold text-center dark:text-white">
//           Next-JS-PostgreSQL
//         </h1>

//         <p className="mt-3 text-center text-gray-600 dark:text-gray-400">
//           <i>Build fast. Ship faster. Scale smarter.</i>
//         </p>

//         <div className="mt-8 flex flex-col gap-4 ">
//           <a href="/auth/login"
//             className="w-full text-center rounded-lg border border-gray-300 py-2 text-lime-800 dark:text-gray-100 hover:bg-lime-600  hover:text-white">
//             Go to sign-in
//           </a>

//           <a href="/feed"
//             className="w-full text-center rounded-lg border border-gray-300 dark:border-gray-400 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-600  hover:text-white">
//             Go to Dashboard
//           </a>

//           <button
//             onClick={toggleDarkMode} className="w-full text-lg text-blue-600 rounded-lg border  border-gray-300  hover:bg-blue-600 hover:text-white">Switch to {darkMode ? "Light" : "Dark"} Mode
//           </button>

//         </div>
//       </div>
//     </main>
//   );
// }

"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { useEffect } from "react"
import { useStore } from "../src/store/useStore"
import { motion } from "framer-motion"
import { Button } from "../components/ui/button"
import Image from "next/image";
import Link from "next/link"

export default function Home() {
  useEffect(() => {
    document.title = "Home | My Next JS App"
  }, [])

  const darkMode = useStore((state) => state.dark)
  const toggleDarkMode = useStore((state) => state.toggleDark)

  return (
    <>
      <main
        className={`relative flex min-h-screen items-center justify-center px-6 transition-all duration-500 ${darkMode
          ? "bg-linear-to-br from-gray-950 via-gray-900 to-gray-800"
          : "bg-linear-to-br from-slate-100 via-white to-slate-200"
          }`} >
        {/* Glow Background Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10">
          <Card className="w-full max-w-md backdrop-blur-xl bg-white/70 dark:bg-white/5 border border-white/15 shadow-3xl rounded-3xl">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="mx-auto w-18 h-18 rounded-2xl bg-linear-to-br from-[#458B73] to-[#09637E] flex items-center justify-center shadow-lg overflow-hidden relative">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-cover" />
              </div>
              <p className="text-3xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-[#458B73] to-[#09637E] italic tracking-wider animate-pulse "> Zentia: Share & Connect </p>

              <CardTitle className="text-3xl font-extrabold tracking-tight">
                Welcome to
                <span className="block bg-linear-to-r from-[#458B73] to-[#09637E] bg-clip-text text-transparent">
                  Next-JS-PostgreSQL
                </span>
              </CardTitle>

              <p className="text-sm text-muted-foreground italic">
                Build fast. Ship faster. Scale smarter.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <Link href="/auth/login">
                <Button className="w-full h-11 text-base shadow-md rounded-2xl border-gray-300">
                  Go to Sign-in
                </Button>
              </Link>

              <Link href="/feed">
                <Button variant="outline" className="w-full h-11 text-base mt-3 rounded-2xl border-gray-300">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>

            <CardFooter className="pt-4">
              <Button
                onClick={toggleDarkMode}
                variant="ghost"
                className="w-full text-sm rounded-2xl border-gray-300" >
                Switch to {darkMode ? "Light" : "Dark"} Mode
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </>
  )
}