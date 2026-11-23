export type Screen = 'start' | 'preview' | 'preview-summary' | 'core' | 'review' | 'context' | 'safety' | 'results';

export function restorePosition(
  screen: unknown, index: unknown, coreValid: boolean[], safetyValid: boolean[], previewLength: number,
): {screen: Screen; index: number} {
  const requestedIndex = typeof index === 'number' && Number.isSafeInteger(index) && index >= 0 ? index : 0;
  function bounded(flags: boolean[], offset = 0) {
    const firstMissing = flags.indexOf(false);
    const limit = firstMissing < 0 ? flags.length - 1 : firstMissing;
    return Math.max(0, Math.min(requestedIndex, limit - offset, flags.length - 1 - offset));
  }

  if (!['preview','preview-summary','core','safety','review','context','results'].includes(String(screen))) return {screen:'start', index:0};
  if (screen === 'safety') return {screen, index:bounded(safetyValid)};
  const missingSafety = safetyValid.indexOf(false);
  if (missingSafety >= 0) return {screen:'safety', index:missingSafety};
  if (screen === 'preview') return {screen, index:bounded(coreValid.slice(0,previewLength))};
  const missing = coreValid.indexOf(false);
  if (missing >= 0 && missing < previewLength) return {screen:'preview', index:missing};
  if (screen === 'preview-summary') return {screen,index:0};
  if (screen === 'core') return {screen,index:bounded(coreValid,previewLength)};
  if (missing >= 0) return {screen:'core',index:missing-previewLength};
  if (screen === 'results' || screen === 'context') return {screen, index: 0};
  return {screen: 'review', index: 0};
}
