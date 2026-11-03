import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('S5 builds a report contract with the mandatory report sections and voluntary handoff controls', async () => {
  const app = await readFile('src/App.tsx', 'utf8');
  const report = await readFile('src/report/ReportModule.tsx', 'utf8');
  const styles = await readFile('src/styles/global.css', 'utf8');

  assert.match(app, /<ReportModule\s+profile=\{reportProfile\}/);
  assert.match(report, /Assessment report/);
  assert.match(report, /Executive summary/);
  assert.match(report, /Primary path/);
  assert.match(report, /Save as PDF/);
  assert.doesNotMatch(report, /Copy summary|Print \/ save as PDF/);
  assert.match(report, /window\.print\(\)/);
  assert.match(report, /WhatsApp/i);
  assert.match(report, /Self-reported assessment — not independently verified/i);
  assert.match(report, /className="report-section"/);
  assert.match(report, /new Set\(\['executive-summary'\]\)/);
  assert.match(report, /printMode \|\| expanded/);
  assert.match(report, /previousOpenSections\.current = openSections/);
  assert.match(styles, /\.report-section\s*>\s*\.report-section-content\s*\{\s*display:\s*block !important/);
  assert.match(report, /A practical recommendation/);
  assert.match(report, /reportGuidance\.guidance/);
  for (const title of [
    'Business snapshot',
    'Methodology and limitations',
    'Seven dimension results',
    'Uncertainty and coverage',
    'Positive capabilities',
    'Gaps and evidence',
    'Critical safety gates',
    'Three priority actions',
    'Budget and capacity fit',
    'Consultant review template',
    'Appendix answers and provenance',
    'Client consultation',
    'Next 30, 60 and 90 days',
  ]) {
    assert.ok(report.includes(title), `Missing readable report section title: ${title}`);
  }
  assert.doesNotMatch(report, /<h4[^>]*>[^<]*_[^<]*<\/h4>/);
  assert.match(styles, /\.report-module\s*\{[^}]*color:\s*var\(--charcoal\)/);
  assert.match(styles, /\.report-module\s+\.eyebrow\s*\{\s*color:\s*#7a6743/);
  assert.match(styles, /\.report-section-summary h4\s*\{[^}]*font-size:\s*clamp\(1\.1rem/);
  assert.match(app, /scrollIntoView\(\{behavior: 'smooth', block: 'start'\}\)/);
});
