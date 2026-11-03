import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluate } from '../src/domain/evaluate.ts';
import { getReportGuidance } from '../src/domain/report-guidance.ts';

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

test('report guidance follows the score interval and evaluator-selected safety path', () => {
  const safetyResult = evaluate({
    ...fixtureF01,
    coreAnswers: {
      ...fixtureF01.coreAnswers,
      'GOV-01': 'GOV-01-L1',
      'GOV-02': 'GOV-02-L1',
    },
    profile: {
      ...fixtureF01.profile,
      data_category: 'restricted',
      planned_ai_use: 'yes',
      planned_use_real_data: 'yes',
    },
  });
  const guidance = getReportGuidance(safetyResult);

  assert.equal(safetyResult.primaryPath, 'P2');
  assert.equal(guidance.title, 'Protect Information First');
  assert.match(guidance.guidance, /before using real or sensitive information/);
  assert.equal(guidance.firstActionId, safetyResult.actionIds[0]);
});

test('report guidance avoids asserting a single maturity band when the interval crosses one', () => {
  const guidance = getReportGuidance(evaluate(fixtureF05));

  assert.equal(guidance.scoreLabel, 'Readiness Range');
  assert.equal(guidance.scoreText, '0 to 100 out of 100');
  assert.match(guidance.scoreNote, /range, not a single score/);
  assert.match(guidance.bandText, /spans the Foundational to Established bands/);
  assert.match(guidance.bandText, /does not support one maturity band/);
  assert.equal(guidance.title, 'Verify The Unknowns');
});

test('report guidance describes uncertain endpoints in plain language', () => {
  const guidance = getReportGuidance({
    score: {lowerEighths: 192, upperEighths: 640, coverageUnits: 120},
    primaryPath: 'P0',
    actionIds: [],
  });

  assert.equal(guidance.scoreLabel, 'Readiness Range');
  assert.equal(guidance.scoreText, '24 to 80 out of 100');
  assert.doesNotMatch(guidance.scoreText, /[\[\]]/);
  assert.match(guidance.scoreNote, /“I am not sure” answers can change the result/);
});

test('report guidance names one band when both score endpoints fall in the same band', () => {
  const guidance = getReportGuidance(evaluate(fixtureF03));

  assert.equal(guidance.scoreLabel, 'Readiness Score');
  assert.equal(guidance.scoreText, '75 out of 100');
  assert.match(guidance.bandText, /score is in the Established band/);
});

test('report guidance rounds an exact fractional score to one whole number without decimals', () => {
  const guidance = getReportGuidance({
    score: {lowerEighths: 220, upperEighths: 220, coverageUnits: 200},
    primaryPath: 'P1',
    actionIds: [],
  });

  assert.equal(guidance.scoreLabel, 'Readiness Score');
  assert.equal(guidance.scoreText, '28 out of 100');
  assert.doesNotMatch(guidance.scoreText, /\.\d/);
  assert.match(guidance.bandText, /score is in the Emerging band/);
});

test('report guidance keeps specialist review ahead of a high score in a high-impact context', () => {
  const result = evaluate({
    ...fixtureF03,
    profile: {
      ...fixtureF03.profile,
      high_impact_ai_workflow: 'yes',
      planned_ai_use: 'yes',
    },
  });
  const guidance = getReportGuidance(result);

  assert.equal(result.primaryPath, 'P6');
  assert.equal(guidance.title, 'Get Specialist Review Before Piloting');
  assert.match(guidance.guidance, /Pause piloting and seek appropriate domain-specific review/);
});
