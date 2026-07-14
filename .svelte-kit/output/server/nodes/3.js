import * as universal from '../entries/pages/dokter/_layout.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/dokter/+layout.js";
export const imports = ["_app/immutable/nodes/3.dd54c79e.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/index.bf6392ca.js","_app/immutable/chunks/AppShell.d41be4b7.js","_app/immutable/chunks/Sidebar.c4f3e656.js","_app/immutable/chunks/each.44dcaf76.js","_app/immutable/chunks/stores.f4dc9f53.js","_app/immutable/chunks/singletons.1f7328cd.js","_app/immutable/chunks/index.67c9fa51.js","_app/immutable/chunks/paths.7e516e97.js","_app/immutable/chunks/ChatPanel.b937c3b8.js","_app/immutable/chunks/toast.d7d7982b.js","_app/immutable/chunks/layout.3be533b8.js","_app/immutable/chunks/realtimeConnection.94db45ea.js","_app/immutable/chunks/formatters.80495444.js","_app/immutable/chunks/ConnectionStatus.18c4e9c9.js"];
export const stylesheets = ["_app/immutable/assets/AppShell.04069988.css","_app/immutable/assets/ChatPanel.e1cf91b9.css","_app/immutable/assets/ConnectionStatus.fafdb7e4.css"];
export const fonts = [];
