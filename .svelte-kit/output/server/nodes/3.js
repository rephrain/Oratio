import * as universal from '../entries/pages/dokter/_layout.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dokter/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/dokter/+layout.js";
export const imports = ["_app/immutable/nodes/3.5359a1b3.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/AppShell.b609f10a.js","_app/immutable/chunks/Sidebar.54dd7f4a.js","_app/immutable/chunks/each.daf10c35.js","_app/immutable/chunks/stores.f6618fb1.js","_app/immutable/chunks/singletons.46f4611c.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.1f0655d5.js","_app/immutable/chunks/ChatPanel.3203f883.js","_app/immutable/chunks/toast.9573ca74.js","_app/immutable/chunks/layout.2e1f5827.js","_app/immutable/chunks/realtimeConnection.2c212399.js","_app/immutable/chunks/formatters.80495444.js","_app/immutable/chunks/ConnectionStatus.772eb7df.js"];
export const stylesheets = ["_app/immutable/assets/AppShell.04069988.css","_app/immutable/assets/ChatPanel.e1cf91b9.css","_app/immutable/assets/ConnectionStatus.fafdb7e4.css"];
export const fonts = [];
