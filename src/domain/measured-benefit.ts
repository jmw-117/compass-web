/** Monthly values are supplied by the respondent for comparable, observed work. */
export function measuredBenefit(profile: Record<string, unknown>, financialEvidence: string) {
  const lines: string[] = [];
  if (profile.baseline_known !== 'yes' || profile.benefit_comparable !== true) return lines;
  const figure = (key: string) => {
    const v = profile[key];
    return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1e9 ? v : undefined;
  };
  const before = figure('minutes_before'), after = figure('minutes_after'), count = figure('cases_month');
  const format = (n: number) => n.toLocaleString('en-GB', {maximumFractionDigits:1});
  if (before !== undefined && after !== undefined && count !== undefined && Number.isInteger(count) && count > 0) {
    const hours = (before - after) * count / 60;
    lines.push(`At ${format(count)} cases per month, the reported change from ${format(before)} to ${format(after)} minutes per case means ${format(Math.abs(hours))} staff hours ${hours < 0 ? 'added' : 'released'} per month. This measures capacity.`);
  }
  const gross = figure('cash_benefit'), cost = figure('cash_running'), upfront = figure('cash_setup');
  const currency = String(profile.benefit_currency);
  if (financialEvidence === 'Supported by available evidence' && ['GBP','USD','EUR','KES'].includes(currency) && gross !== undefined && cost !== undefined) {
    const net = gross - cost;
    lines.push(`Reported monthly cash benefit less running costs: ${currency} ${format(gross)} minus ${currency} ${format(cost)} = ${currency} ${format(net)}.`);
    if (upfront !== undefined && upfront > 0) {
      lines.push(`If that monthly change holds for 12 months, first-year return on the ${currency} ${format(upfront)} setup cost would be ${format((12 * net - upfront) / upfront * 100)}%. This is a scenario based on your figures.`);
    }
  }
  return lines;
}
