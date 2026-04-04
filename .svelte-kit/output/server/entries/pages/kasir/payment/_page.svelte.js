import { c as create_ssr_component, e as escape, b as each, d as add_attribute } from "../../../../chunks/ssr.js";
import { P as PAYMENT_TYPES } from "../../../../chunks/constants.js";
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
  return `${$$result.head += `<!-- HEAD_svelte-k82ij6_START -->${$$result.title = `<title>Pembayaran — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-k82ij6_END -->`, ""} <div class="p-8 space-y-8 max-w-6xl mx-auto"> <div class="flex items-end justify-between"><div><h2 class="text-3xl font-extrabold text-slate-800 tracking-tight" data-svelte-h="svelte-cl3p0l">Proses Pembayaran</h2> <p class="text-slate-500 mt-1 flex items-center gap-2"><span class="material-symbols-outlined text-sm" data-svelte-h="svelte-3j3j9">account_circle</span>
				Petugas Kasir: <span class="font-semibold text-primary">${escape(cashierName)}</span></p></div> ${``}</div>  <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative z-20"><label for="queue-select" class="block text-sm font-bold text-slate-700 mb-2" data-svelte-h="svelte-18zazgu">Pilih Antrean Pasien (Status: Discharged)</label> <div class="relative"><select id="queue-select" class="w-full py-3 pl-4 pr-10 rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 appearance-none bg-slate-50 text-sm font-medium cursor-pointer transition-all"><option value="" data-svelte-h="svelte-meu4vf">-- Cari atau Pilih Pasien yang Selesai Pemeriksaan --</option>${each(dischargedEncounters, (enc) => {
    return `<option${add_attribute("value", enc.encounter.id, 0)}>Antrean #${escape(enc.encounter.queue_number)} — ${escape(enc.patient_name)} (MR: ${escape(enc.patient_id)})
					</option>`;
  })}</select> <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" data-svelte-h="svelte-ocoj69"><span class="material-symbols-outlined text-slate-400">expand_more</span></div></div></div> ${``}</div>`;
});
export {
  Page as default
};
