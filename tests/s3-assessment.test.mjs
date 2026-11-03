import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('S3 assessment begins with the required three-field start profile and preview flow', async () => {
  const app = await readFile('src/App.tsx', 'utf8');

  assert.match(app, /Organisation type/);
  assert.match(app, /Industry or sector/);
  assert.match(app, /Business goal/);
  assert.match(app, /Five-question quick preview/);
  assert.match(app, /Quick preview/);
});

test('S3 keeps local draft behavior explicit and self-reported results separate from validation', async () => {
  const app = await readFile('src/App.tsx', 'utf8');

  assert.match(app, /sessionStorage/);
  assert.match(app, /Draft saved locally in this browser/);
  assert.match(app, /Clear saved draft/);
  assert.match(app, /not a validated\s+client assessment/i);
  assert.match(app, /Unknown answers widen uncertainty/);
});

test('S3 retains the lazy report preview contract required by the foundation shell', async () => {
  const app = await readFile('src/App.tsx', 'utf8');

  assert.match(app, /lazy\(\(\) => import\('\.\/report\/ReportModule'\)\)/);
  assert.match(app, /View report preview/);
  assert.match(app, /report-module-panel/);
});
