const asyncTransition = () => {
	let isPending = $state(false);

	const startTransition = async (callback: () => Promise<unknown>) => {
		isPending = true;
		await callback();
		isPending = false;
	};

	return {
		get isPending() {
			return isPending;
		},
		startTransition,
	};
};

export default asyncTransition;
