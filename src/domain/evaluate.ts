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
  dimensions: Record<DimensionId, { lower: number; upper: number; known: number }>;
  formalGates: Array<{ id: string; triggeringIds: string[]; severity: string }>;
  flags: Array<{ id: string; sourceQuestionIds: string[]; status: 'self_reported' | 'clarified' | 'example_unverified' }>;
  primaryPath: string;
  secondaryPaths: string[];
  actionIds: string[];
  costFit: 'no_cash_option' | 'within_verified_ceiling' | 'possible_not_priced' | 'unknown' | 'specialist_review';
  ruleVersion: string;
};

const DIMENSION_WEIGHTS: Record<DimensionId, number> = {
  STR: 15,
  PRO: 15,
  DAT: 15,
  TEC: 15,
  PEO: 15,
  GOV: 15,
  MET: 10,
};

const QUESTION_SCORE_MAP: Record<string, Record<string, number | null>> = {
  'STR-01': { 'STR-01-L0': 0, 'STR-01-L1': 1, 'STR-01-L2': 2, 'STR-01-L3': 3, 'STR-01-L4': 4, 'STR-01-UNK': null },
  'STR-02': { 'STR-02-L0': 0, 'STR-02-L1': 1, 'STR-02-L2': 2, 'STR-02-L3': 3, 'STR-02-L4': 4, 'STR-02-UNK': null },
  'PRO-01': { 'PRO-01-L0': 0, 'PRO-01-L1': 1, 'PRO-01-L2': 2, 'PRO-01-L3': 3, 'PRO-01-L4': 4, 'PRO-01-UNK': null },
  'PRO-02': { 'PRO-02-L0': 0, 'PRO-02-L1': 1, 'PRO-02-L2': 2, 'PRO-02-L3': 3, 'PRO-02-L4': 4, 'PRO-02-UNK': null },
  'DAT-01': { 'DAT-01-L0': 0, 'DAT-01-L1': 1, 'DAT-01-L2': 2, 'DAT-01-L3': 3, 'DAT-01-L4': 4, 'DAT-01-UNK': null },
  'DAT-02': { 'DAT-02-L0': 0, 'DAT-02-L1': 1, 'DAT-02-L2': 2, 'DAT-02-L3': 3, 'DAT-02-L4': 4, 'DAT-02-UNK': null },
  'TEC-01': { 'TEC-01-L0': 0, 'TEC-01-L1': 1, 'TEC-01-L2': 2, 'TEC-01-L3': 3, 'TEC-01-L4': 4, 'TEC-01-UNK': null },
  'TEC-02': { 'TEC-02-L0': 0, 'TEC-02-L1': 1, 'TEC-02-L2': 2, 'TEC-02-L3': 3, 'TEC-02-L4': 4, 'TEC-02-UNK': null },
  'PEO-01': { 'PEO-01-L0': 0, 'PEO-01-L1': 1, 'PEO-01-L2': 2, 'PEO-01-L3': 3, 'PEO-01-L4': 4, 'PEO-01-UNK': null },
  'PEO-02': { 'PEO-02-L0': 0, 'PEO-02-L1': 1, 'PEO-02-L2': 2, 'PEO-02-L3': 3, 'PEO-02-L4': 4, 'PEO-02-UNK': null },
  'GOV-01': { 'GOV-01-L0': 0, 'GOV-01-L1': 1, 'GOV-01-L2': 2, 'GOV-01-L3': 3, 'GOV-01-L4': 4, 'GOV-01-UNK': null },
  'GOV-02': { 'GOV-02-L0': 0, 'GOV-02-L1': 1, 'GOV-02-L2': 2, 'GOV-02-L3': 3, 'GOV-02-L4': 4, 'GOV-02-UNK': null },
  'MET-01': { 'MET-01-L0': 0, 'MET-01-L1': 1, 'MET-01-L2': 2, 'MET-01-L3': 3, 'MET-01-L4': 4, 'MET-01-UNK': null },
  'MET-02': { 'MET-02-L0': 0, 'MET-02-L1': 1, 'MET-02-L2': 2, 'MET-02-L3': 3, 'MET-02-L4': 4, 'MET-02-UNK': null },
};

const QUESTION_ID_ORDER = Object.keys(QUESTION_SCORE_MAP) as Array<keyof typeof QUESTION_SCORE_MAP>;
const DIMENSION_ORDER: DimensionId[] = ['STR', 'PRO', 'DAT', 'TEC', 'PEO', 'GOV', 'MET'];

function getQuestionDimension(questionId: string): DimensionId {
  if (questionId.startsWith('STR')) return 'STR';
  if (questionId.startsWith('PRO')) return 'PRO';
  if (questionId.startsWith('DAT')) return 'DAT';
  if (questionId.startsWith('TEC')) return 'TEC';
  if (questionId.startsWith('PEO')) return 'PEO';
  if (questionId.startsWith('GOV')) return 'GOV';
  return 'MET';
}

