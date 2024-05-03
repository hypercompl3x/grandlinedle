<script>
	import GrandlinedleLogo from '$lib/assets/grandlinedle-logo.png';
	import '../app.css';
</script>

<div class="h-screen overflow-hidden bg-center bg-no-repeat bg-cover bg-page-background">
	<div class="max-w-screen-md h-full mx-auto flex flex-col items-center">
		<a href="/">
			<img
				alt="The grandlinedle logo"
				src={GrandlinedleLogo}
				class="w-96 my-4 rounded-lg hover:scale-105 transition-transform duration-300 ease-in-out"
			/>
		</a>
		<slot />
	</div>
</div>
