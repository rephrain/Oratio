import { c as create_ssr_component, o as onDestroy, f as escape } from './ssr-4a5a9ccc.js';
import { b as getJakartaDateString, d as formatCurrency } from './formatters-ab7a5011.js';
import { d as PAYMENT_TYPES } from './constants-4ae1dfb2.js';

const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let filteredPayments;
  let totalIncome;
  let normalPaymentsCount;
  let voucherPaymentsCount;
  let payments = [];
  getJakartaDateString();
  [
    { value: "", label: "All Payment Types" },
    ...PAYMENT_TYPES.map((p) => ({ value: p.label, label: p.label }))
  ];
  onDestroy(() => {
  });
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    filteredPayments = payments.filter((p) => {
      return true;
    });
    [...filteredPayments].sort((a, b) => {
      let valA, valB;
      {
        valA = new Date(a.payment?.paid_at || 0).getTime();
        valB = new Date(b.payment?.paid_at || 0).getTime();
      }
      if (typeof valA === "string")
        valA = valA.toLowerCase();
      if (typeof valB === "string")
        valB = valB.toLowerCase();
      if (valA < valB)
        return 1;
      if (valA > valB)
        return -1;
      return 0;
    });
    totalIncome = payments.reduce((sum, p) => sum + (p.payment?.total_paid || 0), 0);
    normalPaymentsCount = payments.filter((p) => p.payment?.payment_mode === "NORMAL").length;
    voucherPaymentsCount = payments.filter((p) => p.payment?.payment_mode === "VOUCHER").length;
    $$rendered = `<div class="h-full flex flex-col"> <div class="flex gap-4 mb-8 shrink-0"><div class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"><div class="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center" data-svelte-h="svelte-wi2yus"><span class="material-symbols-outlined">payments</span></div> <div><p class="text-2xl font-bold text-slate-900">${escape(formatCurrency(totalIncome))}</p> <p class="text-xs font-medium text-slate-500 uppercase tracking-wide" data-svelte-h="svelte-1ca2ah4">Total Income</p></div></div> <div class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"><div class="size-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center" data-svelte-h="svelte-16fv0ms"><span class="material-symbols-outlined">receipt_long</span></div> <div><p class="text-2xl font-bold text-slate-900">${escape(payments.length)}</p> <p class="text-xs font-medium text-slate-500 uppercase tracking-wide" data-svelte-h="svelte-22l6ja">Total Transactions</p></div></div> <div class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"><div class="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center" data-svelte-h="svelte-8ussih"><span class="material-symbols-outlined">check_circle</span></div> <div><p class="text-2xl font-bold text-slate-900">${escape(normalPaymentsCount)}</p> <p class="text-xs font-medium text-slate-500 uppercase tracking-wide" data-svelte-h="svelte-19o9v9z">Normal Payments</p></div></div> <div class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4"><div class="size-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center" data-svelte-h="svelte-g7lj8t"><span class="material-symbols-outlined">redeem</span></div> <div><p class="text-2xl font-bold text-slate-900">${escape(voucherPaymentsCount)}</p> <p class="text-xs font-medium text-slate-500 uppercase tracking-wide" data-svelte-h="svelte-127l3cg">Voucher Payments</p></div></div></div>  <div class="flex items-center justify-between mb-6 shrink-0" data-svelte-h="svelte-hueqte"><div><h2 class="text-xl font-bold text-slate-900">Payment History</h2> <p class="text-sm text-slate-500">Manage and review all completed transactions</p></div></div> ${`<div class="flex-1 flex flex-col items-center justify-center text-slate-400" data-svelte-h="svelte-fi1uia"><span class="material-symbols-outlined text-4xl animate-spin mb-2" style="animation: spin 1s linear infinite;">refresh</span> <p>Memuat pembayaran...</p></div>`} </div>`;
  } while (!$$settled);
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-bdffd1a0.js.map
