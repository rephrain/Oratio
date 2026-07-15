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
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25')
];

export const server_loads = [];

export const dictionary = {
		"/admin": [6,[2]],
		"/admin/import": [7,[2]],
		"/admin/[table]": [8,[2]],
		"/dokter": [9,[3]],
		"/dokter/analytics": [10,[3]],
		"/dokter/history": [11,[3]],
		"/dokter/patient/[patientId]": [12,[3]],
		"/dokter/[encounterId]": [13,[3]],
		"/kasir": [14,[4]],
		"/kasir/edit-patient": [15,[4]],
		"/kasir/existing-patient": [16,[4]],
		"/kasir/new-patient": [17,[4]],
		"/kasir/patients": [18,[4]],
		"/kasir/payments": [20,[4]],
		"/kasir/payment": [19,[4]],
		"/login": [21],
		"/suster": [22,[5]],
		"/suster/edit-patient": [23,[5]],
		"/suster/history": [24,[5]],
		"/suster/patients": [25,[5]]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';