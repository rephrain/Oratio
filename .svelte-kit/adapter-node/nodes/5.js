import * as universal from '../entries/pages/suster/_layout.js';

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/suster/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/suster/+layout.js";
export const imports = ["_app/immutable/nodes/5.da4e311d.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/AppShell.f812ac4d.js","_app/immutable/chunks/Sidebar.a8878ee4.js","_app/immutable/chunks/each.6186f7ce.js","_app/immutable/chunks/stores.e32ead25.js","_app/immutable/chunks/singletons.0288d15a.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.3ee9e420.js","_app/immutable/chunks/ChatPanel.cf5c728b.js","_app/immutable/chunks/toast.9573ca74.js","_app/immutable/chunks/layout.2e1f5827.js","_app/immutable/chunks/realtimeConnection.2c212399.js","_app/immutable/chunks/formatters.80495444.js","_app/immutable/chunks/ConnectionStatus.772eb7df.js"];
export const stylesheets = ["_app/immutable/assets/AppShell.04069988.css","_app/immutable/assets/ChatPanel.e1cf91b9.css","_app/immutable/assets/ConnectionStatus.fafdb7e4.css"];
export const fonts = [];
