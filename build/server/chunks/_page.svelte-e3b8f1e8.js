import { c as create_ssr_component, a as subscribe, f as escape, v as validate_component } from './ssr-4a5a9ccc.js';
import { p as page } from './stores-468b91fe.js';
import { d as PAYMENT_TYPES } from './constants-4ae1dfb2.js';
import { R as RichSelect } from './RichSelect-b89df93a.js';

/* empty css                                                           */const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let cashierName;
  let dischargedEncounterOptions;
  let selectedPaymentType;
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  let { data } = $$props;
  let dischargedEncounters = [];
  let selectedEncounterId = "";
  let items = [];
  let paymentType = "";
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    cashierName = data?.user?.name || "Kasir";
    dischargedEncounterOptions = [
      {
        value: "",
        label: "-- Cari atau Pilih Pasien yang Selesai Pemeriksaan --"
      },
      ...dischargedEncounters.map((enc) => ({
        value: enc.encounter.id,
        label: enc.patient_name || "Unknown Patient",
        sublabel: `Antrean #${enc.encounter.queue_number} — MR: ${enc.patient?.id || "-"}`,
        meta: {
          profile_image_url: enc.patient?.profile_image_url || null
        }
      }))
    ];
    selectedPaymentType = PAYMENT_TYPES.find((pt) => pt.label === paymentType);
    selectedPaymentType?.code?.startsWith("EDC-") || false;
    selectedPaymentType?.code || "";
    items.reduce((sum, it) => sum + (parseFloat(it.subtotal) || 0), 0);
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-k82ij6_START -->${$$result.title = `<title>Pembayaran — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-k82ij6_END -->`, ""} <div class="p-8 space-y-8 max-w-6xl mx-auto"> <div class="flex items-end justify-between"><div><h2 class="text-3xl font-extrabold text-slate-800 tracking-tight" data-svelte-h="svelte-cl3p0l">Proses Pembayaran</h2> <p class="text-slate-500 mt-1 flex items-center gap-2"><span class="material-symbols-outlined text-sm" data-svelte-h="svelte-3j3j9">account_circle</span>
				Petugas Kasir: <span class="font-semibold text-primary">${escape(cashierName)}</span></p></div> ${``}</div>  <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative z-20"><label class="block text-sm font-bold text-slate-700 mb-2" data-svelte-h="svelte-q3b4m2">Pilih Antrean Pasien (Status: Discharged)</label> <div class="relative">${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        options: dischargedEncounterOptions,
        placeholder: "-- Cari atau Pilih Pasien yang Selesai Pemeriksaan --",
        value: selectedEncounterId
      },
      {
        value: ($$value) => {
          selectedEncounterId = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div></div> ${``}</div>`;
  } while (!$$settled);
  $$unsubscribe_page();
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-e3b8f1e8.js.map
