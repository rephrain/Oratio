import { c as create_ssr_component, h as createEventDispatcher, e as escape, f as add_attribute } from './ssr-631a3160.js';

const SearchableSelect = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { value = null } = $$props;
  let { options = [] } = $$props;
  let { placeholder = "Ketik untuk mencari..." } = $$props;
  let { label = "" } = $$props;
  let { required = false } = $$props;
  let { disabled = false } = $$props;
  let { searchFn = null } = $$props;
  let { minChars = 2 } = $$props;
  createEventDispatcher();
  let searchTerm = "";
  let inputEl;
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
  if ($$props.searchFn === void 0 && $$bindings.searchFn && searchFn !== void 0)
    $$bindings.searchFn(searchFn);
  if ($$props.minChars === void 0 && $$bindings.minChars && minChars !== void 0)
    $$bindings.minChars(minChars);
  value ? options.find((o) => o.value === value)?.label || value : "";
  return `<div class="form-group">${label ? `<label class="form-label">${escape(label)} ${required ? `<span class="required" data-svelte-h="svelte-1ttfsis">*</span>` : ``}</label>` : ``} <div class="search-wrapper"><input type="text" class="form-input"${add_attribute("placeholder", placeholder, 0)} ${disabled ? "disabled" : ""}${add_attribute("this", inputEl, 0)}${add_attribute("value", searchTerm, 0)}> ${value ? `<button class="btn btn-ghost btn-icon btn-sm" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%);" data-svelte-h="svelte-cinoah">✕</button>` : ``} ${``}</div></div>`;
});

export { SearchableSelect as S };
//# sourceMappingURL=SearchableSelect-39e7cc67.js.map
