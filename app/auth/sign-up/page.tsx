// "use client";

// import { useState } from "react";
// import { signUp } from "@/src/services/auth.service";
// import { useRouter } from "next/navigation";

// interface FormData {
//     firstName: string;
//     lastName: string;
//     email: string;
//     password: string;
//     confirmPassword: string;
// }
// export default function signUpPage() {
//     const router = useRouter();




//     const [formData, setFormData] = useState<FormData>({
//         firstName: "",
//         lastName: "",
//         email: "",
//         password: "",
//         confirmPassword: "",
//     })

//     // PURPOSE:
//     // Compute display name from signup form data (no DB, no auth context yet)
//     const displayName =
//         formData.firstName || formData.lastName
//             ? `${formData.firstName} ${formData.lastName}`.trim()
//             : formData.email.split("@")[0]; // fallback to email username

//     const [errors, seterrors] = useState<Partial<FormData>>({});

//     //validation of  typing
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//         seterrors({ ...errors, [e.target.name]: "" });
//     }

//     //validation of correct typing
//     const validate = (): Partial<FormData> => {
//         const newErrors: Partial<FormData> = {};
//         const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//         if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
//         if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
//         if (!emailPattern.test(formData.email)) newErrors.email = "Enter a valid email";
//         if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
//         if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Password do not match";

//         return newErrors;
//     }

//     const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         const validationErrors = validate();
//         if (Object.keys(validationErrors).length > 0) {
//             seterrors(validationErrors)
//         } signUp(formData.email, formData.password)
//             .then(() => {
//                 alert("Signup successful — now sign in");
//                 router.push("/sign-in");
//             })


//         setFormData({
//             firstName: "",
//             lastName: "",
//             email: "",
//             password: "",
//             confirmPassword: "",
//         })
//     }

//     return (
//         // <main className="p-6 max-w-2xl mx-auto ">
//         <main className="min-h-screen p-6 bg-[#EBF4DD] flex flex-col items-center justify-center">

//             <h1 className="text-4xl font-bold text-center text-gray-800">Firebase Authentication</h1>
//             {/* <div className="p-6 max-w-sm mx-auto mt-12 bg-teal-50 rounded-2xl shadow-2xl"> */}
//             <div className="w-full max-w-sm bg-[#F9F8F6] rounded-2xl p-6 shadow-2xl">
//                 <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center italic">Sign Up</h2>

//                 <form onSubmit={handleSubmit} >
//                     <div className="mb-4">
//                         <input type="text" name="firstName" placeholder="Enter your FirstName" value={formData.firstName} onChange={handleChange}
//                             className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:border-gray-400 transition" />
//                         {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
//                     </div>

//                     <div className="mb-4">
//                         <input type="text" name="lastName" placeholder="Enter your LastName" value={formData.lastName} onChange={handleChange}
//                             className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:border-gray-400 transition" />
//                         {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
//                     </div>

//                     <div className="mb-4">
//                         <input type="email" name="email" placeholder="Enter your Email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:border-gray-400 transition" />
//                         {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//                     </div>

//                     <div className="mb-4">
//                         <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange}
//                             className="w-full p-3 rounded-lg border border-gray-300 hover:border-gray-400" />
//                         {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
//                     </div>

//                     <div className="mb-4">
//                         <input type="Password" name="confirmPassword" placeholder="Enter confirm password" value={formData.confirmPassword} onChange={handleChange}
//                             className="w-full p-3 rounded-lg border border-gray-300 hover:border-gray-400" />
//                         {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
//                     </div>

//                     <button type="submit"
//                         className="w-full p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition shadow-md">
//                         Create Account
//                     </button>

//                 </form>
//                 <hr className="my-5 border-gray-300" />
//                 <a href="/auth/login" className="block w-full py-3 rounded-lg bg-lime-600 hover:bg-emerald-700 text-white font-semibold transition shadow-md text-center">Sign In</a>
//             </div>

//             <div className="flex justify-center">
//                 <a href="/dashboard" className="mt-8 rounded-lg border border-gray-300 py-2 px-6 bg-blue-500 text-white hover:bg-blue-600">
//                     Back
//                 </a>
//             </div>
//         </main>
//     )
// bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-700}


import { SignupForm } from "../../../src/components/membership/signup-page-01/signup-form"

export default function Page() {
  return (
    <div >
      <SignupForm />
    </div>
  )
}