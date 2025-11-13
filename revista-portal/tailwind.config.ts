import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#3B82F6", // Blue
          foreground: "#FFFFFF",
          dark: "#2563EB",
        },
        secondary: {
          DEFAULT: "#10B981", // Green
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#8B5CF6",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#3B82F6",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
