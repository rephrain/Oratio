

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_table_/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/7.2ac5effa.js","_app/immutable/chunks/scheduler.f04c06a7.js","_app/immutable/chunks/index.e1be8bf6.js","_app/immutable/chunks/each.24015208.js","_app/immutable/chunks/stores.8ec5d781.js","_app/immutable/chunks/singletons.0009ad37.js","_app/immutable/chunks/index.2d48bea8.js","_app/immutable/chunks/DataTable.e45826b1.js","_app/immutable/chunks/Modal.95da47de.js","_app/immutable/chunks/constants.344e4b61.js","_app/immutable/chunks/toast.7d8b2320.js"];
export const stylesheets = ["_app/immutable/assets/DataTable.70755a72.css"];
export const fonts = [];
