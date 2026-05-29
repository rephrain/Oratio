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
		client: {"start":"_app/immutable/entry/start.8fc59e6b.js","app":"_app/immutable/entry/app.d5ad62e0.js","imports":["_app/immutable/entry/start.8fc59e6b.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/singletons.e1db24ca.js","_app/immutable/chunks/index.8449654f.js","_app/immutable/chunks/paths.dff09679.js","_app/immutable/entry/app.d5ad62e0.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/index.98d8086f.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./chunks/0-45dde1ed.js')),
			__memo(() => import('./chunks/1-1a6906a7.js')),
			__memo(() => import('./chunks/2-862fa9d4.js')),
			__memo(() => import('./chunks/3-624e6c72.js')),
			__memo(() => import('./chunks/4-3030544f.js')),
			__memo(() => import('./chunks/5-1082aa9a.js')),
			__memo(() => import('./chunks/6-0967a847.js')),
			__memo(() => import('./chunks/7-7e3edd24.js')),
			__memo(() => import('./chunks/8-18a5211a.js')),
			__memo(() => import('./chunks/9-62747a56.js')),
			__memo(() => import('./chunks/10-954ab5d2.js')),
			__memo(() => import('./chunks/11-83a570f2.js')),
			__memo(() => import('./chunks/12-dc3ea50a.js')),
			__memo(() => import('./chunks/13-366a56ba.js')),
			__memo(() => import('./chunks/14-a2a3a89d.js')),
			__memo(() => import('./chunks/15-f69f8437.js')),
			__memo(() => import('./chunks/16-035aa754.js')),
			__memo(() => import('./chunks/17-f3a5f6ff.js')),
			__memo(() => import('./chunks/18-0e37741e.js')),
			__memo(() => import('./chunks/19-f087152f.js'))
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
				endpoint: __memo(() => import('./chunks/_server-972fa088.js'))
			},
			{
				id: "/api/admin/notifications",
				pattern: /^\/api\/admin\/notifications\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-bdcd953f.js'))
			},
			{
				id: "/api/admin/notifications/read-all",
				pattern: /^\/api\/admin\/notifications\/read-all\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-f68c6b56.js'))
			},
			{
				id: "/api/admin/notifications/[id]/read",
				pattern: /^\/api\/admin\/notifications\/([^/]+?)\/read\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-faba7b24.js'))
			},
			{
				id: "/api/admin/[table]",
				pattern: /^\/api\/admin\/([^/]+?)\/?$/,
				params: [{"name":"table","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-9a611cc4.js'))
			},
			{
				id: "/api/analytics",
				pattern: /^\/api\/analytics\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-1a5add2a.js'))
			},
			{
				id: "/api/auth/login",
				pattern: /^\/api\/auth\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-8cf3494f.js'))
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
				endpoint: __memo(() => import('./chunks/_server-43d53ecf.js'))
			},
			{
				id: "/api/auth/shifts",
				pattern: /^\/api\/auth\/shifts\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-a4470fa9.js'))
			},
			{
				id: "/api/cashiers",
				pattern: /^\/api\/cashiers\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-bfc5ceff.js'))
			},
			{
				id: "/api/chat/conversations",
				pattern: /^\/api\/chat\/conversations\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-d3d2d582.js'))
			},
			{
				id: "/api/chat/messages",
				pattern: /^\/api\/chat\/messages\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-d7d09dad.js'))
			},
			{
				id: "/api/chat/messages/read",
				pattern: /^\/api\/chat\/messages\/read\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-14a1b3f0.js'))
			},
			{
				id: "/api/chat/unread",
				pattern: /^\/api\/chat\/unread\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-1474ce9c.js'))
			},
			{
				id: "/api/chat/users",
				pattern: /^\/api\/chat\/users\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-f7cce0fd.js'))
			},
			{
				id: "/api/dashboard/dokter/referrals",
				pattern: /^\/api\/dashboard\/dokter\/referrals\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-c4b5792d.js'))
			},
			{
				id: "/api/dashboard/dokter/stats",
				pattern: /^\/api\/dashboard\/dokter\/stats\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-392de419.js'))
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
				endpoint: __memo(() => import('./chunks/_server-eab4991a.js'))
			},
			{
				id: "/api/documents",
				pattern: /^\/api\/documents\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-187d19f4.js'))
			},
			{
				id: "/api/documents/[id]",
				pattern: /^\/api\/documents\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-da932dd0.js'))
			},
			{
				id: "/api/encounters",
				pattern: /^\/api\/encounters\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-0b1a4eb2.js'))
			},
			{
				id: "/api/encounters/[id]",
				pattern: /^\/api\/encounters\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-8ab1d7ff.js'))
			},
			{
				id: "/api/encounters/[id]/pdf",
				pattern: /^\/api\/encounters\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-c9b18e7a.js'))
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
				endpoint: __memo(() => import('./chunks/_server-68a68ab0.js'))
			},
			{
				id: "/api/patients/[id]/medical-background",
				pattern: /^\/api\/patients\/([^/]+?)\/medical-background\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-7fdeccac.js'))
			},
			{
				id: "/api/patients/[id]/pdf",
				pattern: /^\/api\/patients\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-3f75bcd3.js'))
			},
			{
				id: "/api/payments",
				pattern: /^\/api\/payments\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-2f7261fa.js'))
			},
			{
				id: "/api/payments/[id]/pdf",
				pattern: /^\/api\/payments\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-a3833e06.js'))
			},
			{
				id: "/api/pdf",
				pattern: /^\/api\/pdf\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-ea39ecb3.js'))
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
				endpoint: __memo(() => import('./chunks/_server-80350626.js'))
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
