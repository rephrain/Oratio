import { c as create_ssr_component, e as escape, d as each, f as add_attribute } from './ssr-631a3160.js';
import { P as PAYMENT_TYPES } from './constants-6b2e336d.js';

const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let cashierName;
  let selectedPaymentType;
  let { data } = $$props;
  let dischargedEncounters = [];
  let items = [];
  let paymentType = "";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  cashierName = data?.user?.name || "Kasir";
  selectedPaymentType = PAYMENT_TYPES.find((pt) => pt.label === paymentType);
  selectedPaymentType?.code?.startsWith("EDC-") || false;
  selectedPaymentType?.code || "";
  items.reduce((sum, it) => sum + (parseFloat(it.subtotal) || 0), 0);
  return `${$$result.head += `<!-- HEAD_svelte-x804iy_START -->${$$result.title = `<title>Pembayaran — Oratio Dental</title>`, ""}<!-- HEAD_svelte-x804iy_END -->`, ""} <div><div class="flex items-center justify-between mb-6" data-svelte-h="svelte-w9c712"><h1 class="page-title" style="margin: 0;">Pembayaran</h1> <a href="/kasir" class="btn btn-secondary">← Kembali</a></div> <div class="card mb-6"><div class="flex items-center gap-2 mb-4"><span class="badge badge-primary">👤 Kasir: ${escape(cashierName)}</span></div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-e9i7po">Pilih Encounter (Status: Discharged)</label> <select class="form-select"><option value="" data-svelte-h="svelte-289a2j">-- Pilih Encounter --</option>${each(dischargedEncounters, (enc) => {
    return `<option${add_attribute("value", enc.encounter.id, 0)}>#${escape(enc.encounter.queue_number)} — ${escape(enc.patient_name)} (${escape(enc.encounter.id)})
					</option>`;
  })}</select></div></div> ${``}</div>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-d71093f1.js.map
