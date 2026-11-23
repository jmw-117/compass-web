import {nairobiDate} from './report-date';
import DecisionSummary from '../assessment/DecisionSummary';
import ActionIcon from './ActionIcon';
import {createPreviewUrl} from './preview-document';
import {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import type {ReadinessResult} from '../domain/evaluate';
import {
  getActionLabel,
  getCostFitLabel,
  getGateLabel,
  getQuestionLabel,
  getReportGuidance,
  positiveCapabilities,
} from '../domain/report-guidance';
import ReadinessSignal from '../ReadinessSignal';
import {catalogActions} from '../domain/recommendations';
import questionBank from '../../docs/domain/question_bank.json';
import manifest from '../../docs/domain/VERSION_MANIFEST.json';

type ProfileLike = {
  organizationType?: string;
  industry?: string;
  businessGoal?: string;
  current_ai_use?: string;
  data_category?: string;
  high_impact_ai_workflow?: string;
  planned_ai_use?: string;
  planned_use_real_data?: string;
  [key: string]: unknown;
};

type ReportModuleProps = {
  assessmentId: string;
  profile: ProfileLike;
  answers: Record<string, string>;
  readiness: ReadinessResult;
};

const SILVERSPARK_WHATSAPP_NUMBER = '254762057288';

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
  onToggle: (id: string, open: boolean) => void;
  children: ReactNode;
};

function ReportSection({id, title, expanded, onToggle, children}: ReportSectionProps) {
  return (
    <details
      className="report-section"
      open={expanded}
      onToggle={(event) => onToggle(id, event.currentTarget.open)}
    >
      <summary className="report-section-summary">
        <h4 id={`report-${id}-title`}>{title}</h4>
        <span className="report-section-toggle" aria-hidden="true" />
      </summary>
      <div className="report-section-content">{children}</div>
    </details>
  );
}

