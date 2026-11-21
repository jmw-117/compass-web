import {activeProbes} from './domain/diagnostics';
import DecisionSummary from './assessment/DecisionSummary';
import CompletionConfetti from './assessment/CompletionConfetti';
import ActionIcon from './report/ActionIcon';
import {lazy, Suspense, useEffect, useMemo, useRef, useState} from 'react';
import questionBank from '../docs/domain/question_bank.json';
import {evaluate} from './domain/evaluate';
import {getGateLabel, getReportGuidance, getSafetyChecksMessage} from './domain/report-guidance';
import ReadinessSignal from './ReadinessSignal';
import AssessmentDetails from './assessment/AssessmentDetails';
import {clearDeviceDraft, restoreDeviceDraft, saveDeviceDraft} from './assessment/local-draft';

const ReportModule = lazy(() => import('./report/ReportModule'));
const STORAGE_KEY = 'silverspark-compass-draft-v1';

type Question = typeof questionBank.questions[number];

type Screen = 'start' | 'preview' | 'preview-summary' | 'core' | 'review' | 'context' | 'results';

type Profile = {
  organizationType: string;
  industry: string;
  businessGoal: string;
  current_ai_use: string;
  data_category: string;
  high_impact_ai_workflow: string;
  planned_ai_use: string;
  planned_use_real_data: string;
};

const emptyProfile: Profile = {
  organizationType: '',
  industry: '',
  businessGoal: '',
  current_ai_use: '',
  data_category: '',
  high_impact_ai_workflow: '',
  planned_ai_use: '',
  planned_use_real_data: '',
};

const ORGANISATION_OPTIONS = [
  ['sole_proprietor', 'Sole proprietor'],
  ['small_sme', 'Small business'],
  ['established_sme', 'Established business'],
  ['enterprise', 'Enterprise or department'],
  ['nonprofit', 'Nonprofit'],
  ['other', 'Other'],
] as const;

const INDUSTRY_OPTIONS = [
  ['retail', 'Retail'],
  ['professional_services', 'Professional services'],
  ['hospitality', 'Hospitality'],
  ['health', 'Health'],
  ['education', 'Education'],
  ['financial_services', 'Financial services'],
  ['manufacturing', 'Manufacturing'],
  ['logistics', 'Logistics'],
  ['technology', 'Technology'],
  ['other', 'Other'],
] as const;

const BUSINESS_GOAL_OPTIONS = [
  ['efficiency', 'Improve efficiency'],
  ['growth', 'Support growth'],
  ['service', 'Improve customer service'],
  ['risk', 'Reduce risk'],
  ['explore', 'Explore AI opportunities'],
] as const;

const SAFETY_CONTEXT_QUESTIONS = [
  {
    id: 'current_ai_use',
    label: 'How is AI currently used in this organisation?',
    options: [
      {value: 'none', label: 'No current AI use'},
      {value: 'personal', label: 'Personal experimentation'},
      {value: 'team_pilot', label: 'A team pilot'},
      {value: 'operational', label: 'Part of an operational workflow'},
      {value: 'unknown', label: 'Not sure'},
    ],
  },
  {
    id: 'data_category',
    label: 'What type of information is expected to be used?',
    options: [
      {value: 'routine', label: 'Routine business information'},
      {value: 'personal', label: 'Personal information'},
      {value: 'restricted', label: 'Restricted or confidential information'},
      {value: 'unknown', label: 'Not sure'},
    ],
  },
  {
    id: 'high_impact_ai_workflow',
    label: 'What part would AI play in deciding care, credit, hiring or access to an essential service?',
    options: [
      {value: 'decides', label: 'Make the decision, such as approving credit'},
      {value: 'influences', label: 'Influence the decision, such as ranking applicants or triaging patients'},
      {value: 'assists', label: 'Only draft or summarise for a person who checks the evidence and decides'},
      {value: 'yes', label: 'Consequential use, role still to clarify'},
      {value: 'no', label: 'No such decision is involved'},
      {value: 'unknown', label: 'Not sure'},
    ],
  },
  {
    id: 'planned_ai_use',
    label: 'Is an AI use planned?',
    options: [
      {value: 'yes', label: 'Yes'},
      {value: 'no', label: 'No'},
      {value: 'unknown', label: 'Not sure'},
    ],
  },
  {
    id: 'planned_use_real_data',
    label: 'Would a planned pilot use real business or customer data?',
    options: [
      {value: 'yes', label: 'Yes'},
      {value: 'no', label: 'No'},
      {value: 'unknown', label: 'Not sure'},
    ],
  },
] as const;

