/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(210, 40%, 98%)",
        foreground: "hsl(220, 9%, 12%)",
        card: "hsl(0, 0%, 100%)",
        "card-foreground": "hsl(220, 9%, 12%)",
        border: "hsl(220, 13%, 91%)",
        primary: "hsl(220, 83%, 53%)",
        secondary: "hsl(158, 64%, 52%)",
        accent: "hsl(43, 96%, 56%)",
        muted: "hsl(210, 40%, 96%)",
        "muted-foreground": "hsl(215, 16%, 47%)"
      },
    },
  },
  plugins: [],
};