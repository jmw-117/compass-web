const scopeOrder = ['current_ai_use', 'planned_ai_use', 'high_impact_ai_workflow', 'data_category', 'planned_use_real_data'] as const;

export function safetyFields(profile: Record<string, unknown>) {
  const noUse = profile.current_ai_use === 'none' && profile.planned_ai_use === 'no';
  return scopeOrder.filter(field => {
    if (field === 'planned_use_real_data') return profile.planned_ai_use !== 'no';
    if (field === 'high_impact_ai_workflow' || field === 'data_category') return !noUse;
    return true;
  });
}
