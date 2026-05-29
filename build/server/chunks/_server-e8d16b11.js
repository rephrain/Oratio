import { c as create_ssr_component, d as createEventDispatcher, e as each, v as validate_component, f as escape, g as add_attribute } from './ssr-a9ffd974.js';
import { j as json } from './index-d7f43214.js';

const css = {
  code: "@keyframes svelte-ftr9rg-jumpFlash{0%{transform:scale(1);filter:drop-shadow(0 0 0 rgba(16, 185, 129, 0))}25%{transform:scale(1.15) translateY(-5px);filter:drop-shadow(0 8px 12px rgba(16, 185, 129, 0.4))}50%{transform:scale(1.05) translateY(-2px);filter:drop-shadow(0 4px 6px rgba(16, 185, 129, 0.2))}100%{transform:scale(1);filter:drop-shadow(0 0 0 rgba(16, 185, 129, 0))}}.animate-jump-flash.svelte-ftr9rg{animation:svelte-ftr9rg-jumpFlash 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;z-index:20}",
  map: null
};
function getStroke(surfaceData, defaultStroke = "#94a3b8") {
  if (surfaceData?.condition === "car" || surfaceData?.condition === "cav")
    return "#000000";
  return defaultStroke;
}
function getStrokeWidth(surfaceData, defaultWidth = "2.5") {
  if (surfaceData?.condition === "car" || surfaceData?.condition === "cav")
    return "4";
  return defaultWidth;
}
const ToothDiagram = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isFMC;
  let isPOC;
  let isIPX;
  let isBridgeComponent;
  let isDenture;
  let isAnterior;
  let cond;
  let isRightSideOfMouth;
  let drawArrowLeft;
  let drawArrowRight;
  let drawCurvedAbove;
  let drawCurvedBelow;
  let points;
  let { number = "" } = $$props;
  let { top = null } = $$props;
  let { right = null } = $$props;
  let { bottom = null } = $$props;
  let { left = null } = $$props;
  let { center = null } = $$props;
  let { globalCondition = null } = $$props;
  let { selectedSurface = "" } = $$props;
  createEventDispatcher();
  function getFill(surfaceData, position) {
    if (selectedSurface === position)
      return "var(--primary-light)";
    if (surfaceData?.bahan_restorasi === "amf")
      return "#000000";
    if (surfaceData?.bahan_restorasi === "cof")
      return "url(#hatch-green)";
    if (surfaceData?.bahan_restorasi === "fis")
      return "url(#hatch-red)";
    if (surfaceData?.color)
      return surfaceData.color;
    return "#ffffff";
  }
  if ($$props.number === void 0 && $$bindings.number && number !== void 0)
    $$bindings.number(number);
  if ($$props.top === void 0 && $$bindings.top && top !== void 0)
    $$bindings.top(top);
  if ($$props.right === void 0 && $$bindings.right && right !== void 0)
    $$bindings.right(right);
  if ($$props.bottom === void 0 && $$bindings.bottom && bottom !== void 0)
    $$bindings.bottom(bottom);
  if ($$props.left === void 0 && $$bindings.left && left !== void 0)
    $$bindings.left(left);
  if ($$props.center === void 0 && $$bindings.center && center !== void 0)
    $$bindings.center(center);
  if ($$props.globalCondition === void 0 && $$bindings.globalCondition && globalCondition !== void 0)
    $$bindings.globalCondition(globalCondition);
  if ($$props.selectedSurface === void 0 && $$bindings.selectedSurface && selectedSurface !== void 0)
    $$bindings.selectedSurface(selectedSurface);
  $$result.css.add(css);
  JSON.stringify({
    top,
    right,
    bottom,
    left,
    center,
    globalCondition
  });
  isFMC = ["fmc", "meb", "gmc"].includes(center?.restoration);
  isPOC = ["poc", "pob", "mpc"].includes(center?.restoration);
  isIPX = center?.restoration === "ipx";
  isBridgeComponent = ["meb", "pob", "pon", "abu", "Bridge"].includes(center?.restoration);
  isDenture = ["prd", "fld", "fud", "pld", "pud", "hld", "hud"].includes(center?.protesa);
  isAnterior = ["1", "2", "3"].includes(String(number).charAt(1));
  cond = center?.condition || "";
  isRightSideOfMouth = ["1", "4", "5", "8"].includes(String(number).charAt(0));
  ["1", "2", "5", "6"].includes(String(number).charAt(0));
  drawArrowLeft = false;
  drawArrowRight = false;
  drawCurvedAbove = false;
  drawCurvedBelow = false;
  {
    if (cond.includes(".ver")) {
      if (cond === "M.ver") {
        if (isRightSideOfMouth)
          drawArrowRight = true;
        else
          drawArrowLeft = true;
      } else if (cond === "D.ver") {
        if (isRightSideOfMouth)
          drawArrowLeft = true;
        else
          drawArrowRight = true;
      } else if (["ML.ver", "DL.ver", "MP.ver", "DP.ver"].includes(cond) || cond === "L.ver" || cond === "P.ver") {
        drawCurvedBelow = true;
      } else {
        drawCurvedAbove = true;
      }
    }
  }
  points = isAnterior ? {
    top: "0,0 100,0 75,35 25,35",
    right: "100,0 100,100 75,65 75,35",
    bottom: "0,100 100,100 75,65 25,65",
    left: "0,0 0,100 25,65 25,35",
    center: "25,35 75,35 75,65 25,65"
  } : {
    top: "0,0 100,0 75,25 25,25",
    right: "100,0 100,100 75,75 75,25",
    bottom: "0,100 100,100 75,75 25,75",
    left: "0,0 0,100 25,75 25,25",
    center: "25,25 75,25 75,75 25,75"
  };
  return `<div class="${"flex flex-col items-center gap-1.5 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105 relative " + escape("", true) + " svelte-ftr9rg"}"><div class="text-[13px] font-bold text-slate-500 leading-none pb-0.5 pointer-events-none select-none">${escape(number)}</div> <div class="relative cursor-pointer filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:drop-shadow-[0_3px_5px_rgba(0,0,0,0.1)] transition-all duration-200"><svg width="42" height="42" viewBox="0 0 100 100" class="overflow-visible group"><defs><pattern id="hatch-green" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#10B981"></rect><line x1="0" y1="0" x2="0" y2="10" stroke="#065F46" stroke-width="2"></line></pattern><pattern id="hatch-red" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#FCA5A5"></rect><line x1="0" y1="0" x2="0" y2="10" stroke="#991B1B" stroke-width="2"></line></pattern><pattern id="hatch-vertical-black" width="6" height="10" patternUnits="userSpaceOnUse"><line x1="3" y1="0" x2="3" y2="10" stroke="#000000" stroke-width="1.5"></line></pattern></defs><polygon${add_attribute("points", points.top, 0)}${add_attribute("fill", getFill(top, "top"), 0)}${add_attribute("stroke", getStroke(top), 0)}${add_attribute("stroke-width", getStrokeWidth(top), 0)} stroke-linejoin="round" class="transition-all duration-200 hover:opacity-85 hover:stroke-primary"></polygon>${isBridgeComponent ? ` <line x1="-5" y1="-15" x2="105" y2="-15" stroke="#000000" stroke-width="6" class="pointer-events-none"></line>` : ``}<polygon${add_attribute("points", points.right, 0)}${add_attribute("fill", getFill(right, "right"), 0)}${add_attribute("stroke", getStroke(right), 0)}${add_attribute("stroke-width", getStrokeWidth(right), 0)} stroke-linejoin="round" class="transition-all duration-200 hover:opacity-85 hover:stroke-primary"></polygon><polygon${add_attribute("points", points.bottom, 0)}${add_attribute("fill", getFill(bottom, "bottom"), 0)}${add_attribute("stroke", getStroke(bottom), 0)}${add_attribute("stroke-width", getStrokeWidth(bottom), 0)} stroke-linejoin="round" class="transition-all duration-200 hover:opacity-85 hover:stroke-primary"></polygon><polygon${add_attribute("points", points.left, 0)}${add_attribute("fill", getFill(left, "left"), 0)}${add_attribute("stroke", getStroke(left), 0)}${add_attribute("stroke-width", getStrokeWidth(left), 0)} stroke-linejoin="round" class="transition-all duration-200 hover:opacity-85 hover:stroke-primary"></polygon><polygon${add_attribute("points", points.center, 0)}${add_attribute("fill", getFill(center, "center"), 0)}${add_attribute("stroke", getStroke(center), 0)}${add_attribute("stroke-width", getStrokeWidth(center), 0)} stroke-linejoin="round" class="transition-all duration-200 hover:opacity-85 hover:stroke-primary z-10"></polygon>${isFMC || isPOC ? ` <rect x="0" y="0" width="100" height="100" fill="none" stroke="#000000" stroke-width="6" class="pointer-events-none"></rect>` : ``}${isPOC ? ` <rect x="0" y="0" width="100" height="100" fill="url(#hatch-vertical-black)" class="pointer-events-none"></rect>` : ``}${globalCondition === "Extracted" || globalCondition === "Missing" ? ` <line x1="10" y1="-10" x2="90" y2="110" stroke="#000000" stroke-width="8" stroke-linecap="round" class="pointer-events-none"></line> <line x1="90" y1="-10" x2="10" y2="110" stroke="#000000" stroke-width="8" stroke-linecap="round" class="pointer-events-none"></line>` : ``}${globalCondition === "Non-Vital" ? ` <polygon points="35,100 65,100 50,125" fill="#ffffff" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" class="pointer-events-none"></polygon>` : ``}${globalCondition === "RCT" ? ` <polygon points="35,100 65,100 50,125" fill="#000000" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" class="pointer-events-none"></polygon>` : ``}${globalCondition === "Fracture" ? ` <g class="pointer-events-none" stroke="#000000" stroke-width="4" stroke-linecap="square"><line x1="20" y1="35" x2="80" y2="35"></line><line x1="20" y1="65" x2="80" y2="65"></line><line x1="45" y1="20" x2="35" y2="80"></line><line x1="65" y1="20" x2="55" y2="80"></line></g>` : ``}${globalCondition === "Sisa Akar" ? ` <line x1="15" y1="-10" x2="45" y2="115" stroke="#000000" stroke-width="10" stroke-linecap="round" class="pointer-events-none"></line> <line x1="85" y1="-25" x2="45" y2="115" stroke="#000000" stroke-width="10" stroke-linecap="round" class="pointer-events-none"></line>` : ``}${["NON", "UNE", "PRE", "ANO"].includes(globalCondition) ? ` <text x="50" y="15" font-family="sans-serif" font-size="28" font-weight="900" fill="#000000" stroke="#ffffff" stroke-width="2" paint-order="stroke" text-anchor="middle" class="pointer-events-none">${escape(globalCondition)}</text>` : ``}${isIPX ? ` <text x="50" y="145" font-family="serif" font-size="28" font-weight="900" fill="#000000" text-anchor="middle" class="pointer-events-none" dominant-baseline="hanging">IPX</text>` : ``}${isDenture ? ` <text x="50"${add_attribute("y", isIPX ? 175 : 145, 0)} font-family="serif" font-size="28" font-weight="900" fill="#000000" text-anchor="middle" class="pointer-events-none" dominant-baseline="hanging">PRD/FLD</text>` : ``}${drawArrowLeft ? `<g class="pointer-events-none" stroke="#000000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="80" y1="-15" x2="20" y2="-15"></line><polyline points="35,-25 20,-15 35,-5"></polyline></g>` : ``}${drawArrowRight ? `<g class="pointer-events-none" stroke="#000000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="20" y1="-15" x2="80" y2="-15"></line><polyline points="65,-25 80,-15 65,-5"></polyline></g>` : ``}${drawCurvedAbove ? `<g class="pointer-events-none" stroke="#000000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M 30,-5 Q 50,-35 80,-10"></path><polyline points="65,-15 80,-10 75,-25"></polyline></g>` : ``}${drawCurvedBelow ? `<g class="pointer-events-none" stroke="#000000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M 30,105 Q 50,135 80,110"></path><polyline points="65,115 80,110 75,125"></polyline></g>` : ``}</svg></div> </div>`;
});
const OdontogramChart = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { odontogramData = {} } = $$props;
  let { selectedTooth = null } = $$props;
  let { selectedSurfaceArea = null } = $$props;
  createEventDispatcher();
  const quadrant1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const quadrant2 = [21, 22, 23, 24, 25, 26, 27, 28];
  const quadrant4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const quadrant3 = [31, 32, 33, 34, 35, 36, 37, 38];
  const quad5 = [55, 54, 53, 52, 51];
  const quad6 = [61, 62, 63, 64, 65];
  const quad8 = [85, 84, 83, 82, 81];
  const quad7 = [71, 72, 73, 74, 75];
  if ($$props.odontogramData === void 0 && $$bindings.odontogramData && odontogramData !== void 0)
    $$bindings.odontogramData(odontogramData);
  if ($$props.selectedTooth === void 0 && $$bindings.selectedTooth && selectedTooth !== void 0)
    $$bindings.selectedTooth(selectedTooth);
  if ($$props.selectedSurfaceArea === void 0 && $$bindings.selectedSurfaceArea && selectedSurfaceArea !== void 0)
    $$bindings.selectedSurfaceArea(selectedSurfaceArea);
  return `<div class="min-w-[700px] max-w-4xl mx-auto py-8"> <div class="flex justify-center mb-6"><div class="flex gap-1.5 flex-1 justify-end pr-6">${each(quadrant1, (num) => {
    let td = odontogramData[String(num)] || {};
    return ` ${validate_component(ToothDiagram, "ToothDiagram").$$render(
      $$result,
      {
        number: num,
        top: td.top,
        right: td.right,
        bottom: td.bottom,
        left: td.left,
        center: td.center,
        globalCondition: td.global,
        selectedSurface: selectedTooth == num ? selectedSurfaceArea : ""
      },
      {},
      {}
    )}`;
  })}</div> <div class="w-1 bg-slate-200 rounded-full mx-2 opacity-80"></div> <div class="flex gap-1.5 flex-1 justify-start pl-6">${each(quadrant2, (num) => {
    let td = odontogramData[String(num)] || {};
    return ` ${validate_component(ToothDiagram, "ToothDiagram").$$render(
      $$result,
      {
        number: num,
        top: td.top,
        right: td.right,
        bottom: td.bottom,
        left: td.left,
        center: td.center,
        globalCondition: td.global,
        selectedSurface: selectedTooth == num ? selectedSurfaceArea : ""
      },
      {},
      {}
    )}`;
  })}</div></div>  <div class="flex justify-center mb-6 opacity-95 scale-90 transform origin-top"><div class="flex gap-1.5 flex-1 justify-end pr-6">${each(quad5, (num) => {
    let td = odontogramData[String(num)] || {};
    return ` ${validate_component(ToothDiagram, "ToothDiagram").$$render(
      $$result,
      {
        number: num,
        top: td.top,
        right: td.right,
        bottom: td.bottom,
        left: td.left,
        center: td.center,
        globalCondition: td.global,
        selectedSurface: selectedTooth == num ? selectedSurfaceArea : ""
      },
      {},
      {}
    )}`;
  })}</div> <div class="w-1 bg-slate-200 rounded-full mx-2 opacity-80"></div> <div class="flex gap-1.5 flex-1 justify-start pl-6">${each(quad6, (num) => {
    let td = odontogramData[String(num)] || {};
    return ` ${validate_component(ToothDiagram, "ToothDiagram").$$render(
      $$result,
      {
        number: num,
        top: td.top,
        right: td.right,
        bottom: td.bottom,
        left: td.left,
        center: td.center,
        globalCondition: td.global,
        selectedSurface: selectedTooth == num ? selectedSurfaceArea : ""
      },
      {},
      {}
    )}`;
  })}</div></div>  <div class="flex justify-center mb-6 opacity-95 scale-90 transform origin-bottom"><div class="flex gap-1.5 flex-1 justify-end pr-6">${each(quad8, (num) => {
    let td = odontogramData[String(num)] || {};
    return ` ${validate_component(ToothDiagram, "ToothDiagram").$$render(
      $$result,
      {
        number: num,
        top: td.top,
        right: td.right,
        bottom: td.bottom,
        left: td.left,
        center: td.center,
        globalCondition: td.global,
        selectedSurface: selectedTooth == num ? selectedSurfaceArea : ""
      },
      {},
      {}
    )}`;
  })}</div> <div class="w-1 bg-slate-200 rounded-full mx-2 opacity-80"></div> <div class="flex gap-1.5 flex-1 justify-start pl-6">${each(quad7, (num) => {
    let td = odontogramData[String(num)] || {};
    return ` ${validate_component(ToothDiagram, "ToothDiagram").$$render(
      $$result,
      {
        number: num,
        top: td.top,
        right: td.right,
        bottom: td.bottom,
        left: td.left,
        center: td.center,
        globalCondition: td.global,
        selectedSurface: selectedTooth == num ? selectedSurfaceArea : ""
      },
      {},
      {}
    )}`;
  })}</div></div>  <div class="flex justify-center"><div class="flex gap-1.5 flex-1 justify-end pr-6">${each(quadrant4, (num) => {
    let td = odontogramData[String(num)] || {};
    return ` ${validate_component(ToothDiagram, "ToothDiagram").$$render(
      $$result,
      {
        number: num,
        top: td.top,
        right: td.right,
        bottom: td.bottom,
        left: td.left,
        center: td.center,
        globalCondition: td.global,
        selectedSurface: selectedTooth == num && selectedSurfaceArea ? selectedSurfaceArea : ""
      },
      {},
      {}
    )}`;
  })}</div> <div class="w-1 bg-slate-200 rounded-full mx-2 opacity-80"></div> <div class="flex gap-1.5 flex-1 justify-start pl-6">${each(quadrant3, (num) => {
    let td = odontogramData[String(num)] || {};
    return ` ${validate_component(ToothDiagram, "ToothDiagram").$$render(
      $$result,
      {
        number: num,
        top: td.top,
        right: td.right,
        bottom: td.bottom,
        left: td.left,
        center: td.center,
        globalCondition: td.global,
        selectedSurface: selectedTooth == num && selectedSurfaceArea ? selectedSurfaceArea : ""
      },
      {},
      {}
    )}`;
  })}</div></div></div>`;
});
function GET() {
  try {
    const { html, css: css2 } = OdontogramChart.render({ odontogramData: {} });
    return json({ html, css: css2.code });
  } catch (e) {
    return json({ error: e.message, stack: e.stack }, { status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server-e8d16b11.js.map
