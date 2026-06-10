import { c as create_ssr_component, d as createEventDispatcher, g as add_attribute, f as escape } from './ssr-4a5a9ccc.js';

const SearchableSelect = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { value = null } = $$props;
  let { options = [] } = $$props;
  let { placeholder = "Ketik untuk mencari..." } = $$props;
  let { label = "" } = $$props;
  let { required = false } = $$props;
  let { disabled = false } = $$props;
  let { searchFn = null } = $$props;
  let { minChars = 2 } = $$props;
  let { inputClass = "form-input" } = $$props;
  let { wrapperClass = "form-group" } = $$props;
  createEventDispatcher();
  let searchTerm = "";
  let inputEl;
  let prevValue = value;
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
  if ($$props.inputClass === void 0 && $$bindings.inputClass && inputClass !== void 0)
    $$bindings.inputClass(inputClass);
  if ($$props.wrapperClass === void 0 && $$bindings.wrapperClass && wrapperClass !== void 0)
    $$bindings.wrapperClass(wrapperClass);
  {
    if (value !== prevValue) {
      if (!value) {
        searchTerm = "";
      }
      prevValue = value;
    }
  }
  value ? options.find((o) => o.value === value)?.label || value : "";
  return `<div${add_attribute("class", wrapperClass, 0)}>${label ? `<label class="form-label">${escape(label)} ${required ? `<span class="required" data-svelte-h="svelte-1ttfsis">*</span>` : ``}</label>` : ``} <div class="search-wrapper"><input type="text"${add_attribute("class", inputClass, 0)}${add_attribute("placeholder", placeholder, 0)} ${disabled ? "disabled" : ""}${add_attribute("this", inputEl, 0)}${add_attribute("value", searchTerm, 0)}> ${value ? `<button class="btn btn-ghost btn-icon btn-sm" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%);" data-svelte-h="svelte-cinoah">✕</button>` : ``} ${``}</div></div>`;
});

export { SearchableSelect as S };
//# sourceMappingURL=SearchableSelect-4aa6c810.js.map
