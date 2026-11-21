import {catalogActions} from './recommendations.ts';
import {getDisplayBand, type ReadinessResult} from './evaluate.ts';

type ReadinessSummary = Pick<ReadinessResult, 'score' | 'primaryPath' | 'secondaryPaths' | 'actionIds'> & Partial<Pick<ReadinessResult, 'pilotReviewRequired' | 'specialistReview' | 'deliveryCapacity' | 'useCaseGuidance'>>;

export type TrafficLightSignal = {
  color: 'red' | 'amber' | 'green';
  label: 'Red' | 'Amber' | 'Green';
  title: string;
  description: string;
  rangeNote: string;
};

const SIGNALS_BY_BAND: Record<string, TrafficLightSignal> = {
  Foundational: {
    color: 'red',
    label: 'Red',
    title: 'Not Ready Yet',
    description: 'Address foundational gaps and priority actions before piloting.',
    rangeNote: '',
  },
  Emerging: {
    color: 'amber',
    label: 'Amber',
    title: 'Building Readiness',
    description: 'Strengthen the outstanding foundations and verify unknowns before piloting.',
    rangeNote: '',
  },
  Developing: {
    color: 'amber',
    label: 'Amber',
    title: 'Building Readiness',
    description: 'Strengthen the outstanding foundations and verify unknowns before piloting.',
    rangeNote: '',
  },
  Established: {
    color: 'green',
    label: 'Green',
    title: 'Strong Foundations',
    description: 'The core indicators suggest stronger foundations; validate the specific use case and safeguards before deployment.',
    rangeNote: '',
  },
};

function getSignalForBand(band: string): TrafficLightSignal {
  const signal = SIGNALS_BY_BAND[band];
  if (!signal) throw new Error(`Unsupported readiness band: ${band}`);
  return signal;
}

const PATH_RECOMMENDATIONS: Record<string, {title: string; guidance: string}> = {
  P0: {
    title: 'Verify The Unknowns',
    guidance: 'Confirm the unanswered details that could change this decision. Start by checking one important information source, its quality, and who is accountable for it.',
  },
  P1: {
    title: 'Strengthen Operating Foundations',
    guidance: 'Write down one repeated workflow from start to finish, then measure its time or errors before choosing a change.',
  },
  P2: {
    title: 'Protect Information First',
    guidance: 'Put clear data-handling rules and human escalation in place before using real or sensitive information with AI.',
  },
  P3: {
    title: 'Build People Capability',
    guidance: 'Run a short practical AI-literacy walkthrough, name someone to support adoption, and agree how people will check outputs.',
  },
  P4: {
    title: 'Connect And Streamline Digital Work',
    guidance: 'Map where information is copied between tools, then choose one avoidable handoff to simplify before considering an integration.',
  },
  P5: {
    title: 'Prepare A Measured, Low-Risk Pilot',
    guidance: 'Define one bounded pilot with a baseline, an accountable owner, human review, and a clear way to stop if it does not work.',
  },
  P6: {
    title: 'Get Specialist Review Before Piloting',
    guidance: 'Pause piloting and seek appropriate domain-specific review before using AI in this high-impact context.',
  },
};

const DEFAULT_RECOMMENDATION = {
  title: 'Verify The Unknowns',
  guidance: 'Confirm the unanswered details that could change this decision. Start by checking one important information source, its quality, and who is accountable for it.',
};

const QUESTION_LABELS: Record<string, string> = {
  'STR-01': 'business goal and desired outcome',
  'STR-02': 'who can approve an AI or automation use case',
  'PRO-01': 'how consistently the main workflow is performed',
  'PRO-02': 'how recurring work problems are identified',
  'DAT-01': 'reliability of the business records you use',
  'DAT-02': 'who maintains and safeguards business records',
  'TEC-01': 'where everyday business records are kept',
  'TEC-02': 'how records from different systems are combined',
  'PEO-01': 'team confidence in learning and checking AI-assisted work',
  'PEO-02': 'who supports the team through change',
  'GOV-01': 'what rules protect sensitive information in digital or AI tools',
  'GOV-02': 'how important AI-assisted decisions are checked before action',
  'MET-01': 'how you measure whether a change is helping',
  'MET-02': 'how you check whether a business change is working',
};

const GATE_LABELS: Record<string, string> = {
  'URGENT-REGULATED': 'High-impact AI use needs specialist review',
  'GOV-DATA': 'Data protection and AI safeguards need review',
  'DATA-POOR': 'Records contain reported errors or gaps',
  'DATA-UNKNOWN': 'Essential data details need confirmation',
  'OWN-NONE': 'An accountable decision owner has not been identified',
  'BASELINE-MISSING': 'A reliable business baseline is not yet available',
};

const SEVERITY_LABELS: Record<string, string> = {
  BLOCK_PILOT: 'Do not pilot until this is addressed',
  BLOCK_UNCONTROLLED_AI: 'Do not use AI with uncontrolled data',
  VERIFY: 'Needs confirmation',
  BLOCK_FINANCIAL_CLAIMS: 'Do not make financial claims',
};

