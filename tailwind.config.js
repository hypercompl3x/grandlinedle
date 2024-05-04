/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		colors: {
			transparent: 'transparent',
			white: '#FFF',
			black: '#000',
			yellow: { primary: '#E0D561', dark: '#F3E033' },
			green: { light: '#24D475', primary: '#3DA75E' },
			red: {
				light: '#D53633',
				primary: '#E30C0C',
				dark: '#80201F',
			},
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
