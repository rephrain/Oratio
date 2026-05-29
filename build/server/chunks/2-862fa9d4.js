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

const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-02dfd6f0.js')).default;
const universal_id = "src/routes/admin/+layout.js";
const imports = ["_app/immutable/nodes/2.3d467076.js","_app/immutable/chunks/scheduler.034cee57.js","_app/immutable/chunks/index.98d8086f.js","_app/immutable/chunks/NotificationPanel.f818985e.js","_app/immutable/chunks/each.37e91fe0.js","_app/immutable/chunks/toast.c09e6c6b.js","_app/immutable/chunks/index.8449654f.js","_app/immutable/chunks/layout.a14078e9.js","_app/immutable/chunks/stores.773b3f2b.js","_app/immutable/chunks/singletons.e1db24ca.js","_app/immutable/chunks/paths.dff09679.js"];
const stylesheets = ["_app/immutable/assets/2.2e2ef6c2.css","_app/immutable/assets/NotificationPanel.27608108.css"];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _layout as universal, universal_id };
//# sourceMappingURL=2-862fa9d4.js.map
