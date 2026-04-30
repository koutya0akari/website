/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#08110f",
        "night-soft": "#10231f",
        "night-muted": "#1e312c",
        accent: "#61e3ba",
        highlight: "#efc968",
        parchment: "#fdf5e7",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto)", "system-ui", "sans-serif"],
        display: ["var(--font-signika)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1180px",
      },
      boxShadow: {
        card: "0 20px 50px rgba(2, 6, 23, 0.4)",
      },
      backgroundImage: {
        "grid-line": "linear-gradient(transparent 95%, rgba(255,255,255,0.08) 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
