import assert from 'node:assert/strict';
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
