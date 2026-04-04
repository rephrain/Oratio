import { j as json } from './index-d7f43214.js';

function GET() {
  const now = /* @__PURE__ */ new Date();
  return json({
    serverTime: now.toISOString(),
    localTime: now.toString(),
    offset: now.getTimezoneOffset(),
    tzEnv: process.env.TZ
  });
}

export { GET };
//# sourceMappingURL=_server-174d4b34.js.map
