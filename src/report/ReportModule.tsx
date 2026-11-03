import {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import type {ReadinessResult} from '../domain/evaluate';
import {getReportGuidance} from '../domain/report-guidance';
import ReadinessSignal from '../ReadinessSignal';

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

type ReportSectionProps = {
  id: string;
  title: string;
  expanded: boolean;
  printMode: boolean;
  onToggle: (id: string, open: boolean) => void;
  children: ReactNode;
};

function ReportSection({id, title, expanded, printMode, onToggle, children}: ReportSectionProps) {
  const isOpen = printMode || expanded;

  return (
    <details
      className="report-section"
      open={isOpen}
      onToggle={(event) => {
        if (!printMode) onToggle(id, event.currentTarget.open);
      }}
    >
      <summary className="report-section-summary">
        <h4 id={`report-${id}-title`}>{title}</h4>
        <span className="report-section-toggle" aria-hidden="true" />
      </summary>
      <div className="report-section-content">{children}</div>
    </details>
  );
}

export default function ReportModule({profile, answers, readiness}: ReportModuleProps) {
  const [openSections, setOpenSections] = useState(() => new Set(['executive-summary']));
  const [printMode, setPrintMode] = useState(false);
  const [printError, setPrintError] = useState('');
  const previousOpenSections = useRef<Set<string> | null>(null);

  const unknownQuestions = useMemo(
    () => Object.keys(answers).filter((questionId) => !answers[questionId] || answers[questionId].endsWith('-UNK')),
    [answers],
  );

  const assessmentId = useMemo(() => {
    const seed = `${profile.organizationType ?? 'unknown'}-${profile.industry ?? 'unknown'}-${Date.now()}`;
    return `SELF-${seed.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24).toUpperCase()}`;
  }, [profile]);

  const reportGuidance = getReportGuidance(readiness);

  const shareText = useMemo(
    () =>
      [
        'Silverspark Compass Readiness Summary',
        `Assessment ID: ${assessmentId}`,
        `Primary Path: ${readiness.primaryPath}`,
        `${reportGuidance.scoreLabel}: ${reportGuidance.scoreText}`,
        ...(reportGuidance.scoreNote ? [reportGuidance.scoreNote] : []),
        `Safety Checks To Review: ${readiness.formalGates.length ? readiness.formalGates.map((gate) => gate.id).join(', ') : 'No safety checks triggered'}`,
        'Request to discuss: yes',
      ].join('\n'),
    [assessmentId, readiness, reportGuidance.scoreLabel, reportGuidance.scoreNote, reportGuidance.scoreText],
  );

  useEffect(() => {
    if (!printMode) return;

    const frame = window.requestAnimationFrame(() => {
      try {
        window.print();
      } catch {
        setPrintError('The print dialog could not be opened. Please try again or use your browser print menu.');
      } finally {
        setPrintMode(false);
        if (previousOpenSections.current) setOpenSections(previousOpenSections.current);
        previousOpenSections.current = null;
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [printMode]);

  function toggleSection(id: string, open: boolean) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSaveAsPdf() {
    setPrintError('');
    previousOpenSections.current = openSections;
    setPrintMode(true);
  }

  function handleWhatsAppClick() {
    const message = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <article className="report-module" aria-live="polite">
      {printError && <p className="storage-error" role="alert">{printError}</p>}
      <header className="report-header">
        <div>
          <p className="eyebrow">Assessment Report</p>
          <h3>Self-Reported Assessment — Not Independently Verified</h3>
        </div>
        <div className="report-actions">
          <button type="button" className="button-secondary" onClick={handleSaveAsPdf} disabled={printMode}>
            Save as PDF
          </button>
          <button type="button" className="button-primary" onClick={handleWhatsAppClick}>
            Share via WhatsApp
          </button>
        </div>
      </header>

      <ReportSection
        id="executive-summary"
        title="Executive Summary"
        expanded={openSections.has('executive-summary')}
        printMode={printMode}
        onToggle={toggleSection}
      >
        <div className="report-grid">
          <div>
            <p className="report-label">Assessment ID</p>
            <strong>{assessmentId}</strong>
          </div>
          <div>
            <p className="report-label">{reportGuidance.scoreLabel}</p>
            <strong>{reportGuidance.scoreText}</strong>
          </div>
          <div>
            <p className="report-label">Primary Path</p>
            <strong>{readiness.primaryPath}</strong>
          </div>
          <div>
            <p className="report-label">Safety Checks To Review</p>
            <strong>{readiness.formalGates.length ? readiness.formalGates.map((gate) => gate.id).join(', ') : 'No safety checks triggered'}</strong>
          </div>
        </div>
        {reportGuidance.scoreNote && <p className="report-score-note">{reportGuidance.scoreNote}</p>}
        <ReadinessSignal signal={reportGuidance.signal} />
      </ReportSection>

      <ReportSection id="business-snapshot" title="Business Snapshot" expanded={openSections.has('business-snapshot')} printMode={printMode} onToggle={toggleSection}>
        <ul className="report-list">
          <li>Organisation Type: {profile.organizationType || 'Not shared'}</li>
          <li>Industry / Sector: {profile.industry || 'Not shared'}</li>
          <li>Business Goal: {profile.businessGoal || 'Not yet defined'}</li>
          <li>Budget Fit: {readiness.costFit}</li>
        </ul>
      </ReportSection>

      <ReportSection id="methodology-limitations" title="Methodology And Limitations" expanded={openSections.has('methodology-limitations')} printMode={printMode} onToggle={toggleSection}>
        <p>
          This report is a self-reported assessment based on the browser answers collected in this session. It is not an independent verification, legal review, or certification of client readiness.
        </p>
      </ReportSection>

      <ReportSection id="practical-recommendation" title="A Practical Recommendation" expanded={openSections.has('practical-recommendation')} printMode={printMode} onToggle={toggleSection}>
        <p>{reportGuidance.bandText}</p>
        <p>{reportGuidance.guidance}</p>
        {reportGuidance.firstActionId && (
          <p>Start with priority action {reportGuidance.firstActionId} in the action list below.</p>
        )}
      </ReportSection>

      <ReportSection id="seven-dimension-results" title="Seven Dimension Results" expanded={openSections.has('seven-dimension-results')} printMode={printMode} onToggle={toggleSection}>
        <div className="dimension-report-list">
          {Object.entries(readiness.dimensions).map(([dimensionId, metric]) => (
            <div key={dimensionId} className="report-dimension-item">
              <div className="report-dimension-header">
                <span>{DIMENSION_LABELS[dimensionId] ?? dimensionId}</span>
                <span>
                  {metric.lower === metric.upper
                    ? `${Math.round((metric.lower / 4) * 100)}%`
                    : `${Math.floor((metric.lower / 4) * 100)} to ${Math.ceil((metric.upper / 4) * 100)}% possible`}
                  {' · '}{metric.known} of 2 indicators answered
                </span>
              </div>
              <div className="dimension-track" aria-hidden="true">
                <span style={{width: `${Math.min(100, (metric.upper / 4) * 100)}%`}} />
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      <ReportSection id="uncertainty-coverage" title="Uncertainty And Coverage" expanded={openSections.has('uncertainty-coverage')} printMode={printMode} onToggle={toggleSection}>
        <ul className="report-list">
          {unknownQuestions.length ? (
            unknownQuestions.map((questionId) => <li key={questionId}>Verify {questionId}: confirm the answer before acting on this recommendation.</li>)
          ) : (
            <li>No unknown answers were declared in this draft.</li>
          )}
        </ul>
      </ReportSection>

      <ReportSection id="positive-capabilities" title="Positive Capabilities" expanded={openSections.has('positive-capabilities')} printMode={printMode} onToggle={toggleSection}>
        <ul className="report-list">
          {readiness.actionIds.length ? (
            readiness.actionIds.map((actionId) => <li key={actionId}>Action {actionId} is relevant to the current read-out.</li>)
          ) : (
            <li>No action ID was triggered in this draft; the result remains exploratory.</li>
          )}
        </ul>
      </ReportSection>

      <ReportSection id="gaps-and-evidence" title="Gaps And Evidence" expanded={openSections.has('gaps-and-evidence')} printMode={printMode} onToggle={toggleSection}>
        <ul className="report-list">
          {readiness.formalGates.length ? (
            readiness.formalGates.map((gate) => <li key={gate.id}>{gate.id} — {gate.severity}</li>)
          ) : (
            <li>No formal gates are currently triggered for this self-reported profile.</li>
          )}
        </ul>
      </ReportSection>

      <ReportSection id="critical-safety-gates" title="Critical Safety Gates" expanded={openSections.has('critical-safety-gates')} printMode={printMode} onToggle={toggleSection}>
        <p>{readiness.formalGates.length ? readiness.formalGates.map((gate) => gate.id).join(', ') : 'No critical safety gates are triggered in this draft.'}</p>
      </ReportSection>

      <ReportSection id="primary-path" title="Primary Path" expanded={openSections.has('primary-path')} printMode={printMode} onToggle={toggleSection}>
        <p>
          Recommended primary path: <strong>{readiness.primaryPath}</strong>. Secondary paths: {readiness.secondaryPaths.length ? readiness.secondaryPaths.join(', ') : 'none'}.
        </p>
      </ReportSection>

      <ReportSection id="three-priority-actions" title="Three Priority Actions" expanded={openSections.has('three-priority-actions')} printMode={printMode} onToggle={toggleSection}>
        <ol className="report-list ordered">
          {readiness.actionIds.slice(0, 3).map((actionId) => (
            <li key={actionId}>{actionId}</li>
          ))}
          {readiness.actionIds.length === 0 && <li>No action is recommended in the current local draft.</li>}
        </ol>
      </ReportSection>

      <ReportSection id="budget-and-capacity-fit" title="Budget And Capacity Fit" expanded={openSections.has('budget-and-capacity-fit')} printMode={printMode} onToggle={toggleSection}>
        <p>Budget capacity fit: {readiness.costFit}. This does not imply a verified affordability conclusion.</p>
      </ReportSection>

      <ReportSection id="next-30-60-90-days" title="Next 30, 60 And 90 Days" expanded={openSections.has('next-30-60-90-days')} printMode={printMode} onToggle={toggleSection}>
        <ul className="report-list">
          <li>Next 30 days: confirm the current evidence trail and resolve any unknown answers.</li>
          <li>Next 60 days: test one or two low-risk workflows using the primary path recommendations.</li>
          <li>Next 90 days: review progress, confirm owners, and decide whether to continue or pause.</li>
        </ul>
      </ReportSection>

      <ReportSection id="client-consultation-cta" title="Client Consultation" expanded={openSections.has('client-consultation-cta')} printMode={printMode} onToggle={toggleSection}>
        <p>Ask the client whether they want a short consult to discuss the readiness profile and next practical step.</p>
      </ReportSection>

      <ReportSection id="appendix-answers-and-provenance" title="Appendix Answers And Provenance" expanded={openSections.has('appendix-answers-and-provenance')} printMode={printMode} onToggle={toggleSection}>
        <p>Source answers: {Object.keys(answers).length ? Object.keys(answers).join(', ') : 'No answers recorded yet'}.</p>
      </ReportSection>

      <ReportSection id="consultant-review-template" title="Consultant Review Template" expanded={openSections.has('consultant-review-template')} printMode={printMode} onToggle={toggleSection}>
        <ul className="report-list">
          <li>Assessment ID: {assessmentId}</li>
          <li>Receipt method: user-controlled WhatsApp preview</li>
          <li>Manual verification status: pending</li>
          <li>Reviewed by: [consultant name]</li>
          <li>Approval state: draft</li>
        </ul>
      </ReportSection>
    </article>
  );
}
