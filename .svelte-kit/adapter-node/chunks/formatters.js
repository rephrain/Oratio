function generatePatientId(lastId) {
  if (!lastId)
    return "O000001";
  const num = parseInt(lastId.substring(1)) + 1;
  return "O" + String(num).padStart(6, "0");
}
function generateEncounterId(doctorCode, lastId) {
  const now = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const prefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${doctorCode}`;
  if (!lastId || !lastId.startsWith(prefix)) {
    return prefix + "000001";
  }
  const num = parseInt(lastId.substring(prefix.length)) + 1;
  return prefix + String(num).padStart(6, "0");
}
export {
  generatePatientId as a,
  generateEncounterId as g
};
