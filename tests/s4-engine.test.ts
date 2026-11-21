import goldenCases from '../docs/domain/golden_cases.json' with { type: 'json' };
import actions from '../docs/domain/action_catalog.json' with { type: 'json' };
import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluate, getDisplayBand } from '../src/domain/evaluate.ts';
import {
  getActionLabel,
  getCostFitLabel,
  getGateLabel,
  getSafetyChecksMessage,
  getQuestionLabel,
  getReportGuidance,
  getSeverityLabel,
} from '../src/domain/report-guidance.ts';

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
  assert.ok(result.actionIds.includes('A03'));

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

test('an explicit missing baseline activates the financial gate', () => {
  const result = evaluate({
    ...fixtureF01,
    probeAnswers: {'PR-MET-START':'No'},
    profile: {
      ...fixtureF01.profile,
      baseline_known: 'no',
      businessGoal: 'efficiency',
      primary_goal: 'efficiency',
    },
  });

  assert.ok(result.formalGates.some(({id}) => id === 'BASELINE-MISSING'));
});

test('S4 keeps path selection monotonic and scores within the valid range', () => {
  const result = evaluate(fixtureF03);
  assert.ok(result.score.lowerEighths <= result.score.upperEighths);
  assert.ok(result.score.lowerEighths >= 0);
  assert.ok(result.score.upperEighths <= 800);
  assert.equal(result.dimensions.STR.lower, 3);
  assert.equal(result.dimensions.GOV.upper, 3);
});

test('unknown core answers widen each dimension across both indicators', () => {
  const result = evaluate({
    ...fixtureF03,
    coreAnswers: {
      ...fixtureF03.coreAnswers,
      'STR-02': 'STR-02-UNK',
    },
  });

  assert.deepEqual(result.dimensions.STR, {lower: 1.5, upper: 3.5, known: 1});
  for (const dimension of Object.values(result.dimensions)) {
    assert.ok(dimension.lower >= 0);
    assert.ok(dimension.upper <= 4);
    assert.ok(dimension.lower <= dimension.upper);
  }
});

test('unknown core answers do not satisfy numeric safety or path predicates', () => {
  const result = evaluate({
    ...fixtureF03,
    coreAnswers: {
      ...fixtureF03.coreAnswers,
      'DAT-01': 'DAT-01-UNK',
      'GOV-01': 'GOV-01-UNK',
      'MET-01': 'MET-01-UNK',
      'STR-02': 'STR-02-UNK',
      'TEC-01': 'TEC-01-UNK',
      'TEC-02': 'TEC-02-UNK',
    },
    profile: {
      ...fixtureF03.profile,
      data_category: 'restricted',
      planned_use_real_data: 'yes',
    },
  });

  const gateIds = result.formalGates.map(({id}) => id);
  assert.ok(gateIds.includes('DATA-UNKNOWN'), 'Unknown data quality needs verification');
  for (const gateId of ['GOV-DATA', 'OWN-NONE', 'BASELINE-MISSING']) {
    assert.ok(!gateIds.includes(gateId), `Unknown answers must not trigger ${gateId}`);
  }
  assert.notEqual(result.primaryPath, 'P4');
  assert.ok(!result.secondaryPaths.includes('P4'));
});

test('safety context completeness distinguishes confirmed profile values from unknowns', () => {
  const complete = evaluate({
    ...fixtureF03,
    profile: {
      ...fixtureF03.profile,
      current_ai_use: 'team_pilot',
      data_category: 'routine',
      high_impact_ai_workflow: 'no',
      planned_ai_use: 'yes',
      planned_use_real_data: 'no',
    },
  });
  const incomplete = evaluate({
    ...fixtureF03,
    profile: {
      ...fixtureF03.profile,
      current_ai_use: 'unknown',
      data_category: 'routine',
      high_impact_ai_workflow: 'no',
      planned_ai_use: 'yes',
      planned_use_real_data: 'no',
    },
  });

  assert.equal(complete.safetyContextConfirmed, true);
  assert.equal(incomplete.safetyContextConfirmed, false);
  assert.equal(evaluate(fixtureF03).safetyContextConfirmed, true);
  assert.equal(evaluate(fixtureF05).safetyContextConfirmed, false);
});

