import probes from '../../docs/domain/probes.json' with { type: 'json' };
import extension from '../../docs/domain/technical_extension.json' with { type: 'json' };

type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { q: string; max_score?: number; unknown?: boolean }
  | { profile: string; in?: string[]; eq?: string };

function applies(condition: Condition, profile: Record<string, unknown>, score: (id: string) => number | null): boolean {
  if ('all' in condition) return condition.all.every((item) => applies(item, profile, score));
  if ('any' in condition) return condition.any.some((item) => applies(item, profile, score));
  if ('profile' in condition) {
    const value = profile[condition.profile];
    return typeof value === 'string' && (condition.in?.includes(value) ?? value === condition.eq);
  }
  const value = score(condition.q);
  return condition.unknown ? value === null : value !== null && condition.max_score !== undefined && value <= condition.max_score;
}

export function activeProbes(profile: Record<string, unknown>, score: (id: string) => number | null) {
  return probes.rules.filter(({id,when}) => applies(when, profile, score) &&
    !(id === 'PR-MET-START' && ['yes','no'].includes(String(profile.baseline_known)))).slice(0, probes.cap);
}

export function applicableTechnicalQuestions(profile: Record<string, unknown>) {
  if (profile.extended_assessment !== true) return [];
  const currentUse = profile.current_ai_use;
  const currentOrPlanned = currentUse === 'team_pilot' || currentUse === 'operational' || profile.planned_ai_use === 'yes';
  if (profile.diagnostic_scope === 'guided') {
    const ids = currentOrPlanned || currentUse === 'personal'
      ? ['EX-CMP-01','EX-ARC-02','EX-TST-01','EX-QUICK-VENDOR','EX-QUICK-CONTINUITY']
      : ['EX-QUICK-FIRST','EX-DTS-01','EX-QUICK-VENDOR','EX-QUICK-CONTINUITY'];
    return [...extension.questions,...extension.quick_checks].filter(q=>ids.includes(q.id));
  }
  return [...extension.questions, ...extension.quick_checks].filter(({applies_when: condition}) =>
    condition === 'ALL' ||
    (condition === 'AI_INTENT' && (currentOrPlanned || currentUse === 'personal')) ||
    (condition === 'CURRENT_OR_PLANNED' && currentOrPlanned),
  );
}

const flagRules: Record<string, Record<string, string>> = extension.flag_generation;
const flagActions: Record<string, string[]> = extension.flag_to_existing_action_ids;

export function technicalFindings(profile: Record<string, unknown>, answers: Record<string, string>) {
  return applicableTechnicalQuestions(profile).flatMap((question) => {
    const choice = question.choices.find(({id}) => id === answers[question.id]);
    if (!choice) return [];
    const flag = flagRules[question.flag]?.[choice.value];
    return [{
      questionId: question.id,
      prompt: question.prompt,
      response: choice.label,
      flag,
      actionIds: flag ? (flagActions[flag.slice('flag.'.length)] ?? []) : [],
    }];
  });
}
