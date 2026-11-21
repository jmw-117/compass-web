# Compass validation and release decisions

## Real-business pilot — external validation pending

Use the invitation, consent checklist, observation sheet and independent consultant rubric in [the pilot package](S0_VALIDATION_PACKAGE.md). Record the deployed question and rule versions. The synthetic cases are software fixtures.

Recruit approximately 10–15 consenting businesses across sole proprietors, small businesses, established SMEs and enterprise departments. Include first-time AI users, paper-based workflows and consequential uses. Declining has no commercial consequence. Participants may skip questions or withdraw. Ask for fictional examples, never customer records. Obtain privacy review of the notice, storage location, withdrawal contact and retention period before recruitment. Separate consent records from pseudonymous observations. Limit access to researchers and independent reviewers. Agree a deletion date and verify deletion after analysis.

For each session record release, persona, platform, start, interruptions, finish or last completed screen, assistance requests and uncertain answers. Ask the participant to explain one low and one high response, identify their first action and distinguish the four result statuses. Ask what they would change. Do not suggest a target score. Record active and paused time separately.

Have an experienced consultant independently rate each completed report for usefulness in a discovery call, explaining the first action, evidence needed and any misleading guidance. Primary measure = completed reports rated useful divided by all completed reports assessed by the consultant. Report missing ratings, dropouts and the denominator separately. An independent safety reviewer should compare high maturity with unsafe use, uncertain consequential use, low maturity with a routine opportunity and conflicting disclosures against the recorded decision and supporting answers.

For each calibration proposal record the question or decision, anonymised observation, sample count, alternative explanation, candidate change and regression affected. Retest with users before claiming improvement. Version adopted changes and preserve previous outcomes. No participants have been assessed in this engineering iteration.

## Hosting decision — commercial launch pending

Keep GitHub Pages for the test deployment. GitHub restricts using Pages to run an online business or a site primarily facilitating commercial transactions or commercial SaaS. A consultancy lead-generation funnel requires a hosting decision before commercial promotion. Adding a custom domain does not change those terms. [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

After approval, assess Cloudflare Pages Free against expected traffic and current limits. Build the same static output with COMPASS_BASE_PATH=/ and COMPASS_SITE_URL=https://compass.sspark.net/. Test the preview deployment, TLS, report export, privacy notice and routing before changing DNS. Keep Pages available during cutover. Record the previous DNS target for rollback. No paid plan, DNS change or commercial migration has been authorised. [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/)

## Aggregate measurement — design only

Proposed daily counters are start, phase and screen reached, completion, export requested and consultation action chosen. A consultation click measures intent. Count explicit actions once per in-memory journey. Exclude identifiers, IPs, referrers, fingerprints, free text, answers, scores, references and message contents. Estimate abandonment from differences between aggregate phase totals. Revisits and offline sessions limit precision. Do not join visits. Agree retention and minimum cell sizes during privacy review. Obtain a hosting decision, legal/privacy approval and an approved notice and consent mechanism before implementation. Compass currently sends no analytics events.