function getProfileOptionLabel(options: readonly (readonly [string, string])[], value: string) {
  return options.find(([optionValue]) => optionValue === value)?.[1] ?? value;
}

function getSafetyContextOptionLabel(fieldId: (typeof SAFETY_CONTEXT_QUESTIONS)[number]['id'], value: string) {
  const field = SAFETY_CONTEXT_QUESTIONS.find(({id}) => id === fieldId);
  return field?.options.find((option) => option.value === value)?.label ?? 'Not answered';
}

const coreQuestions = questionBank.questions;

const questionExamples: Record<string, string> = {
  'STR-01': 'Think of a result you want to improve, such as response time, costs or customer satisfaction.',
  'STR-02': 'Think of who can approve a change to the way your team works.',
  'PRO-01': 'Pick one recurring task, such as handling an enquiry or preparing an invoice.',
  'PRO-02': 'Think of a recurring delay, mistake or task that often has to be done twice.',
  'DAT-01': 'Examples include order records, customer requests or stock counts you use to make decisions.',
  'DAT-02': 'Think of who updates those records and makes them available to the people who need them.',
  'TEC-01': 'Consider the main places you keep business records, including paper, email, spreadsheets or software.',
  'TEC-02': 'For example, think of how a sale recorded in one tool becomes an invoice in another.',
  'PEO-01': 'Consider both experience with AI tools and the ability to check their answers.',
  'PEO-02': 'Think of the last tool or process you introduced and the support people received.',
  'GOV-01': 'Think of rules on which information people can enter into tools and who can access it.',
  'GOV-02': 'Consider who checks an AI-assisted recommendation before it affects a customer or colleague.',
  'MET-01': 'Pick one measure you can compare over time, such as errors per week or time to answer a request.',
  'MET-02': 'Think of who checks after a change, when they check and what they do with the findings.',
};

const wizardSteps = ['Profile', 'Questions', 'Review', 'Results'] as const;

const previewQuestions = coreQuestions.slice(0, 5);
const remainingQuestions = coreQuestions.slice(5);

function getDimensionLabel(dimension: Question['dimension']) {
  const labels: Record<string, string> = {
    STR: 'Strategy',
    PRO: 'Processes',
    DAT: 'Data',
    TEC: 'Technology',
    PEO: 'People',
    GOV: 'Governance',
    MET: 'Measurement',
  };
  return labels[dimension] ?? dimension;
}

function newAssessmentId() {
  return 'SELF-' + (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).toUpperCase();
}