export function getActionLabel(actionId: string): string {
  return catalogActions.get(actionId)?.title ?? 'Review the recommended next step';
}

export function getQuestionLabel(questionId: string): string {
  return QUESTION_LABELS[questionId] ?? 'assessment question';
}

export function getGateLabel(gateId: string): string {
  return GATE_LABELS[gateId] ?? 'Additional safety check';
}

export function getSeverityLabel(severity: string): string {
  return SEVERITY_LABELS[severity] ?? 'Review required';
}

export function getCostFitLabel(costFit: ReadinessResult['costFit']): string {
  const labels: Record<ReadinessResult['costFit'], string> = {
    no_cash_option: 'A no-external-cash option is listed; it still requires staff time.',
    within_verified_ceiling: 'The reviewed estimate is within the stated ceiling; confirm current costs and scope before deciding.',
    possible_not_priced: 'Costs have not been verified yet.',
    unknown: 'Cost fit is unknown.',
    specialist_review: 'Specialist review is needed before costs can be assessed.',
  };
  return labels[costFit];
}

export function getSafetyChecksMessage(
  readiness: Pick<ReadinessResult, 'formalGates' | 'safetyContextConfirmed'>,
): string {
  if (!readiness.safetyContextConfirmed) {
    return 'Safety context is incomplete or includes “Not sure”. Other checks may apply; this report is not a safety clearance.';
  }
  if (readiness.formalGates.length > 0) {
    return 'Formal safety checks have been triggered. Review them; this report is not a safety clearance.';
  }
  return 'No formal safety checks were triggered for the context entered. This report is not a safety clearance.';
}

export function getReportGuidance(readiness: ReadinessSummary) {
  const recommendation = readiness.specialistReview ? PATH_RECOMMENDATIONS.P6 ?? DEFAULT_RECOMMENDATION
    : readiness.primaryPath === 'FEASIBILITY' ? {
      title: 'Confirm the next practical step',
      guidance: readiness.deliveryCapacity === 'Unconfirmed' ? 'All core answers are known. Confirm who can set aside time for the proposed work.' :
        readiness.deliveryCapacity === 'Unavailable' ? 'All core answers are known. Revisit timing when someone can commit time.' : 'Review the workflow and the safeguards that still need evidence.',
    } : readiness.pilotReviewRequired && readiness.primaryPath === 'P5' ? {
      title: 'Review safeguards before planning a pilot',
      guidance: 'Complete the missing context and review the evidence with the responsible owner before planning any pilot.',
    } : PATH_RECOMMENDATIONS[readiness.primaryPath] ?? DEFAULT_RECOMMENDATION;
  const isExactScore = readiness.score.lowerEighths === readiness.score.upperEighths;
  const lowerScore = Math.floor(readiness.score.lowerEighths / 8);
  const upperScore = Math.ceil(readiness.score.upperEighths / 8);
  const lowerBand = getDisplayBand(readiness.score.lowerEighths);
  const upperBand = getDisplayBand(readiness.score.upperEighths);
  const lowerSignal = getSignalForBand(lowerBand);
  const upperSignal = getSignalForBand(upperBand);
  const signal: TrafficLightSignal = {
    ...lowerSignal,
    rangeNote: lowerSignal.color === upperSignal.color
      ? ''
      : `This range also reaches ${upperSignal.label.toLowerCase()} territory. The cautious signal follows the lower bound until uncertain answers are confirmed.`,
  };

  const scoreValue = isExactScore
    ? `${Math.round(readiness.score.lowerEighths / 8)}`
    : `${lowerScore} to ${upperScore}`;

  return {
    title: recommendation.title,
    primaryPathLabel: recommendation.title,
    secondaryPathLabels: readiness.secondaryPaths.map(
      (path) => PATH_RECOMMENDATIONS[path]?.title ?? 'Additional readiness focus',
    ),
    signal,
    scoreLabel: isExactScore ? 'Readiness Score' : 'Readiness Range',
    scoreValue,
    scoreText: `${scoreValue} out of 100`,
    scoreNote: isExactScore
      ? ''
      : 'This is a range, not a single score. “I am not sure” answers can change the result; confirming them may narrow the range.',
    bandText: isExactScore
      ? `The score is in the ${lowerBand} band.`
      : lowerBand === upperBand
      ? `This range sits within the ${lowerBand} band.`
      : `This range spans the ${lowerBand} to ${upperBand} bands; it does not support one maturity band.`,
    guidance: recommendation.guidance,
    firstActionId: readiness.actionIds[0] ?? null,
    actions: readiness.actionIds.map((id) => ({id, label: getActionLabel(id)})),
    firstActionLabel: readiness.actionIds[0] ? getActionLabel(readiness.actionIds[0]) : null,
  };
}
