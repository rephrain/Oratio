import { writable } from 'svelte/store';

export const isSidebarOpen = writable(true);
export const headerTitle = writable(null);
export const isPatientProfileOpen = writable(false);
