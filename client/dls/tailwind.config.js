const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Advent Pro', ...defaultTheme.fontFamily.sans],
				poppins: ['Poppins', 'sans-serif']
			},
			colors: {
				off: 'var(--clr-off)',
				on: 'var(--clr-on)',
				accent: 'var(--clr-accent)',
				...defaultTheme.colors
			}
		}
	},
	plugins: []
};
