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
  useCaseGuidance: 'Hold' | 'Review required' | 'Eligible for controlled pilot planning' | 'Not assessed';
  deliveryCapacity: 'Available' | 'Unconfirmed' | 'Unavailable';
  financialEvidence: 'Supported by available evidence' | 'Unverified' | 'Unsupported';
  concerns: string[];
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
  high_impact_ai_workflow: new Set(['yes', 'decides', 'influences', 'assists', 'no']),
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
  probeAnswers.forEach((value, key) => facts.set('probe.' + key, value || null));
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
  facts.set('metrics.pilotBlockingGateCount', formalGates.filter(g => ['BLOCK_PILOT','BLOCK_UNCONTROLLED_AI'].includes(g.severity)).length);
  const enabledPaths = rules.path_priority.filter(path => matches('P-' + path, facts));
  const strongFoundations = enabledPaths.length === 0 && unknownCount === 0 && lowerEighths >= rules.scoring.band_thresholds_eighths[2]!;
  const primaryPath = enabledPaths[0] ?? (strongFoundations ? 'FEASIBILITY' : unknownCount ? 'P0' : 'P1');
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

  const concerns: string[] = [];
  const hasGate = (id: string) => facts.get('gate.' + id) === true;
  const current = profile.current_ai_use;
  const noUse = current === 'none' && profile.planned_ai_use === 'no';
  const hasFlag = (flag: string) => findings.some(f => f.flag === 'flag.' + flag);
  const scoreOf = (id: string) => getAnswerScore(id, coreAnswers[id]) ?? -1;
  if (probeAnswers.get('PR-GOV-PLANNED') === 'No') concerns.push('Restricted data is planned without adequate safeguards. Hold that use until protections are in place.');
  if (probeAnswers.has('PR-GOV-PLANNED') && !['Yes','No'].includes(probeAnswers.get('PR-GOV-PLANNED') ?? '')) concerns.push('Confirm the protections for planned restricted data.');
  if (probeAnswers.get('PR-GOV-SHARE') === 'Yes') concerns.push('Real personal information was entered without safeguards. Stop that use and review the affected information.');
  if (probeAnswers.get('PR-GOV-SHARE') === 'Yes' && scoreOf('GOV-01') >= 3) concerns.push('The reported data disclosure conflicts with your strong governance answer. Check the last tool use against your rules.');
  if (hasGate('URGENT-REGULATED') || hasFlag('high_impact_review')) concerns.push('AI could affect a significant decision. Obtain specialist review before any pilot.');
  if (!safetyContextConfirmed) concerns.push('Confirm the unanswered or uncertain safety context.');
  const sharingUnresolved = probeAnswers.has('PR-GOV-SHARE') && !['Yes','No'].includes(probeAnswers.get('PR-GOV-SHARE') ?? '');
  if (sharingUnresolved) concerns.push('Confirm whether real personal information entered an AI tool without safeguards.');
  const ownerUnclear = probeAnswers.has('PR-STR-OWNER') && !['Owner or founder','A named manager'].includes(probeAnswers.get('PR-STR-OWNER') ?? '');
  if (ownerUnclear) concerns.push('Identify who is accountable for the change. A sole proprietor can take this role.');
  if (probeAnswers.has('PR-HUMAN-REVIEW') && probeAnswers.get('PR-HUMAN-REVIEW') !== 'An accountable reviewer with authority') concerns.push('Confirm an accountable person independently checks the underlying evidence before deciding.');
  if (hasFlag('no_human_fallback') || hasFlag('no_ai_use_controls') || hasFlag('no_safety_tests')) concerns.push('Your technical answers identify missing controls. Demonstrate an output check and a working human fallback.');
  if (hasFlag('high_impact_review') && profile.high_impact_ai_workflow === 'no') concerns.push('Your technical answers describe consequential data while the use-case answer excludes significant decisions. Confirm the role of AI.');
  if (hasFlag('sensitive_data_review') || hasFlag('data_classification_unknown')) concerns.push('Review the reported data classification and tool safeguards.');
  if (hasGate('DATA-UNKNOWN') || hasGate('DATA-POOR')) concerns.push(hasGate('DATA-POOR') ? 'Check unreliable records against the source before using them in a pilot.' : 'Check a sample of the intended data to establish its quality.');
  if (hasFlag('no_ops_owner')) concerns.push('Identify who monitors the tool and responds when it fails.');
  if (noUse && ['decides','influences','yes','assists'].includes(String(profile.high_impact_ai_workflow))) concerns.push('Your answers describe a decision involving AI but no current or planned use. Clarify the workflow.');
  if (scoreOf('STR-01') >= 3 && hasFlag('no_use_case')) concerns.push('Compare the stated goal with the technical finding that no use case has been identified.');
  if (profile.value_stream === 'hire_to_retire' && hasFlag('high_impact_review') && profile.high_impact_ai_workflow === 'no') concerns.push('You described hiring and a consequential technical use while reporting no significant decision. Clarify whether AI ranks or screens candidates.');
  const hold = hasGate('URGENT-REGULATED') || (hasFlag('high_impact_review') && profile.high_impact_ai_workflow !== 'no') || hasGate('GOV-DATA') || hasGate('OWN-NONE');
  const useCaseGuidance: ReadinessResult['useCaseGuidance'] = hold ? 'Hold' : concerns.length ? 'Review required' : noUse ? 'Not assessed' : 'Eligible for controlled pilot planning';
  const deliveryCapacity = profile.staff_capacity === 'none' ? 'Unavailable' : ['available','limited'].includes(String(profile.staff_capacity)) ? 'Available' : 'Unconfirmed';
  const financialEvidence = hasGate('BASELINE-MISSING') || hasFlag('baseline_missing') ? 'Unsupported' :
    profile.baseline_known === 'yes' && ['cost','revenue'].includes(String(profile.impact_measure)) ? 'Supported by available evidence' : 'Unverified';
  if (scoreOf('MET-01') >= 3 && financialEvidence === 'Unsupported') concerns.push('Measurement is rated highly, but no baseline was identified for this workflow. Record its starting value before estimating benefit.');
  if (scoreOf('STR-01') === 0 && profile.primary_goal && profile.primary_goal !== 'explore') concerns.push('You selected a goal but reported no agreed outcome. Name the workflow and the change you want to see.');
  const pilotReviewRequired = useCaseGuidance !== 'Eligible for controlled pilot planning';
  const actionPath = primaryPath === 'FEASIBILITY' || (primaryPath === 'P5' && pilotReviewRequired) ? 'P1' : primaryPath;
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
    useCaseGuidance, deliveryCapacity, financialEvidence, concerns,
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
