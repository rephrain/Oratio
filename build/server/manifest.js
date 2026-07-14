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
		client: {"start":"_app/immutable/entry/start.5533e039.js","app":"_app/immutable/entry/app.27e06f97.js","imports":["_app/immutable/entry/start.5533e039.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/singletons.1f7328cd.js","_app/immutable/chunks/index.67c9fa51.js","_app/immutable/chunks/paths.7e516e97.js","_app/immutable/entry/app.27e06f97.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/index.bf6392ca.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./chunks/0-a30f08ea.js')),
			__memo(() => import('./chunks/1-2445b890.js')),
			__memo(() => import('./chunks/2-f157d5a3.js')),
			__memo(() => import('./chunks/3-6c59b286.js')),
			__memo(() => import('./chunks/4-bdbecbd7.js')),
			__memo(() => import('./chunks/5-8fa51e77.js')),
			__memo(() => import('./chunks/6-1cff49a3.js')),
			__memo(() => import('./chunks/7-13548b38.js')),
			__memo(() => import('./chunks/8-66d1e041.js')),
			__memo(() => import('./chunks/9-13239c8d.js')),
			__memo(() => import('./chunks/10-d92cdf7c.js')),
			__memo(() => import('./chunks/11-99aaa7f3.js')),
			__memo(() => import('./chunks/12-270c6b4b.js')),
			__memo(() => import('./chunks/13-6949fee3.js')),
			__memo(() => import('./chunks/14-f5a1cc9e.js')),
			__memo(() => import('./chunks/15-a1798144.js')),
			__memo(() => import('./chunks/16-81beea34.js')),
			__memo(() => import('./chunks/17-a61542ef.js')),
			__memo(() => import('./chunks/18-cf550e8b.js')),
			__memo(() => import('./chunks/19-afaa8441.js')),
			__memo(() => import('./chunks/20-ec420194.js')),
			__memo(() => import('./chunks/21-7dc871aa.js')),
			__memo(() => import('./chunks/22-23b3957d.js')),
			__memo(() => import('./chunks/23-af0d34fd.js')),
			__memo(() => import('./chunks/24-f9a71a0e.js'))
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
				endpoint: __memo(() => import('./chunks/_server-ce2e1de5.js'))
			},
			{
				id: "/api/admin/notifications",
				pattern: /^\/api\/admin\/notifications\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-8db69e2f.js'))
			},
			{
				id: "/api/admin/notifications/read-all",
				pattern: /^\/api\/admin\/notifications\/read-all\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-f75c1a1b.js'))
			},
			{
				id: "/api/admin/notifications/[id]/read",
				pattern: /^\/api\/admin\/notifications\/([^/]+?)\/read\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-6ffbba77.js'))
			},
			{
				id: "/api/admin/[table]",
				pattern: /^\/api\/admin\/([^/]+?)\/?$/,
				params: [{"name":"table","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-fd55f083.js'))
			},
			{
				id: "/api/analytics",
				pattern: /^\/api\/analytics\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-efe025e8.js'))
			},
			{
				id: "/api/auth/login",
				pattern: /^\/api\/auth\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-12d281df.js'))
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
				endpoint: __memo(() => import('./chunks/_server-9a16aeb1.js'))
			},
			{
				id: "/api/auth/shifts",
				pattern: /^\/api\/auth\/shifts\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-a8115972.js'))
			},
			{
				id: "/api/cashiers",
				pattern: /^\/api\/cashiers\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-200e296f.js'))
			},
			{
				id: "/api/chat/broadcast",
				pattern: /^\/api\/chat\/broadcast\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-60601cb8.js'))
			},
			{
				id: "/api/chat/conversations",
				pattern: /^\/api\/chat\/conversations\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-b6c84288.js'))
			},
			{
				id: "/api/chat/messages",
				pattern: /^\/api\/chat\/messages\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-741b6f87.js'))
			},
			{
				id: "/api/chat/messages/read",
				pattern: /^\/api\/chat\/messages\/read\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-c7f87bae.js'))
			},
			{
				id: "/api/chat/unread",
				pattern: /^\/api\/chat\/unread\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-1b40a8cd.js'))
			},
			{
				id: "/api/chat/users",
				pattern: /^\/api\/chat\/users\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-9066d7b6.js'))
			},
			{
				id: "/api/dashboard/dokter/referrals",
				pattern: /^\/api\/dashboard\/dokter\/referrals\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-50de7740.js'))
			},
			{
				id: "/api/dashboard/dokter/stats",
				pattern: /^\/api\/dashboard\/dokter\/stats\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-eb19bf64.js'))
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
				endpoint: __memo(() => import('./chunks/_server-92dd82c3.js'))
			},
			{
				id: "/api/documents",
				pattern: /^\/api\/documents\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-be97ee64.js'))
			},
			{
				id: "/api/documents/[id]",
				pattern: /^\/api\/documents\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-0291379d.js'))
			},
			{
				id: "/api/encounters",
				pattern: /^\/api\/encounters\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-110e4ef2.js'))
			},
			{
				id: "/api/encounters/[id]",
				pattern: /^\/api\/encounters\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-1eb86f4b.js'))
			},
			{
				id: "/api/encounters/[id]/pdf",
				pattern: /^\/api\/encounters\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-2aacdacd.js'))
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
				endpoint: __memo(() => import('./chunks/_server-9893dd1a.js'))
			},
			{
				id: "/api/patients/[id]",
				pattern: /^\/api\/patients\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-5346fad9.js'))
			},
			{
				id: "/api/patients/[id]/medical-background",
				pattern: /^\/api\/patients\/([^/]+?)\/medical-background\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-d3f4d623.js'))
			},
			{
				id: "/api/patients/[id]/pdf",
				pattern: /^\/api\/patients\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-29fb3019.js'))
			},
			{
				id: "/api/payments",
				pattern: /^\/api\/payments\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-874fc6f1.js'))
			},
			{
				id: "/api/payments/[id]/pdf",
				pattern: /^\/api\/payments\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-a544458e.js'))
			},
			{
				id: "/api/pdf",
				pattern: /^\/api\/pdf\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-bc8066b4.js'))
			},
			{
				id: "/api/realtime/stream",
				pattern: /^\/api\/realtime\/stream\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-07f6ce97.js'))
			},
			{
				id: "/api/realtime/subscribe",
				pattern: /^\/api\/realtime\/subscribe\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-e84ef7b7.js'))
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
				endpoint: __memo(() => import('./chunks/_server-446725ed.js'))
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
