import { writable } from 'svelte/store';

export const isChatOpen = writable(false);
export const unreadCount = writable(0);
