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
		client: {"start":"_app/immutable/entry/start.1f5860f5.js","app":"_app/immutable/entry/app.68698bc9.js","imports":["_app/immutable/entry/start.1f5860f5.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/singletons.0288d15a.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.3ee9e420.js","_app/immutable/entry/app.68698bc9.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./chunks/0-86cfd343.js')),
			__memo(() => import('./chunks/1-5e76a4a3.js')),
			__memo(() => import('./chunks/2-f9ad1a1b.js')),
			__memo(() => import('./chunks/3-5b89cfc5.js')),
			__memo(() => import('./chunks/4-feb70105.js')),
			__memo(() => import('./chunks/5-67509b9c.js')),
			__memo(() => import('./chunks/6-10858d4d.js')),
			__memo(() => import('./chunks/7-2e6a9c7d.js')),
			__memo(() => import('./chunks/8-b8c0b972.js')),
			__memo(() => import('./chunks/9-2e5ccc42.js')),
			__memo(() => import('./chunks/10-074cd5ea.js')),
			__memo(() => import('./chunks/11-84a5cf5c.js')),
			__memo(() => import('./chunks/12-8eef37bb.js')),
			__memo(() => import('./chunks/13-21722e63.js')),
			__memo(() => import('./chunks/14-4410f805.js')),
			__memo(() => import('./chunks/15-72731192.js')),
			__memo(() => import('./chunks/16-ec4679e4.js')),
			__memo(() => import('./chunks/17-6caac6b0.js')),
			__memo(() => import('./chunks/18-b67eb513.js')),
			__memo(() => import('./chunks/19-d6047f8a.js')),
			__memo(() => import('./chunks/20-e37c563c.js')),
			__memo(() => import('./chunks/21-89e3c9bc.js')),
			__memo(() => import('./chunks/22-d2488fdd.js')),
			__memo(() => import('./chunks/23-3462c387.js')),
			__memo(() => import('./chunks/24-5f10c643.js')),
			__memo(() => import('./chunks/25-85eddb38.js')),
			__memo(() => import('./chunks/26-e5838665.js')),
			__memo(() => import('./chunks/27-0563464f.js'))
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
				endpoint: __memo(() => import('./chunks/_server-54e787f6.js'))
			},
			{
				id: "/api/admin/notifications",
				pattern: /^\/api\/admin\/notifications\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-6fa49af2.js'))
			},
			{
				id: "/api/admin/notifications/read-all",
				pattern: /^\/api\/admin\/notifications\/read-all\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-a8a7eea0.js'))
			},
			{
				id: "/api/admin/notifications/[id]/read",
				pattern: /^\/api\/admin\/notifications\/([^/]+?)\/read\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-6905ac14.js'))
			},
			{
				id: "/api/admin/[table]",
				pattern: /^\/api\/admin\/([^/]+?)\/?$/,
				params: [{"name":"table","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-b39c2df8.js'))
			},
			{
				id: "/api/analytics",
				pattern: /^\/api\/analytics\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-32d8c3ee.js'))
			},
			{
				id: "/api/auth/login",
				pattern: /^\/api\/auth\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-9d1eb896.js'))
			},
			{
				id: "/api/auth/logout",
				pattern: /^\/api\/auth\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-b1bbc6e4.js'))
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
				endpoint: __memo(() => import('./chunks/_server-c006d416.js'))
			},
			{
				id: "/api/auth/refresh",
				pattern: /^\/api\/auth\/refresh\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-e9c9ce85.js'))
			},
			{
				id: "/api/auth/shifts",
				pattern: /^\/api\/auth\/shifts\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-f15b2031.js'))
			},
			{
				id: "/api/cashiers",
				pattern: /^\/api\/cashiers\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-e72e1503.js'))
			},
			{
				id: "/api/chat/broadcast",
				pattern: /^\/api\/chat\/broadcast\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-57758080.js'))
			},
			{
				id: "/api/chat/conversations",
				pattern: /^\/api\/chat\/conversations\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-f6727a56.js'))
			},
			{
				id: "/api/chat/messages",
				pattern: /^\/api\/chat\/messages\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-d93afe1b.js'))
			},
			{
				id: "/api/chat/messages/read",
				pattern: /^\/api\/chat\/messages\/read\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-ecb875fa.js'))
			},
			{
				id: "/api/chat/unread",
				pattern: /^\/api\/chat\/unread\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-0cecbe76.js'))
			},
			{
				id: "/api/chat/users",
				pattern: /^\/api\/chat\/users\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-85cecf9c.js'))
			},
			{
				id: "/api/dashboard/dokter/referrals",
				pattern: /^\/api\/dashboard\/dokter\/referrals\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-e66117c1.js'))
			},
			{
				id: "/api/dashboard/dokter/stats",
				pattern: /^\/api\/dashboard\/dokter\/stats\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-c7ba11a3.js'))
			},
			{
				id: "/api/dashboard/suster/doctors",
				pattern: /^\/api\/dashboard\/suster\/doctors\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-970081d5.js'))
			},
			{
				id: "/api/dashboard/suster/referrals",
				pattern: /^\/api\/dashboard\/suster\/referrals\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-b5a6cdd2.js'))
			},
			{
				id: "/api/dashboard/suster/stats",
				pattern: /^\/api\/dashboard\/suster\/stats\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-749dbefc.js'))
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
				endpoint: __memo(() => import('./chunks/_server-38359df8.js'))
			},
			{
				id: "/api/documents",
				pattern: /^\/api\/documents\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-d9ed58ab.js'))
			},
			{
				id: "/api/documents/[id]",
				pattern: /^\/api\/documents\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-5d3eb10a.js'))
			},
			{
				id: "/api/encounters",
				pattern: /^\/api\/encounters\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-d5848e1d.js'))
			},
			{
				id: "/api/encounters/lock",
				pattern: /^\/api\/encounters\/lock\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-0f2131a7.js'))
			},
			{
				id: "/api/encounters/[id]",
				pattern: /^\/api\/encounters\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-2ef3cb2d.js'))
			},
			{
				id: "/api/encounters/[id]/pdf",
				pattern: /^\/api\/encounters\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-f33198b8.js'))
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
				endpoint: __memo(() => import('./chunks/_server-07d8edd3.js'))
			},
			{
				id: "/api/patients/[id]",
				pattern: /^\/api\/patients\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-7ae8795b.js'))
			},
			{
				id: "/api/patients/[id]/medical-background",
				pattern: /^\/api\/patients\/([^/]+?)\/medical-background\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-7c3fff33.js'))
			},
			{
				id: "/api/patients/[id]/pdf",
				pattern: /^\/api\/patients\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-27bfbe7a.js'))
			},
			{
				id: "/api/payments",
				pattern: /^\/api\/payments\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-58b96275.js'))
			},
			{
				id: "/api/payments/[id]/pdf",
				pattern: /^\/api\/payments\/([^/]+?)\/pdf\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-b0218527.js'))
			},
			{
				id: "/api/pdf",
				pattern: /^\/api\/pdf\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-66756fc9.js'))
			},
			{
				id: "/api/realtime/stream",
				pattern: /^\/api\/realtime\/stream\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-aed63f59.js'))
			},
			{
				id: "/api/realtime/subscribe",
				pattern: /^\/api\/realtime\/subscribe\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-5a2eb912.js'))
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
				endpoint: __memo(() => import('./chunks/_server-160a82e8.js'))
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
				page: { layouts: [0,5,], errors: [1,,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/suster/patient/[patientId]",
				pattern: /^\/suster\/patient\/([^/]+?)\/?$/,
				params: [{"name":"patientId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,5,], errors: [1,,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/suster/[encounterId]",
				pattern: /^\/suster\/([^/]+?)\/?$/,
				params: [{"name":"encounterId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,5,], errors: [1,,], leaf: 27 },
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
