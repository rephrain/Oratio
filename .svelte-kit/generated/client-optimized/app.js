export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16')
];

export const server_loads = [];

export const dictionary = {
		"/admin": [5,[2]],
		"/admin/import": [6,[2]],
		"/admin/[table]": [7,[2]],
		"/dokter": [8,[3]],
		"/dokter/analytics": [9,[3]],
		"/dokter/patient/[patientId]": [10,[3]],
		"/dokter/[encounterId]": [11,[3]],
		"/kasir": [12,[4]],
		"/kasir/existing-patient": [13,[4]],
		"/kasir/new-patient": [14,[4]],
		"/kasir/payment": [15,[4]],
		"/login": [16]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';