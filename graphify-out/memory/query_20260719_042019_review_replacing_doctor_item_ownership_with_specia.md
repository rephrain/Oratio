---
type: "query"
date: "2026-07-19T04:20:19.386799+00:00"
question: "Review replacing doctor-item ownership with specialization ownership. Analyze database, backend, API, authorization impact, migration plan, and historical encounter safety."
contributor: "graphify"
outcome: "useful"
source_nodes: ["schema.js", "doctorItems", "encounterItems", "authorizationRules.js", "+server.js"]
---

# Q: Review replacing doctor-item ownership with specialization ownership. Analyze database, backend, API, authorization impact, migration plan, and historical encounter safety.

## Answer

Expanded from original query via vocab: [doctor, doctors, item, items, encounter, encounters, authorization, auth, schema, service, api, patient]. Findings: current doctor_items is a doctor_id/item_id join; items admin M2M uses doctorItems; /api/admin/items?doctor_id does not filter because admin GET only filters direct columns; encounter_items snapshots item_id, price_at_time, subtotal and payments/analytics use encounter_items with encounters.doctor_id. Recommendation: introduce specialization entities and specialization_items, assign doctors to specialization separately, keep encounter_items immutable and optionally snapshot specialization/item names for history; replace item availability filtering with explicit API/join; keep encounter authorization on encounter.doctor_id.

## Outcome

- Signal: useful

## Source Nodes

- schema.js
- doctorItems
- encounterItems
- authorizationRules.js
- +server.js