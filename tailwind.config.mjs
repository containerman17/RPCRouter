const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx,vue}'],
    theme: {
        extend: {
            typography: {
                DEFAULT: {
                    css: {
                        'h1': {
                            fontSize: '48px',
                            textAlign: 'center',
                        },
                        'h2': {
                            fontSize: '32px',
                            textAlign: 'center',
                        },
                        'h3': {
                            fontSize: '24px',
                            textAlign: 'center',
                        },
                    },
                },
            },
            animation: {
                'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
            colors: {
                primary: colors.blue,
            }
        },
    },
    plugins: [require('@tailwindcss/forms'), require('@headlessui/tailwindcss'), require('@tailwindcss/typography')],
}
