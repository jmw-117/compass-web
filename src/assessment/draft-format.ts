import bank from '../../docs/domain/question_bank.json' with {type:'json'};
export const draftLifetime = 30 * 24 * 60 * 60 * 1000;
export function encodeDraft(fields: Record<string,unknown>, now = Date.now()) {
  return JSON.stringify({...fields,draftVersion:2,questionVersion:bank.version,savedAt:now});
}
export function decodeDraft(raw: string, now = Date.now()) {
  if(raw.length > 32768) throw Error('Draft too large');
  const value = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value) || !value.profile || !value.answers ||
    typeof value.profile !== 'object' || Array.isArray(value.profile) || typeof value.answers !== 'object' || Array.isArray(value.answers)) throw Error('Invalid draft');
  if(value.draftVersion !== undefined && value.draftVersion !== 2) throw Error('Incompatible draft');
  if(value.draftVersion === 2 && (!Number.isFinite(value.savedAt) || value.savedAt > now || now-value.savedAt >= draftLifetime)) throw Error('Expired draft');
  const migrated = value.questionVersion !== bank.version;
  // The previous question bank measured different practices under the same option IDs.
  if(migrated) {value.answers={}; value.probeAnswers={};}
  return {fields:value as Record<string,unknown>, migrated};
}
