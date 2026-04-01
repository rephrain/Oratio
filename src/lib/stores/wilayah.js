import { writable } from 'svelte/store';

export const provinces = writable([]);
export const regencies = writable([]);
export const districts = writable([]);
export const villages = writable([]);

export const loadingProvince = writable(false);
export const loadingRegency = writable(false);
export const loadingDistrict = writable(false);
export const loadingVillage = writable(false);