<script>
	import GrandlinedleLogo from '$lib/assets/grandlinedle-logo.png';
	import '../app.css';
</script>

<div
	class="h-screen overflow-hidden overflow-y-auto bg-center bg-no-repeat bg-cover bg-page-background"
>
	<div class="flex flex-col items-center h-full max-w-screen-md mx-auto">
		<a href="/">
			<img
				alt="The grandlinedle logo"
				src={GrandlinedleLogo}
				class="my-4 transition-transform duration-300 ease-in-out rounded-lg w-96 hover:scale-105"
			/>
		</a>
		<slot />
	</div>
</div>
