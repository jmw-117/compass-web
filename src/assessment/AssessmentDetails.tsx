import ActionIcon from '../report/ActionIcon';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import discovery from '../../docs/domain/prospective_client_discovery.json';
import schema from '../../docs/domain/profile_schema.json';
import { activeProbes, applicableTechnicalQuestions } from '../domain/diagnostics';
import { getAnswerScore } from '../domain/evaluate';

type AssessmentDetailsProps = {
  profile: Record<string, unknown>;
  answers: Record<string, string>;
  probeAnswers: Record<string, string>;
  extendedAnswers: Record<string, string>;
  onBack: () => void;
  onResults: () => void;
  update: (field: string, value: string | string[] | boolean | number | undefined) => void;
  answerProbe: (id: string, value: string) => void;
  answerTechnical: (id: string, value: string) => void;
};

const fieldLabels: Record<string, string> = {
  business_size: 'How many people work in the business?',
  commercial_model: 'How does the business earn revenue?',
  value_stream: 'Which workflow would you improve first?',
  workflow_frequency: 'How often does this workflow happen?',
  workflow_bottleneck: 'What slows this workflow down most?',
  workflow_systems: 'Which tools are involved?',
  impact_measure: 'What improvement would you measure?',
  baseline_known: 'Do you know the current baseline?',
  optional_context: 'What else would help explain the workflow?',
  budget_window: 'How is external spend authorised?',
  budget_ceiling: 'One-off external budget over 90 days (KES)',
  monthly_budget_ceiling: 'Ongoing monthly external budget (KES)',
  budget_band: 'What level of external spend could you consider?',
  decision_authority: 'Who could approve an improvement?',
  preferred_next_step: 'What would you prefer to do next?',
  staff_capacity: 'How much staff time could you commit?',
  timeline: 'When could you start?',
};

const valueLabels: Record<string, string> = {
  '2_9': '2 to 9', '10_49': '10 to 49', '50_249': '50 to 249', '250_plus': '250 or more',
  many_daily: 'Several times a day', lead_to_sale: 'Enquiry to sale', order_to_cash: 'Order to payment',
  service_to_resolution: 'Service request to resolution', procure_to_pay: 'Purchase to supplier payment',
  hire_to_retire: 'Hiring and people operations', report_to_decision: 'Reporting and decisions',
  one_off_90_days: 'One-off spend over 90 days', monthly_recurring: 'Monthly recurring spend',
  no_external_spend: 'No external spend', one_to_three_months: 'In one to three months',
  whatsapp: 'WhatsApp', crm: 'CRM', erp: 'ERP', pos: 'Point of sale', unknown: 'Not sure',
};

function labelValue(value: string) {
  return valueLabels[value] ?? value.replaceAll('_', ' ').replace(/^./, (letter) => letter.toUpperCase());
}

const contextFields = discovery.fields.filter(({stage}) => stage === 'context' || stage === 'discovery');
const constraintFieldSources = [...schema.later_fields, ...discovery.fields];
const amountFields = schema.later_fields.filter(field => ['budget_ceiling', 'monthly_budget_ceiling'].includes(field.id));
const constraintFields = [
  'staff_capacity', 'timeline',
  'budget_window', 'budget_band',
  'decision_authority', 'preferred_next_step',
].flatMap((id) => constraintFieldSources.filter((field) => field.id === id));

type Field = { id: string; type?: string; values?: string[]; max_chars?: number; max_items?: number };

