import bank from '../../docs/domain/question_bank.json' with {type: 'json'};
import rules from '../../docs/domain/rules.json' with {type: 'json'};
import {matches} from './predicates.ts';
import { activeProbes, technicalFindings } from './diagnostics.ts';
import { recommendActions } from './recommendations.ts';

export type DimensionId = 'STR' | 'PRO' | 'DAT' | 'TEC' | 'PEO' | 'GOV' | 'MET';
export type BudgetBand = 'none' | 'limited' | 'moderate' | 'flexible' | 'unknown';

export type AssessmentInput = {
  assessmentId?: string;
  schemaVersion?: string;
  questionBankVersion?: string;
  profile: Record<string, unknown>;
  coreAnswers: Record<string, string>;
  probeAnswers?: Record<string, string>;
  extendedAnswers?: Record<string, string>;
};

export type ReadinessResult = {
  score: {
    lowerEighths: number;
    upperEighths: number;
    coverageUnits: number;
  };
  safetyContextConfirmed: boolean;
  technicalFindings: ReturnType<typeof technicalFindings>;
  specialistReview: boolean;
  pilotReviewRequired: boolean;
  probeEvidence: Array<{id: string; prompt: string; answer: string}>;
  dimensions: Record<DimensionId, { lower: number; upper: number; known: number }>;
  formalGates: Array<{ id: string; triggeringIds: string[]; severity: string }>;
  flags: Array<{ id: string; sourceQuestionIds: string[]; status: 'self_reported' | 'clarified' | 'example_unverified' }>;
  primaryPath: string;
  secondaryPaths: string[];
  actionIds: string[];
  costFit: 'no_cash_option' | 'within_verified_ceiling' | 'possible_not_priced' | 'unknown' | 'specialist_review';
  ruleVersion: string;
};

const DIMENSION_WEIGHTS = Object.fromEntries(bank.dimensions.map(d => [d.id, d.weight_pct])) as Record<DimensionId, number>;
const byQuestion = new Map(bank.questions.map(q => [q.id, q]));
const QUESTION_ID_ORDER = bank.questions.map(q => q.id);
const DIMENSION_ORDER = bank.dimensions.map(d => d.id as DimensionId);

const SAFETY_CONTEXT_VALUES: Record<string, ReadonlySet<string>> = {
  current_ai_use: new Set(['none', 'personal', 'team_pilot', 'operational']),
  data_category: new Set(['routine', 'personal', 'restricted']),
  high_impact_ai_workflow: new Set(['yes', 'no']),
  planned_ai_use: new Set(['yes', 'no']),
  planned_use_real_data: new Set(['yes', 'no']),
};

function getQuestionDimension(questionId: string): DimensionId {
  return byQuestion.get(questionId)!.dimension as DimensionId;
}

export function getAnswerScore(questionId: string, optionId: string | undefined): number | null {
  if (!optionId) return null;
  return byQuestion.get(questionId)?.options.find(option => option.id === optionId)?.score ?? null;
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  return '';
}

function getProfileString(profile: Record<string, unknown>, key: string): string {
  return asString(profile[key]);
}

function toBand(score: number): string {
  const {band_names: names, band_thresholds_eighths: thresholds} = rules.scoring;
  return names.reduce((band, name, i) => score >= thresholds[i]! ? name : band, names[0]!);
}

