import { createContext } from 'svelte';
import type { OnlineRoomState } from './online-room-state.svelte';

export const [getOnlineRoom, setOnlineRoom] = createContext<OnlineRoomState>();
