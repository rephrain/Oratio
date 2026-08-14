import "fs";
import "path";
import "puppeteer";
const MINIMAL_PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n3 0 obj <</Type /Page /Parent 2 0 R /Resources <<>> /MediaBox [0 0 612 792]>> endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000111 00000 n \ntrailer <</Size 4 /Root 1 0 R>>\nstartxref\n190\n%%EOF"
);
async function generatePatientProfilePdf(data) {
  return MINIMAL_PDF;
}
async function generateSoapFormPdf(data) {
  return MINIMAL_PDF;
}
async function generateSoapWhoFormPdf(data) {
  return MINIMAL_PDF;
}
async function generatePaymentReceiptPdf(data) {
  return MINIMAL_PDF;
}
export {
  generateSoapFormPdf as a,
  generatePatientProfilePdf as b,
  generatePaymentReceiptPdf as c,
  generateSoapWhoFormPdf as g
};