function getAnswerScore(questionId: string, optionId: string | undefined): number | null {
  if (!optionId) return null;
  return QUESTION_SCORE_MAP[questionId]?.[optionId] ?? null;
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  return '';
}

function getProfileString(profile: Record<string, unknown>, key: string): string {
  return asString(profile[key]);
}

function toBand(score: number): string {
  if (score >= 600) return 'Established';
  if (score >= 400) return 'Developing';
  if (score >= 200) return 'Emerging';
  return 'Foundational';
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
    if (current.known > 0) {
      current.lower = current.lower / (current.known * DIMENSION_WEIGHTS[dimension]);
      current.upper = current.upper / (current.known * DIMENSION_WEIGHTS[dimension]);
    } else {
      current.lower = 0;
      current.upper = 4;
    }
  }

  const gateMap: Record<string, { triggered: boolean; ids: string[]; severity: string }> = {
    'URGENT-REGULATED': {
      triggered: false,
      ids: ['profile.high_impact_ai_workflow', 'profile.current_ai_use', 'profile.planned_ai_use'],
      severity: 'BLOCK_PILOT',
    },
    'GOV-DATA': {
      triggered: false,
      ids: ['probe.PR-GOV-SHARE', 'profile.data_category', 'answer.GOV-01', 'profile.planned_use_real_data'],
      severity: 'BLOCK_UNCONTROLLED_AI',
    },
    'DATA-UNKNOWN': {
      triggered: false,
      ids: ['answer.DAT-01', 'answer.DAT-02'],
      severity: 'VERIFY',
    },
    'OWN-NONE': {
      triggered: false,
      ids: ['answer.STR-02', 'probe.PR-STR-OWNER'],
      severity: 'BLOCK_PILOT',
    },
    'BASELINE-MISSING': {
      triggered: false,
      ids: ['answer.MET-01', 'profile.primary_goal', 'probe.PR-MET-START'],
      severity: 'BLOCK_FINANCIAL_CLAIMS',
    },
  };

  const profileHighImpact = getProfileString(profile, 'high_impact_ai_workflow') === 'yes';
  const currentAiUse = getProfileString(profile, 'current_ai_use');
  const plannedAiUse = getProfileString(profile, 'planned_ai_use');
  const urgentGate = gateMap['URGENT-REGULATED'] ?? { triggered: false, ids: [], severity: 'BLOCK_PILOT' };
  urgentGate.triggered =
    (profileHighImpact && ['team_pilot', 'operational'].includes(currentAiUse)) ||
    (profileHighImpact && plannedAiUse === 'yes');
  gateMap['URGENT-REGULATED'] = urgentGate;

  const shareProbe = getProfileString(profile, 'PR-GOV-SHARE');
  const dataCategory = getProfileString(profile, 'data_category');
  const gov01Score = getAnswerScore('GOV-01', coreAnswers['GOV-01']) ?? 0;
  const plannedUseRealData = getProfileString(profile, 'planned_use_real_data');
  const govDataGate = gateMap['GOV-DATA'] ?? { triggered: false, ids: [], severity: 'BLOCK_UNCONTROLLED_AI' };
  govDataGate.triggered =
    (shareProbe === 'Yes' && ['personal', 'restricted'].includes(dataCategory)) ||
    (gov01Score <= 1 && dataCategory === 'restricted' && plannedUseRealData === 'yes');
  gateMap['GOV-DATA'] = govDataGate;

  const dat01Missing = getAnswerScore('DAT-01', coreAnswers['DAT-01']) === null;
  const dat02Missing = getAnswerScore('DAT-02', coreAnswers['DAT-02']) === null;
  const dat01Score = getAnswerScore('DAT-01', coreAnswers['DAT-01']) ?? 0;
  const dataUnknownGate = gateMap['DATA-UNKNOWN'] ?? { triggered: false, ids: [], severity: 'VERIFY' };
  dataUnknownGate.triggered = (dat01Missing && dat02Missing) || dat01Score === 0;
  gateMap['DATA-UNKNOWN'] = dataUnknownGate;

  const str02Score = getAnswerScore('STR-02', coreAnswers['STR-02']) ?? 0;
  const strOwnerProbe = getProfileString(profile, 'PR-STR-OWNER');
  const ownNoneGate = gateMap['OWN-NONE'] ?? { triggered: false, ids: [], severity: 'BLOCK_PILOT' };
  ownNoneGate.triggered =
    str02Score === 0 || (['No one yet', 'Not sure'].includes(strOwnerProbe) && str02Score <= 1);
  gateMap['OWN-NONE'] = ownNoneGate;

  const met01Score = getAnswerScore('MET-01', coreAnswers['MET-01']) ?? 0;
  const primaryGoal = getProfileString(profile, 'primary_goal');
  const metStartProbe = getProfileString(profile, 'PR-MET-START');
  const baselineGate = gateMap['BASELINE-MISSING'] ?? { triggered: false, ids: [], severity: 'BLOCK_FINANCIAL_CLAIMS' };
  baselineGate.triggered =
    met01Score <= 1 && ['efficiency', 'growth', 'service', 'risk'].includes(primaryGoal) && metStartProbe !== 'Yes';
  gateMap['BASELINE-MISSING'] = baselineGate;

  const formalGates = Object.entries(gateMap)
    .filter(([, gate]) => gate.triggered)
    .map(([id, gate]) => ({ id, triggeringIds: gate.ids, severity: gate.severity }));

  const pilotBlockingGateCount = formalGates.filter((gate) =>
    ['BLOCK_PILOT', 'BLOCK_UNCONTROLLED_AI', 'BLOCK_FINANCIAL_CLAIMS'].includes(gate.severity),
  ).length;

  const enabledPaths = new Set<string>();
  if ((gateMap['URGENT-REGULATED'] ?? { triggered: false, ids: [], severity: 'BLOCK_PILOT' }).triggered) enabledPaths.add('P6');
  if ((gateMap['GOV-DATA'] ?? { triggered: false, ids: [], severity: 'BLOCK_UNCONTROLLED_AI' }).triggered) enabledPaths.add('P2');
  if (unknownCount >= 3 || coverageUnits < 150 || (dat01Missing && dat02Missing)) enabledPaths.add('P0');
  if (dimensions.PRO.upper <= 1.5 || dimensions.DAT.upper <= 1.5) enabledPaths.add('P1');
  if ((getAnswerScore('TEC-01', coreAnswers['TEC-01']) ?? 0) <= 2 && (getAnswerScore('TEC-02', coreAnswers['TEC-02']) ?? 0) <= 2) enabledPaths.add('P4');
  if (dimensions.PEO.upper <= 1.5) enabledPaths.add('P3');
  if (
    coverageUnits >= 180 &&
    dimensions.DAT.lower >= 2 &&
    (getAnswerScore('GOV-01', coreAnswers['GOV-01']) ?? 0) >= 2 &&
    (getAnswerScore('GOV-02', coreAnswers['GOV-02']) ?? 0) >= 2 &&
    (getAnswerScore('STR-02', coreAnswers['STR-02']) ?? 0) >= 2 &&
    (getAnswerScore('MET-01', coreAnswers['MET-01']) ?? 0) >= 2 &&
    (getAnswerScore('PEO-01', coreAnswers['PEO-01']) ?? 0) >= 2 &&
    (getAnswerScore('PRO-01', coreAnswers['PRO-01']) ?? 0) >= 2 &&
    (getAnswerScore('TEC-01', coreAnswers['TEC-01']) ?? 0) >= 2 &&
    ['limited', 'available'].includes(getProfileString(profile, 'staff_capacity')) &&
    pilotBlockingGateCount === 0
  ) {
    enabledPaths.add('P5');
  }

  const primaryPath = (() => {
    if (enabledPaths.has('P6')) return 'P6';
    if (enabledPaths.has('P2')) return 'P2';
    if (enabledPaths.has('P0')) return 'P0';
    const orderedPaths = ['P1', 'P4', 'P3', 'P5'];
    for (const path of orderedPaths) {
      if (enabledPaths.has(path)) return path;
    }
    return 'P0';
  })();

  const secondaryPaths = Array.from(enabledPaths).filter((path) => path !== primaryPath).slice(0, 2);

  const flags: ReadinessResult['flags'] = [];
  for (const questionId of QUESTION_ID_ORDER) {
    if (getAnswerScore(questionId, coreAnswers[questionId]) === null) {
      flags.push({ id: `${questionId}-UNKNOWN`, sourceQuestionIds: [questionId], status: 'self_reported' });
    }
  }

  const budgetBand = getProfileString(profile, 'budget_band') as BudgetBand;
  let costFit: ReadinessResult['costFit'];
  if (budgetBand === 'unknown') costFit = 'unknown';
  else if (budgetBand === 'none') costFit = 'no_cash_option';
  else if (budgetBand === 'limited' || budgetBand === 'moderate' || budgetBand === 'flexible') costFit = 'possible_not_priced';
  else costFit = 'unknown';

  const actionIds: string[] = [];
  if (primaryPath === 'P6') actionIds.push('A06-HUMAN-REVIEW');
  if (primaryPath === 'P2') actionIds.push('A02-DATA-GOVERNANCE');
  if (primaryPath === 'P0') actionIds.push('A00-VERIFY-BASELINE');
  if (primaryPath === 'P1') actionIds.push('A01-FOUNDATIONAL-READINESS');
  if (primaryPath === 'P4') actionIds.push('A04-TECH-READINESS');
  if (primaryPath === 'P3') actionIds.push('A03-TEAM-READINESS');
  if (primaryPath === 'P5') actionIds.push('A05-PILOT-READY');

  return {
    score: {
      lowerEighths: Math.round(lowerEighths),
      upperEighths: Math.round(upperEighths),
      coverageUnits: Math.round(coverageUnits),
    },
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
    ruleVersion: '1.2.0',
  };
}

export function getDisplayBand(score: number): string {
  return toBand(score);
}
