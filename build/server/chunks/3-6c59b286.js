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
const imports = ["_app/immutable/nodes/3.dd54c79e.js","_app/immutable/chunks/scheduler.2a238cd3.js","_app/immutable/chunks/index.bf6392ca.js","_app/immutable/chunks/AppShell.d41be4b7.js","_app/immutable/chunks/Sidebar.c4f3e656.js","_app/immutable/chunks/each.44dcaf76.js","_app/immutable/chunks/stores.f4dc9f53.js","_app/immutable/chunks/singletons.1f7328cd.js","_app/immutable/chunks/index.67c9fa51.js","_app/immutable/chunks/paths.7e516e97.js","_app/immutable/chunks/ChatPanel.b937c3b8.js","_app/immutable/chunks/toast.d7d7982b.js","_app/immutable/chunks/layout.3be533b8.js","_app/immutable/chunks/realtimeConnection.94db45ea.js","_app/immutable/chunks/formatters.80495444.js","_app/immutable/chunks/ConnectionStatus.18c4e9c9.js"];
const stylesheets = ["_app/immutable/assets/AppShell.04069988.css","_app/immutable/assets/ChatPanel.e1cf91b9.css","_app/immutable/assets/ConnectionStatus.fafdb7e4.css"];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _layout as universal, universal_id };
//# sourceMappingURL=3-6c59b286.js.map
