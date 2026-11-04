import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readdir, readFile} from 'node:fs/promises';
import test from 'node:test';

async function readClientSource(directory = 'src') {
  const entries = await readdir(directory, {withFileTypes: true});
  const contents = await Promise.all(entries.map(async (entry) => {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return readClientSource(path);
    if (!/\.(?:ts|tsx)$/.test(entry.name)) return '';
    return readFile(path, 'utf8');
  }));
  return contents.flat().join('\n');
}

test('S6 preserves the static no-submission privacy boundary', async () => {
  const report = await readFile('src/report/ReportModule.tsx', 'utf8');
  const app = await readFile('src/App.tsx', 'utf8');
  const activeClientCode = await readClientSource();

  assert.doesNotMatch(activeClientCode, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|new WebSocket/);
  assert.match(report, /window\.open\(`https:\/\/wa\.me\/\?text=\$\{message\}`/);
  assert.match(report, /function handleWhatsAppClick\(\)/);
  assert.match(app, /sessionStorage\.setItem\(STORAGE_KEY/);
  assert.match(app, /Your progress is saved only in this browser/);
});

test('S6 ignores local private material without hiding required product documents', () => {
  const isIgnored = (path) => {
    try {
      execFileSync('git', ['check-ignore', '--no-index', '-q', path], {stdio: 'ignore'});
      return true;
    } catch (error) {
      if (error.status === 1) return false;
      throw error;
    }
  };

  assert.equal(isIgnored('.env.production.local'), true);
  assert.equal(isIgnored('docs/private/consultant-notes.md'), true);
  assert.equal(isIgnored('docs/_private/client-data.json'), true);
  assert.equal(isIgnored('docs/domain/product_requirements.json'), false);
  assert.equal(isIgnored('docs/handoffs/ledger.json'), false);
  assert.equal(isIgnored('docs/stages/S6-quality-hardening.md'), false);
});
