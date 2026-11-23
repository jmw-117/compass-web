import assert from 'node:assert/strict';
import test from 'node:test';
import {restorePosition} from '../src/assessment/journey-position.ts';

test('refresh restores the cursor without skipping required evidence', () => {
  const core = Array<boolean>(14).fill(true);
  const safety = Array<boolean>(5).fill(true);
  const position = (screen: unknown, index: unknown) => restorePosition(screen, index, core, safety, 5);
  assert.deepEqual(position('core', 3), {screen:'core', index:3});
  assert.deepEqual(position('context', 8), {screen:'context', index:0});
  assert.deepEqual(position('nonsense', -1), {screen:'start', index:0});
  safety[2] = false;
  assert.deepEqual(position('results', 0), {screen:'safety', index:2});
  core[6] = false;
  assert.deepEqual(position('safety', 0), {screen:'core', index:1});
  assert.deepEqual(position('core', 99), {screen:'core', index:1});
  core[4] = false;
  assert.deepEqual(position('review', 0), {screen:'preview', index:4});
});
