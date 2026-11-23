import {measuredBenefit} from '../domain/measured-benefit.ts';
import type {ReadinessResult} from '../domain/evaluate.ts';
import {actionIllustration} from './action-illustrations.ts';
import {dimensionRows, getDimensionLabel} from '../domain/dimension-display.ts';
import {decisionRows, positiveCapabilities, getActionLabel, getCostFitLabel, getQuestionLabel, getReportGuidance} from '../domain/report-guidance.ts';
import {catalogActions} from '../domain/recommendations.ts';
import questionBank from '../../docs/domain/question_bank.json' with {type: 'json'};
import manifest from '../../docs/domain/VERSION_MANIFEST.json' with {type: 'json'};

type ProfileLike = {
  organizationType?: string;
  industry?: string;
  businessGoal?: string;
  current_ai_use?: string;
  data_category?: string;
  high_impact_ai_workflow?: string;
  planned_ai_use?: string;
  planned_use_real_data?: string;
  [key: string]: unknown;
};

export type ReportInput = {
  assessmentId: string;
  profile: ProfileLike;
  answers: Record<string, string>;
  readiness: ReadinessResult;
};

export function buildReportContent({assessmentId, profile, answers, readiness}: ReportInput, date: string) {
  const reportGuidance = getReportGuidance(readiness);
  const areas = dimensionRows(readiness.dimensions);
  const decisions = decisionRows(readiness);
  const evidence = questionBank.questions.map(({id, dimension, prompt, options}) => {
    const selected = options.find(option => option.id === answers[id]);
    return {id, area: getDimensionLabel(dimension), prompt, answer: selected?.label ?? 'No answer recorded', uncertain: selected?.score == null};
  });
  const known = areas.reduce((total, area) => total + area.known, 0);
  const strengths = positiveCapabilities(readiness.dimensions).map(([id]) => getDimensionLabel(id));
  const capability = strengths.length ? 'Your strongest reported practices are in ' + strengths.join(' and ') + '.' : 'No area has sufficient positive evidence to identify a strength.';
  const benefit = measuredBenefit(profile, readiness.financialEvidence);
  const method = 'Two questions per area measure practices from 0 to 4. The weighted total gives organisational readiness. Unknown answers span the full scale. A confirmed stop condition takes precedence over a high score. Unresolved safety evidence requires review. The weights and thresholds are provisional.';
  const actions = readiness.actionPlan.map(({id, title, step, outcome, owner, effort, category, context}) => {
    const action = catalogActions.get(id);
    const paragraphs: string[] = [];
    if (action) {
      paragraphs.push(`Owner: ${owner}. Effort: ${effort}. Cost: ${category}.`);
      if (id === readiness.actionIds[0] && context) paragraphs.push(context);
      paragraphs.push(step + ' ' + outcome);
      paragraphs.push('Evidence to review: ' + action.evidence_question_ids.map(getQuestionLabel).join(', ') + '.');
      if (action.prerequisite_ids.length) paragraphs.push('Complete first: ' + action.prerequisite_ids.map(getActionLabel).join(', ') + '.');
      paragraphs.push('Done when: ' + action.validation);
    }
    const dimension = action?.dimension ?? 'PRO';
    return {id, title, paragraphs, area: getDimensionLabel(dimension), illustration: actionIllustration(id, dimension)};
  });
  const business = [
    {label: 'Organisation Type', value: profile.organizationType || 'Not shared'},
    {label: 'Industry / Sector', value: profile.industry || 'Not shared'},
    {label: 'Business Goal', value: profile.businessGoal || 'Not yet defined'},
  ];
  const useContext = [
    {label: 'Current AI Use', value: profile.current_ai_use || 'Not answered'},
    {label: 'Data Category', value: profile.data_category || 'Not answered'},
    {label: 'High-Impact AI Workflow', value: profile.high_impact_ai_workflow || 'Not answered'},
    {label: 'Planned AI Use', value: profile.planned_ai_use || 'Not answered'},
    {label: 'Planned Use of Real Data', value: profile.planned_use_real_data || 'Not answered'},
  ];
  for (const [label, value] of [['Workflow', profile.value_stream], ['Main bottleneck', profile.workflow_bottleneck]] as const) {
    if (typeof value === 'string' && value) useContext.push({label, value: value.replaceAll('_', ' ')});
  }
  useContext.push({label: 'Budget Fit', value: getCostFitLabel(readiness.costFit)});
  const metadata = [
    {key: 'reference', label: 'Assessment reference', value: assessmentId},
    {key: 'date', label: 'Prepared on', value: date},
    {key: 'method', label: 'Method version', value: readiness.ruleVersion},
    {key: 'report', label: 'Report version', value: manifest.report_version},
  ];
  const shareText = [
    'Silverspark Compass readiness summary',
    'Reference: ' + assessmentId,
    'Business: ' + (profile.organizationType || 'Not supplied') + (typeof profile.business_size === 'string' && profile.business_size ? ' · Team size: ' + profile.business_size.replaceAll('_',' ').replace(' plus','+') : ''),
    'Industry: ' + (profile.industry || 'Not supplied'),
    'Goal: ' + (profile.businessGoal || 'Not supplied'),
    reportGuidance.scoreLabel + ': ' + reportGuidance.scoreText,
    ...decisions.map(({label, value}) => label + ': ' + value),
    ...readiness.concerns.slice(0, 2),
    'Next step: ' + (reportGuidance.firstActionLabel ?? reportGuidance.title),
    'I would like to discuss this first action, who should own it and how we would measure the result.',
  ].join('\n');

  return {
    assessmentId, date, reportGuidance, areas, decisions, actions, business, useContext, metadata, evidence, shareText, capability, benefit, method,
    concerns: readiness.concerns,
    coverage: `${known} of ${evidence.length} core answers are known.`,
    opportunity: `${readiness.opportunity.kind}. ${readiness.opportunity.next} ${readiness.opportunity.measure}`,
    disclaimer: 'Self-Reported Assessment — Not Independently Verified',
    noActions: 'No action was identified from these responses.',
  };
}

export type ReportContent = ReturnType<typeof buildReportContent>;
