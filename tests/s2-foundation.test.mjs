import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('static landing shell remains semantic and usable without JavaScript', async () => {
  const html = await readFile('index.html', 'utf8');

  assert.match(html, /<html lang="en">/);
  assert.match(html, /<a class="skip-link" href="#main">Skip to content<\/a>/);
  assert.match(html, /<main id="main">/);
  assert.match(html, /<noscript>/);
  assert.match(html, /Explore the assessment/);
  assert.match(html, /No account required/);
});

test('React enhancement loads the report preview on demand and keeps it user-controlled', async () => {
  const app = await readFile('src/App.tsx', 'utf8');
  const report = await readFile('src/report/ReportModule.tsx', 'utf8');

  assert.match(app, /lazy\(\(\) => import\('\.\/report\/ReportModule'\)\)/);
  assert.match(app, /aria-expanded=\{isReportModuleOpen\}/);
  assert.match(app, /<ReportModule\s+profile=\{profile\}/);
  assert.match(report, /Self-reported assessment — not independently verified/);
  assert.match(report, /Copy summary/);
  assert.match(report, /Share via WhatsApp/);
});

test('quality checks cover the agreed branches and deployment stays manually gated', async () => {
  const workflow = await readFile('.github/workflows/deploy-pages.yml', 'utf8');

  const branches = 'main,\\s*codex,\\s*develop,\\s*maintenance,\\s*upgrade';
  assert.match(workflow, new RegExp(`pull_request:\\s+branches:\\s+\\[${branches}\\]`));
  assert.match(workflow, new RegExp(`push:\\s+branches:\\s+\\[${branches}\\]`));
  assert.match(workflow, /github\.event_name == 'workflow_dispatch' && inputs\.deploy/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
});

test('the 14 core questions and seven dimensions remain unchanged', async () => {
  const bank = JSON.parse(await readFile('docs/domain/question_bank.json', 'utf8'));

  assert.equal(bank.questions.length, 14);
  assert.equal(bank.dimensions.length, 7);
  assert.equal(new Set(bank.questions.map((question) => question.id)).size, 14);
});
