import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('static landing shell remains semantic and usable without JavaScript', async () => {
  const html = await readFile('index.html', 'utf8');

  assert.match(html, /<html lang="en">/);
  assert.match(html, /<a class="skip-link" href="#main">Skip to content<\/a>/);
  assert.match(html, /<main id="main">/);
  assert.match(html, /<noscript>/);
  assert.match(html, /<span class="wordmark-mark">[\s\S]*class="wordmark-logo"/);
  assert.match(await readFile('src/styles/global.css', 'utf8'), /\.wordmark-mark[\s\S]*overflow:\s*hidden/);
  assert.match(await readFile('src/styles/global.css', 'utf8'), /\.wordmark-logo[\s\S]*width:\s*7rem/);
  assert.match(html, /Assess Your Readiness/);
  assert.match(html, /No account required/);
  assert.match(html, /<p>AI readiness, considered\.<\/p>/);
  assert.doesNotMatch(html, /Development foundation|Not an assessment result/);

  const styles = await readFile('src/styles/global.css', 'utf8');
  assert.match(styles, /font-family:\s*ui-sans-serif,\s*system-ui,\s*sans-serif,\s*"Apple Color Emoji",\s*"Segoe UI Emoji",\s*"Segoe UI Symbol",\s*"Noto Color Emoji";/);
  assert.doesNotMatch(styles, /font-family:\s*(?:Inter|Georgia|Arial)/);
  assert.match(styles, /button,\s*input,\s*select,\s*textarea\s*\{\s*font:\s*inherit/);
  assert.match(styles, /\.site-footer\s*>\s*p\s*\{[^}]*text-align:\s*right/);
});

test('assessment mounts only after the launch button is clicked and then fills the hero section', async () => {
  const html = await readFile('index.html', 'utf8');
  const entry = await readFile('src/main.tsx', 'utf8');
  const app = await readFile('src/App.tsx', 'utf8');
  const styles = await readFile('src/styles/global.css', 'utf8');

  assert.match(html, /id="take-assessment"[\s\S]*aria-controls="react-enhancement"[\s\S]*aria-expanded="false"/);
  assert.match(entry, /lazy\(\(\) => import\('\.\/App'\)\)/);
  assert.match(entry, /getElementById\('take-assessment'\)/);
  assert.match(entry, /launchButton\.addEventListener\('click'/);
  assert.match(entry, /root\.render\(/);
  assert.match(entry, /setAttribute\('aria-labelledby', 'assessment-title'\)/);
  assert.match(entry, /hero--assessment-active/);
  assert.match(styles, /\.hero--assessment-active\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(styles, /\.hero--assessment-active\s+\.hero-copy\s*\{\s*display:\s*none;/);
  assert.match(app, /screen !== 'start'/);
  assert.match(app, /role="progressbar"/);
  assert.match(styles, /transition:\s*width 320ms ease-out/);
});

test('React enhancement loads the report preview on demand and keeps it user-controlled', async () => {
  const app = await readFile('src/App.tsx', 'utf8');
  const report = await readFile('src/report/ReportModule.tsx', 'utf8');

  assert.match(app, /lazy\(\(\) => import\('\.\/report\/ReportModule'\)\)/);
  assert.match(app, /aria-expanded=\{isReportModuleOpen\}/);
  assert.match(app, /<ReportModule\s+profile=\{reportProfile\}/);
  assert.match(report, /Self-reported assessment — not independently verified/);
  assert.match(report, /Save as PDF/);
  assert.doesNotMatch(report, /Copy summary/);
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
