// "use client";

// import { useState } from "react";
// import { signIn } from "@/src/services/auth.service";

// export default function SignInPage() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);

// //          //  FIX: guard BEFORE calling signIn
// //   if (!email.trim() || !password.trim()) {
// //     alert("Email and password are required");
// //     return; //  stop execution
// //   }

// //   setLoading(true);

//         try {
//             const user = await signIn(email, password);

//             console.log("Logged in user:", user);

//             // readable display name while f.name/l.name null in db
//             const name =
//                 user.firstName || user.lastName
//                     ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() // prefer real name
//                     : user.email
//                         .split("@")[0]  
//                         .replace(/\d+/g, ""); 

//             alert(`Welcome ${name}!`);
//         } catch (err: any) {
//             console.error("Login failed:", err.message);

//             alert(err.message);
//         } finally {
//             // Purpose: Reset loading state regardless of outcome
//             setLoading(false);
//         }

//     }

//     return (
//         // <main className="p-6 max-w mx-auto">
//          <main className="min-h-screen p-6 bg-[#EBF4DD] flex flex-col items-center justify-center">

//             <h1 className="text-3xl font-bold mt-20 text-center">Firebase Authentication</h1>
//             <div className="p-6 max-w-sm mx-auto my-12 bg-[#F9F8F6] rounded-2xl shadow-2xl">
//                 <h2 className="text-2xl mb-6 font-bold text-center text-gray-900 italic">Sign In</h2>

//                 <input
//                     placeholder="Enter your Email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="border border-gray-300 hover:border-gray-600 p-3 w-full mb-4  rounded-2xl  hover:bg-gray-300 " />

//                 <input
//                     placeholder="••••••"
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="border p-2 w-full mb-4  border-gray-300 hover:border-gray-600 rounded-2xl hover:bg-gray-300" />

//                 <button onClick={handleSubmit} className="bg-cyan-600 hover:bg-cyan-800 text-white px-4 py-2 rounded-2xl w-full font-semibold">
//                     Login
//                 </button>
//                 <button className="w-full text-center text-blue-500 hover:underline py-5">
//                     Forgotten password?
//                 </button>

//                 <a
//                     href="/sign-up"
//                     className="block bg-[#2e5a3b] hover:bg-[#10481e] text-white px-4 py-2 rounded-2xl w-full font-semibold text-center">
//                     Signup
//                 </a>

//             </div>

//             <div className="flex justify-center">
//                 <a href="/dashboard"
//                     className="text-center rounded-lg border border-gray-300 py-2 px-6 bg-blue-500 text-white hover:bg-blue-600">
//                     Back
//                 </a>
//             </div>
//         </main>
//     );
// }


import LoginPage from "../../../src/components/membership//login-page-02/login-form";

export default function Page() {
  return <LoginPage />; 
}