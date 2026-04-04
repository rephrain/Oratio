import { c as create_ssr_component, f as createEventDispatcher, e as escape, j as compute_slots } from "./ssr.js";
const Modal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$slots = compute_slots(slots);
  let { show = false } = $$props;
  let { title = "" } = $$props;
  let { size = "" } = $$props;
  createEventDispatcher();
  if ($$props.show === void 0 && $$bindings.show && show !== void 0)
    $$bindings.show(show);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  return ` ${show ? `<div class="modal-overlay"><div class="${"modal-content " + escape(size ? "modal-" + size : "", true)}"><div class="modal-header"><h2>${escape(title)}</h2> <button class="btn btn-ghost btn-icon" data-svelte-h="svelte-11ku10c">✕</button></div> <div class="modal-body">${slots.default ? slots.default({}) : ``}</div> ${$$slots.footer ? `<div class="modal-footer">${slots.footer ? slots.footer({}) : ``}</div>` : ``}</div></div>` : ``}`;
});
export {
  Modal as M
};
