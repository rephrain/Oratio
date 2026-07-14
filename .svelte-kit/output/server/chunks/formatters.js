function formatDate(date, locale = "id-ID") {
  if (!date)
    return "-";
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Jakarta"
  });
}
function getJakartaDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(/* @__PURE__ */ new Date());
}
function getJakartaMonthString() {
  return getJakartaDateString().substring(0, 7);
}
function formatCurrency(amount) {
  if (amount == null)
    return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(amount);
}
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
  generateEncounterId as a,
  getJakartaDateString as b,
  getJakartaMonthString as c,
  formatCurrency as d,
  formatDate as f,
  generatePatientId as g
};
