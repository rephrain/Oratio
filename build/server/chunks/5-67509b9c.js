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

const index = 5;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-d0eb42da.js')).default;
const universal_id = "src/routes/suster/+layout.js";
const imports = ["_app/immutable/nodes/5.da4e311d.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/AppShell.f812ac4d.js","_app/immutable/chunks/Sidebar.a8878ee4.js","_app/immutable/chunks/each.6186f7ce.js","_app/immutable/chunks/stores.e32ead25.js","_app/immutable/chunks/singletons.0288d15a.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/paths.3ee9e420.js","_app/immutable/chunks/ChatPanel.cf5c728b.js","_app/immutable/chunks/toast.9573ca74.js","_app/immutable/chunks/layout.2e1f5827.js","_app/immutable/chunks/realtimeConnection.2c212399.js","_app/immutable/chunks/formatters.80495444.js","_app/immutable/chunks/ConnectionStatus.772eb7df.js"];
const stylesheets = ["_app/immutable/assets/AppShell.04069988.css","_app/immutable/assets/ChatPanel.e1cf91b9.css","_app/immutable/assets/ConnectionStatus.fafdb7e4.css"];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _layout as universal, universal_id };
//# sourceMappingURL=5-67509b9c.js.map
