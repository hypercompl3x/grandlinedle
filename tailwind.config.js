/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		colors: {
			transparent: 'transparent',
			white: '#FFF',
			black: '#000',
			red: '#E30C0C',
			blue: {
				light: '#4ABFFF',
				dark: '#1E4DE0',
			},
		},
		extend: {
			backgroundImage: {
				'page-background': "url('/src/lib/assets/one-piece-bg.jpg')",
			},
		},
	},
	plugins: [],
};
