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

const index = 4;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-d39e2ef0.js')).default;
const universal_id = "src/routes/kasir/+layout.js";
const imports = ["_app/immutable/nodes/4.39e04140.js","_app/immutable/chunks/scheduler.58399093.js","_app/immutable/chunks/index.53af2136.js","_app/immutable/chunks/ChatPanel.3203f883.js","_app/immutable/chunks/each.daf10c35.js","_app/immutable/chunks/toast.9573ca74.js","_app/immutable/chunks/index.87639c41.js","_app/immutable/chunks/layout.2e1f5827.js","_app/immutable/chunks/realtimeConnection.2c212399.js","_app/immutable/chunks/Sidebar.54dd7f4a.js","_app/immutable/chunks/stores.f6618fb1.js","_app/immutable/chunks/singletons.46f4611c.js","_app/immutable/chunks/paths.1f0655d5.js","_app/immutable/chunks/formatters.80495444.js"];
const stylesheets = ["_app/immutable/assets/4.250f402a.css","_app/immutable/assets/ChatPanel.e1cf91b9.css"];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _layout as universal, universal_id };
//# sourceMappingURL=4-5b96541f.js.map
