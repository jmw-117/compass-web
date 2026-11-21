import bank from '../../docs/domain/question_bank.json';
import rules from '../../docs/domain/rules.json';

export default function MethodNote() {
  return <details className="answer-review"><summary>How your result is calculated</summary>
    <p>Each of the 14 answers describes a practice from 0 to 4. The two practices in each area count equally. Their weighted average is expressed out of 100.</p>
    <ul>{bank.dimensions.map(d => <li key={d.id}>{d.description} · {d.weight_pct}%</li>)}</ul>
    <p>{rules.scoring.band_names.map((name,i) => name + ' starts at ' + rules.scoring.band_thresholds_eighths[i]! / 8).join('. ')}. Bands use the unrounded score.</p>
    <p>An uncertain answer could score anywhere from 0 to 4. Its weight widens your range. Check a recent record or example to narrow it.</p>
    <p>These weights and thresholds are provisional. Your answers describe organisational practices. Use-case guidance separately considers the risks of the work you propose. Neither is independent validation.</p>
  </details>;
}
