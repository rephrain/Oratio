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
		client: {"start":"_app/immutable/entry/start.cbb5d4c6.js","app":"_app/immutable/entry/app.e594aedd.js","imports":["_app/immutable/entry/start.cbb5d4c6.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/singletons.e888a464.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.96392b08.js","_app/immutable/entry/app.e594aedd.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./chunks/0-86cfd343.js')),
			__memo(() => import('./chunks/1-f7eb25c9.js')),
			__memo(() => import('./chunks/2-b0dad3a7.js')),
			__memo(() => import('./chunks/3-9b332cd9.js')),
			__memo(() => import('./chunks/4-d91647c4.js')),
			__memo(() => import('./chunks/5-395dd709.js')),
			__memo(() => import('./chunks/6-601ff20c.js')),
			__memo(() => import('./chunks/7-10fed7d6.js')),
			__memo(() => import('./chunks/8-5c186a96.js')),
			__memo(() => import('./chunks/9-b225ff92.js')),
			__memo(() => import('./chunks/10-809eeb58.js')),
			__memo(() => import('./chunks/11-fe79976a.js')),
			__memo(() => import('./chunks/12-7e19a475.js')),
			__memo(() => import('./chunks/13-3b108a99.js')),
			__memo(() => import('./chunks/14-e9da8e44.js')),
			__memo(() => import('./chunks/15-f6265950.js')),
			__memo(() => import('./chunks/16-252098c1.js')),
			__memo(() => import('./chunks/17-f85e117b.js')),
			__memo(() => import('./chunks/18-21ed74fd.js')),
			__memo(() => import('./chunks/19-be1bcd54.js')),
			__memo(() => import('./chunks/20-d04ba4d8.js')),
			__memo(() => import('./chunks/21-db7e17ee.js')),
			__memo(() => import('./chunks/22-85e267b6.js')),
			__memo(() => import('./chunks/23-26c416fe.js')),
			__memo(() => import('./chunks/24-4a602acd.js')),
			__memo(() => import('./chunks/25-7f659251.js'))
		],
		routes: [
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/admin/import",
				pattern: /^\/admin\/import\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/admin/[table]",
				pattern: /^\/admin\/([^/]+?)\/?$/,
				params: [{"name":"table","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/api/admin/dashboard",
				pattern: /^\/api\/admin\/dashboard\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-61f0b556.js'))
			},
			{
				id: "/api/admin/notifications",
				pattern: /^\/api\/admin\/notifications\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-560475cd.js'))
			},
			{
				id: "/api/admin/notifications/read-all",
				pattern: /^\/api\/admin\/notifications\/read-all\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-ab8019a0.js'))
			},
			{
				id: "/api/admin/notifications/[id]/read",
				pattern: /^\/api\/admin\/notifications\/([^/]+?)\/read\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-6963e7c4.js'))
			},
			{
				id: "/api/admin/[table]",
				pattern: /^\/api\/admin\/([^/]+?)\/?$/,
				params: [{"name":"table","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-1534f2cf.js'))
			},
			{
				id: "/api/analytics",
				pattern: /^\/api\/analytics\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-74af823a.js'))
			},
			{
				id: "/api/auth/login",
				pattern: /^\/api\/auth\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-4e181da2.js'))
			},
			{
				id: "/api/auth/logout",
				pattern: /^\/api\/auth\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-aa2d6d57.js'))
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
				endpoint: __memo(() => import('./chunks/_server-aac03904.js'))
			},
			{
				id: "/api/auth/refresh",
				pattern: /^\/api\/auth\/refresh\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-5323701f.js'))
			},
			{
				id: "/api/auth/shifts",
				pattern: /^\/api\/auth\/shifts\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-5bdb2c77.js'))
			},
			{
				id: "/api/cashiers",
				pattern: /^\/api\/cashiers\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-8c21914f.js'))
			},
			{
				id: "/api/chat/broadcast",
				pattern: /^\/api\/chat\/broadcast\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-ad66f18c.js'))
			},
			{
				id: "/api/chat/conversations",
				pattern: /^\/api\/chat\/conversations\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-044563f0.js'))
			},
			{
				id: "/api/chat/messages",
				pattern: /^\/api\/chat\/messages\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-d2b90d60.js'))
			},
			{
				id: "/api/chat/messages/read",
				pattern: /^\/api\/chat\/messages\/read\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-73014307.js'))
			},
			{
				id: "/api/chat/unread",
				pattern: /^\/api\/chat\/unread\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-f614238d.js'))
			},
			{
				id: "/api/chat/users",
				pattern: /^\/api\/chat\/users\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-574e1110.js'))
			},
			{
				id: "/api/dashboard/dokter/referrals",
				pattern: /^\/api\/dashboard\/dokter\/referrals\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-50c996b8.js'))
			},
			{
				id: "/api/dashboard/dokter/stats",
				pattern: /^\/api\/dashboard\/dokter\/stats\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-3e2f16f9.js'))
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
				endpoint: __memo(() => import('./chunks/_server-ca07a250.js'))
			},
			{
				id: "/api/documents",
				pattern: /^\/api\/documents\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-dbc2573f.js'))
			},
			{
				id: "/api/documents/[id]",
				pattern: /^\/api\/documents\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-f85a543a.js'))
			},
			{
				id: "/api/encounters",
				pattern: /^\/api\/encounters\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-8cbb3a3c.js'))
			},
			{
				id: "/api/encounters/[id]",
				pattern: /^\/api\/encounters\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-67dd7c69.js'))
			},
			{
				id: "/api/encounters/[id]/pdf",
				pattern: /^\/api\/encounters\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-9cc71058.js'))
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
				endpoint: __memo(() => import('./chunks/_server-cd829eae.js'))
			},
			{
				id: "/api/patients/[id]",
				pattern: /^\/api\/patients\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-11173539.js'))
			},
			{
				id: "/api/patients/[id]/medical-background",
				pattern: /^\/api\/patients\/([^/]+?)\/medical-background\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-ee5a10e6.js'))
			},
			{
				id: "/api/patients/[id]/pdf",
				pattern: /^\/api\/patients\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-9fb91466.js'))
			},
			{
				id: "/api/payments",
				pattern: /^\/api\/payments\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-70021774.js'))
			},
			{
				id: "/api/payments/[id]/pdf",
				pattern: /^\/api\/payments\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-6cf2865e.js'))
			},
			{
				id: "/api/pdf",
				pattern: /^\/api\/pdf\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-8aba498a.js'))
			},
			{
				id: "/api/realtime/stream",
				pattern: /^\/api\/realtime\/stream\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-44881be1.js'))
			},
			{
				id: "/api/realtime/subscribe",
				pattern: /^\/api\/realtime\/subscribe\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-fa9f6b38.js'))
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
				endpoint: __memo(() => import('./chunks/_server-5e45c1db.js'))
			},
			{
				id: "/api/test-ssr",
				pattern: /^\/api\/test-ssr\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-730805f2.js'))
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
				page: { layouts: [0,3,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/dokter/analytics",
				pattern: /^\/dokter\/analytics\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/dokter/history",
				pattern: /^\/dokter\/history\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/dokter/patient/[patientId]",
				pattern: /^\/dokter\/patient\/([^/]+?)\/?$/,
				params: [{"name":"patientId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/dokter/[encounterId]",
				pattern: /^\/dokter\/([^/]+?)\/?$/,
				params: [{"name":"encounterId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/kasir",
				pattern: /^\/kasir\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/kasir/edit-patient",
				pattern: /^\/kasir\/edit-patient\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/kasir/existing-patient",
				pattern: /^\/kasir\/existing-patient\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/kasir/new-patient",
				pattern: /^\/kasir\/new-patient\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/kasir/patients",
				pattern: /^\/kasir\/patients\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/kasir/payments",
				pattern: /^\/kasir\/payments\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/kasir/payment",
				pattern: /^\/kasir\/payment\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/suster",
				pattern: /^\/suster\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/suster/edit-patient",
				pattern: /^\/suster\/edit-patient\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/suster/history",
				pattern: /^\/suster\/history\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/suster/patients",
				pattern: /^\/suster\/patients\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 25 },
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
