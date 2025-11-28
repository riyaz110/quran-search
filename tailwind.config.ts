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
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#2ca4ab", // Quran.com Teal
                    hover: "#238389",
                },
                secondary: "#f4f5f6",
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                arabic: ['var(--font-quran)', 'Scheherazade New', 'serif'],
            },
        },
    },
    plugins: [],
};
export default config;
