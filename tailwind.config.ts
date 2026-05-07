import type { Config } from "tailwindcss";

/**
 * tre.ai design tokens — locked aesthetic.
 * Source of truth for every color in the product.
 * Do not introduce new accents without explicit approval.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:     "#F4F1EC", // warm paper
        bg2:    "#EDE8E0",
        ink:    "#101418", // primary text
        ink2:   "#3A4047", // secondary text
        mute:   "#7A8089", // tertiary / metadata
        rule:   "#E1DCD2", // borders, dividers
        card:   "#FFFFFF",
        accent: "#1F4E5F", // deep teal — sole chromatic accent
        accent2:"#7BA8A8",
        warm:   "#C77A4D", // tags
        gold:   "#C8A24C", // tailwind tags
        red:    "#C0473F", // stuck / danger
        green:  "#3F8160", // done / positive
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontFeatureSettings: {
        ss01: '"ss01"',
        cv11: '"cv11"',
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter:  "-0.025em",
        tightx:   "-0.02em",
        tight2:   "-0.01em",
        cadence:  "0.16em",
      },
      transitionTimingFunction: {
        ease: "cubic-bezier(.32,.72,0,1)",
      },
      boxShadow: {
        soft:    "0 1px 0 rgba(16,20,24,.02), 0 6px 18px rgba(16,20,24,.04)",
        device:  "0 30px 80px rgba(16,20,24,.18), 0 6px 12px rgba(16,20,24,.08)",
        cta:     "0 4px 12px rgba(16,20,24,.15)",
        next:    "0 4px 14px rgba(16,20,24,.08)",
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
