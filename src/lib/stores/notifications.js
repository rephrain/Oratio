import { writable } from 'svelte/store';

export const isNotificationOpen = writable(false);
export const notifications = writable([]);
export const unreadNotificationCount = writable(0);
