const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Advent Pro', ...defaultTheme.fontFamily.sans]
			},
			colors: {
				off: 'var(--clr-off)',
				on: 'var(--clr-on)',
				circuit: 'var(--clr-circuit)',
				...defaultTheme.colors
			}
		}
	},
	plugins: []
};
