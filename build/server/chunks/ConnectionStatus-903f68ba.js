import { c as create_ssr_component, a as subscribe, g as add_attribute, f as escape } from './ssr-4a5a9ccc.js';
import { d as connectionStatus } from './ChatPanel-640d5543.js';

const css = {
  code: ".rt-status-container.svelte-1kr0ya1.svelte-1kr0ya1{display:flex;align-items:center;padding:4px 12px;background:rgba(255, 255, 255, 0.6);backdrop-filter:blur(8px);border-radius:100px;border:1px solid rgba(226, 232, 240, 0.8);cursor:help;transition:all 0.3s ease}.rt-status-container.svelte-1kr0ya1.svelte-1kr0ya1:hover{background:#fff;box-shadow:0 4px 12px rgba(0, 0, 0, 0.05)}.rt-indicator.svelte-1kr0ya1.svelte-1kr0ya1{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em}.rt-indicator.svelte-1kr0ya1 .material-symbols-outlined.svelte-1kr0ya1{font-size:16px}.rt-label.svelte-1kr0ya1.svelte-1kr0ya1{display:none}@media(min-width: 768px){.rt-label.svelte-1kr0ya1.svelte-1kr0ya1{display:block}}.rt-pulse.svelte-1kr0ya1.svelte-1kr0ya1{animation:svelte-1kr0ya1-rtPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)}@keyframes svelte-1kr0ya1-rtPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.9)}}",
  map: null
};
const ConnectionStatus = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let config;
  let $connectionStatus, $$unsubscribe_connectionStatus;
  $$unsubscribe_connectionStatus = subscribe(connectionStatus, (value) => $connectionStatus = value);
  const STATUS_CONFIG = {
    connecting: {
      icon: "sync",
      label: "Connecting...",
      class: "text-amber-500",
      pulse: true
    },
    connected: {
      icon: "check_circle",
      label: "Real-time Linked",
      class: "text-emerald-500",
      pulse: false
    },
    disconnected: {
      icon: "cloud_off",
      label: "Offline",
      class: "text-slate-400",
      pulse: false
    },
    error: {
      icon: "error",
      label: "Connection Error",
      class: "text-rose-500",
      pulse: true
    }
  };
  $$result.css.add(css);
  config = STATUS_CONFIG[$connectionStatus] || STATUS_CONFIG.disconnected;
  $$unsubscribe_connectionStatus();
  return `<div class="rt-status-container svelte-1kr0ya1"${add_attribute("title", config.label, 0)}><div class="${"rt-indicator " + escape(config.class, true) + " svelte-1kr0ya1"}"><span class="${"material-symbols-outlined " + escape(config.pulse ? "rt-pulse" : "", true) + " svelte-1kr0ya1"}">${escape(config.icon)}</span> <span class="rt-label svelte-1kr0ya1">${escape(config.label)}</span></div> </div>`;
});

export { ConnectionStatus as C };
//# sourceMappingURL=ConnectionStatus-903f68ba.js.map
