import { c as create_ssr_component, d as createEventDispatcher, e as escape, p as null_to_empty, f as add_attribute } from "./ssr.js";
/* empty css                                          */const css = {
  code: ".custom-scrollbar.svelte-1yx88wq::-webkit-scrollbar{width:5px}.custom-scrollbar.svelte-1yx88wq::-webkit-scrollbar-track{background:transparent}.custom-scrollbar.svelte-1yx88wq::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}.custom-scrollbar.svelte-1yx88wq::-webkit-scrollbar-thumb:hover{background:#94a3b8}",
  map: null
};
const RichSelect = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let selectedOption;
  let { value = null } = $$props;
  let { options = [] } = $$props;
  let { placeholder = "Pilih..." } = $$props;
  let { label = "" } = $$props;
  let { required = false } = $$props;
  let { disabled = false } = $$props;
  let { loading = false } = $$props;
  let { wrapperClass = "form-group" } = $$props;
  createEventDispatcher();
  let wrapper;
  if ($$props.value === void 0 && $$bindings.value && value !== void 0)
    $$bindings.value(value);
  if ($$props.options === void 0 && $$bindings.options && options !== void 0)
    $$bindings.options(options);
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0)
    $$bindings.placeholder(placeholder);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.required === void 0 && $$bindings.required && required !== void 0)
    $$bindings.required(required);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  if ($$props.loading === void 0 && $$bindings.loading && loading !== void 0)
    $$bindings.loading(loading);
  if ($$props.wrapperClass === void 0 && $$bindings.wrapperClass && wrapperClass !== void 0)
    $$bindings.wrapperClass(wrapperClass);
  $$result.css.add(css);
  selectedOption = options.find((o) => o.value === value) || null;
  return `<div class="${escape(null_to_empty(wrapperClass), true) + " svelte-1yx88wq"}"${add_attribute("this", wrapper, 0)}>${label ? `<label class="form-label font-bold text-slate-700 text-xs mb-2 block uppercase tracking-wider">${escape(label)} ${required ? `<span class="text-red-500 ml-1" data-svelte-h="svelte-wply4x">*</span>` : ``}</label>` : ``} <div class="relative"><button type="button" class="${"w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border " + escape(
    "border-slate-200",
    true
  ) + " bg-white text-left transition-all hover:border-primary/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed h-[50px]"}" ${disabled || loading ? "disabled" : ""}><div class="flex items-center gap-3 overflow-hidden">${loading ? `<div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0" data-svelte-h="svelte-1i6zgsb"><span class="material-symbols-outlined text-primary text-sm animate-spin" style="animation: spin 1s linear infinite;">refresh</span></div>` : `${selectedOption?.meta?.profile_image_url || selectedOption?.meta?.is_doctor || selectedOption?.meta?.icon ? `<div class="relative shrink-0">${selectedOption?.meta?.profile_image_url ? `<img${add_attribute("src", selectedOption.meta.profile_image_url, 0)}${add_attribute("alt", selectedOption.label, 0)} class="w-8 h-8 rounded-full object-cover border border-slate-100">` : `${selectedOption?.meta?.icon ? `<div class="${"w-8 h-8 rounded-full " + escape(selectedOption.meta.iconColor || "bg-slate-100 text-slate-500", true) + " flex items-center justify-center svelte-1yx88wq"}"><span class="material-symbols-outlined text-[18px]">${escape(selectedOption.meta.icon)}</span></div>` : `${selectedOption ? `<div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">${escape(selectedOption.label.substring(0, 2).toUpperCase())}</div>` : `<div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center" data-svelte-h="svelte-o73soj"><span class="material-symbols-outlined text-slate-400 text-sm">person</span></div>`}`}`}</div>` : ``}`} <div class="flex flex-col min-w-0"><span class="${"truncate text-sm " + escape(
    selectedOption ? "text-slate-800 font-bold" : "text-slate-400 font-medium",
    true
  )}">${escape(loading ? "Memuat..." : selectedOption ? selectedOption.label : placeholder)}</span> ${selectedOption?.sublabel ? `<span class="text-[10px] text-slate-400 font-medium truncate leading-none mt-0.5">${escape(selectedOption.sublabel)}</span>` : ``}</div></div> <div class="${"flex items-center justify-center w-6 h-6 rounded-full " + escape(
    "text-slate-400",
    true
  ) + " transition-colors shrink-0"}"><span class="${"material-symbols-outlined text-[20px] transition-transform duration-300 " + escape("", true)}">expand_more</span></div></button> ${``}</div> </div>`;
});
export {
  RichSelect as R
};