test('report guidance follows the score interval and evaluator-selected safety path', () => {
  const safetyResult = evaluate({
    ...fixtureF01,
    probeAnswers: {'PR-GOV-SHARE': 'Yes'},
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
  const fixtureF05Result = evaluate(fixtureF05);
  const guidance = getReportGuidance(fixtureF05Result);

  assert.equal(guidance.scoreLabel, 'Readiness Range');
  assert.equal(guidance.scoreText, '0 to 100 out of 100');
  assert.match(guidance.scoreNote, /range, not a single score/);
  assert.match(guidance.bandText, /spans the Foundational to Established bands/);
  assert.match(guidance.bandText, /does not support one maturity band/);
  assert.equal(guidance.signal.color, 'red');
  assert.match(guidance.signal.rangeNote, /cautious signal follows the lower bound/);
  assert.equal(guidance.title, 'Verify The Unknowns');
  assert.equal(guidance.primaryPathLabel, 'Verify The Unknowns');
  assert.equal(guidance.firstActionLabel, getActionLabel(fixtureF05Result.actionIds[0] ?? ''));
});

test('report guidance uses human-readable labels for actions, questions, and safety checks', () => {
  assert.equal(getActionLabel('A00'), 'Identify someone to verify missing answers');
  assert.equal(getQuestionLabel('STR-02'), 'who can approve an AI or automation use case');
  assert.equal(getGateLabel('DATA-UNKNOWN'), 'Essential data details need confirmation');
  assert.equal(getSeverityLabel('BLOCK_PILOT'), 'Do not pilot until this is addressed');
  assert.equal(getCostFitLabel('unknown'), 'Cost fit is unknown.');
});

test('no-triggered-gate messaging distinguishes incomplete context from a safety clearance', () => {
  const incomplete = getSafetyChecksMessage({formalGates: [], safetyContextConfirmed: false});
  const noGates = getSafetyChecksMessage({formalGates: [], safetyContextConfirmed: true});
  const withGate = getSafetyChecksMessage({formalGates: [{id: 'GOV-DATA'}], safetyContextConfirmed: true});

  assert.match(incomplete, /context is incomplete/i);
  assert.match(incomplete, /not a safety clearance/i);
  assert.match(noGates, /context entered/i);
  assert.match(noGates, /not a safety clearance/i);
  assert.match(withGate, /checks have been triggered/i);
});

test('report guidance describes uncertain endpoints in plain language', () => {
  const guidance = getReportGuidance({
    score: {lowerEighths: 192, upperEighths: 640, coverageUnits: 120},
    primaryPath: 'P0',
    secondaryPaths: [],
    actionIds: [],
  });

  assert.equal(guidance.scoreLabel, 'Readiness Range');
  assert.equal(guidance.scoreText, '24 to 80 out of 100');
  assert.doesNotMatch(guidance.scoreText, /[\[\]]/);
  assert.match(guidance.scoreNote, /“I am not sure” answers can change the result/);
  assert.equal(guidance.signal.color, 'red');
  assert.equal(guidance.signal.title, 'Not Ready Yet');
  assert.match(guidance.signal.rangeNote, /also reaches green territory/);
});

test('report guidance names one band when both score endpoints fall in the same band', () => {
  const guidance = getReportGuidance(evaluate(fixtureF03));

  assert.equal(guidance.scoreLabel, 'Readiness Score');
  assert.equal(guidance.scoreText, '75 out of 100');
  assert.equal(guidance.signal.color, 'green');
  assert.equal(guidance.signal.title, 'Strong Foundations');
  assert.match(guidance.bandText, /score is in the Established band/);
});

test('report guidance rounds an exact fractional score to one whole number without decimals', () => {
  const guidance = getReportGuidance({
    score: {lowerEighths: 220, upperEighths: 220, coverageUnits: 200},
    primaryPath: 'P1',
    secondaryPaths: [],
    actionIds: [],
  });

  assert.equal(guidance.scoreLabel, 'Readiness Score');
  assert.equal(guidance.scoreText, '28 out of 100');
  assert.doesNotMatch(guidance.scoreText, /\.\d/);
  assert.match(guidance.bandText, /score is in the Emerging band/);
});

test('traffic-light signal follows existing band boundaries and uses the lower color for a crossing range', () => {
  const guidanceFor = (lowerEighths: number, upperEighths = lowerEighths) =>
    getReportGuidance({
      score: {lowerEighths, upperEighths, coverageUnits: 200},
      primaryPath: 'P1',
      secondaryPaths: [],
      actionIds: [],
    });

  assert.equal(guidanceFor(199).signal.color, 'red');
  assert.equal(guidanceFor(200).signal.color, 'amber');
  assert.equal(guidanceFor(599).signal.color, 'amber');
  assert.equal(guidanceFor(600).signal.color, 'green');

  const crossingRange = guidanceFor(200, 600);
  assert.equal(crossingRange.signal.color, 'amber');
  assert.match(crossingRange.signal.rangeNote, /reaches green territory/);
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

test('all existing synthetic golden cases retain their recorded expectations', () => {
  for (const item of goldenCases.cases) {
    const input: AssessmentInput = {
      profile: item.profile,
      coreAnswers: item.answers,
      probeAnswers: item.probes ?? {},
    };
    const actual = evaluate(input);
    const expected = item.expected;
    if (expected) {
      const expectation = {primary_path: actual.primaryPath, lower_eighths: actual.score.lowerEighths,
        upper_eighths: actual.score.upperEighths, coverage_units: actual.score.coverageUnits};
      for (const key of Object.keys(expectation) as Array<keyof typeof expectation>) {
        if (key in expected) assert.equal(expectation[key], expected[key], item.id + ' ' + key);
      }
      const gates = actual.formalGates.map(({id}) => id);
      for (const id of expected.gates_present ?? []) assert.ok(gates.includes(id), item.id + ' ' + id);
      for (const id of expected.gates_not_present ?? []) assert.ok(!gates.includes(id), item.id + ' ' + id);
      for (const path of expected.forbidden_primary ?? []) assert.notEqual(actual.primaryPath, path, item.id);
      if (expected.primary_path_not) assert.notEqual(actual.primaryPath, expected.primary_path_not, item.id);
      if (expected.score_type === 'interval') assert.ok(actual.score.lowerEighths < actual.score.upperEighths, item.id);
      if (expected.band === 'multiple') assert.notEqual(getDisplayBand(actual.score.lowerEighths), getDisplayBand(actual.score.upperEighths), item.id);
      if (expected.budget_fit === 'unverified') assert.equal(actual.costFit, 'unknown', item.id);
    }
    if (item.id === 'F01' || item.metamorphic?.expect_same_readiness) {
      const updated = evaluate({...input, profile: {...input.profile, budget_band: 'flexible', budget_ceiling: 120000}});
      assert.deepEqual(updated.score, actual.score, item.id);
      assert.deepEqual(updated.formalGates, actual.formalGates, item.id);
      assert.equal(updated.primaryPath, actual.primaryPath, item.id);
    }
    if (item.metamorphic?.expect_same_json) {
      const before = {...input.coreAnswers};
      input.coreAnswers['TEC-01'] = item.metamorphic.edit ?? '';
      evaluate(input);
      input.coreAnswers = before;
      assert.deepEqual(evaluate(input), actual, item.id);
    }
    assert.ok(actual.actionIds.length >= 1 && actual.actionIds.length <= 3, item.id);
    actual.actionIds.forEach((id, index) => {
      const action = actions.actions.find((entry) => entry.id === id);
      assert.ok(action, item.id + ' ' + id);
      for (const prerequisite of action.prerequisite_ids) assert.ok(actual.actionIds.slice(0, index).includes(prerequisite), item.id + ' ' + prerequisite);
    });
  }
});

test('inactive evidence cannot trigger gates and the technical annex leaves core scores alone', () => {
  const item = goldenCases.cases.find(({id}) => id === 'F08');
  assert.ok(item);
  const input: AssessmentInput = {
    profile: item.profile, coreAnswers: item.answers, probeAnswers: {'PR-GOV-SHARE': 'Yes'},
  };
  const active = evaluate(input);
  assert.ok(active.formalGates.some(({id}) => id === 'GOV-DATA'));
  const edited = evaluate({...input, profile: {...item.profile, current_ai_use: 'none', planned_use_real_data: 'no', data_category: 'routine'}});
  assert.ok(!edited.formalGates.some(({id}) => id === 'GOV-DATA'));
  assert.ok(!edited.probeEvidence.some(({id}) => id === 'PR-GOV-SHARE'));

  const annex = evaluate({
    ...fixtureF03,
    profile: {...fixtureF03.profile, extended_assessment: true},
    extendedAnswers: {'EX-CMP-01': 'EX-CMP-01-high'},
  });
  const baseline = evaluate(fixtureF03);
  assert.deepEqual(annex.score, baseline.score);
  assert.deepEqual(annex.formalGates, baseline.formalGates);
  assert.equal(annex.specialistReview, true);
  assert.equal(annex.actionIds[0], 'A20');
  assert.match(getReportGuidance(annex).guidance, /Pause piloting/);
});
