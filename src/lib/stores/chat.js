import { writable } from 'svelte/store';

export const isChatOpen = writable(false);
export const unreadCount = writable(0);
export const chatView = writable('conversations'); // 'conversations' | 'chat' | 'newChat' | 'broadcast'
