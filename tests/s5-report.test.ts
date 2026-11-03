import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('S5 builds a report contract with the mandatory report sections and voluntary handoff controls', async () => {
  const app = await readFile('src/App.tsx', 'utf8');
  const report = await readFile('src/report/ReportModule.tsx', 'utf8');

  assert.match(app, /<ReportModule\s+profile=\{profile\}/);
  assert.match(report, /document_identity/i);
  assert.match(report, /executive_summary/i);
  assert.match(report, /primary_path/i);
  assert.match(report, /Copy summary/i);
  assert.match(report, /Print \/ save as PDF/i);
  assert.match(report, /window\.print\(\)/);
  assert.match(report, /WhatsApp/i);
  assert.match(report, /Self-reported assessment — not independently verified/i);
  assert.match(app, /scrollIntoView\(\{behavior: 'smooth', block: 'start'\}\)/);
});
