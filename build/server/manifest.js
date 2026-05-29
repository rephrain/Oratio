const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["fonts/Roboto-BoldItalic.ttf","fonts/Roboto-Italic.ttf","fonts/Roboto-Medium.ttf","fonts/Roboto-Regular.ttf","logo.png"]),
	mimeTypes: {".ttf":"font/ttf",".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.8e47f7af.js","app":"_app/immutable/entry/app.e5c06ead.js","imports":["_app/immutable/entry/start.8e47f7af.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/singletons.3cb44420.js","_app/immutable/chunks/index.8449654f.js","_app/immutable/chunks/paths.c67aefbd.js","_app/immutable/entry/app.e5c06ead.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/index.98d8086f.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./chunks/0-45dde1ed.js')),
			__memo(() => import('./chunks/1-51550628.js')),
			__memo(() => import('./chunks/2-6da24f1f.js')),
			__memo(() => import('./chunks/3-2770113e.js')),
			__memo(() => import('./chunks/4-b6b2e730.js')),
			__memo(() => import('./chunks/5-1082aa9a.js')),
			__memo(() => import('./chunks/6-25061163.js')),
			__memo(() => import('./chunks/7-29ba4973.js')),
			__memo(() => import('./chunks/8-527ecea0.js')),
			__memo(() => import('./chunks/9-4aed8550.js')),
			__memo(() => import('./chunks/10-bbd0cdc9.js')),
			__memo(() => import('./chunks/11-c88797c5.js')),
			__memo(() => import('./chunks/12-2ebdda1b.js')),
			__memo(() => import('./chunks/13-3668aa46.js')),
			__memo(() => import('./chunks/14-6a1f2476.js')),
			__memo(() => import('./chunks/15-d9aa577e.js')),
			__memo(() => import('./chunks/16-9b6a76c7.js')),
			__memo(() => import('./chunks/17-8a7e0a79.js')),
			__memo(() => import('./chunks/18-ac79516e.js')),
			__memo(() => import('./chunks/19-869a6277.js'))
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
				id: "/api/admin/dashboard",
				pattern: /^\/api\/admin\/dashboard\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-5104ee2b.js'))
			},
			{
				id: "/api/admin/notifications",
				pattern: /^\/api\/admin\/notifications\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-3a940c9e.js'))
			},
			{
				id: "/api/admin/notifications/read-all",
				pattern: /^\/api\/admin\/notifications\/read-all\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-d8cba82e.js'))
			},
			{
				id: "/api/admin/notifications/[id]/read",
				pattern: /^\/api\/admin\/notifications\/([^/]+?)\/read\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-7612673f.js'))
			},
			{
				id: "/api/admin/[table]",
				pattern: /^\/api\/admin\/([^/]+?)\/?$/,
				params: [{"name":"table","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-ab925cbb.js'))
			},
			{
				id: "/api/analytics",
				pattern: /^\/api\/analytics\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-300aa96b.js'))
			},
			{
				id: "/api/auth/login",
				pattern: /^\/api\/auth\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-8d550d1b.js'))
			},
			{
				id: "/api/auth/logout",
				pattern: /^\/api\/auth\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-07d61ef6.js'))
			},
			{
				id: "/api/auth/me",
				pattern: /^\/api\/auth\/me\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-90226c2c.js'))
			},
			{
				id: "/api/auth/profile",
				pattern: /^\/api\/auth\/profile\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-a005d997.js'))
			},
			{
				id: "/api/auth/shifts",
				pattern: /^\/api\/auth\/shifts\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-18c1d19f.js'))
			},
			{
				id: "/api/cashiers",
				pattern: /^\/api\/cashiers\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-4c7debdf.js'))
			},
			{
				id: "/api/chat/conversations",
				pattern: /^\/api\/chat\/conversations\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-ad9924b8.js'))
			},
			{
				id: "/api/chat/messages",
				pattern: /^\/api\/chat\/messages\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-bfa93f93.js'))
			},
			{
				id: "/api/chat/messages/read",
				pattern: /^\/api\/chat\/messages\/read\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-856da5df.js'))
			},
			{
				id: "/api/chat/unread",
				pattern: /^\/api\/chat\/unread\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-25f8051d.js'))
			},
			{
				id: "/api/chat/users",
				pattern: /^\/api\/chat\/users\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-d2629238.js'))
			},
			{
				id: "/api/dashboard/dokter/referrals",
				pattern: /^\/api\/dashboard\/dokter\/referrals\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-5850712a.js'))
			},
			{
				id: "/api/dashboard/dokter/stats",
				pattern: /^\/api\/dashboard\/dokter\/stats\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-c85abeb9.js'))
			},
			{
				id: "/api/debug-tz",
				pattern: /^\/api\/debug-tz\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-174d4b34.js'))
			},
			{
				id: "/api/doctors",
				pattern: /^\/api\/doctors\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-b866307c.js'))
			},
			{
				id: "/api/documents",
				pattern: /^\/api\/documents\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-ede75d2f.js'))
			},
			{
				id: "/api/documents/[id]",
				pattern: /^\/api\/documents\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-9277c5b1.js'))
			},
			{
				id: "/api/encounters",
				pattern: /^\/api\/encounters\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-7c8c14bd.js'))
			},
			{
				id: "/api/encounters/[id]",
				pattern: /^\/api\/encounters\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-21fc36c5.js'))
			},
			{
				id: "/api/encounters/[id]/pdf",
				pattern: /^\/api\/encounters\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-23a902d2.js'))
			},
			{
				id: "/api/geonames",
				pattern: /^\/api\/geonames\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-824fcb09.js'))
			},
			{
				id: "/api/kfa",
				pattern: /^\/api\/kfa\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-680c59b2.js'))
			},
			{
				id: "/api/patients",
				pattern: /^\/api\/patients\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-f7fb847c.js'))
			},
			{
				id: "/api/patients/[id]/medical-background",
				pattern: /^\/api\/patients\/([^/]+?)\/medical-background\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-91ed355f.js'))
			},
			{
				id: "/api/patients/[id]/pdf",
				pattern: /^\/api\/patients\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-44d5f1ae.js'))
			},
			{
				id: "/api/payments",
				pattern: /^\/api\/payments\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-93fd6c15.js'))
			},
			{
				id: "/api/payments/[id]/pdf",
				pattern: /^\/api\/payments\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-a9853fd8.js'))
			},
			{
				id: "/api/pdf",
				pattern: /^\/api\/pdf\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-349602e5.js'))
			},
			{
				id: "/api/snowstorm",
				pattern: /^\/api\/snowstorm\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-7d906516.js'))
			},
			{
				id: "/api/terminologies",
				pattern: /^\/api\/terminologies\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-92fb82a3.js'))
			},
			{
				id: "/api/test-ssr",
				pattern: /^\/api\/test-ssr\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-e8d16b11.js'))
			},
			{
				id: "/api/wilayah",
				pattern: /^\/api\/wilayah\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-5b9b39a9.js'))
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
				id: "/dokter/history",
				pattern: /^\/dokter\/history\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/dokter/patient/[patientId]",
				pattern: /^\/dokter\/patient\/([^/]+?)\/?$/,
				params: [{"name":"patientId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/dokter/[encounterId]",
				pattern: /^\/dokter\/([^/]+?)\/?$/,
				params: [{"name":"encounterId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/kasir",
				pattern: /^\/kasir\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/kasir/existing-patient",
				pattern: /^\/kasir\/existing-patient\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/kasir/new-patient",
				pattern: /^\/kasir\/new-patient\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/kasir/patients",
				pattern: /^\/kasir\/patients\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/kasir/payments",
				pattern: /^\/kasir\/payments\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/kasir/payment",
				pattern: /^\/kasir\/payment\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 19 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();

const prerendered = new Set([]);

export { manifest, prerendered };
//# sourceMappingURL=manifest.js.map
