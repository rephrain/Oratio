import { j as json } from "../../../../chunks/index.js";
function GET() {
  const now = /* @__PURE__ */ new Date();
  return json({
    serverTime: now.toISOString(),
    localTime: now.toString(),
    offset: now.getTimezoneOffset(),
    tzEnv: process.env.TZ
  });
}
export {
  GET
};
