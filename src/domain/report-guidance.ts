import {getDisplayBand, type ReadinessResult} from './evaluate.ts';

type ReadinessSummary = Pick<ReadinessResult, 'score' | 'primaryPath' | 'actionIds'>;

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

export function getReportGuidance(readiness: ReadinessSummary) {
  const recommendation = PATH_RECOMMENDATIONS[readiness.primaryPath] ?? DEFAULT_RECOMMENDATION;
  const isExactScore = readiness.score.lowerEighths === readiness.score.upperEighths;
  const lowerScore = Math.floor(readiness.score.lowerEighths / 8);
  const upperScore = Math.ceil(readiness.score.upperEighths / 8);
  const lowerBand = getDisplayBand(readiness.score.lowerEighths);
  const upperBand = getDisplayBand(readiness.score.upperEighths);

  return {
    title: recommendation.title,
    scoreLabel: isExactScore ? 'Readiness Score' : 'Readiness Range',
    scoreText: isExactScore
      ? `${Math.round(readiness.score.lowerEighths / 8)} out of 100`
      : `${lowerScore} to ${upperScore} out of 100`,
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
  };
}
