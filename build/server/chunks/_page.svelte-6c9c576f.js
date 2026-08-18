import { c as create_ssr_component, a as subscribe, o as onDestroy, v as validate_component } from './ssr-4a5a9ccc.js';
import { p as page } from './stores-468b91fe.js';
import { c as isPatientProfileOpen, h as headerTitle, b as isSidebarHidden } from './layout-3873cafe.js';
import { T as ToothDetailPanel } from './ToothDetailPanel-e2107141.js';
import './index2-bd557b7d.js';
import './SearchableSelect-4aa6c810.js';
import './constants-29762e90.js';

function parseSurfaces(surfaceStr, toothNum) {
  let s = (surfaceStr || "").toUpperCase().trim();
  if (s === "")
    return ["center"];
  if (["TOP", "BOTTOM", "LEFT", "RIGHT", "CENTER"].includes(s))
    return [s.toLowerCase()];
  const quad = String(toothNum)[0];
  const isUpper = ["1", "2", "5", "6"].includes(quad);
  const isRightSideOfMouth = ["1", "4", "5", "8"].includes(quad);
  let result = [];
  if (s.includes("O") || s.includes("I"))
    result.push("center");
  if (s.includes("M"))
    result.push(isRightSideOfMouth ? "right" : "left");
  if (s.includes("D"))
    result.push(isRightSideOfMouth ? "left" : "right");
  if (s.includes("V") || s.includes("B") || s.includes("F") || s.includes("LA"))
    result.push(isUpper ? "top" : "bottom");
  if (s.includes("P") || s.includes("L") && !s.includes("LA"))
    result.push(isUpper ? "bottom" : "top");
  if (result.length === 0)
    return ["center"];
  return result;
}
async function searchTerminology(term, system) {
  const res = await fetch(`/api/terminologies?term=${encodeURIComponent(term)}&system=${encodeURIComponent(system)}`);
  const data = await res.json();
  return data.results || [];
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  let $$unsubscribe_isPatientProfileOpen;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_isPatientProfileOpen = subscribe(isPatientProfileOpen, (value) => value);
  let { data } = $$props;
  const encounterId = $page.params.encounterId;
  let encounter = null;
  let odontogram = {
    dentition_type: "Adult",
    occlusi: "",
    torus_palatinus: "Tidak Ada",
    torus_mandibularis: "Tidak Ada",
    palatum: "",
    diastema: "Tidak Ada",
    gigi_anomali: "Tidak Ada",
    details: []
  };
  let availableItems = [];
  let patientHistory = [];
  let doctorsList = [];
  let showToothModal = false;
  let toothDetail = {
    tooth_number: "",
    keadaan: "",
    protesa: "",
    bahan_protesa: "",
    restorations: [],
    diagnoses: [],
    procedures: []
  };
  onDestroy(() => {
    fetch("/api/encounters/lock", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encounterId })
    });
    headerTitle.set(null);
    isSidebarHidden.set(false);
  });
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    patientHistory.filter((h) => h.encounter?.id !== encounterId);
    [
      { value: "", label: "Select Doctor" },
      ...doctorsList.filter((doc) => doc.doctor_code !== encounter?.doctor_code).map((doc) => ({
        value: doc.doctor_code,
        label: doc.name,
        sublabel: doc.doctor_code,
        meta: {
          profile_image_url: doc.profile_image_url,
          is_doctor: true
        }
      }))
    ];
    availableItems.map((ai) => ({
      value: ai.id,
      label: ai.name,
      sublabel: `${ai.item_group || "Umum"} • Rp ${parseFloat(ai.price || 0).toLocaleString("id-ID")}`,
      meta: {
        icon: "medical_services",
        iconColor: "bg-primary/10 text-primary"
      }
    }));
    (odontogram.details || []).reduce(
      (acc, d) => {
        const tn = String(d.tooth_number);
        if (!acc[tn])
          acc[tn] = {};
        let color = "#10B981";
        if (d.keadaan === "car" || d.keadaan === "cav")
          color = "#ffffff";
        else if (d.keadaan === "mis")
          color = "#9CA3AF";
        else if (d.keadaan === "sou")
          color = "#ffffff";
        if (d.keadaan === "mis")
          acc[tn].global = "Missing";
        else if (d.protesa === "prd" || d.protesa === "fld" || d.protesa === "fud")
          acc[tn].global = "Missing";
        else if (d.keadaan === "nvt")
          acc[tn].global = "Non-Vital";
        else if (d.keadaan === "non")
          acc[tn].global = "NON";
        else if (d.keadaan === "une")
          acc[tn].global = "UNE";
        else if (d.keadaan === "pre")
          acc[tn].global = "PRE";
        else if (d.keadaan === "ano")
          acc[tn].global = "ANO";
        else if (d.keadaan === "cfr" || d.keadaan === "frx")
          acc[tn].global = "Fracture";
        else if (d.keadaan === "rrx")
          acc[tn].global = "Sisa Akar";
        if (d.restorations && d.restorations.length > 0) {
          d.restorations.forEach((r) => {
            const mappedData = {
              condition: d.keadaan,
              color,
              restoration: r.restorasi,
              bahan_restorasi: r.bahan_restorasi,
              protesa: d.protesa
            };
            if (r.surfaces && r.surfaces.length > 0) {
              r.surfaces.forEach((s) => {
                const keys = parseSurfaces(s, tn);
                keys.forEach((k) => {
                  if (!acc[tn][k])
                    acc[tn][k] = mappedData;
                });
              });
            } else {
              if (!acc[tn]["center"])
                acc[tn]["center"] = mappedData;
            }
            if (r.restorasi === "rct") {
              acc[tn].global = "RCT";
            } else if (r.restorasi === "pon") {
              acc[tn].global = "Missing";
            }
          });
        } else {
          const mappedData = {
            condition: d.keadaan,
            color,
            restoration: null,
            bahan_restorasi: null,
            protesa: d.protesa
          };
          if (!acc[tn]["center"])
            acc[tn]["center"] = mappedData;
        }
        return acc;
      },
      {}
    );
    $$rendered = `<div>${`<div style="text-align: center; padding: var(--space-16);" data-svelte-h="svelte-2ll8s8"><div class="spinner spinner-lg" style="margin: 0 auto;"></div> <p class="text-muted mt-4">Memuat encounter...</p></div>`}</div>  ${``}  ${validate_component(ToothDetailPanel, "ToothDetailPanel").$$render(
      $$result,
      {
        initialData: toothDetail,
        searchIcd10Fn: (term) => searchTerminology(term, "ICD-10"),
        searchIcd9Fn: (term) => searchTerminology(term, "ICD-9-CM"),
        show: showToothModal
      },
      {
        show: ($$value) => {
          showToothModal = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  $$unsubscribe_page();
  $$unsubscribe_isPatientProfileOpen();
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-6c9c576f.js.map
