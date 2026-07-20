<script lang="ts">
	import { Info } from 'lucide-svelte';
	import Modal from '$lib/components/Modal.svelte';
</script>

{#snippet button(onClick: () => void)}
	<button
		type="button"
		onclick={onClick}
		class="flex items-center gap-x-1 rounded-full from-grey to-grey-dark bg-linear-to-b px-2 py-1 text-sm font-bold hover:brightness-110 shadow-xs"
	>
		<Info class="size-3.5 stroke-3" />
		About
	</button>
{/snippet}

<Modal
	{button}
	headerClass="bg-grey"
	containerClass="overflow-y-auto text-left max-h-[60dvh] items-start"
	name="About"
	wide
>
	<div class="p-4 space-y-4">
		<p>
			<span class="text-red-primary font-bold">Grandlinedle</span>
			is a daily One Piece Wordle game made for fans of the manga and anime series. Take on a new set
			of challenges each day covering characters, locations, quotes and crews from across the series.
		</p>

		<section class="space-y-px">
			<h3 class="font-bold text-blue-primary">Classic</h3>
			<p>
				Guess the mystery One Piece character. Each attempt compares your character's attributes
				with the answer, giving you clues to help narrow it down.
			</p>
		</section>

		<section class="space-y-px">
			<h3 class="font-bold text-blue-primary">Location</h3>
			<p>
				Identify the One Piece location from a blurred image that becomes clearer with each
				incorrect guess. Choose Easy mode for some extra help or Hard mode for a tougher challenge.
			</p>
		</section>

		<section class="space-y-px">
			<h3 class="font-bold text-blue-primary">Quote</h3>
			<p>Guess which One Piece character said the daily quote.</p>
		</section>

		<section class="space-y-px">
			<h3 class="font-bold text-blue-primary">Crew</h3>
			<p>
				Identify the One Piece crew from a zoomed in image that zooms out with each incorrect guess.
			</p>
		</section>

		<section class="space-y-0.5">
			<h3 class="font-bold text-red-primary">Online</h3>
			<p>
				Create a private room or join one with a room code, then compete against other players
				across multiple rounds to see who knows One Piece the best.
			</p>
		</section>
	</div>

	<div class="h-px w-full bg-grey shrink-0"></div>

	<div class="space-y-4 text-base p-4">
		<p>
			Grandlinedle is an unofficial project inspired by Wordle, OnePiecedle and other daily guessing
			games.
		</p>

		<p>
			One Piece and its related characters and properties belong to Eiichiro Oda, Shueisha, Fuji
			Television, Toei Animation and their respective rights holders. Grandlinedle is not affiliated
			with, endorsed by or sponsored by any of these parties.
		</p>
	</div>
</Modal>
