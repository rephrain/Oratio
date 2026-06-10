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
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20')
];

export const server_loads = [];

export const dictionary = {
		"/admin": [5,[2]],
		"/admin/import": [6,[2]],
		"/admin/[table]": [7,[2]],
		"/dokter": [8,[3]],
		"/dokter/analytics": [9,[3]],
		"/dokter/history": [10,[3]],
		"/dokter/patient/[patientId]": [11,[3]],
		"/dokter/[encounterId]": [12,[3]],
		"/kasir": [13,[4]],
		"/kasir/edit-patient": [14,[4]],
		"/kasir/existing-patient": [15,[4]],
		"/kasir/new-patient": [16,[4]],
		"/kasir/patients": [17,[4]],
		"/kasir/payments": [19,[4]],
		"/kasir/payment": [18,[4]],
		"/login": [20]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';