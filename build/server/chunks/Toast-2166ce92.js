import { c as create_ssr_component, e as escape, v as validate_component, a as subscribe, d as each, o as onDestroy } from './ssr-631a3160.js';
import { d as derived, w as writable } from './index2-ea876b50.js';
import { t as toasts } from './toast2-22a880f7.js';

const currentUser = writable(null);
derived(currentUser, ($user) => !!$user);
derived(currentUser, ($user) => $user?.role || null);
const css = {
  code: ".shift-timer.svelte-16gowge{display:flex;align-items:center;gap:8px;padding:4px 12px;border-radius:var(--radius-full);transition:all 0.3s ease}.timer-normal.svelte-16gowge{background-color:var(--primary-light);color:var(--primary)}.timer-warning.svelte-16gowge{background-color:var(--warning-light);color:#92400e}.timer-critical.svelte-16gowge{background-color:var(--danger-light);color:var(--danger)}@keyframes svelte-16gowge-pulse-warn{0%{box-shadow:0 0 0 0 rgba(245, 158, 11, 0.4)}70%{box-shadow:0 0 0 6px rgba(245, 158, 11, 0)}100%{box-shadow:0 0 0 0 rgba(245, 158, 11, 0)}}@keyframes svelte-16gowge-pulse-crit{0%{box-shadow:0 0 0 0 rgba(239, 68, 68, 0.4)}70%{box-shadow:0 0 0 6px rgba(239, 68, 68, 0)}100%{box-shadow:0 0 0 0 rgba(239, 68, 68, 0)}}.timer-warning.pulse.svelte-16gowge{animation:svelte-16gowge-pulse-warn 2s infinite}.timer-critical.pulse.svelte-16gowge{animation:svelte-16gowge-pulse-crit 1s infinite}",
  map: null
};
const ShiftTimer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let shiftEnd = /* @__PURE__ */ new Date();
  shiftEnd.setHours(17, 0, 0, 0);
  let timeRemaining = "Menghitung...";
  let timerClass = "timer-normal";
  onDestroy(() => {
  });
  $$result.css.add(css);
  return `<div class="${"shift-timer " + escape(timerClass, true) + " svelte-16gowge"}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> <span class="font-medium text-sm">Shift s/d ${escape(shiftEnd.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }))} • ${escape(timeRemaining)}</span> </div>`;
});
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title = "" } = $$props;
  let { user = null } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  return `<header class="top-header"><div class="flex items-center gap-4"><h2 style="font-size: var(--font-size-lg); font-weight: 600;">${escape(title)}</h2></div> <div class="flex items-center gap-3">${user?.role === "dokter" ? `${validate_component(ShiftTimer, "ShiftTimer").$$render($$result, {}, {}, {})}` : ``} <span class="text-sm text-muted">${escape(user?.name || "")}</span> <div class="badge badge-primary" style="text-transform: capitalize;">${escape(user?.role || "")}</div></div></header>`;
});
const AppShell = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { user } = $$props;
  let { role } = $$props;
  let { title = "" } = $$props;
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0)
    $$bindings.role(role);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  return `<div class="${"app-shell role-" + escape(role, true)}"><div class="main-content">${validate_component(Header, "Header").$$render($$result, { title, user }, {}, {})} <div class="page-content">${slots.default ? slots.default({}) : ``}</div></div></div>`;
});
const Toast = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $toasts, $$unsubscribe_toasts;
  $$unsubscribe_toasts = subscribe(toasts, (value) => $toasts = value);
  $$unsubscribe_toasts();
  return `<div class="toast-container">${each($toasts, (toast) => {
    return `<div class="${"toast toast-" + escape(toast.type, true)}"><span style="flex: 1;">${escape(toast.message)}</span> <button class="btn btn-ghost btn-icon btn-sm" data-svelte-h="svelte-w3x981">✕</button> </div>`;
  })}</div>`;
});

export { AppShell as A, Toast as T };
//# sourceMappingURL=Toast-2166ce92.js.map
