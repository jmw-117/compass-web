import catalog from '../../docs/domain/action_catalog.json' with { type: 'json' };
import rules from '../../docs/domain/rules.json' with { type: 'json' };
import type { DimensionId, ReadinessResult } from './evaluate.ts';

export const catalogActions = new Map(catalog.actions.map((action) => [action.id, action]));

export function recommendActions(
  primaryPath: string,
  otherPaths: string[],
  dimensions: ReadinessResult['dimensions'],
  profile: Record<string, unknown>,
  specialistReview: boolean,
  technicalActionIds: string[],
  pilotReviewRequired: boolean,
) {
  const paths = new Set([primaryPath, ...otherPaths]);
  const candidates = new Set<string>();
  const constraints: Record<string, string[]> = rules.budget.qualitative_candidate_classes;
  const budget = profile.budget_window === 'no_external_spend' || profile.budget_ceiling === 0
    ? 'none'
    : typeof profile.budget_band === 'string' ? profile.budget_band : 'unknown';
  const classes = constraints[budget] ?? ['C0'];
  const hasCapacity = profile.staff_capacity === 'limited' || profile.staff_capacity === 'available';
  const goal = typeof profile.primary_goal === 'string' ? profile.primary_goal : '';
  const ranking = rules.action_ranking;

  function addCandidate(id: string) {
    const action = catalogActions.get(id);
    if (!action || candidates.has(id)) return;
    candidates.add(id);
    action.prerequisite_ids.forEach(addCandidate);
  }

  for (const action of catalog.actions) {
    if (paths.has(action.path)) addCandidate(action.id);
  }
  technicalActionIds.forEach(addCandidate);
  if (specialistReview) addCandidate('A20');

  function rank(action: (typeof catalog.actions)[number]) {
    const severity = (4 - dimensions[action.dimension as DimensionId].upper) / 4;
    const goalFit = action.goal_tags.includes(goal) || action.goal_tags.includes('all');
    const feasibility = action.cost_class === 'C0' && profile.staff_capacity !== 'none' ? 1
      : action.cost_class === 'C1' && hasCapacity && classes.includes('C1') ? 0.5 : 0;
    return ranking.severity * severity + ranking.dependency_unlock * action.dependency_unlock / 3 +
      ranking.goal_alignment * Number(goalFit) + ranking.feasibility * feasibility;
  }

  function safetyPriority(id: string, path: string) {
    if (specialistReview && id === 'A20') return 2;
    return Number(path === primaryPath && (path === 'P2' || path === 'P6'));
  }

  const eligible = catalog.actions
    .filter(({id, path, cost_class: costClass}) =>
      candidates.has(id) &&
      (classes.includes(costClass) || (specialistReview && id === 'A20')) &&
      (path !== 'P5' || (!pilotReviewRequired && paths.has(path))),
    )
    .sort((a, b) => safetyPriority(b.id, b.path) - safetyPriority(a.id, a.path) ||
      rank(b) - rank(a) || rules.path_priority.indexOf(a.path) - rules.path_priority.indexOf(b.path) ||
      a.id.localeCompare(b.id));

  const selected: string[] = [];
  while (selected.length < 3) {
    const next = eligible.find(({id, prerequisite_ids: prerequisites}) =>
      !selected.includes(id) && prerequisites.every((prerequisite) => selected.includes(prerequisite)),
    );
    if (!next) break;
    selected.push(next.id);
  }
  return selected;
}
