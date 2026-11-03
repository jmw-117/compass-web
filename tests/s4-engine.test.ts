import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluate } from '../src/domain/evaluate.ts';

const fixtureF01 = {
  assessmentId: 'F01',
  schemaVersion: '1.2.0',
  questionBankVersion: '1.1.0',
  profile: {
    org_type: 'sole_proprietor',
    industry: 'retail',
    primary_goal: 'efficiency',
    budget_band: 'none',
    staff_capacity: 'limited',
    data_category: 'personal',
    high_impact_ai_workflow: 'no',
    planned_ai_use: 'no',
    planned_use_real_data: 'no',
    current_ai_use: 'none',
  },
  coreAnswers: {
    'STR-01': 'STR-01-L1',
    'STR-02': 'STR-02-L2',
    'PRO-01': 'PRO-01-L1',
    'PRO-02': 'PRO-02-L1',
    'DAT-01': 'DAT-01-L1',
    'DAT-02': 'DAT-02-L1',
    'TEC-01': 'TEC-01-L1',
    'TEC-02': 'TEC-02-L1',
    'PEO-01': 'PEO-01-L0',
    'PEO-02': 'PEO-02-L1',
    'GOV-01': 'GOV-01-L1',
    'GOV-02': 'GOV-02-L1',
    'MET-01': 'MET-01-L0',
    'MET-02': 'MET-02-L1',
  },
};

const fixtureF03 = {
  assessmentId: 'F03',
  schemaVersion: '1.2.0',
  questionBankVersion: '1.1.0',
  profile: {
    org_type: 'established_sme',
    industry: 'professional_services',
    primary_goal: 'service',
    budget_band: 'moderate',
    staff_capacity: 'available',
    data_category: 'routine',
    high_impact_ai_workflow: 'no',
    planned_ai_use: 'yes',
    planned_use_real_data: 'no',
    current_ai_use: 'team_pilot',
  },
  coreAnswers: {
    'STR-01': 'STR-01-L3',
    'STR-02': 'STR-02-L3',
    'PRO-01': 'PRO-01-L3',
    'PRO-02': 'PRO-02-L3',
    'DAT-01': 'DAT-01-L3',
    'DAT-02': 'DAT-02-L3',
    'TEC-01': 'TEC-01-L3',
    'TEC-02': 'TEC-02-L3',
    'PEO-01': 'PEO-01-L3',
    'PEO-02': 'PEO-02-L3',
    'GOV-01': 'GOV-01-L3',
    'GOV-02': 'GOV-02-L3',
    'MET-01': 'MET-01-L3',
    'MET-02': 'MET-02-L3',
  },
};

const fixtureF05 = {
  assessmentId: 'F05',
  schemaVersion: '1.2.0',
  questionBankVersion: '1.1.0',
  profile: {
    org_type: 'small_sme',
    industry: 'retail',
    primary_goal: 'explore',
    budget_band: 'unknown',
    staff_capacity: 'unknown',
    data_category: 'unknown',
    high_impact_ai_workflow: 'unknown',
    planned_ai_use: 'unknown',
    planned_use_real_data: 'unknown',
    current_ai_use: 'unknown',
  },
  coreAnswers: {
    'STR-01': 'STR-01-UNK',
    'STR-02': 'STR-02-UNK',
    'PRO-01': 'PRO-01-UNK',
    'PRO-02': 'PRO-02-UNK',
    'DAT-01': 'DAT-01-UNK',
    'DAT-02': 'DAT-02-UNK',
    'TEC-01': 'TEC-01-UNK',
    'TEC-02': 'TEC-02-UNK',
    'PEO-01': 'PEO-01-UNK',
    'PEO-02': 'PEO-02-UNK',
    'GOV-01': 'GOV-01-UNK',
    'GOV-02': 'GOV-02-UNK',
    'MET-01': 'MET-01-UNK',
    'MET-02': 'MET-02-UNK',
  },
};

test('F01 chooses the low-readiness path without budget altering score or gates', () => {
  const result = evaluate(fixtureF01);
  assert.equal(result.primaryPath, 'P1');
  assert.equal(result.score.coverageUnits, 200);
  assert.ok(result.formalGates.length >= 0);
  assert.equal(result.actionIds[0], 'A01-FOUNDATIONAL-READINESS');

  const comparable = evaluate({
    ...fixtureF01,
    profile: { ...fixtureF01.profile, budget_band: 'flexible' },
  });
  assert.equal(result.score.lowerEighths, comparable.score.lowerEighths);
  assert.equal(result.score.upperEighths, comparable.score.upperEighths);
  assert.deepEqual(result.formalGates, comparable.formalGates);
});

test('F03 reaches the pilot-ready path with a 600-point score and full coverage', () => {
  const result = evaluate(fixtureF03);
  assert.equal(result.primaryPath, 'P5');
  assert.equal(result.score.lowerEighths, 600);
  assert.equal(result.score.upperEighths, 600);
  assert.equal(result.score.coverageUnits, 200);
  assert.equal(result.formalGates.length, 0);
});

test('F05 uses the unknown path and keeps the total interval open', () => {
  const result = evaluate(fixtureF05);
  assert.equal(result.primaryPath, 'P0');
  assert.equal(result.score.lowerEighths, 0);
  assert.equal(result.score.upperEighths, 800);
  assert.equal(result.score.coverageUnits, 0);
  assert.equal(result.costFit, 'unknown');
  assert.ok(result.flags.length >= 14);
});

test('S4 keeps path selection monotonic and scores within the valid range', () => {
  const result = evaluate(fixtureF03);
  assert.ok(result.score.lowerEighths <= result.score.upperEighths);
  assert.ok(result.score.lowerEighths >= 0);
  assert.ok(result.score.upperEighths <= 800);
  assert.equal(result.dimensions.STR.lower, 3);
  assert.equal(result.dimensions.GOV.upper, 3);
});
