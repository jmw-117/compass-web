import type {ReadinessResult} from '../domain/evaluate';

export default function DecisionSummary({result}: {result: ReadinessResult}) {
  return <section className="decision-summary" aria-label="Use-case decision">
    <p><strong>AI Use-Case Guidance</strong><br/>{result.useCaseGuidance}</p>
    <p><strong>Delivery Capacity</strong><br/>{result.deliveryCapacity}</p>
    <p><strong>Financial Benefit Evidence</strong><br/>{result.financialEvidence}</p>
    {result.concerns.length > 0 && <ul>{result.concerns.map(reason => <li key={reason}>{reason}</li>)}</ul>}
  </section>;
}
