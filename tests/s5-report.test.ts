import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('S5 builds a report contract with the mandatory report sections and voluntary handoff controls', async () => {
  const app = await readFile('src/App.tsx', 'utf8');
  const report = await readFile('src/report/ReportModule.tsx', 'utf8');
  const model = await readFile('src/report/report-content.ts', 'utf8');
  const pdf = await readFile('src/report/export-pdf.ts', 'utf8');
  assert.doesNotMatch(pdf, /querySelector|textContent|innerText|HTMLElement/);
  assert.match(report, /downloadReport\(content\)/);
  const signal = await readFile('src/ReadinessSignal.tsx', 'utf8');
  const styles = await readFile('src/styles/global.css', 'utf8');

  assert.match(app, /<ReportModule\s+profile=\{reportProfile\}/);
  assert.match(report, /Assessment Report/);
  assert.match(report, /Executive Decision/);
  assert.match(model, /Industry \/ Sector/);
  assert.doesNotMatch(report, /Path reference:|Cost class:|Consultant Review Template|Next 30, 60 And 90 Days/);
  assert.match(report, /reportGuidance\.primaryPathLabel/);
  assert.match(model, /catalogActions\.get\(id\)/);
  assert.match(report, /getQuestionLabel\(questionId\)/);
  assert.match(report, /getGateLabel\(gate\.id\)/);
  assert.match(report, /DecisionSummary result=\{readiness\} rows=\{content\.decisions\}/);
  assert.doesNotMatch(report, /No safety checks triggered/);
  for (const contextField of [
    'current_ai_use',
    'data_category',
    'high_impact_ai_workflow',
    'planned_ai_use',
    'planned_use_real_data',
  ]) {
    assert.ok(model.includes(`profile.${contextField}`), `Missing safety context in report: ${contextField}`);
  }
  assert.doesNotMatch(report, /slice\(0,\s*24\)/);
  assert.match(styles, /\.report-module\s+:where\(p, li, strong, small, span, code\)\s*\{[^}]*overflow-wrap:\s*anywhere/);
  assert.match(report, /Export Report/);
  assert.match(report, /Copy summary/);
  assert.match(report, /Message preview/);
  assert.match(report, /const \{downloadReport\} = await import\('\.\/export-pdf'\)/);
  assert.match(report, /Send Report/);
  assert.match(report, /WhatsApp/i);
  assert.match(model, /Self-Reported Assessment — Not Independently Verified/);
  assert.match(report, /className="report-section"/);
  assert.match(report, /new Set\(\['executive-summary'\]\)/);
  assert.match(report, /open=\{expanded\}/);
  assert.match(styles, /\.report-section\s*>\s*\.report-section-content\s*\{\s*display:\s*block !important/);
  assert.match(report, /className="first-action"/);
  assert.match(report, /reportGuidance\.guidance/);
  assert.match(report, /reportGuidance\.scoreNote/);
  assert.match(app, /<ReadinessSignal signal=\{reportGuidance\.signal\} \/>/);
  assert.match(report, /<ReadinessSignal signal=\{reportGuidance\.signal\} \/>/);
  assert.match(signal, /This signal is not approval to deploy AI/);
  assert.match(report, /<DimensionBar lower=\{area\.lower\} upper=\{area\.upper\}/);
  assert.doesNotMatch(report, /\[\$\{metric\.lower\}, \$\{metric\.upper\}\]/);
  for (const title of [
    'Business Snapshot',
    'Methodology And Limitations',
    'Seven Dimension Results',
    'Uncertainty And Coverage',
    'Positive Capabilities',
    'Priority Action Plan',
    'Budget And Capacity Fit',
    'Evidence &amp; Methodology',
  ]) {
    assert.ok(report.includes(title), `Missing readable report section title: ${title}`);
  }
  assert.doesNotMatch(report, /<h4[^>]*>[^<]*_[^<]*<\/h4>/);
  assert.match(styles, /\.report-module\s*\{[^}]*color:\s*var\(--charcoal\)/);
  assert.match(styles, /\.report-module\s+\.eyebrow\s*\{\s*color:\s*#7a6743/);
  assert.match(styles, /\.report-section-summary h4\s*\{[^}]*font-size:\s*clamp\(1\.1rem/);
  assert.match(app, /<ActionIcon name="back"/);
});
