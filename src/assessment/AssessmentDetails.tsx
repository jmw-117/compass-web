import type { ChangeEvent } from 'react';
import discovery from '../../docs/domain/prospective_client_discovery.json';
import schema from '../../docs/domain/profile_schema.json';
import { activeProbes, applicableTechnicalQuestions } from '../domain/diagnostics';
import { getAnswerScore } from '../domain/evaluate';

type AssessmentDetailsProps = {
  profile: Record<string, unknown>;
  answers: Record<string, string>;
  probeAnswers: Record<string, string>;
  extendedAnswers: Record<string, string>;
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
const constraintFields = [
  ...schema.later_fields.filter(({id}) => ['staff_capacity', 'timeline', 'budget_band', 'budget_ceiling'].includes(id)),
  ...discovery.fields.filter(({stage}) => stage === 'constraints' || stage === 'results'),
];

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
    <label>
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

export default function AssessmentDetails({profile, answers, probeAnswers, extendedAnswers, update, answerProbe, answerTechnical}: AssessmentDetailsProps) {
  const probes = activeProbes(profile, (id) => getAnswerScore(id, answers[id]));
  const questions = applicableTechnicalQuestions(profile);

  return (
    <div className="compass-context">
      <details>
        <summary>Business workflow <small>Optional</small></summary>
        <div className="profile-form">
          {contextFields.map((field) => <OptionalField key={field.id} field={field} value={profile[field.id]} update={update} />)}
        </div>
      </details>
      <details>
        <summary>Staff capacity, timing and budget <small>Optional</small></summary>
        <div className="profile-form">
          {constraintFields.map((field) => <OptionalField key={field.id} field={field} value={profile[field.id]} update={update} />)}
          <p className="inline-note">Separate one-off and monthly amounts. Enter zero for no external cash. Budget does not change readiness.</p>
        </div>
      </details>
      {probes.length > 0 && (
        <details open>
          <summary>Evidence checks <small>Optional</small></summary>
          <div className="profile-form">
            <p className="inline-note">These questions clarify your answers and any relevant safety checks.</p>
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
        </details>
      )}
      <details>
        <summary>Technical assessment <small>Optional</small></summary>
        <div className="profile-form">
          <label className="compass-checkbox">
            <input type="checkbox" checked={profile.extended_assessment === true}
              onChange={(event) => update('extended_assessment', event.target.checked)} />
            Include technical questions in my assessment
          </label>
          <p className="inline-note">Questions adapt to your current or planned AI use. The answers add diagnostic findings and leave the readiness score unchanged.</p>
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
      </details>
    </div>
  );
}
