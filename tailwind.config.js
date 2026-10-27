/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // Colors are CSS variables (see index.css) so light/dark is a single class swap.
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        subtle: token("subtle"),
        line: token("line"),
        fg: token("fg"),
        muted: token("muted"),
        accent: token("accent"),
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        pop: {
          from: { opacity: "0", transform: "translateY(4px) scale(0.98)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        // `backwards`, not `both`: a filled animation keeps a stacking context forever,
        // which would trap the fullscreen map under the sticky header.
        rise: "rise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) backwards",
        pop: "pop 0.16s ease-out both",
      },
    },
  },
  plugins: [],
}
