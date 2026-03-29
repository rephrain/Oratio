
import root from '../root.svelte';
import { set_building } from '__sveltekit/environment';
import { set_assets } from '__sveltekit/paths';
import { set_private_env, set_public_env } from '../../../node_modules/@sveltejs/kit/src/runtime/shared-server.js';

export const options = {
	app_template_contains_nonce: false,
	csp: {"mode":"auto","directives":{"upgrade-insecure-requests":false,"block-all-mixed-content":false},"reportOnly":{"upgrade-insecure-requests":false,"block-all-mixed-content":false}},
	csrf_check_origin: true,
	track_server_fetches: false,
	embedded: false,
	env_public_prefix: 'PUBLIC_',
	env_private_prefix: '',
	hooks: null, // added lazily, via `get_hooks`
	preload_strategy: "modulepreload",
	root,
	service_worker: false,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!doctype html>\r\n<html lang=\"id\">\r\n\r\n<head>\r\n\t<meta charset=\"utf-8\" />\r\n\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\r\n\t<meta name=\"description\" content=\"Oratio Clinic – Sistem Rekam Medis Kedokteran Gigi\" />\r\n\t<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\r\n\t<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />\r\n\t<link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap\"\r\n\t\trel=\"stylesheet\" />\r\n\t<link href=\"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap\"\r\n\t\trel=\"stylesheet\" />\r\n\t<script src=\"https://cdn.tailwindcss.com?plugins=forms,container-queries\"></script>\r\n\t<script>\r\n\t\ttailwind.config = {\r\n\t\t\tdarkMode: \"class\",\r\n\t\t\ttheme: {\r\n\t\t\t\textend: {\r\n\t\t\t\t\tcolors: {\r\n\t\t\t\t\t\t\"primary\": \"var(--tw-primary)\",\r\n\t\t\t\t\t\t\"secondary\": \"var(--tw-secondary)\",\r\n\t\t\t\t\t\t\"accent\": \"var(--tw-accent)\",\r\n\t\t\t\t\t\t\"forest\": \"var(--tw-forest)\",\r\n\t\t\t\t\t\t\"background-light\": \"var(--tw-bg-light)\",\r\n\t\t\t\t\t\t\"background-dark\": \"var(--tw-bg-dark)\",\r\n\t\t\t\t\t},\r\n\t\t\t\t\tfontFamily: {\r\n\t\t\t\t\t\t\"display\": [\"Inter\", \"sans-serif\"]\r\n\t\t\t\t\t},\r\n\t\t\t\t\tborderRadius: {\r\n\t\t\t\t\t\t\"DEFAULT\": \"0.5rem\",\r\n\t\t\t\t\t\t\"lg\": \"1rem\",\r\n\t\t\t\t\t\t\"xl\": \"1.5rem\",\r\n\t\t\t\t\t\t\"2xl\": \"2rem\",\r\n\t\t\t\t\t\t\"full\": \"9999px\"\r\n\t\t\t\t\t},\r\n\t\t\t\t\tkeyframes: {\r\n\t\t\t\t\t\tfadeInUp: {\r\n\t\t\t\t\t\t\t'0%': { opacity: '0', transform: 'translateY(20px)' },\r\n\t\t\t\t\t\t\t'100%': { opacity: '1', transform: 'translateY(0)' },\r\n\t\t\t\t\t\t},\r\n\t\t\t\t\t\tfloat: {\r\n\t\t\t\t\t\t\t'0%, 100%': { transform: 'translate(0, 0)' },\r\n\t\t\t\t\t\t\t'50%': { transform: 'translate(-20px, 20px)' },\r\n\t\t\t\t\t\t},\r\n\t\t\t\t\t\tfloatReverse: {\r\n\t\t\t\t\t\t\t'0%, 100%': { transform: 'translate(0, 0)' },\r\n\t\t\t\t\t\t\t'50%': { transform: 'translate(20px, -20px)' },\r\n\t\t\t\t\t\t}\r\n\t\t\t\t\t},\r\n\t\t\t\t\tanimation: {\r\n\t\t\t\t\t\tfadeInUp: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',\r\n\t\t\t\t\t\tfloat: 'float 20s ease-in-out infinite',\r\n\t\t\t\t\t\tfloatReverse: 'floatReverse 25s ease-in-out infinite',\r\n\t\t\t\t\t}\r\n\t\t\t\t},\r\n\t\t\t},\r\n\t\t}\r\n\t</script>\r\n\t<style>\r\n\t\t:root {\r\n\t\t\t--tw-primary: #3b82f6;\r\n\t\t\t--tw-secondary: #E0E0E0;\r\n\t\t\t--tw-accent: #0ea5e9;\r\n\t\t\t--tw-forest: #064E3B;\r\n\t\t\t--tw-bg-light: #f8fafc;\r\n\t\t\t--tw-bg-dark: #0f172a;\r\n\t\t}\r\n\t</style>\r\n\t<title>Oratio Clinic</title>\r\n\t" + head + "\r\n</head>\r\n\r\n<body data-sveltekit-preload-data=\"hover\">\r\n\t<div style=\"display: contents\">" + body + "</div>\r\n</body>\r\n\r\n</html>",
		error: ({ status, message }) => "<!doctype html>\r\n<html lang=\"en\">\r\n\t<head>\r\n\t\t<meta charset=\"utf-8\" />\r\n\t\t<title>" + message + "</title>\r\n\r\n\t\t<style>\r\n\t\t\tbody {\r\n\t\t\t\t--bg: white;\r\n\t\t\t\t--fg: #222;\r\n\t\t\t\t--divider: #ccc;\r\n\t\t\t\tbackground: var(--bg);\r\n\t\t\t\tcolor: var(--fg);\r\n\t\t\t\tfont-family:\r\n\t\t\t\t\tsystem-ui,\r\n\t\t\t\t\t-apple-system,\r\n\t\t\t\t\tBlinkMacSystemFont,\r\n\t\t\t\t\t'Segoe UI',\r\n\t\t\t\t\tRoboto,\r\n\t\t\t\t\tOxygen,\r\n\t\t\t\t\tUbuntu,\r\n\t\t\t\t\tCantarell,\r\n\t\t\t\t\t'Open Sans',\r\n\t\t\t\t\t'Helvetica Neue',\r\n\t\t\t\t\tsans-serif;\r\n\t\t\t\tdisplay: flex;\r\n\t\t\t\talign-items: center;\r\n\t\t\t\tjustify-content: center;\r\n\t\t\t\theight: 100vh;\r\n\t\t\t\tmargin: 0;\r\n\t\t\t}\r\n\r\n\t\t\t.error {\r\n\t\t\t\tdisplay: flex;\r\n\t\t\t\talign-items: center;\r\n\t\t\t\tmax-width: 32rem;\r\n\t\t\t\tmargin: 0 1rem;\r\n\t\t\t}\r\n\r\n\t\t\t.status {\r\n\t\t\t\tfont-weight: 200;\r\n\t\t\t\tfont-size: 3rem;\r\n\t\t\t\tline-height: 1;\r\n\t\t\t\tposition: relative;\r\n\t\t\t\ttop: -0.05rem;\r\n\t\t\t}\r\n\r\n\t\t\t.message {\r\n\t\t\t\tborder-left: 1px solid var(--divider);\r\n\t\t\t\tpadding: 0 0 0 1rem;\r\n\t\t\t\tmargin: 0 0 0 1rem;\r\n\t\t\t\tmin-height: 2.5rem;\r\n\t\t\t\tdisplay: flex;\r\n\t\t\t\talign-items: center;\r\n\t\t\t}\r\n\r\n\t\t\t.message h1 {\r\n\t\t\t\tfont-weight: 400;\r\n\t\t\t\tfont-size: 1em;\r\n\t\t\t\tmargin: 0;\r\n\t\t\t}\r\n\r\n\t\t\t@media (prefers-color-scheme: dark) {\r\n\t\t\t\tbody {\r\n\t\t\t\t\t--bg: #222;\r\n\t\t\t\t\t--fg: #ddd;\r\n\t\t\t\t\t--divider: #666;\r\n\t\t\t\t}\r\n\t\t\t}\r\n\t\t</style>\r\n\t</head>\r\n\t<body>\r\n\t\t<div class=\"error\">\r\n\t\t\t<span class=\"status\">" + status + "</span>\r\n\t\t\t<div class=\"message\">\r\n\t\t\t\t<h1>" + message + "</h1>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</body>\r\n</html>\r\n"
	},
	version_hash: "1v0do7y"
};

export function get_hooks() {
	return import("../../../src/hooks.server.js");
}

export { set_assets, set_building, set_private_env, set_public_env };
