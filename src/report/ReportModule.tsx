import {useMemo, useState} from 'react';
import type {ReadinessResult} from '../domain/evaluate';

type ProfileLike = {
  organizationType?: string;
  industry?: string;
  businessGoal?: string;
  [key: string]: unknown;
};

type ReportModuleProps = {
  profile: ProfileLike;
  answers: Record<string, string>;
  readiness: ReadinessResult;
};

const DIMENSION_LABELS: Record<string, string> = {
  STR: 'Strategy',
  PRO: 'Processes',
  DAT: 'Data',
  TEC: 'Technology',
  PEO: 'People',
  GOV: 'Governance',
  MET: 'Measurement',
};

export default function ReportModule({profile, answers, readiness}: ReportModuleProps) {
  const [copied, setCopied] = useState(false);

  const unknownQuestions = useMemo(
    () => Object.keys(answers).filter((questionId) => !answers[questionId] || answers[questionId].endsWith('-UNK')),
    [answers],
  );

  const assessmentId = useMemo(() => {
    const seed = `${profile.organizationType ?? 'unknown'}-${profile.industry ?? 'unknown'}-${Date.now()}`;
    return `SELF-${seed.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24).toUpperCase()}`;
  }, [profile]);

  const shareText = useMemo(
    () =>
      [
        'Silverspark Compass readiness summary',
        `Assessment ID: ${assessmentId}`,
        `Primary path: ${readiness.primaryPath}`,
        `Readiness interval: [${readiness.score.lowerEighths}, ${readiness.score.upperEighths}]`,
        `Critical gate codes: ${readiness.formalGates.length ? readiness.formalGates.map((gate) => gate.id).join(', ') : 'none'}`,
        'Request to discuss: yes',
      ].join('\n'),
    [assessmentId, readiness],
  );

  async function handleCopySummary() {
    setCopied(false);
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      window.alert('Clipboard access is unavailable in this browser. Please copy the summary manually.');
      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch {
      window.alert('Copy was blocked. Please copy the summary manually from the report.');
    }
  }

  function handleWhatsAppClick() {
    const message = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <article className="report-module" aria-live="polite">
      <header className="report-header">
        <div>
          <p className="eyebrow">document_identity</p>
          <h3>Self-reported assessment — not independently verified</h3>
        </div>
        <div className="report-actions">
          <button type="button" className="button-secondary" onClick={handleCopySummary}>
            {copied ? 'Summary copied' : 'Copy summary'}
          </button>
          <button type="button" className="button-primary" onClick={handleWhatsAppClick}>
            Share via WhatsApp
          </button>
        </div>
      </header>

      <section className="report-section" aria-labelledby="report-executive-summary-title">
        <h4 id="report-executive-summary-title">executive_summary</h4>
        <div className="report-grid">
          <div>
            <p className="report-label">Assessment ID</p>
            <strong>{assessmentId}</strong>
          </div>
          <div>
            <p className="report-label">Overall readiness</p>
            <strong>
              [{readiness.score.lowerEighths}, {readiness.score.upperEighths}] / {readiness.score.coverageUnits}
            </strong>
          </div>
          <div>
            <p className="report-label">Primary path</p>
            <strong>{readiness.primaryPath}</strong>
          </div>
          <div>
            <p className="report-label">Formal gates</p>
            <strong>{readiness.formalGates.length ? readiness.formalGates.map((gate) => gate.id).join(', ') : 'none'}</strong>
          </div>
        </div>
      </section>

      <section className="report-section" aria-labelledby="report-business-snapshot-title">
        <h4 id="report-business-snapshot-title">business_snapshot</h4>
        <ul className="report-list">
          <li>Organisation type: {profile.organizationType || 'Not shared'}</li>
          <li>Industry: {profile.industry || 'Not shared'}</li>
          <li>Business goal: {profile.businessGoal || 'Not yet defined'}</li>
          <li>Budget fit: {readiness.costFit}</li>
        </ul>
      </section>

      <section className="report-section" aria-labelledby="report-methodology-title">
        <h4 id="report-methodology-title">methodology_limitations</h4>
        <p>
          This report is a self-reported assessment based on the browser answers collected in this session. It is not an independent verification, legal review, or certification of client readiness.
        </p>
      </section>

      <section className="report-section" aria-labelledby="report-dimensions-title">
        <h4 id="report-dimensions-title">seven_dimension_results</h4>
        <div className="dimension-report-list">
          {Object.entries(readiness.dimensions).map(([dimensionId, metric]) => (
            <div key={dimensionId} className="report-dimension-item">
              <div className="report-dimension-header">
                <span>{DIMENSION_LABELS[dimensionId] ?? dimensionId}</span>
                <span>
                  [{metric.lower}, {metric.upper}] · coverage {metric.known}/2
                </span>
              </div>
              <div className="dimension-track" aria-hidden="true">
                <span style={{width: `${Math.min(100, (metric.upper / 4) * 100)}%`}} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="report-section" aria-labelledby="report-uncertainty-title">
        <h4 id="report-uncertainty-title">uncertainty_coverage</h4>
        <ul className="report-list">
          {unknownQuestions.length ? (
            unknownQuestions.map((questionId) => <li key={questionId}>Verify {questionId}: confirm the answer before acting on this recommendation.</li>)
          ) : (
            <li>No unknown answers were declared in this draft.</li>
          )}
        </ul>
      </section>

      <section className="report-section" aria-labelledby="report-positive-title">
        <h4 id="report-positive-title">positive_capabilities</h4>
        <ul className="report-list">
          {readiness.actionIds.length ? (
            readiness.actionIds.map((actionId) => <li key={actionId}>Action {actionId} is relevant to the current read-out.</li>)
          ) : (
            <li>No action ID was triggered in this draft; the result remains exploratory.</li>
          )}
        </ul>
      </section>

      <section className="report-section" aria-labelledby="report-gaps-title">
        <h4 id="report-gaps-title">gaps_and_evidence</h4>
        <ul className="report-list">
          {readiness.formalGates.length ? (
            readiness.formalGates.map((gate) => <li key={gate.id}>{gate.id} — {gate.severity}</li>)
          ) : (
            <li>No formal gates are currently triggered for this self-reported profile.</li>
          )}
        </ul>
      </section>

      <section className="report-section" aria-labelledby="report-gates-title">
        <h4 id="report-gates-title">critical_safety_gates</h4>
        <p>{readiness.formalGates.length ? readiness.formalGates.map((gate) => gate.id).join(', ') : 'No critical safety gates are triggered in this draft.'}</p>
      </section>

      <section className="report-section" aria-labelledby="report-path-title">
        <h4 id="report-path-title">primary_path</h4>
        <p>
          Recommended primary path: <strong>{readiness.primaryPath}</strong>. Secondary paths: {readiness.secondaryPaths.length ? readiness.secondaryPaths.join(', ') : 'none'}.
        </p>
      </section>

      <section className="report-section" aria-labelledby="report-actions-title">
        <h4 id="report-actions-title">three_priority_actions</h4>
        <ol className="report-list ordered">
          {readiness.actionIds.slice(0, 3).map((actionId) => (
            <li key={actionId}>{actionId}</li>
          ))}
          {readiness.actionIds.length === 0 && <li>No action is recommended in the current local draft.</li>}
        </ol>
      </section>

      <section className="report-section" aria-labelledby="report-budget-title">
        <h4 id="report-budget-title">budget_and_capacity_fit</h4>
        <p>Budget capacity fit: {readiness.costFit}. This does not imply a verified affordability conclusion.</p>
      </section>

      <section className="report-section" aria-labelledby="report-plan-title">
        <h4 id="report-plan-title">next_30_60_90_days</h4>
        <ul className="report-list">
          <li>Next 30 days: confirm the current evidence trail and resolve any unknown answers.</li>
          <li>Next 60 days: test one or two low-risk workflows using the primary path recommendations.</li>
          <li>Next 90 days: review progress, confirm owners, and decide whether to continue or pause.</li>
        </ul>
      </section>

      <section className="report-section" aria-labelledby="report-cta-title">
        <h4 id="report-cta-title">client_consultation_cta</h4>
        <p>Ask the client whether they want a short consult to discuss the readiness profile and next practical step.</p>
      </section>

      <section className="report-section" aria-labelledby="report-appendix-title">
        <h4 id="report-appendix-title">appendix_answers_and_provenance</h4>
        <p>Source answers: {Object.keys(answers).length ? Object.keys(answers).join(', ') : 'No answers recorded yet'}.</p>
      </section>

      <section className="report-section" aria-labelledby="report-consultant-title">
        <h4 id="report-consultant-title">consultant_review_template</h4>
        <ul className="report-list">
          <li>Assessment ID: {assessmentId}</li>
          <li>Receipt method: user-controlled copy or WhatsApp preview</li>
          <li>Manual verification status: pending</li>
          <li>Reviewed by: [consultant name]</li>
          <li>Approval state: draft</li>
        </ul>
      </section>
    </article>
  );
}
