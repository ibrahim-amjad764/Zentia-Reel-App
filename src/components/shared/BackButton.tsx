"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
   <button
  onClick={() => router.back()}
  className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-2xl shadow hover:bg-cyan-900 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95">
  ← Back
</button>
  );
}