export default function ReportModule({assessmentId, profile, answers, readiness}: ReportModuleProps) {
  const strengths = positiveCapabilities(readiness.dimensions);
  const [openSections, setOpenSections] = useState(() => new Set(['executive-summary']));
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  useEffect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }, [pdfUrl]);
  const [shareOpen, setShareOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const [reportDate] = useState(() => nairobiDate());
  const reportRef = useRef<HTMLElement>(null);

  const [previewUrl, setPreviewUrl] = useState('');
  useEffect(() => {
    if (!reportRef.current) return;
    const url = createPreviewUrl(reportRef.current);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [assessmentId, answers, profile, readiness]);

  const unknownQuestions = useMemo(
    () => Object.keys(answers).filter((questionId) => !answers[questionId] || answers[questionId].endsWith('-UNK')),
    [answers],
  );

  const reportGuidance = getReportGuidance(readiness);
  const workflow = typeof profile.value_stream === 'string' ? profile.value_stream.replaceAll('_', ' ') : '';
  const bottleneck = typeof profile.workflow_bottleneck === 'string' ? profile.workflow_bottleneck.replaceAll('_', ' ') : '';

  const shareText = [
    'Silverspark Compass readiness summary',
    'Reference: ' + assessmentId,
    reportGuidance.scoreLabel + ': ' + reportGuidance.scoreText,
    [profile.organizationType, profile.industry, profile.businessGoal].filter(Boolean).join(' · '),
    'AI Use-Case Guidance: ' + readiness.useCaseGuidance,
    'Delivery Capacity: ' + readiness.deliveryCapacity,
    'Financial Benefit Evidence: ' + readiness.financialEvidence,
    ...readiness.concerns.slice(0, 2),
    'Next step: ' + (reportGuidance.firstActionLabel ?? reportGuidance.title),
    'I would like to discuss the next steps.',
  ].join('\n');

  function toggleSection(id: string, open: boolean) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleExportReport() {
    const report = reportRef.current;
    if (!report || exporting) return;
    setExportError('');
    setExporting(true);
    try {
      const {downloadReport} = await import('./export-pdf');
      const url = await downloadReport(report, assessmentId, reportGuidance.signal.color, readiness.dimensions);
      if (reportRef.current === report) setPdfUrl(url);
      else URL.revokeObjectURL(url);
    } catch {
      setExportError('The PDF could not be downloaded. Open Preview Report and use your browser’s Print command, or use Copy summary under Send Report.');
    } finally {
      setExporting(false);
    }
  }

  function handleWhatsAppClick() {
    const message = encodeURIComponent(shareText);
    window.open('https://wa.me/' + SILVERSPARK_WHATSAPP_NUMBER + '?text=' + message, '_blank', 'noopener,noreferrer');
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyStatus('Summary copied.');
    } catch {
      summaryRef.current?.focus();
      summaryRef.current?.select();
      setCopyStatus('Select and copy the summary using your browser.');
    }
  }

  return (
    <>
      <div className="report-actions" role="group" aria-label="Report actions">
        <button type="button" className="button-primary" onClick={() => void handleExportReport()} disabled={exporting}>
          <ActionIcon name="export" /> {exporting ? 'Exporting…' : 'Export Report'}
        </button>
        <button type="button" className="button-secondary" aria-expanded={shareOpen} aria-controls="compass-share-preview"
          onClick={() => {setShareOpen((open) => !open); setCopyStatus('');}}>
          <ActionIcon name="send" /> Send Report
        </button>
        <a className="button-secondary" href={previewUrl || undefined} target="_blank" rel="noopener noreferrer"
          aria-description="Opens in a new tab" aria-disabled={!previewUrl}>
          <ActionIcon name="preview" /> Preview Report
        </a>
      </div>
      {pdfUrl && <p className="inline-note" role="status">Download didn’t start? <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Open PDF</a> to view or save your report.</p>}
      {exportError && <p className="storage-error" role="alert">{exportError}</p>}
      <div className="compass-share-preview" id="compass-share-preview" hidden={!shareOpen}>
        <p>Send Report prepares a summary. To share the complete PDF, export it and attach it yourself. WhatsApp opens with this message ready for you to send.</p>
        <p>To discuss these findings, call <a href="tel:+254762057288">+254 762 057 288</a> or visit the <a href="https://sspark.net/" target="_blank" rel="noopener noreferrer">Silverspark Consulting website</a>.</p>
        <label htmlFor="compass-share-text">Message preview</label>
        <textarea id="compass-share-text" ref={summaryRef} readOnly rows={5} value={shareText} />
        <div className="button-row">
          <button type="button" className="button-secondary" onClick={() => void copySummary()}>Copy summary</button>
          <button type="button" className="button-primary" onClick={handleWhatsAppClick}>Open WhatsApp</button>
        </div>
        {copyStatus && <p role="status">{copyStatus}</p>}
      </div>

      <div hidden>
        <article ref={reportRef} className="report-module" aria-labelledby="assessment-report-title">
        <header className="report-header">
          <div>
            <h1 id="assessment-report-title">Assessment Report</h1>
            <p className="report-disclaimer">Self-Reported Assessment — Not Independently Verified</p>
          </div>
        </header>
          <ReportSection
            id="executive-summary"
            title="Executive Summary"
            expanded={openSections.has('executive-summary')}
            onToggle={toggleSection}
          >
            <div className="report-overview">
              <div className="report-score">
                <p className="result-label">{reportGuidance.scoreLabel}</p>
                <p className="report-score-value"><strong>{reportGuidance.scoreValue}</strong> <span>out of 100</span></p>
                <p>{Object.values(readiness.dimensions).reduce((total, dimension) => total + dimension.known, 0)} of {questionBank.questions.length} core answers are known.</p>
                {reportGuidance.scoreNote && <p className="report-score-note">{reportGuidance.scoreNote}</p>}
              </div>
              <div className="report-next-step">
                <p className="result-label">Recommended next step</p>
                <h5>{reportGuidance.primaryPathLabel}</h5>
                <p>{reportGuidance.guidance}</p>
                <p className="first-action"><strong>Start here.</strong> {reportGuidance.firstActionLabel}</p>
              </div>
            </div>
            <ReadinessSignal signal={reportGuidance.signal} />
            <DecisionSummary result={readiness} />
            <div className="report-safety">
              <h5>Key findings</h5>
              {readiness.formalGates.length > 0 && (
                <ul className="report-list">
                  {readiness.formalGates.map((gate) => <li key={gate.id}>{getGateLabel(gate.id)}</li>)}
                </ul>
              )}
              <p>{readiness.opportunity.kind}. {readiness.opportunity.next} {readiness.opportunity.measure}</p>
            </div>
          </ReportSection>

          <ReportSection id="three-priority-actions" title="Priority Actions" expanded={openSections.has('three-priority-actions')} onToggle={toggleSection}>
            <ol className="report-list ordered">
              {readiness.actionPlan.map(({id, title: label, step, outcome, owner, effort, category, context}) => {
                const action = catalogActions.get(id);
                return (
                  <li key={id}>
                    <strong>{label}</strong> 
                    {action && (
                      <div>
                        <p>Owner: {owner}. Effort: {effort}. Cost: {category}.</p>
                        {id === readiness.actionIds[0] && <p>{context}</p>}
                        <p>{step} {outcome}</p>
                        <p>Evidence to review: {action.evidence_question_ids.map(getQuestionLabel).join(', ')}.</p>
                        {action.prerequisite_ids.length > 0 && <p>Complete first: {action.prerequisite_ids.map(getActionLabel).join(', ')}.</p>}
                        <p>Done when: {action.validation}</p>
                        
                      </div>
                    )}
                  </li>
                );
              })}
              {readiness.actionIds.length === 0 && <li>No action was identified from these responses.</li>}
            </ol>
          </ReportSection>

          <ReportSection id="business-snapshot" title="Business Snapshot" expanded={openSections.has('business-snapshot')} onToggle={toggleSection}>
            <ul className="report-list">
              <li>Organisation Type: {profile.organizationType || 'Not shared'}</li>
              <li>Industry / Sector: {profile.industry || 'Not shared'}</li>
              <li>Business Goal: {profile.businessGoal || 'Not yet defined'}</li>
              <li>Current AI Use: {profile.current_ai_use || 'Not answered'}</li>
              <li>Data Category: {profile.data_category || 'Not answered'}</li>
              <li>High-Impact AI Workflow: {profile.high_impact_ai_workflow || 'Not answered'}</li>
              <li>Planned AI Use: {profile.planned_ai_use || 'Not answered'}</li>
              <li>Planned Use of Real Data: {profile.planned_use_real_data || 'Not answered'}</li>
              {workflow && <li>Workflow: {workflow}</li>}
              {bottleneck && <li>Main bottleneck: {bottleneck}</li>}
              <li>Budget Fit: {getCostFitLabel(readiness.costFit)}</li>
            </ul>
          </ReportSection>

          <ReportSection id="methodology-limitations" title="Methodology And Limitations" expanded={openSections.has('methodology-limitations')} onToggle={toggleSection}>
            <p>
              This report is a self-reported assessment based on the browser answers collected in this session. It is not an independent verification, legal review, or certification of client readiness.
            </p>
          </ReportSection>


          <ReportSection id="seven-dimension-results" title="Seven Dimension Results" expanded={openSections.has('seven-dimension-results')} onToggle={toggleSection}>
            <div className="dimension-report-list">
              {Object.entries(readiness.dimensions).map(([dimensionId, metric]) => (
                <div key={dimensionId} data-dimension={dimensionId} className="report-dimension-item">
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

          <ReportSection id="uncertainty-coverage" title="Uncertainty And Coverage" expanded={openSections.has('uncertainty-coverage')} onToggle={toggleSection}>
            <ul className="report-list">
              {unknownQuestions.length ? (
                unknownQuestions.map((questionId) => (
                  <li key={questionId}>
                    Confirm your answer about {getQuestionLabel(questionId)}.
                    
                  </li>
                ))
              ) : (
                <li>All readiness questions have known answers.</li>
              )}
            </ul>
          </ReportSection>

          <ReportSection id="positive-capabilities" title="Positive Capabilities" expanded={openSections.has('positive-capabilities')} onToggle={toggleSection}>
            <ul className="report-list">
              {strengths.length === 0 ? (
                <li>No confirmed strength emerged from the practices assessed.</li>
              ) : strengths.map(([id, result]) => (
                  <li key={id}>{DIMENSION_LABELS[id] ?? id} reported {Math.round(result.lower * 25)} out of 100.</li>
                ))}
            </ul>
          </ReportSection>



          {readiness.probeEvidence.length > 0 && (
            <ReportSection id="follow-up-evidence" title="Follow-up Evidence" expanded={openSections.has('follow-up-evidence')} onToggle={toggleSection}>
              <dl>{readiness.probeEvidence.map(({id, prompt, answer}) => <div key={id}><dt>{prompt}</dt><dd>{answer}</dd></div>)}</dl>
            </ReportSection>
          )}




          <ReportSection id="budget-and-capacity-fit" title="Budget And Capacity Fit" expanded={openSections.has('budget-and-capacity-fit')} onToggle={toggleSection}>
                      <p>{getCostFitLabel(readiness.costFit)} Cost classes are qualitative. Staff time is required even for actions without external cash spend.</p>
              {typeof profile.budget_ceiling === 'number' && <p>One-off ceiling over 90 days: KES {profile.budget_ceiling.toLocaleString('en-KE')}.</p>}
              {typeof profile.monthly_budget_ceiling === 'number' && <p>Separate monthly ceiling: KES {profile.monthly_budget_ceiling.toLocaleString('en-KE')}.</p>}
              {typeof profile.staff_capacity === 'string' && profile.staff_capacity && <p>Reported staff capacity: {profile.staff_capacity}.</p>}
          </ReportSection>


          {readiness.technicalFindings.length > 0 && (
            <ReportSection id="technical-annex" title="Technical Findings" expanded={openSections.has('technical-annex')} onToggle={toggleSection}>
              <p>These self-reported observations inform the review and leave the readiness score unchanged.</p>
              <ul className="report-list">
                {readiness.technicalFindings.map((finding) => (
                  <li key={finding.questionId}>
                    <strong>{finding.prompt}</strong> {finding.response}
                    {finding.flag && <small> Review: {finding.flag.replace(/^flag\./, '').replaceAll('_', ' ')}.</small>}
                  </li>
                ))}
              </ul>
            </ReportSection>
          )}


          <ReportSection id="appendix-answers-and-provenance" title="Appendix Answers And Provenance" expanded={openSections.has('appendix-answers-and-provenance')} onToggle={toggleSection}>
            <dl className="report-metadata">
              <div><dt>Assessment reference</dt><dd><code>{assessmentId}</code></dd></div>
              <div><dt>Prepared on</dt><dd><time dateTime={reportDate}>{reportDate}</time></dd></div>
              <div><dt>Method version</dt><dd>{readiness.ruleVersion}</dd></div>
              <div><dt>Report version</dt><dd>{manifest.report_version}</dd></div>
            </dl>
            <h5>Your assessment answers</h5>
            <dl className="report-answers">
              {questionBank.questions.map(({id, prompt, options}) => (
                <div key={id}>
                  <dt>{prompt}</dt>
                  <dd>{options.find((option) => option.id === answers[id])?.label ?? 'No answer recorded'}</dd>
                </div>
              ))}
            </dl>
          </ReportSection>

        </article>
      </div>
    </>
  );
}
