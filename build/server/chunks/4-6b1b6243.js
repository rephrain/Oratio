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
const component = async () => component_cache ??= (await import('./_layout.svelte-c22399a3.js')).default;
const universal_id = "src/routes/kasir/+layout.js";
const imports = ["_app/immutable/nodes/4.5fe7029b.js","_app/immutable/chunks/scheduler.d0219a17.js","_app/immutable/chunks/index.b4a1576b.js","_app/immutable/chunks/Toast.dcf5f8d9.js","_app/immutable/chunks/each.7096ff1d.js","_app/immutable/chunks/stores.be7b7c50.js","_app/immutable/chunks/singletons.b78c0928.js","_app/immutable/chunks/index.367da6d0.js","_app/immutable/chunks/toast.d55168c0.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _layout as universal, universal_id };
//# sourceMappingURL=4-6b1b6243.js.map
