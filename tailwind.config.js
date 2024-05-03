/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			backgroundImage: {
				'page-background': "url('/src/lib/assets/one-piece-bg.jpg')",
			},
		},
	},
	plugins: [],
};
