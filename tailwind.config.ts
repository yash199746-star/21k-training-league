import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: "#D4C5A9",
        "sand-light": "#EDE6D8",
        navy: "#1A2744",
        "navy-deep": "#0D1829",
        stone: "#F5F2ED",
        himalayan: "#4A7C59",
        saffron: "#E8A020",
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
