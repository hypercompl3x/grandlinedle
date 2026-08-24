import { createContext } from 'svelte';
import type { SettingsState } from './settings-state.svelte';

export const [getSettings, setSettings] = createContext<SettingsState>();
