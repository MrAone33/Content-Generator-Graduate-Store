/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'graduate-black': '#000000',
                'graduate-white': '#FFFFFF',
                'graduate-gray': '#F5F5F5',
                'graduate-muted': '#767676',
                'graduate-accent': '#FF0000',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            borderRadius: {
                none: '0',
                sm: '4px',
                DEFAULT: '6px',
                md: '6px',
                lg: '8px',
            },
        },
    },
    plugins: [],
}
