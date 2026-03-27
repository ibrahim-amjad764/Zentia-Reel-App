// <div className='relative min-h-screen flex items-center justify-center bg-black text-white'>
//   <AuthBackgroundShape className='absolute opacity-20' /> {/* subtle background shape */}

//   <Card className='z-10 w-full max-w-md bg-gray-900 text-white shadow-2xl'>
//     <CardHeader>
//       <Logo className="w-12 h-12 mb-8" />
//       <div>
//         <CardTitle className='mb-1.5 text-2xl'>Sign in to Firebase Authentication</CardTitle>
//         <CardDescription className='text-gray-400 text-base'>Ship Faster and Focus on Growth.</CardDescription>
//       </div>
//     </CardHeader>

//     <CardContent>
//       <LoginForm />
//     </CardContent>
//   </Card>
// </div>
// <div className="relative min-h-screen flex items-center justify-center
//   bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-700 px-4"
// >
//   {/* Optional: keep or remove this decorative background shape */}
//   <AuthBackgroundShape className="absolute opacity-10 mix-blend-screen" />

//   <Card className="z-10 w-full max-w-md
//     bg-white/10 backdrop-blur-md border border-white/20
//     shadow-lg rounded-3xl"
//   >
//     <CardHeader>
//       <Logo className="w-12 h-12 mb-8 text-white/70" />
//       <div>
//         <CardTitle className="mb-1.5 text-2xl text-white">Sign in to Firebase Authentication</CardTitle>
//         <CardDescription className="text-base text-white/70">Ship Faster and Focus on Growth.</CardDescription>
//       </div>
//     </CardHeader>

//     <CardContent>
//     </CardContent>
//   </Card>
// </div>

import LoginForm from './login-form'
const Login = () => {
  return (<LoginForm />)
}
export default Login