function OptionalField({field, value, update}: {field: Field; value: unknown; update: AssessmentDetailsProps['update']}) {
  const {id} = field;
  const label = fieldLabels[id] ?? labelValue(id);

  if (field.type === 'multi_enum') {
    const selected = Array.isArray(value) ? value : [];
    function change(event: ChangeEvent<HTMLInputElement>) {
      const option = event.target.value;
      if (!event.target.checked) update(id, selected.filter((item) => item !== option));
      else if (option === 'unknown') update(id, [option]);
      else update(id, [...selected.filter((item) => item !== 'unknown'), option].slice(0, field.max_items));
    }
    return (
      <fieldset className="compass-multi-options">
        <legend>{label}</legend>
        <div className="compass-option-grid">
          {field.values?.map((option) => (
            <label className="compass-checkbox" key={option}>
              <input type="checkbox" value={option} checked={selected.includes(option)}
                disabled={option !== 'unknown' && selected.length >= (field.max_items ?? Infinity) && !selected.includes(option)}
                onChange={change} />
              <span>{labelValue(option)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <label data-field={id}>
      <span>{label}</span>
      {field.values ? (
        <select value={typeof value === 'string' ? value : ''} onChange={(event) => update(id, event.target.value)}>
          <option value="">Skip</option>
          {field.values.map((option) => <option key={option} value={option}>{labelValue(option)}</option>)}
        </select>
      ) : field.type === 'string' ? (
        <>
          <textarea rows={2} maxLength={field.max_chars} value={typeof value === 'string' ? value : ''}
            aria-describedby="compass-context-note" onChange={(event) => update(id, event.target.value)} />
          <small id="compass-context-note">Keep names, personal data and confidential information out of this note.</small>
        </>
      ) : (
        <input type="number" min={0} step={1} inputMode="numeric" value={typeof value === 'number' ? value : ''}
          onChange={(event) => {
            const amount = event.target.valueAsNumber;
            update(id, Number.isSafeInteger(amount) && amount >= 0 ? amount : undefined);
          }} />
      )}
    </label>
  );
}

export default function AssessmentDetails({
  profile, answers, probeAnswers, extendedAnswers, update, answerProbe, answerTechnical, onBack, onResults,
}: AssessmentDetailsProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const probes = activeProbes(profile, (id) => getAnswerScore(id, answers[id])).filter(q => !['PR-GOV-SHARE','PR-GOV-PLANNED','PR-HUMAN-REVIEW'].includes(q.id));
  const questions = applicableTechnicalQuestions(profile);
  const firstStep = {id: 'workflow', title: 'Business workflow', description: 'Tell us how the work happens today and where it gets stuck.'};
  const steps = [
    firstStep,
    {id: 'capacity', title: 'Staff capacity, timing and budget', description: 'Tell us what time and budget your organisation could commit.'},
    ...(probes.length > 0 ? [{id: 'evidence', title: 'Evidence checks', description: 'A few follow-up questions can clarify your answers.'}] : []),
    {id: 'technical', title: 'Technical assessment', description: 'Add technical detail to help identify safeguards for current or planned AI use.'},
  ];
  const step = steps[stepIndex] ?? firstStep;
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    heading.current?.focus({preventScroll: true});
    heading.current?.closest('.assessment-shell')?.scrollIntoView({block: 'start', behavior: 'instant'});
  }, [stepIndex]);

  return (
    <section className="assessment-panel compass-context" aria-labelledby="optional-context-title">
      <header className="panel-header">
        <p className="eyebrow">Optional details · Step {stepIndex + 1} of {steps.length}</p>
        <h2 id="optional-context-title" ref={heading} tabIndex={-1}>{step.title}</h2>
        <p>{step.description}</p>
      </header>

      {(step.id === 'workflow' || step.id === 'capacity') && (
        <div className="profile-form compass-field-grid">
          {(step.id === 'workflow' ? contextFields : constraintFields).filter(field => !(profile.budget_window === 'no_external_spend' && ['budget_ceiling','monthly_budget_ceiling','budget_band'].includes(field.id)) && !(field.id === 'decision_authority' && answers['STR-02'] && !answers['STR-02'].endsWith('-UNK')) && !(field.id === 'baseline_known' && ['Yes','No'].includes(probeAnswers['PR-MET-START'] ?? ''))).map((field) => (
            <OptionalField key={field.id} field={field} value={profile[field.id]} update={update} />
          ))}
          {step.id === 'capacity' && (
            <div className="budget-detail">
              <p className="inline-note">A budget band is enough to tailor your recommendations. Budget does not change readiness.</p>
              {profile.budget_window !== 'no_external_spend' && <details open={typeof profile.budget_ceiling === 'number' || typeof profile.monthly_budget_ceiling === 'number' || undefined}>
                <summary>KES amounts</summary>
                <p>Optionally add exact amounts if you budget in Kenyan shillings.</p>
                <div className="profile-form compass-field-grid">{amountFields.map(field =>
                  <OptionalField key={field.id} field={field} value={profile[field.id]} update={update} />)}</div>
              </details>}
            </div>
          )}
        </div>
      )}

      {step.id === 'evidence' && (
        <div className="profile-form">
          {probes.map(({id, prompt, choices}) => (
            <label key={id}>
              <span>{prompt}</span>
              {choices ? (
                <select value={probeAnswers[id] ?? ''} onChange={(event) => answerProbe(id, event.target.value)}>
                  <option value="">Skip</option>
                  {choices.map((choice) => <option key={choice}>{choice}</option>)}
                </select>
              ) : (
                <textarea rows={2} maxLength={140} value={probeAnswers[id] ?? ''} onChange={(event) => answerProbe(id, event.target.value)} />
              )}
            </label>
          ))}
        </div>
      )}

      {step.id === 'technical' && (
        <div className="profile-form">
          <label className="compass-checkbox">
            <input type="checkbox" checked={profile.extended_assessment === true}
              onChange={(event) => {update('diagnostic_scope','guided');update('extended_assessment', event.target.checked);}} />
            Include technical questions in my assessment
          </label>
          <p className="inline-note">These answers help identify technical issues and leave the readiness score unchanged.</p>
          {profile.extended_assessment === true && <label>Diagnostic depth
            <select value={String(profile.diagnostic_scope ?? 'full')} onChange={event=>update('diagnostic_scope',event.target.value)}><option value="guided">Short guided check</option><option value="full">Full technical assessment</option></select>
          </label>}
          {questions.map((question) => (
            <label key={question.id}>
              <span>{question.prompt}</span>
              <select value={extendedAnswers[question.id] ?? ''} onChange={(event) => answerTechnical(question.id, event.target.value)}>
                <option value="">Skip</option>
                {question.choices.map(({id, label}) => <option key={id} value={id}>{label}</option>)}
              </select>
            </label>
          ))}
        </div>
      )}

      <div className="button-row wizard-decision">
        <button type="button" className="button-secondary nav-back"
          onClick={stepIndex === 0 ? onBack : () => setStepIndex((current) => current - 1)}>
          <ActionIcon name="back" /> {stepIndex === 0 ? 'Back' : 'Previous'}
        </button>
        <div className="wizard-forward">
          <button type="button" className={isLastStep ? 'button-primary result-cta' : 'button-secondary'} onClick={onResults}>
            <ActionIcon name="result" /> View Result
          </button>
          {!isLastStep && (
            <button type="button" className="button-primary" onClick={() => setStepIndex((current) => current + 1)}>
              <ActionIcon name="next" /> Next Section
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
