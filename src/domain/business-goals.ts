import profileSchema from '../../docs/domain/profile_schema.json' with {type: 'json'};

type BusinessGoal = {label: string; measure: string; action_tag: string};

const definitions = new Map<string, BusinessGoal>(Object.entries(profileSchema.business_goals));

export const businessGoalOptions = (profileSchema.early_fields.find(field => field.id === 'primary_goal')?.values ?? [])
  .map(id => [id, definitions.get(id)!.label] as const);

export function getBusinessGoal(value: unknown) {
  return typeof value === 'string' ? definitions.get(value) : undefined;
}
