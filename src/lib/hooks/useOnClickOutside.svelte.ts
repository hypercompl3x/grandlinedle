const useOnClickOutside = (fn: () => void) => {
	let containerEl = $state<HTMLDivElement>();

	const handleClick = (e: Event) => {
		if (containerEl && !containerEl.contains(e?.target as Node)) {
			fn();
		}
	};

	$effect(() => {
		document.addEventListener('click', handleClick);
		document.addEventListener('touchstart', handleClick);

		return () => {
			document.removeEventListener('click', handleClick);
			document.removeEventListener('touchstart', handleClick);
		};
	});

	return {
		set containerEl(value: HTMLDivElement | undefined) {
			containerEl = value;
		},
	};
};

export default useOnClickOutside;
