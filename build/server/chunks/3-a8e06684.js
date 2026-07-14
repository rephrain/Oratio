const load = async ({ fetch }) => {
  const res = await fetch("/api/auth/me");
  if (res.ok) {
    const data = await res.json();
    return { user: data.user };
  }
  return { user: null };
};

var _layout = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 3;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-554ee08b.js')).default;
const universal_id = "src/routes/dokter/+layout.js";
const imports = ["_app/immutable/nodes/3.1702e92c.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/index.bf6392ca.js","_app/immutable/chunks/AppShell.7bf53706.js","_app/immutable/chunks/Sidebar.64ba8e29.js","_app/immutable/chunks/each.44dcaf76.js","_app/immutable/chunks/stores.156f02e4.js","_app/immutable/chunks/singletons.3673d942.js","_app/immutable/chunks/index.67c9fa51.js","_app/immutable/chunks/paths.0bf0e0b5.js","_app/immutable/chunks/ChatPanel.b937c3b8.js","_app/immutable/chunks/toast.d7d7982b.js","_app/immutable/chunks/layout.3be533b8.js","_app/immutable/chunks/realtimeConnection.94db45ea.js","_app/immutable/chunks/formatters.80495444.js","_app/immutable/chunks/ConnectionStatus.18c4e9c9.js"];
const stylesheets = ["_app/immutable/assets/AppShell.04069988.css","_app/immutable/assets/ChatPanel.e1cf91b9.css","_app/immutable/assets/ConnectionStatus.fafdb7e4.css"];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _layout as universal, universal_id };
//# sourceMappingURL=3-a8e06684.js.map
