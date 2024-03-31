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
				...defaultTheme.colors,
				neutral: {
					900: '#1e1e1e',
					800: '#2c2c2c',
					700: '#5a5a5a',
					100: '#e1e1e1'
				},
				off: '#555151',
				on: '#cb4444',
				circuit: '#2f323a'
			}
		}
	},
	plugins: []
};
