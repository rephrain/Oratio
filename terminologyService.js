import axios from "axios";

const ecl = "<404684003";
const raw = `http://snomed.info/sct?fhir_vs=ecl/${ecl}`;
const encoded = encodeURIComponent(raw);

const url = `https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=${encoded}&filter=diabetes&count=5`;

try {
    const res = await axios.get(url, {
        headers: {
            Accept: "application/fhir+json",
        },
        timeout: 5000,
    });

    console.log("✅ SUCCESS");
    console.log(res.data.expansion.contains);
} catch (err) {
    console.error("❌ ERROR");
    console.error(err.code, err.message);
}