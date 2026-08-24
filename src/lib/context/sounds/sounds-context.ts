import { createContext } from 'svelte';
import type { SoundsState } from './sounds-state.svelte';

export const [getSounds, setSounds] = createContext<SoundsState>();
