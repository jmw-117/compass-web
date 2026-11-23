import {nairobiDate} from './report-date';
import {buildReportContent, type ReportInput} from './report-content';
import {getDimensionLabel} from '../domain/dimension-display';
import DimensionBar from '../assessment/DimensionBar';
import DecisionSummary from '../assessment/DecisionSummary';
import ActionIcon from './ActionIcon';
import {createPreviewUrl} from './preview-document';
import {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {
  getCostFitLabel,
  getGateLabel,
  getQuestionLabel,
  positiveCapabilities,
} from '../domain/report-guidance';
import ReadinessSignal from '../ReadinessSignal';

const SILVERSPARK_WHATSAPP_NUMBER = '254762057288';

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

export default function ReportModule({assessmentId, profile, answers, readiness}: ReportInput) {
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
  const content = useMemo(() => buildReportContent({assessmentId, profile, answers, readiness}, reportDate),
    [assessmentId, profile, answers, readiness, reportDate]);
  const {areas, reportGuidance, shareText} = content;
  const reportRef = useRef<HTMLElement>(null);

  const [previewUrl, setPreviewUrl] = useState('');
  useEffect(() => {
    if (!reportRef.current) return;
    const url = createPreviewUrl(reportRef.current);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [content]);

  const unknownQuestions = useMemo(
    () => Object.keys(answers).filter((questionId) => !answers[questionId] || answers[questionId].endsWith('-UNK')),
    [answers],
  );

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
      const url = await downloadReport(content);
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
        <p>Silverspark can help scope the first action, agree a measure and identify any specialist review. To discuss these findings, call <a href="tel:+254762057288">+254 762 057 288</a> or visit the <a href="https://sspark.net/contact" target="_blank" rel="noopener noreferrer">project enquiry form</a>.</p>
        <p>For email, copy the summary below and paste it into your draft. You choose what to send.</p>
        <label htmlFor="compass-share-text">Message preview</label>
        <textarea id="compass-share-text" ref={summaryRef} readOnly rows={5} value={shareText} />
        <div className="button-row">
          <button type="button" className="button-secondary" onClick={() => void copySummary()}>Copy summary</button>
          <a className="button-secondary" href="mailto:jmw.info@icloud.com">Email Silverspark</a>
          <button type="button" className="button-primary" onClick={handleWhatsAppClick}>Open WhatsApp</button>
        </div>
        {copyStatus && <p role="status">{copyStatus}</p>}
      </div>

      <div hidden>
        <article ref={reportRef} className="report-module" aria-labelledby="assessment-report-title">
        <header className="report-header">
          <div>
            <h1 id="assessment-report-title">Assessment Report</h1>
            <p className="report-disclaimer">{content.disclaimer}</p>
          </div>
        </header>
          <ReportSection
            id="executive-summary"
            title="Executive Decision"
            expanded={openSections.has('executive-summary')}
            onToggle={toggleSection}
          >
            <div className="report-overview">
              <div className="report-score">
                <p className="result-label">{reportGuidance.scoreLabel}</p>
                <p className="report-score-value"><strong>{reportGuidance.scoreValue}</strong> <span>out of 100</span></p>
                <p>{content.coverage}</p>
                {reportGuidance.scoreNote && <p className="report-score-note">{reportGuidance.scoreNote}</p>}
              </div>
              <div className="report-next-step">
                <p className="result-label">Recommended next step</p>
                <h5>{reportGuidance.primaryPathLabel}</h5>
                <p>{reportGuidance.guidance}</p>
                {reportGuidance.firstActionLabel && <p className="first-action"><strong>Start here.</strong> {reportGuidance.firstActionLabel}</p>}
              </div>
            </div>
            <ReadinessSignal signal={reportGuidance.signal} />
            <DecisionSummary result={readiness} rows={content.decisions} />
            <div className="report-safety">
              <h5>Key findings</h5>
              {readiness.formalGates.length > 0 && (
                <ul className="report-list">
                  {readiness.formalGates.map((gate) => <li key={gate.id}>{getGateLabel(gate.id)}</li>)}
                </ul>
              )}
              <p>{content.capability}</p><p>{content.opportunity}</p>
              {content.benefit.map(line => <p key={line}>{line}</p>)}
            </div>
          </ReportSection>

          <ReportSection id="three-priority-actions" title="Priority Action Plan" expanded={openSections.has('three-priority-actions')} onToggle={toggleSection}>
            <ol className="report-list ordered editorial-actions">
              {content.actions.map(({id, title, paragraphs, area, illustration}, index) => <li key={id}>
                <header className="action-opener">
                  <svg viewBox="0 0 64 48" aria-hidden="true" focusable="false"><path d={illustration} /></svg>
                  <div><span className="action-byline">Priority {index + 1} · {area}</span><strong>{title}</strong></div>
                </header>
                {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              </li>)}
              {!content.actions.length && <li>{content.noActions}</li>}
            </ol>
          </ReportSection>

          <ReportSection id="business-snapshot" title="Business Snapshot" expanded={openSections.has('business-snapshot')} onToggle={toggleSection}>
            <ul className="report-list">
              {[...content.business, ...content.useContext].map(({label, value}) => <li key={label}>{label}: {value}</li>)}
            </ul>
          </ReportSection>

          <ReportSection id="methodology-limitations" title="Methodology And Limitations" expanded={openSections.has('methodology-limitations')} onToggle={toggleSection}>
            <p>
              This report is a self-reported assessment based on the browser answers collected in this session. It is not an independent verification, legal review, or certification of client readiness.
            </p>
          </ReportSection>


          <ReportSection id="seven-dimension-results" title="Seven Dimension Results" expanded={openSections.has('seven-dimension-results')} onToggle={toggleSection}>
            <div className="dimension-report-list">
              {areas.map(area => (
                <div key={area.dimension} data-dimension={area.dimension} className="report-dimension-item">
                  <div className="report-dimension-header">
                    <span>{area.label}</span>
                    <span>{area.scoreText}{area.known < 2 && ' possible'} · {area.known} of 2 indicators answered</span>
                  </div>
                  <DimensionBar lower={area.lower} upper={area.upper} />
                </div>
              ))}
              {areas.some(area => area.upper > area.lower) && <p className="area-key"><i aria-hidden="true" />Striped ranges show uncertainty from unknown answers.</p>}
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
                  <li key={id}>{getDimensionLabel(id)} reported {Math.round(result.lower * 25)} out of 100.</li>
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


          <ReportSection id="appendix-answers-and-provenance" title="Evidence &amp; Methodology" expanded={openSections.has('appendix-answers-and-provenance')} onToggle={toggleSection}>
            <dl className="report-metadata">
              {content.metadata.map(({key, label, value}) => <div key={key}><dt>{label}</dt><dd>
                {key === 'reference' ? <code>{value}</code> : key === 'date' ? <time dateTime={value}>{value}</time> : value}
              </dd></div>)}
            </dl>
            <h5>How to read the evidence</h5><p>{content.method}</p>
            <h5>Your assessment answers</h5>
            <p>{content.coverage}</p>
            <dl className="report-answers">
              {content.evidence.map(({id, area, prompt, answer, uncertain}, index) => (
                <div key={id} className={uncertain ? 'evidence-uncertain' : undefined}>
                  <dt>{content.evidence[index - 1]?.area !== area && <small className="evidence-area">{area}</small>}
                    <span className="evidence-prompt">{prompt}</span></dt>
                  <dd>{answer}</dd>
                </div>
              ))}
            </dl>
          </ReportSection>

        </article>
      </div>
    </>
  );
}
