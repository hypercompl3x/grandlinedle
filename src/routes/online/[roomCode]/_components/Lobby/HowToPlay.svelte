<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Modal from '$lib/components/Modal.svelte';
</script>

{#snippet button(onClick: () => void)}
	<Button type="button" onclick={onClick} class="max-w-md w-full from-grey to-grey-dark">
		How to play?
	</Button>
{/snippet}

<Modal
	{button}
	headerClass="bg-grey"
	containerClass="gap-y-3 p-2 text-center font-normal text-lg"
	name="How to play?"
>
	<div>Compete against your crewmates to figure out the mystery character.</div>
	<div>
		Each round features a new random character. After every guess, a new clue is revealed. Guess
		correctly to score a point, or keep going until all 8 clues have been shown.
	</div>
	<div>The player with the most points at the end wins. Good luck!</div>
</Modal>
