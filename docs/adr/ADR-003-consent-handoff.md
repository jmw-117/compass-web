# ADR-003 — User-controlled handoff without an intake backend

**Decision:** Reports are generated fully in the browser and available without contact details. Explicit share preview → user can copy summary or open verified Silverspark WhatsApp `wa.me` link. The visitor sends the message manually; app does not record confirmed receipt. No Worker, form endpoint, database or analytics.

**Outgoing summary:** opaque assessment ID, readiness range or incomplete marker, primary path ID, two action IDs, voluntary invitation. No names, customer details, financial records, sensitive business narrative or complete questionnaire. Limit text length and preview exactly. The URL is not proof of authenticity or delivery.

**Fallbacks:** copy text; locally readable report; print/save PDF best effort. All contact channels must be verified by human before publishing. External app disclosures and privacy notice required.
