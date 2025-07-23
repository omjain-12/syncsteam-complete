/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0a0a0a",
        "bg-secondary": "#111111",
        "bg-tertiary": "#1a1a1a",
        "bg-card": "#161616",    
        "bg-hover": "#252525",
        "accent-primary": "#8b5cf6",
        "accent-secondary": "#a78bfa",
        "accent-dark": "#7c3aed",
        "text-primary": "#ffffff",
        "text-secondary": "#d1d5db",
        "text-muted": "#9ca3af",
        "border-primary": "#2d2d2d",
        "border-secondary": "#404040",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
        "gradient-secondary":
          "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        "gradient-card": "linear-gradient(145deg, #161616 0%, #1a1a1a 100%)",
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "pulse-slow": "pulse 3s infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(139, 92, 246, 0.3)",
        card: "0 4px 20px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 15px 30px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
