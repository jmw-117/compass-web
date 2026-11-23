import type {ReadinessResult} from '../domain/evaluate';

import {decisionRows} from '../domain/report-guidance';

export default function DecisionSummary({result, rows = decisionRows(result)}: {result: ReadinessResult; rows?: ReturnType<typeof decisionRows>}) {
  return <section className="decision-summary" aria-label="Use-case decision">
    {rows.map(({label, value}) => <p key={label}><strong>{label}</strong><br/>{value}</p>)}
    {result.concerns.length > 0 && <ul>{result.concerns.slice(0,2).map(reason => <li key={reason}>{reason}</li>)}</ul>}
    {result.concerns.length > 2 && <details><summary>More findings</summary><ul>{result.concerns.slice(2).map(reason=><li key={reason}>{reason}</li>)}</ul></details>}
  </section>;
}