export function evaluate(input: AssessmentInput): ReadinessResult {
  const profile = input.profile ?? {};
  const coreAnswers = input.coreAnswers ?? {};
  const dimensions: Record<DimensionId, { lower: number; upper: number; known: number }> = {
    STR: { lower: 0, upper: 0, known: 0 },
    PRO: { lower: 0, upper: 0, known: 0 },
    DAT: { lower: 0, upper: 0, known: 0 },
    TEC: { lower: 0, upper: 0, known: 0 },
    PEO: { lower: 0, upper: 0, known: 0 },
    GOV: { lower: 0, upper: 0, known: 0 },
    MET: { lower: 0, upper: 0, known: 0 },
  };

  let lowerEighths = 0;
  let upperEighths = 0;
  let coverageUnits = 0;
  let knownCount = 0;

  for (const questionId of QUESTION_ID_ORDER) {
    const optionId = coreAnswers[questionId];
    const dimension = getQuestionDimension(questionId);
    const score = getAnswerScore(questionId, optionId);

    if (score === null) {
      const current = dimensions[dimension];
      current.upper += 4 * DIMENSION_WEIGHTS[dimension];
      upperEighths += 4 * DIMENSION_WEIGHTS[dimension];
      continue;
    }

    knownCount += 1;
    const weight = DIMENSION_WEIGHTS[dimension];
    const accumulated = dimensions[dimension];
    accumulated.lower += score * weight;
    accumulated.upper += score * weight;
    accumulated.known += 1;

    lowerEighths += score * weight;
    upperEighths += score * weight;
    coverageUnits += weight;
  }

  const unknownCount = QUESTION_ID_ORDER.length - knownCount;

  for (const dimension of DIMENSION_ORDER) {
    const current = dimensions[dimension] ?? { lower: 0, upper: 0, known: 0 };
    dimensions[dimension] = current;
    const indicatorCount = QUESTION_ID_ORDER.filter((questionId) => getQuestionDimension(questionId) === dimension).length;
    const denominator = indicatorCount * DIMENSION_WEIGHTS[dimension];
    current.lower = denominator === 0 ? 0 : current.lower / denominator;
    current.upper = denominator === 0 ? 0 : current.upper / denominator;
  }

  const probes = activeProbes(profile, (id) => getAnswerScore(id, coreAnswers[id]));
  const probeAnswers = new Map(probes.map(({id, choices}) => {
    const answer = input.probeAnswers?.[id] ?? '';
    return [id, choices?.includes(answer) ? answer : ''];
  }));
  const facts = new Map<string, unknown>();
  Object.entries(profile).forEach(([key, value]) => facts.set('profile.' + key, value));
  for (const id of QUESTION_ID_ORDER) facts.set('answer.' + id, getAnswerScore(id, coreAnswers[id]));
  probeAnswers.forEach((value, key) => facts.set('probe.' + key, value));
  for (const id of DIMENSION_ORDER) {
    facts.set('dimension.' + id + '.lower', dimensions[id].lower);
    facts.set('dimension.' + id + '.upper', dimensions[id].upper);
  }
  facts.set('metrics.unknownCount', unknownCount);
  facts.set('metrics.coverageUnits', coverageUnits);
  const formalGates = rules.gates.flatMap(gate => {
    const references = new Set<string>();
    const triggered = matches(gate.predicate_ast_id, facts, references);
    facts.set('gate.' + gate.id, triggered);
    return triggered ? [{id: gate.id, severity: gate.severity, triggeringIds: [...references]}] : [];
  });
  facts.set('metrics.pilotBlockingGateCount', formalGates.filter(g => g.severity.startsWith('BLOCK_')).length);
  const enabledPaths = rules.path_priority.filter(path => matches('P-' + path, facts));
  const primaryPath = enabledPaths[0] ?? 'P0';
  const secondaryPaths = enabledPaths.slice(1, 3);

  const flags: ReadinessResult['flags'] = [];
  for (const questionId of QUESTION_ID_ORDER) {
    if (getAnswerScore(questionId, coreAnswers[questionId]) === null) {
      flags.push({ id: `${questionId}-UNKNOWN`, sourceQuestionIds: [questionId], status: 'self_reported' });
    }
  }

  const budgetBand = (profile.budget_window === 'no_external_spend' || profile.budget_ceiling === 0
    ? 'none' : getProfileString(profile, 'budget_band')) as BudgetBand;
  const findings = technicalFindings(profile, input.extendedAnswers ?? {});
  const specialistReview = facts.get('gate.URGENT-REGULATED') === true || findings.some(({flag}) =>
    flag === 'flag.high_impact_review' || flag === 'flag.sensitive_data_review',
  );
  const safetyContextConfirmed = Object.entries(SAFETY_CONTEXT_VALUES).every(([field, values]) =>
    values.has(getProfileString(profile, field)),
  );
  let costFit: ReadinessResult['costFit'];
  if (specialistReview) costFit = 'specialist_review';
  else if (budgetBand === 'unknown') costFit = 'unknown';
  else if (budgetBand === 'none') costFit = 'no_cash_option';
  else if (budgetBand === 'limited' || budgetBand === 'moderate' || budgetBand === 'flexible') costFit = 'possible_not_priced';
  else costFit = 'unknown';

  const pilotReviewRequired = !safetyContextConfirmed || specialistReview || findings.some(({flag}) =>
    flag === 'flag.no_human_fallback' || flag === 'flag.no_ai_use_controls' || flag === 'flag.no_safety_tests',
  );
  const actionPath = primaryPath === 'P5' && pilotReviewRequired ? 'P0' : primaryPath;
  const actionIds = recommendActions(actionPath, secondaryPaths, dimensions, profile,
    specialistReview, findings.flatMap(({actionIds}) => actionIds), pilotReviewRequired);
  const probeEvidence = probes.flatMap(({id, prompt}) => {
    const answer = probeAnswers.get(id);
    return answer ? [{id, prompt, answer}] : [];
  });

  return {
    score: {
      lowerEighths: Math.round(lowerEighths),
      upperEighths: Math.round(upperEighths),
      coverageUnits: Math.round(coverageUnits),
    },
    safetyContextConfirmed,
    technicalFindings: findings,
    specialistReview,
    pilotReviewRequired,
    probeEvidence,
    dimensions: {
      STR: { lower: Number(dimensions.STR.lower.toFixed(2)), upper: Number(dimensions.STR.upper.toFixed(2)), known: dimensions.STR.known },
      PRO: { lower: Number(dimensions.PRO.lower.toFixed(2)), upper: Number(dimensions.PRO.upper.toFixed(2)), known: dimensions.PRO.known },
      DAT: { lower: Number(dimensions.DAT.lower.toFixed(2)), upper: Number(dimensions.DAT.upper.toFixed(2)), known: dimensions.DAT.known },
      TEC: { lower: Number(dimensions.TEC.lower.toFixed(2)), upper: Number(dimensions.TEC.upper.toFixed(2)), known: dimensions.TEC.known },
      PEO: { lower: Number(dimensions.PEO.lower.toFixed(2)), upper: Number(dimensions.PEO.upper.toFixed(2)), known: dimensions.PEO.known },
      GOV: { lower: Number(dimensions.GOV.lower.toFixed(2)), upper: Number(dimensions.GOV.upper.toFixed(2)), known: dimensions.GOV.known },
      MET: { lower: Number(dimensions.MET.lower.toFixed(2)), upper: Number(dimensions.MET.upper.toFixed(2)), known: dimensions.MET.known },
    },
    formalGates: formalGates,
    flags,
    primaryPath,
    secondaryPaths,
    actionIds,
    costFit,
    ruleVersion: rules.version,
  };
}

export function getDisplayBand(score: number): string {
  return toBand(score);
}
