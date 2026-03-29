import { c as create_ssr_component, a as subscribe, e as escape, v as validate_component, b as each, f as add_attribute } from "../../../../chunks/ssr.js";
import { p as page } from "../../../../chunks/stores.js";
import { M as Modal } from "../../../../chunks/Modal.js";
import { T as TOOTH_SURFACES } from "../../../../chunks/constants.js";
const ToothDiagram_svelte_svelte_type_style_lang = "";
const OdontogramChart_svelte_svelte_type_style_lang = "";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { data } = $$props;
  const encounterId = $page.params.encounterId;
  let odontogram = {
    dentition: "permanent",
    occlusi: "",
    torus_palatinus: "Tidak Ada",
    torus_mandibularis: "Tidak Ada",
    palatum: "",
    diastema: "Tidak Ada",
    gigi_anomali: "Tidak Ada",
    details: []
  };
  let showToothModal = false;
  let toothDetail = {
    tooth_number: "",
    surface: "",
    keadaan: "",
    bahan_restorasi: "",
    restorasi: "",
    protesa: "",
    bahan_protesa: "",
    diagnosis_code: "",
    diagnosis_display: "",
    procedure_code: "",
    procedure_display: ""
  };
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    (odontogram.details || []).reduce(
      (acc, d) => {
        if (!acc[d.tooth_number])
          acc[d.tooth_number] = {};
        let color = "#10B981";
        if (d.keadaan && d.keadaan.toUpperCase().includes("CARIES"))
          color = "#EF4444";
        else if (d.keadaan === "MISSING")
          color = "#9CA3AF";
        acc[d.tooth_number].center = {
          condition: d.keadaan,
          color,
          restoration: d.restorasi
        };
        if (d.keadaan === "EXTRACTED")
          acc[d.tooth_number].global = "Extracted";
        else if (d.keadaan === "MISSING")
          acc[d.tooth_number].global = "Missing";
        return acc;
      },
      {}
    );
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-12w82bp_START -->${$$result.title = `<title>Encounter ${escape(encounterId)} — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-12w82bp_END -->`, ""} <div>${`<div style="text-align: center; padding: var(--space-16);" data-svelte-h="svelte-2ll8s8"><div class="spinner spinner-lg" style="margin: 0 auto;"></div> <p class="text-muted mt-4">Memuat encounter...</p></div>`}</div>  ${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Detail Gigi #" + toothDetail.tooth_number,
        size: "lg",
        show: showToothModal
      },
      {
        show: ($$value) => {
          showToothModal = $$value;
          $$settled = false;
        }
      },
      {
        footer: () => {
          return `<div slot="footer"><button class="btn btn-secondary" data-svelte-h="svelte-8n7kax">Batal</button> <button class="btn btn-primary" data-svelte-h="svelte-n9dyk0">💾 Simpan</button></div>`;
        },
        default: () => {
          return `<div class="form-row"><div class="form-group"><label class="form-label" data-svelte-h="svelte-darksu">Permukaan</label> <div class="flex gap-2">${each(TOOTH_SURFACES, (s) => {
            return `<label class="flex items-center gap-1 text-sm"><input type="checkbox" ${toothDetail.surface?.includes(s.key) ? "checked" : ""}> ${escape(s.key)} (${escape(s.label)})
					</label>`;
          })}</div></div></div> <div class="form-row mt-4"><div class="form-group"><label class="form-label" data-svelte-h="svelte-nf3f8t">Keadaan</label> <input class="form-input" placeholder="Kondisi gigi"${add_attribute("value", toothDetail.keadaan, 0)}></div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-12c1thm">Restorasi</label> <input class="form-input" placeholder="Jenis restorasi"${add_attribute("value", toothDetail.restorasi, 0)}></div></div> <div class="form-row mt-4"><div class="form-group"><label class="form-label" data-svelte-h="svelte-1yjps5r">Diagnosa (ICD-10)</label> <input class="form-input" placeholder="Kode"${add_attribute("value", toothDetail.diagnosis_code, 0)}> <input class="form-input mt-2" placeholder="Deskripsi"${add_attribute("value", toothDetail.diagnosis_display, 0)}></div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-smfnw2">Tindakan (ICD-9-CM)</label> <input class="form-input" placeholder="Kode"${add_attribute("value", toothDetail.procedure_code, 0)}> <input class="form-input mt-2" placeholder="Deskripsi"${add_attribute("value", toothDetail.procedure_display, 0)}></div></div>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_page();
  return $$rendered;
});
export {
  Page as default
};
