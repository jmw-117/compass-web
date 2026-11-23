import assert from 'node:assert/strict';
import test from 'node:test';
import {dimensionRows} from '../src/domain/dimension-display.ts';
import type {ReadinessResult} from '../src/domain/evaluate.ts';

test('dimension ranges distinguish missing evidence, confirmed zero and exact fractional scores', () => {
  const exact = {lower: 3.5, upper: 3.5, known: 2};
  const dimensions: ReadinessResult['dimensions'] = {
    STR: {lower: 0, upper: 4, known: 0}, PRO: {lower: 0, upper: 0, known: 2},
    DAT: {lower: 0.5, upper: 2.5, known: 1}, TEC: exact, PEO: exact, GOV: exact, MET: exact,
  };
  const rows = dimensionRows(dimensions);
  assert.equal(rows.length, 7);
  assert.deepEqual(rows.slice(0, 4).map(row => [row.lower, row.upper, row.scoreText]), [
    [0, 100, '0–100%'], [0, 0, '0%'], [12.5, 62.5, '12–63%'], [87.5, 87.5, '88%'],
  ]);
});