export default function App() {
  const [assessmentId, setAssessmentId] = useState(newAssessmentId);
  const celebratedAssessment = useRef('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [screen, setScreen] = useState<Screen>('start');
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [context, setContext] = useState<Record<string, unknown>>({});
  const [probeAnswers, setProbeAnswers] = useState<Record<string, string>>({});
  const [extendedAnswers, setExtendedAnswers] = useState<Record<string, string>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [editingFromReview, setEditingFromReview] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [draftBusy, setDraftBusy] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  function applyDraft(raw: string) {
    if (raw.length > 32_768) throw new Error('Draft is too large.');
    const draft: unknown = JSON.parse(raw);
    if (!draft || typeof draft !== 'object' || Array.isArray(draft)) throw new Error('Invalid draft.');
    const fields = draft as Record<string, unknown>;
    if (typeof fields.assessmentId === 'string' && /^SELF-[A-Z0-9-]{6,48}$/.test(fields.assessmentId)) setAssessmentId(fields.assessmentId);
    function knownStrings(value: unknown) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
      return Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === 'string' && item.length <= 240)) as Record<string, string>;
    }
    const savedProfile = knownStrings(fields.profile);
    const savedTypes: Record<string, string> = {'Sole proprietor': 'sole_proprietor', SME: 'small_sme', Department: 'enterprise', Enterprise: 'enterprise'};
    const type = savedProfile.organizationType ?? '';
    const restored = {...emptyProfile};
    for (const key of Object.keys(restored) as Array<keyof Profile>) restored[key] = savedProfile[key] ?? '';
    restored.organizationType = savedTypes[type] ?? type;
    setProfile(restored);
    const savedAnswers = knownStrings(fields.answers);
    setAnswers(Object.fromEntries(coreQuestions.flatMap(({id, options}) =>
      options.some((option) => option.id === savedAnswers[id]) ? [[id, savedAnswers[id] ?? '']] : [],
    )));
    setContext(fields.context && typeof fields.context === 'object' && !Array.isArray(fields.context)
      ? fields.context as Record<string, unknown> : {});
    setProbeAnswers(knownStrings(fields.probeAnswers));
    setExtendedAnswers(knownStrings(fields.extendedAnswers));
  }

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) applyDraft(raw);
    } catch {
      setStorageError('The session draft could not be restored. You can start a new assessment.');
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    try {
      const hasProgress = Object.values(profile).some(Boolean) || Object.keys(answers).length > 0;
      if (hasProgress) sessionStorage.setItem(STORAGE_KEY, JSON.stringify({assessmentId, profile, answers, context, probeAnswers, extendedAnswers}));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      setStorageError('Draft storage is blocked, so you can continue in this session without saving.');
    }
  }, [assessmentId, profile, answers, context, probeAnswers, extendedAnswers, draftLoaded]);

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>('.assessment-shell');
    shell?.querySelector('h2')?.focus({preventScroll: true});
    shell?.scrollIntoView({block: 'start', behavior: 'instant'});
  }, [screen, questionIndex]);

  const answeredCount = coreQuestions.filter((question) =>
    question.options.some((option) => option.id === answers[question.id]),
  ).length;
  const readinessResult = useMemo(
    () =>
      evaluate({
        assessmentId: 'assessment-local',
        schemaVersion: '1.3.1',
        questionBankVersion: questionBank.version,
        profile: {
          ...context,
          ...profile,
          org_type: profile.organizationType,
          industry: profile.industry,
          businessGoal: profile.businessGoal,
          primary_goal: profile.businessGoal,
        },
        coreAnswers: answers,
        probeAnswers,
        extendedAnswers,
      }),
    [answers, profile, context, probeAnswers, extendedAnswers],
  );
  const scoreSummary = useMemo(() => {
    const scoredEntries = Object.entries(answers)
      .map(([questionId, optionId]) => {
        const question = coreQuestions.find((item) => item.id === questionId);
        const option = question?.options.find((entry) => entry.id === optionId);
        return {questionId, score: option?.score ?? null};
      })
      .filter((entry) => entry.score !== null);

    return {
      answered: scoredEntries.length,
    };
  }, [answers]);

  const dimensionSummary = (['STR', 'PRO', 'DAT', 'TEC', 'PEO', 'GOV', 'MET'] as const).map((dimension) => {
    const metric = readinessResult.dimensions[dimension];
    return {
      dimension,
      label: getDimensionLabel(dimension),
      upper: Math.ceil((metric.upper / 4) * 100),
      scoreText: metric.lower === metric.upper
        ? `${Math.round((metric.lower / 4) * 100)}%`
        : `${Math.floor((metric.lower / 4) * 100)} to ${Math.ceil((metric.upper / 4) * 100)}% possible`,
      known: metric.known,
    };
  });

  const profileComplete = Boolean(
    profile.organizationType &&
      INDUSTRY_OPTIONS.some(([value]) => value === profile.industry) &&
      BUSINESS_GOAL_OPTIONS.some(([value]) => value === profile.businessGoal),
  );
  const safetyContextAnswered = SAFETY_CONTEXT_QUESTIONS.every(({id, options}) =>
    options.some(({value}) => profile[id] === value),
  );
  const reportProfile = {
    ...context,
    ...profile,
    organizationType: getProfileOptionLabel(ORGANISATION_OPTIONS, profile.organizationType),
    industry: getProfileOptionLabel(INDUSTRY_OPTIONS, profile.industry),
    businessGoal: getProfileOptionLabel(BUSINESS_GOAL_OPTIONS, profile.businessGoal),
    current_ai_use: getSafetyContextOptionLabel('current_ai_use', profile.current_ai_use),
    data_category: getSafetyContextOptionLabel('data_category', profile.data_category),
    high_impact_ai_workflow: getSafetyContextOptionLabel('high_impact_ai_workflow', profile.high_impact_ai_workflow),
    planned_ai_use: getSafetyContextOptionLabel('planned_ai_use', profile.planned_ai_use),
    planned_use_real_data: getSafetyContextOptionLabel('planned_use_real_data', profile.planned_use_real_data),
  };
  const reportGuidance = getReportGuidance(readinessResult);
  const allCoreQuestionsAnswered = answeredCount === coreQuestions.length;

  function updateProfile(field: keyof Profile, value: string) {
    setProfile((current) => ({...current, [field]: value}));
  }

  function setAnswer(questionId: string, optionId: string) {
    setAnswers((current) => ({...current, [questionId]: optionId}));
  }

  function handleQuestionBack() {
    if (editingFromReview) {
      setEditingFromReview(false);
      setScreen('review');
      return;
    }

    if (screen === 'preview' && questionIndex === 0) {
      setScreen('start');
      return;
    }

    if (screen === 'core' && questionIndex === 0) {
      setScreen('preview-summary');
      return;
    }

    setQuestionIndex((current) => Math.max(0, current - 1));
  }

  function handleQuestionContinue(question: Question) {
    if (!question.options.some((option) => option.id === answers[question.id])) {
      return;
    }

    if (editingFromReview) {
      setEditingFromReview(false);
      setScreen('review');
      return;
    }

    if (screen === 'preview') {
      if (questionIndex < previewQuestions.length - 1) {
        setQuestionIndex((current) => current + 1);
        return;
      }

      setQuestionIndex(0);
      setScreen('preview-summary');
      return;
    }

    if (questionIndex < remainingQuestions.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }

    setQuestionIndex(0);
    setScreen('review');
  }

  function editQuestion(index: number) {
    const isPreviewQuestion = index < previewQuestions.length;
    setEditingFromReview(true);
    setQuestionIndex(isPreviewQuestion ? index : index - previewQuestions.length);
    setScreen(isPreviewQuestion ? 'preview' : 'core');
  }

  async function manageDeviceDraft(action: 'save' | 'restore' | 'clear') {
    setDraftBusy(true);
    try {
      if (action === 'save') {
        await saveDeviceDraft(JSON.stringify({assessmentId, profile, answers, context, probeAnswers, extendedAnswers}));
        setDraftStatus('Draft saved on this device.');
      } else if (action === 'restore') {
        const saved = await restoreDeviceDraft();
        if (saved) applyDraft(saved);
        setDraftStatus(saved ? 'Saved draft restored to this session.' : 'There is no current saved draft.');
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
        setAssessmentId(newAssessmentId());
        setProfile(emptyProfile);
        setAnswers({});
        setContext({});
        setProbeAnswers({});
        setExtendedAnswers({});
        setQuestionIndex(0);
        setEditingFromReview(false);
        setScreen('start');
        await clearDeviceDraft();
        setDraftStatus('Draft cleared from this session and device.');
      }
    } catch {
      setDraftStatus('The browser could not complete the draft action.');
    } finally {
      setDraftBusy(false);
    }
  }

  function renderStartScreen() {
    return (
      <section className="assessment-panel start-panel" aria-labelledby="assessment-title">
        <div className="panel-header">
          <h2 id="assessment-title" tabIndex={-1}>Tell us about your organisation.</h2>
          <p>Choose a goal to frame your assessment. You’ll answer 14 questions and get a readiness summary with recommended next steps.</p>
        </div>

        <form
          className="profile-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (profileComplete) {
              setQuestionIndex(0);
              setScreen('preview');
            }
          }}
        >
          <label htmlFor="profile-organisation">
            <span>Organisation type</span>
            <select
              value={profile.organizationType}
              onChange={(event) => updateProfile('organizationType', event.target.value)}
              id="profile-organisation" required
            >
              <option value="">Choose your organisation type</option>
              {ORGANISATION_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <label htmlFor="profile-industry">
            <span>Industry or sector</span>
            <select
              value={profile.industry}
              onChange={(event) => updateProfile('industry', event.target.value)}
              id="profile-industry" required
            >
              <option value="">Choose your industry</option>
              {INDUSTRY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label htmlFor="profile-goal">
            <span>Business goal</span>
            <select
              value={profile.businessGoal}
              onChange={(event) => updateProfile('businessGoal', event.target.value)}
              id="profile-goal" required
            >
              <option value="">Choose a goal</option>
              {BUSINESS_GOAL_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <p className="inline-note">Your progress is saved only in this browser.</p>

          {!profileComplete && (
            <p className="inline-note" aria-live="polite">
              Add the three fields above to begin the readiness assessment.
            </p>
          )}

          <div className="button-row">
            <button type="submit" className="button-primary" disabled={!profileComplete}>
              Start Questions
            </button>
          </div>
        </form>
      </section>
    );
  }

  function renderQuestionScreen(
    questions: Question[],
    step: 'preview' | 'core',
    currentIndex: number,
  ) {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) {
      return null;
    }

    const progressQuestionNumber = step === 'preview'
      ? currentIndex + 1
      : previewQuestions.length + currentIndex + 1;
    const isFinalQuestion = currentIndex === questions.length - 1;
    const hasCurrentAnswer = currentQuestion.options.some((option) => option.id === answers[currentQuestion.id]);

    return (
      <section className="assessment-panel question-panel" aria-labelledby="question-panel-title">
        <div className="progress-wrap">
          <div className="question-meta">
            <span>{getDimensionLabel(currentQuestion.dimension)}</span>
            <span>Question {progressQuestionNumber} of {coreQuestions.length}</span>
          </div>
          <div
            className="progress-bar"
            role="progressbar"
            aria-label="Assessment progress"
            aria-valuemin={0}
            aria-valuemax={coreQuestions.length}
            aria-valuenow={progressQuestionNumber}
            aria-valuetext={`Question ${progressQuestionNumber} of ${coreQuestions.length}`}
          >
            <span
              style={{
                width: `${Math.min(100, (progressQuestionNumber / coreQuestions.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        <fieldset
          key={currentQuestion.id}
          className="question-block"
          aria-describedby="question-example question-answer-hint"
        >
          <legend>
            <h2 id="question-panel-title" tabIndex={-1}>{currentQuestion.prompt}</h2>
          </legend>
          <p id="question-example" className="question-example">{questionExamples[currentQuestion.id]}</p>
          <div className="option-list">
            {currentQuestion.options.map((option) => (
              <label key={option.id} htmlFor={option.id} className={`option-card ${answers[currentQuestion.id] === option.id ? 'selected' : ''}`}>
                <input
                  type="radio"
                  id={option.id}
                  name={currentQuestion.id}
                  checked={answers[currentQuestion.id] === option.id}
                  onChange={() => setAnswer(currentQuestion.id, option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <p id="question-answer-hint" className="inline-note">
          Choose the answer that best describes how things work today. Choose “I am not sure” if you don’t have enough information.
        </p>

        <div className="button-row">
          <button type="button" className="button-secondary nav-back" onClick={handleQuestionBack}>
            <ActionIcon name="back" /> {editingFromReview || (screen === 'preview' && currentIndex === 0) ? 'Back' : 'Previous'}
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={() => handleQuestionContinue(currentQuestion)}
            disabled={!hasCurrentAnswer}
          >
            <ActionIcon name={editingFromReview || (isFinalQuestion && step === 'core') ? 'review' : 'next'} />
            {editingFromReview ? 'Save Answer' : isFinalQuestion ? (step === 'preview' ? 'Quick Preview' : 'Review Answers') : 'Next Question'}
          </button>
        </div>
      </section>
    );
  }

  function renderPreviewSummary() {
    const known = previewQuestions.filter((question) => {
      const answer = question.options.find((option) => option.id === answers[question.id]);
      return answer?.score !== null && answer !== undefined;
    }).length;
    const followUp = previewQuestions.length - known;

    return (
      <section className="assessment-panel" aria-labelledby="preview-summary-title">
        <div className="panel-header">
          <h2 id="preview-summary-title" tabIndex={-1}>Your quick preview</h2>
          <p>You’ve covered your business goal, ways of working and the reliability of your records.</p>
          <p>{followUp > 0
            ? `${followUp} of the first five answers ${followUp === 1 ? 'needs' : 'need'} confirmation. Your report will show how this affects your readiness range.`
            : 'All five answers describe a current practice. Continue to see how your systems, people and safeguards affect your next step.'}</p>
          <p>{remainingQuestions.length} questions remain before the final review.</p>
        </div>
        <div className="button-row">
          <button type="button" className="button-secondary nav-back" onClick={() => {setQuestionIndex(previewQuestions.length - 1); setScreen('preview');}}><ActionIcon name="back" /> Back</button>
          <button type="button" className="button-primary" onClick={() => {setQuestionIndex(0); setScreen('core');}}><ActionIcon name="next" /> Continue</button>
        </div>
      </section>
    );
  }

  function showResults() {
    if (!allCoreQuestionsAnswered || !safetyContextAnswered) return;
    let firstVisit = celebratedAssessment.current !== assessmentId;
    try {
      if (sessionStorage.getItem('compass.lastCelebrated') === assessmentId) firstVisit = false;
      sessionStorage.setItem('compass.lastCelebrated', assessmentId);
    } catch {
      // The in-memory reference also covers browsers with storage disabled.
    }
    celebratedAssessment.current = assessmentId;
    setShowConfetti(firstVisit && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setScreen('results');
  }

  function renderReviewScreen() {
    return (
      <section className="assessment-panel" aria-labelledby="review-title">
        <div className="panel-header">
          <h2 id="review-title" tabIndex={-1}>Review your assessment.</h2>
          <p>Review your answers and confirm how you plan to use AI. Then see your results or add details for more tailored recommendations.</p>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Profile</h3>
            <p><strong>Type:</strong> {getProfileOptionLabel(ORGANISATION_OPTIONS, profile.organizationType) || 'Not entered'}</p>
            <p><strong>Industry:</strong> {getProfileOptionLabel(INDUSTRY_OPTIONS, profile.industry) || 'Not entered'}</p>
            <p><strong>Goal:</strong> {getProfileOptionLabel(BUSINESS_GOAL_OPTIONS, profile.businessGoal) || 'Not entered'}</p>
          </div>
          <div className="summary-card">
            <h3>Evidence</h3>
            <p>{answeredCount} of {coreQuestions.length} questions answered</p>
            <p>{scoreSummary.answered} answers describe a known practice</p>
          </div>
        </div>

        <details className="answer-review">
          <summary>Your answers</summary>
          <ol className="answer-review-list">
            {coreQuestions.map((question, index) => (
              <li key={question.id}>
                <div>
                  <strong>{question.prompt}</strong>
                  <p>{question.options.find(({id}) => id === answers[question.id])?.label ?? 'Unanswered'}</p>
                </div>
                <button className="button-secondary" type="button" aria-label={`Edit Q${index + 1}`} onClick={() => editQuestion(index)}>Edit</button>
              </li>
            ))}
          </ol>
        </details>

        <fieldset className="profile-form safety-context-form" aria-describedby="safety-context-note">
          <legend>Safety and data context</legend>
          <p className="inline-note" id="safety-context-note">
            Answer these five questions so we can show the relevant safety checks. Choose “Not sure” if you need to confirm an answer.
          </p>
          {SAFETY_CONTEXT_QUESTIONS.map((question) => (
            <label key={question.id} htmlFor={question.id}>
              <span>{question.label}</span>
              <select
                value={profile[question.id]}
                onChange={(event) => updateProfile(question.id, event.target.value)}
                id={question.id}
                required
              >
                <option value="">Choose One</option>
                {question.options.map(({value, label}) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          ))}
        </fieldset>

        <div className="profile-form safety-evidence">
          {activeProbes({...context,...profile}, id => coreQuestions.find(q=>q.id===id)?.options.find(o=>o.id===answers[id])?.score ?? null)
            .filter(q => ['PR-GOV-SHARE','PR-GOV-PLANNED','PR-HUMAN-REVIEW'].includes(q.id))
            .map(q => <label key={q.id}>{q.prompt}
              <select value={probeAnswers[q.id] ?? ''} onChange={event => setProbeAnswers({...probeAnswers,[q.id]:event.target.value})}>
                <option value="">Skip for now</option>{q.choices?.map(choice => <option key={choice}>{choice}</option>)}
              </select>
            </label>)}
        </div>
        {readinessResult.primaryPath === 'FEASIBILITY' && readinessResult.useCaseGuidance === 'Eligible for controlled pilot planning' &&
          <label className="profile-form">Can someone make time to plan a small pilot?
            <select value={String(context.staff_capacity ?? '')} onChange={event => setContext({...context, staff_capacity:event.target.value})}>
              <option value="">Choose or skip</option><option value="available">Yes</option><option value="limited">Some time</option><option value="none">No time now</option><option value="unknown">Not sure</option>
            </select>
          </label>}
        <div className="button-row wizard-decision">
          <button type="button" className="button-secondary nav-back" onClick={() => {
            setQuestionIndex(remainingQuestions.length - 1);
            setScreen('core');
          }}>
            <ActionIcon name="back" /> Back
          </button>
          <div className="wizard-forward">
            <button type="button" className="button-secondary"
              onClick={() => setScreen('context')} disabled={!allCoreQuestionsAnswered || !safetyContextAnswered}>
              <ActionIcon name="details" /> More Details
            </button>
            <button type="button" className="button-primary result-cta" onClick={showResults}
              disabled={!allCoreQuestionsAnswered || !safetyContextAnswered}>
              <ActionIcon name="result" /> View Result
            </button>
          </div>
        </div>
        {!allCoreQuestionsAnswered && (
          <p className="inline-note answer-required-note" role="status">
            Answer all {coreQuestions.length} questions before viewing your results.
          </p>
        )}
        {allCoreQuestionsAnswered && !safetyContextAnswered && (
          <p className="inline-note answer-required-note" role="status">
            Choose one response for each safety and data context question. “Not sure” is valid.
          </p>
        )}
      </section>
    );
  }

  function renderResultsScreen() {
    return (
      <section className="assessment-panel" aria-labelledby="results-title">
        {showConfetti && <CompletionConfetti onFinish={() => setShowConfetti(false)} />}
        <div className="panel-header">
          <h2 id="results-title" tabIndex={-1}>Your AI readiness snapshot.</h2>
          <p>See what your answers support, which safeguards need attention and where to start.</p>
        </div>

        <div className="result-summary">
          <div>
            <p className="result-label">{reportGuidance.scoreLabel}</p>
            <h3>{reportGuidance.scoreValue} <span>out of 100</span></h3>
            {reportGuidance.scoreNote && <p className="result-score-note">{reportGuidance.scoreNote}</p>}
          </div>
          <div>
            <p className="result-label">Known Answers</p>
            <h3>{scoreSummary.answered} of {coreQuestions.length}</h3>
          </div>
        </div>

        <ReadinessSignal signal={reportGuidance.signal} />
        <DecisionSummary result={readinessResult} />

        <aside className="pragmatic-recommendation" aria-labelledby="safety-results-title">
          <h3 id="safety-results-title">Safety and evidence checks</h3>
          <p>{getSafetyChecksMessage(readinessResult)}</p>
          {readinessResult.formalGates.length > 0 && <ul>{readinessResult.formalGates.map((gate) => <li key={gate.id}>{getGateLabel(gate.id)}</li>)}</ul>}
        </aside>

        <aside className="pragmatic-recommendation" aria-labelledby="practical-next-step-title">
          <p className="eyebrow">Practical Next Step</p>
          <h3 id="practical-next-step-title">{reportGuidance.title}</h3>
          <p>{reportGuidance.guidance}</p>
          {reportGuidance.firstActionLabel && <p><strong>Start here.</strong> {reportGuidance.firstActionLabel}</p>}
          <p className="recommendation-band">{reportGuidance.bandText}</p>
        </aside>

        <section className="dimension-list" aria-labelledby="dimension-summary-title">
          <h3 id="dimension-summary-title">Readiness by area</h3>
          {dimensionSummary.map((dimension) => (
            <div key={dimension.dimension} className="dimension-row">
              <div className="dimension-label-row">
                <span>{dimension.label}</span>
                <span>{dimension.scoreText} · {dimension.known} of 2 indicators answered</span>
              </div>
              <div className="dimension-track" aria-hidden="true">
                <span style={{width: `${dimension.upper}%`}} />
              </div>
            </div>
          ))}
        </section>

        <div className="result-notes">
          <p>
            This summary is based on the answers recorded in this browser and is not a validated
            client assessment or certification.
          </p>
          <p>
            Unknown answers widen uncertainty and should be checked before making a decision.
          </p>
        </div>

        <p className="inline-note result-privacy">Your answers stay in this browser. You choose whether to save or share your report.</p>

        <div className="results-toolbar">
          <button type="button" className="button-secondary results-back" onClick={() => setScreen('review')}>
            <ActionIcon name="back" /> Back
          </button>
          {allCoreQuestionsAnswered && (
            <Suspense fallback={<p role="status">Preparing report actions…</p>}>
              <ReportModule profile={reportProfile} assessmentId={assessmentId} answers={answers} readiness={readinessResult} />
            </Suspense>
          )}
        </div>
      </section>
    );
  }

  const activeStep = screen === 'start' ? 'Profile' : (screen === 'review' || screen === 'context') ? 'Review' : screen === 'results' ? 'Results' : 'Questions';

  return (
    <div className="assessment-shell">
      <nav className="assessment-topbar" aria-label="Assessment progress">
        <ol className="wizard-steps">
          {wizardSteps.map((step) => <li key={step} aria-current={step === activeStep ? 'step' : undefined}>{step}</li>)}
        </ol>
      </nav>

      {storageError && <p className="storage-error" role="alert">{storageError}</p>}

      {screen === 'start' && renderStartScreen()}
      {screen === 'preview' && renderQuestionScreen(previewQuestions, 'preview', questionIndex)}
      {screen === 'preview-summary' && renderPreviewSummary()}
      {screen === 'core' && renderQuestionScreen(remainingQuestions, 'core', questionIndex)}
      {screen === 'review' && renderReviewScreen()}
      {screen === 'context' && (
        <AssessmentDetails
          onBack={() => setScreen('review')}
          onResults={showResults}
          profile={{...context, ...profile, primary_goal: profile.businessGoal}}
          answers={answers}
          probeAnswers={probeAnswers}
          extendedAnswers={extendedAnswers}
          update={(id, value) => setContext((current) => ({...current, [id]: value}))}
          answerProbe={(id, value) => setProbeAnswers((current) => ({...current, [id]: value}))}
          answerTechnical={(id, value) => setExtendedAnswers((current) => ({...current, [id]: value}))}
        />
      )}
      {screen === 'results' && renderResultsScreen()}
      <details className="compass-draft-controls">
        <summary>Draft controls</summary>
        <p>Your progress is saved for this browser tab. You can explicitly save a copy on this device to restore later. Copies expire after 30 days and are removed when you next try to restore them.</p>
        <div className="button-row">
          <button className="button-secondary" type="button" disabled={draftBusy} onClick={() => void manageDeviceDraft('save')}>Save Draft</button>
          {screen === 'start' && <button className="button-secondary" type="button" disabled={draftBusy} onClick={() => void manageDeviceDraft('restore')}>Restore Draft</button>}
          <button className="button-secondary" type="button" disabled={draftBusy} onClick={() => void manageDeviceDraft('clear')}>Clear draft</button>
        </div>
        {draftStatus && <p role="status">{draftStatus}</p>}
      </details>
    </div>
  );
}
