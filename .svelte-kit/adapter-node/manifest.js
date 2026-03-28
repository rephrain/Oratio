export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["fonts/Roboto-BoldItalic.ttf","fonts/Roboto-Italic.ttf","fonts/Roboto-Medium.ttf","fonts/Roboto-Regular.ttf"]),
	mimeTypes: {".ttf":"font/ttf"},
	_: {
		client: {"start":"_app/immutable/entry/start.cb61660f.js","app":"_app/immutable/entry/app.6664f161.js","imports":["_app/immutable/entry/start.cb61660f.js","_app/immutable/chunks/scheduler.3644534c.js","_app/immutable/chunks/singletons.440318f5.js","_app/immutable/chunks/index.6c73ec2d.js","_app/immutable/chunks/paths.7a655565.js","_app/immutable/entry/app.6664f161.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/scheduler.3644534c.js","_app/immutable/chunks/index.89b48b24.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js')),
			__memo(() => import('./nodes/15.js')),
			__memo(() => import('./nodes/16.js'))
		],
		routes: [
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/admin/import",
				pattern: /^\/admin\/import\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/admin/[table]",
				pattern: /^\/admin\/([^/]+?)\/?$/,
				params: [{"name":"table","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/api/admin/[table]",
				pattern: /^\/api\/admin\/([^/]+?)\/?$/,
				params: [{"name":"table","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/admin/_table_/_server.js'))
			},
			{
				id: "/api/auth/login",
				pattern: /^\/api\/auth\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/login/_server.js'))
			},
			{
				id: "/api/auth/logout",
				pattern: /^\/api\/auth\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/logout/_server.js'))
			},
			{
				id: "/api/auth/me",
				pattern: /^\/api\/auth\/me\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/me/_server.js'))
			},
			{
				id: "/api/doctors",
				pattern: /^\/api\/doctors\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/doctors/_server.js'))
			},
			{
				id: "/api/encounters",
				pattern: /^\/api\/encounters\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/encounters/_server.js'))
			},
			{
				id: "/api/encounters/[id]",
				pattern: /^\/api\/encounters\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/encounters/_id_/_server.js'))
			},
			{
				id: "/api/kfa",
				pattern: /^\/api\/kfa\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/kfa/_server.js'))
			},
			{
				id: "/api/patients",
				pattern: /^\/api\/patients\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/patients/_server.js'))
			},
			{
				id: "/api/payments",
				pattern: /^\/api\/payments\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/payments/_server.js'))
			},
			{
				id: "/api/pdf",
				pattern: /^\/api\/pdf\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/pdf/_server.js'))
			},
			{
				id: "/api/snowstorm",
				pattern: /^\/api\/snowstorm\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/snowstorm/_server.js'))
			},
			{
				id: "/dokter",
				pattern: /^\/dokter\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/dokter/analytics",
				pattern: /^\/dokter\/analytics\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/dokter/patient/[patientId]",
				pattern: /^\/dokter\/patient\/([^/]+?)\/?$/,
				params: [{"name":"patientId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/dokter/[encounterId]",
				pattern: /^\/dokter\/([^/]+?)\/?$/,
				params: [{"name":"encounterId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/kasir",
				pattern: /^\/kasir\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/kasir/existing-patient",
				pattern: /^\/kasir\/existing-patient\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/kasir/new-patient",
				pattern: /^\/kasir\/new-patient\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/kasir/payment",
				pattern: /^\/kasir\/payment\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();

export const prerendered = new Set([]);
