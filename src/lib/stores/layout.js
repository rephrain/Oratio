import { writable } from 'svelte/store';

export const isSidebarOpen = writable(true);
export const isSidebarHidden = writable(false);
export const headerTitle = writable(null);
export const isPatientProfileOpen = writable(false);
export const isProfileModalOpen = writable(false);
