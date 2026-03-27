/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        // Elastic bounce for notification number
        "bounce-notif": {
          "0%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-6px)" },
          "50%": { transform: "translateY(-12px)" },
          "70%": { transform: "translateY(-6px)" },
        },
        // Subtle shake for bell icon
        "shake-notif": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%": { transform: "rotate(-10deg)" },
          "40%": { transform: "rotate(10deg)" },
          "60%": { transform: "rotate(-6deg)" },
          "80%": { transform: "rotate(6deg)" },
        },
      },
      animation: {
        "bounce-notif": "bounce-notif 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards",
        "shake-notif": "shake-notif 0.8s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};