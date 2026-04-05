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
        background: "#FAF8F5",
        beige: "#E8DFD0",
        grege: "#C5B9A8",
        bronze: "#A07850",
        noir: "#1A1A18",
        promo: "#8B2E2E",
        white: "#FFFFFF",
      },
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "Georgia", "serif"],
        dm: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      aspectRatio: {
        "3/4": "3 / 4",
      },
      animation: {
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-bottom": "slideInBottom 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        marquee: "marquee 20s linear infinite",
      },
      keyframes: {
        slideInRight: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        slideInBottom: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      boxShadow: {
        warm: "0 2px 12px 0 rgba(160, 120, 80, 0.08)",
        "warm-md": "0 4px 24px 0 rgba(160, 120, 80, 0.12)",
        "warm-lg": "0 8px 40px 0 rgba(160, 120, 80, 0.16)",
      },
    },
  },
  plugins: [],
};
export default config;
