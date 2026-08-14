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
export {
  getJakartaDateString as a,
  getJakartaMonthString as b,
  formatCurrency as c,
  formatDate as f,
  generatePatientId as g
};
