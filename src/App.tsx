import {safetyFields} from './domain/safety-scope';
import {encodeDraft,decodeDraft} from './assessment/draft-format';
import profileSchema from '../docs/domain/profile_schema.json';
import {businessGoalOptions, getBusinessGoal} from './domain/business-goals';
import {dimensionRows, getDimensionLabel} from './domain/dimension-display';
import DimensionBar from './assessment/DimensionBar';
import {restorePosition, type Screen} from './assessment/journey-position';
import LoadBoundary from './LoadBoundary';
import MethodNote from './assessment/MethodNote';
import {markets, ownership, industryExamples} from './domain/market';
import {activeProbes} from './domain/diagnostics';
import DecisionSummary from './assessment/DecisionSummary';
import CompletionConfetti from './assessment/CompletionConfetti';
import ActionIcon from './report/ActionIcon';
import {lazy, Suspense, useEffect, useMemo, useRef, useState} from 'react';
import questionBank from '../docs/domain/question_bank.json';
import {evaluate} from './domain/evaluate';
import {getReportGuidance} from './domain/report-guidance';
import ReadinessSignal from './ReadinessSignal';
import AssessmentDetails from './assessment/AssessmentDetails';
import {clearDeviceDraft, restoreDeviceDraft} from './assessment/local-draft';

const ReportModule = lazy(() => import('./report/ReportModule'));
const STORAGE_KEY = 'silverspark-compass-draft-v1';

type Question = typeof questionBank.questions[number];

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

const INDUSTRY_OPTIONS = profileSchema.early_fields.find(field => field.id === 'industry')!.values.map(value =>
  [value, value.replaceAll('_',' ').replace(/^./, c=>c.toUpperCase())] as const);

const SAFETY_CONTEXT_QUESTIONS = [
  {
    id: 'current_ai_use',
    hint: 'Include everyday work such as drafting a reply, summarising notes or searching records.',
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
    hint: 'Think about what the tool would receive: public information, customer contact details or confidential records.',
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
    hint: 'Consider who makes the final decision and whether a person can check and override the AI output.',
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
    hint: 'Think about one use you are actively considering, even if you have not chosen a tool.',
    label: 'Is an AI use planned?',
    options: [
      {value: 'yes', label: 'Yes'},
      {value: 'no', label: 'No'},
      {value: 'unknown', label: 'Not sure'},
    ],
  },
  {
    id: 'planned_use_real_data',
    hint: 'Real data includes actual orders, messages and payment records. Invented examples are test data.',
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

function safetyQuestions(profile: Profile) {
  return safetyFields(profile).map(field => SAFETY_CONTEXT_QUESTIONS.find(({id}) => id === field)!);
}

const wizardSteps = ['Profile', 'Safety', 'Questions', 'Review', 'Results'] as const;

const previewQuestions = coreQuestions.slice(0, 5);
const remainingQuestions = coreQuestions.slice(5);

function validProfile(profile: Profile) {
  return ORGANISATION_OPTIONS.some(([value]) => value === profile.organizationType) &&
    INDUSTRY_OPTIONS.some(([value]) => value === profile.industry) &&
    businessGoalOptions.some(([value]) => value === profile.businessGoal);
}

function newAssessmentId() {
  return 'SELF-' + (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).toUpperCase();
}

export default function App({onHome}: {onHome: () => void}) {
  const [reportCreated, setReportCreated] = useState(false);
  const [exportedVersion, setExportedVersion] = useState('');
  const [assessmentId, setAssessmentId] = useState(newAssessmentId);
  const celebratedAssessment = useRef('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [screen, setScreen] = useState<Screen>('start');
  const [committedProfile, setProfile] = useState<Profile>(emptyProfile);
  const [committedAnswers, setAnswers] = useState<Record<string, string>>({});
  const [context, setContext] = useState<Record<string, unknown>>({});
  const [committedProbes, setProbeAnswers] = useState<Record<string, string>>({});
  const [extendedAnswers, setExtendedAnswers] = useState<Record<string, string>>({});
  const [detailStep, setDetailStep] = useState('workflow');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reviewEdit, setReviewEdit] = useState<{profile: Profile; answers: Record<string, string>; probes: Record<string, string>} | null>(null);
  const editingFromReview = reviewEdit !== null;
  const profile = reviewEdit?.profile ?? committedProfile;
  const probeAnswers = reviewEdit?.probes ?? committedProbes;
  const scopedSafety = safetyQuestions(profile);
  const answers = reviewEdit?.answers ?? committedAnswers;
  const [storageError, setStorageError] = useState('');
  const [legacyAvailable, setLegacyAvailable] = useState(false);
  const [draftBusy, setDraftBusy] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // A download covers only the committed answers used to produce that report.
  const reportVersion = useMemo(() => JSON.stringify([committedProfile, committedAnswers, context, committedProbes, extendedAnswers]),
    [committedProfile, committedAnswers, context, committedProbes, extendedAnswers]);
  const reportExported = reportVersion === exportedVersion;

  function applyDraft(raw: string, resumeJourney = true) {
    const {fields,migrated} = decodeDraft(raw);
    if (migrated) setStorageError('Business details restored. Answer the revised readiness questions again.');
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
    const validAnswers = Object.fromEntries(coreQuestions.flatMap(({id, options}) =>
      options.some((option) => option.id === savedAnswers[id]) ? [[id, savedAnswers[id] ?? '']] : [],
    ));
    setAnswers(validAnswers);
    if (resumeJourney && !migrated && validProfile(restored)) {
      const previousSafetyOrder = ['current_ai_use','data_category','high_impact_ai_workflow','planned_ai_use','planned_use_real_data'];
      const savedSafetyId = fields.safetyField ?? previousSafetyOrder[Number(fields.questionIndex)];
      const restoredIndex = fields.screen === 'safety' ? Math.max(0,safetyQuestions(restored).findIndex(q => q.id === savedSafetyId)) : fields.questionIndex;
      const position = restorePosition(fields.screen ?? (fields.atResults ? 'results' : 'start'), restoredIndex,
        coreQuestions.map(question => Boolean(validAnswers[question.id])),
        safetyQuestions(restored).map(({id, options}) => options.some(({value}) => restored[id] === value)),
        previewQuestions.length);
      setScreen(position.screen);
      setQuestionIndex(position.index);
      if (position.screen === 'context' && typeof fields.detailStep === 'string') setDetailStep(fields.detailStep);
    }
    const restoredContext = fields.context && typeof fields.context === 'object' && !Array.isArray(fields.context)
      ? fields.context as Record<string, unknown> : {};
    const probes = knownStrings(fields.probeAnswers);
    const extended = knownStrings(fields.extendedAnswers);
    setContext(restoredContext);
    setProbeAnswers(probes);
    setExtendedAnswers(extended);
    setReportCreated(!migrated && (fields.reportCreated === true || fields.atResults === true || fields.screen === 'results'));
    setExportedVersion(!migrated && fields.reportExported === true
      ? JSON.stringify([restored, validAnswers, restoredContext, probes, extended]) : '');
  }

  useEffect(() => {
    let active = true;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) applyDraft(raw);
      void restoreDeviceDraft().then(saved => {
        if (active && !raw && saved) setLegacyAvailable(true);
      }).catch(() => undefined);
    } catch {
      try {sessionStorage.removeItem(STORAGE_KEY);} catch { /* Storage may be blocked. */ }
      setStorageError('The session draft could not be restored. You can start a new assessment.');
    } finally {
      setDraftLoaded(true);
    }
    return () => {active = false;};
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    try {
      const hasProgress = Object.values(committedProfile).some(Boolean) || Object.keys(committedAnswers).length > 0;
      if (hasProgress) sessionStorage.setItem(STORAGE_KEY, encodeDraft({assessmentId, reportCreated, reportExported, profile: committedProfile, answers: committedAnswers, context, probeAnswers: committedProbes, extendedAnswers,
        safetyField: screen === 'safety' ? safetyQuestions(committedProfile)[questionIndex]?.id : undefined,
        screen: editingFromReview ? 'review' : screen, questionIndex, detailStep, atResults: screen === 'results'}));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      setStorageError('This browser cannot save progress for a refresh. Keep this tab open until you export your report.');
    }
  }, [assessmentId, reportCreated, reportExported, committedProfile, committedAnswers, context, committedProbes, extendedAnswers, editingFromReview, screen, questionIndex, detailStep, draftLoaded]);

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>('.assessment-shell');
    shell?.querySelector('h2')?.focus({preventScroll: true});
    shell?.scrollIntoView({block: 'start', behavior: 'instant'});
  }, [screen, questionIndex]);

  useEffect(() => {
    const links = document.querySelectorAll<HTMLAnchorElement>('a[data-compass-home]');
    function goHome(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (reportCreated && !reportExported && !window.confirm(
        'Your latest report has not been exported. Returning home will clear this assessment and its answers. Return home?',
      )) return;
      try {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem('compass.lastCelebrated');
      } catch { /* The in-memory assessment is cleared even when storage is unavailable. */ }
      onHome();
    }
    links.forEach(link => link.addEventListener('click', goHome));
    return () => links.forEach(link => link.removeEventListener('click', goHome));
  }, [onHome, reportCreated, reportExported]);

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
  const knownAnswers = Object.values(readinessResult.dimensions).reduce((count, area) => count + area.known, 0);

  const dimensionSummary = dimensionRows(readinessResult.dimensions);

  const profileComplete = validProfile(profile);
  const safetyContextAnswered = scopedSafety.every(({id, options}) =>
    options.some(({value}) => profile[id] === value),
  );
  const reportProfile = {
    ...context,
    ...profile,
    organizationType: getProfileOptionLabel(ORGANISATION_OPTIONS, profile.organizationType),
    industry: getProfileOptionLabel(INDUSTRY_OPTIONS, profile.industry),
    businessGoal: getProfileOptionLabel(businessGoalOptions, profile.businessGoal),
    current_ai_use: getSafetyContextOptionLabel('current_ai_use', profile.current_ai_use),
    data_category: scopedSafety.some(q => q.id === 'data_category') ? getSafetyContextOptionLabel('data_category', profile.data_category) : 'Outside the stated use case',
    high_impact_ai_workflow: scopedSafety.some(q => q.id === 'high_impact_ai_workflow') ? getSafetyContextOptionLabel('high_impact_ai_workflow', profile.high_impact_ai_workflow) : 'Outside the stated use case',
    planned_ai_use: getSafetyContextOptionLabel('planned_ai_use', profile.planned_ai_use),
    planned_use_real_data: scopedSafety.some(q => q.id === 'planned_use_real_data') ? getSafetyContextOptionLabel('planned_use_real_data', profile.planned_use_real_data) : 'Outside the stated use case',
  };
  const reportGuidance = getReportGuidance(readinessResult);
  const allCoreQuestionsAnswered = answeredCount === coreQuestions.length;

  function updateProfile(field: keyof Profile, value: string) {
    const next = {...profile, [field]: value};
    const relevant = safetyFields(next);
    for (const {id} of SAFETY_CONTEXT_QUESTIONS) if (!relevant.includes(id)) next[id] = '';
    const active = activeProbes({...context, ...next}, id => coreQuestions.find(q => q.id === id)?.options.find(o => o.id === answers[id])?.score ?? null);
    const nextProbes = Object.fromEntries(Object.entries(probeAnswers).filter(([id]) => active.some(q => q.id === id)));
    if (reviewEdit) setReviewEdit({...reviewEdit, profile: next, probes: nextProbes});
    else {setProfile(next); setProbeAnswers(nextProbes);}
  }

  function setAnswer(questionId: string, optionId: string) {
    if (reviewEdit) setReviewEdit({...reviewEdit, answers: {...answers, [questionId]: optionId}});
    else setAnswers((current) => ({...current, [questionId]: optionId}));
  }

  function handleQuestionBack() {
    if (editingFromReview) {
      finishReviewEdit(false);
      return;
    }

    if (screen === 'preview' && questionIndex === 0) {
      setQuestionIndex(scopedSafety.length - 1);
      setScreen('safety');
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
      finishReviewEdit(true);
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

  function finishReviewEdit(save: boolean) {
    if (save && reviewEdit) {
      setProfile(reviewEdit.profile);
      setProbeAnswers(reviewEdit.probes);
      setAnswers(reviewEdit.answers);
    }
    setReviewEdit(null);
    setScreen('review');
  }

  function editProfileOrSafety(destination: 'start' | 'safety', index = 0) {
    setReviewEdit({profile, answers, probes: probeAnswers});
    setQuestionIndex(index);
    setScreen(destination);
  }

  function editQuestion(index: number) {
    const isPreviewQuestion = index < previewQuestions.length;
    setReviewEdit({profile, answers, probes: probeAnswers});
    setQuestionIndex(isPreviewQuestion ? index : index - previewQuestions.length);
    setScreen(isPreviewQuestion ? 'preview' : 'core');
  }

  async function handleLegacyCopy(resume: boolean) {
    setDraftBusy(true);
    try {
      if (resume) {
        const saved = await restoreDeviceDraft();
        if (saved) applyDraft(saved, false);
        else setStorageError('The saved copy has expired or was removed.');
      } else {
        await clearDeviceDraft();
      }
      setLegacyAvailable(false);
    } catch {
      setStorageError('The saved copy could not be opened or removed. Please try again.');
    } finally {
      setDraftBusy(false);
    }
  }

  function renderStartScreen() {
    return (
      <section className="assessment-panel start-panel" aria-labelledby="assessment-title">
        <div className="panel-header">
          <h2 id="assessment-title" tabIndex={-1}>Tell us about your organisation.</h2>
          <p>{editingFromReview ? 'Update your business details, then return to your review.' : 'Tell us about your business and its goal, then answer two to five safety questions and 14 readiness questions for a report with practical next steps.'}</p>
        </div>

        {legacyAvailable && !Object.values(profile).some(Boolean) && <aside aria-label="Previously saved assessment">
          <p>You previously saved an assessment on this device.</p>
          <div className="button-row">
            <button className="button-secondary" type="button" disabled={draftBusy} onClick={() => void handleLegacyCopy(true)}>Resume</button>
            <button className="button-secondary" type="button" disabled={draftBusy} onClick={() => void handleLegacyCopy(false)}>Delete copy</button>
          </div>
        </aside>}

        <form
          className="profile-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (editingFromReview && profileComplete) finishReviewEdit(true);
            else if (profileComplete) {
              setQuestionIndex(0);
              setScreen('safety');
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
            <span>Which business outcome matters most?</span>
            <select
              value={profile.businessGoal}
              onChange={(event) => updateProfile('businessGoal', event.target.value)}
              id="profile-goal" aria-describedby="goal-measure" required
            >
              <option value="">Choose your main goal</option>
              {businessGoalOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <p id="goal-measure" className="inline-note" aria-live="polite">{getBusinessGoal(profile.businessGoal)?.measure ?? 'Choose the outcome you most want to improve first.'}</p>

          <p className="inline-note">Progress stays in this tab when you refresh. Export your report to keep a copy.</p>

          {!profileComplete && (
            <p className="inline-note" aria-live="polite">
              Add the three fields above to begin the readiness assessment.
            </p>
          )}

          <div className="button-row">
            {editingFromReview && <button type="button" className="button-secondary nav-back" onClick={() => finishReviewEdit(false)}><ActionIcon name="back" /> Back</button>}
            <button type="submit" className="button-primary" disabled={!profileComplete}>
              {editingFromReview ? 'Save Profile' : 'Start Questions'}
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
          <p id="question-example" className="question-example">{currentQuestion.id === 'STR-02' ? (ownership[profile.organizationType] ?? 'The person responsible for this workflow') + ' can take this role.' : questionExamples[currentQuestion.id]}
          {currentQuestion.id === 'DAT-01' && ' ' + markets.global.records}
          {currentQuestion.id === 'TEC-02' && ' ' + markets.global.continuity}
          {currentQuestion.id === 'PRO-01' && ' Think of ' + (industryExamples[profile.industry] ?? 'a typical request') + '.'}</p>
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
    const example = previewQuestions.find(q => (q.options.find(o => o.id === answers[q.id])?.score ?? 5) <= 1);
    const observation = example ? 'Start by checking ' + getDimensionLabel(example.dimension).toLowerCase() + ' against a recent example. ' + questionExamples[example.id] :
      known ? 'Use one of the workflows you described as the starting point for a small, measurable improvement.' : 'Collect one recent order or work record to answer these questions with evidence.';

    return (
      <section className="assessment-panel" aria-labelledby="preview-summary-title">
        <div className="panel-header">
          <h2 id="preview-summary-title" tabIndex={-1}>Your quick preview</h2>
          <p>You’ve covered your business goal, ways of working and the reliability of your records.</p>
          <p>{followUp > 0
            ? `${followUp} of the first five answers ${followUp === 1 ? 'needs' : 'need'} confirmation. Your report will show how this affects your readiness range.`
            : 'All five answers describe a current practice. Continue to see how your systems, people and safeguards affect your next step.'}</p>
          <p>{observation}</p>
          <p>Next are the remaining {remainingQuestions.length} readiness questions.</p>
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
    setReportCreated(true);
    setScreen('results');
  }

  function renderSafetyScreen() {
    const question = scopedSafety[questionIndex]!;
    const last = questionIndex === scopedSafety.length-1;
    const attached: Record<string,string[]> = {
      high_impact_ai_workflow: ['PR-HUMAN-REVIEW'],
      data_category: profile.planned_ai_use === 'no' || profile.current_ai_use !== 'none' ? ['PR-GOV-SHARE'] : [],
      planned_use_real_data: profile.current_ai_use === 'none' ? ['PR-GOV-PLANNED','PR-GOV-SHARE'] : ['PR-GOV-PLANNED'],
    };
    const followUps = activeProbes({...context,...profile}, id => coreQuestions.find(q => q.id === id)?.options.find(o => o.id === answers[id])?.score ?? null)
      .filter(q => attached[question.id]?.includes(q.id));
    function goBack() {
      if (editingFromReview) finishReviewEdit(false);
      else if (questionIndex > 0) setQuestionIndex(questionIndex - 1);
      else {
        setQuestionIndex(0);
        setScreen('start');
      }
    }
    function advance() {
      if (editingFromReview) {
        const missing = scopedSafety.findIndex(({id, options}) => !options.some(o => o.value === profile[id]));
        if (missing >= 0) setQuestionIndex(missing);
        else finishReviewEdit(true);
      }
      else if (last) {setQuestionIndex(0); setScreen('preview');}
      else setQuestionIndex(questionIndex + 1);
    }
    return <section className="assessment-panel question-panel" aria-labelledby="safety-question-title">
      <p className="eyebrow">Safety context · {questionIndex+1} of {scopedSafety.length}</p>
      <fieldset className="question-block" aria-describedby="safety-question-hint"><legend><h2 id="safety-question-title" tabIndex={-1}>{question.label}</h2></legend>
      <p id="safety-question-hint" className="question-example">{question.hint}</p>
      <div className="option-list">{question.options.map(o=><label className="option-card" key={o.value}><input type="radio" name={question.id} value={o.value}
        checked={profile[question.id]===o.value} onChange={()=>updateProfile(question.id,o.value)}/><span>{o.label}</span></label>)}</div></fieldset>
      {profile[question.id] && followUps.map(q => <label key={q.id} className="profile-form">{q.prompt}
        <select value={probeAnswers[q.id] ?? ''} onChange={event => {
          const probes = {...probeAnswers, [q.id]:event.target.value};
          if (reviewEdit) setReviewEdit({...reviewEdit, probes}); else setProbeAnswers(probes);
        }}><option value="">Skip for now</option>{q.choices?.map(choice => <option key={choice}>{choice}</option>)}</select>
      </label>)}
      {question.id === 'high_impact_ai_workflow' && ['decides','influences','yes'].includes(profile.high_impact_ai_workflow) &&
        <p className="inline-note" role="status">This use needs specialist review before a pilot. You can continue assessing the organisation.</p>}
      {followUps.some(q => (q.id === 'PR-GOV-SHARE' && probeAnswers[q.id] === 'Yes') || (q.id === 'PR-GOV-PLANNED' && probeAnswers[q.id] === 'No')) &&
        <p className="inline-note" role="status">Pause this use of real data and review the safeguards with the person responsible.</p>}
      <div className="button-row"><button className="button-secondary nav-back" onClick={goBack}><ActionIcon name="back"/> Back</button>
      <button className="button-primary" disabled={!profile[question.id]} onClick={advance}><ActionIcon name={editingFromReview ? 'review' : 'next'}/> {editingFromReview ? 'Save Answer' : last ? 'Start Questions' : 'Next Question'}</button></div>
    </section>;
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
            <p><strong>Goal:</strong> {getProfileOptionLabel(businessGoalOptions, profile.businessGoal) || 'Not entered'}</p>
            <button type="button" className="button-secondary" onClick={() => editProfileOrSafety('start')}>Edit Profile</button>
          </div>
          <div className="summary-card">
            <h3>Evidence</h3>
            <p>{answeredCount} of {coreQuestions.length} questions answered</p>
            <p>{knownAnswers} answers describe a known practice</p>
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

        <details className="answer-review"><summary>Safety context</summary>
          <ol className="answer-review-list">
            {scopedSafety.map((question, index) => <li key={question.id}>
              <div><strong>{question.label}</strong><p>{getSafetyContextOptionLabel(question.id, profile[question.id])}</p></div>
              <button type="button" className="button-secondary" aria-label={`Edit safety question ${index + 1}: ${question.label}`}
                onClick={() => editProfileOrSafety('safety', index)}>Edit</button>
            </li>)}
          </ol>
        </details>

        {(readinessResult.primaryPath === 'FEASIBILITY' || readinessResult.primaryPath === 'P5') && readinessResult.useCaseGuidance === 'Eligible for controlled pilot planning' &&
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
              onClick={() => {setDetailStep('workflow'); setScreen('context');}} disabled={!allCoreQuestionsAnswered || !safetyContextAnswered}>
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
            <h3>{knownAnswers} of {coreQuestions.length}</h3>
          </div>
        </div>

        <ReadinessSignal signal={reportGuidance.signal} />
        <DecisionSummary result={readinessResult} />

        <aside className="pragmatic-recommendation" aria-labelledby="practical-next-step-title">
          <p className="eyebrow">Practical Next Step</p>
          <h3 id="practical-next-step-title">{reportGuidance.title}</h3>
          <p>{reportGuidance.guidance}</p>
          {reportGuidance.firstActionLabel && <p><strong>Start here.</strong> {reportGuidance.firstActionLabel}</p>}
          <p className="recommendation-band">{reportGuidance.bandText}</p>
        </aside>

        <p className="inline-note result-privacy">Export the full PDF or share a short consultation brief by email or WhatsApp.</p>
        <div className="results-toolbar">
          <button type="button" className="button-secondary results-back" onClick={() => setScreen('review')}>
            <ActionIcon name="back" /> Back
          </button>
          {allCoreQuestionsAnswered && (
            <LoadBoundary message="Compass could not open the report actions.">
              <Suspense fallback={<p role="status">Preparing report actions…</p>}>
                <ReportModule profile={reportProfile} assessmentId={assessmentId} answers={answers} readiness={readinessResult} onExported={() => setExportedVersion(reportVersion)} />
              </Suspense>
            </LoadBoundary>
          )}
        </div>

        {readinessResult.opportunity.kind !== 'Foundation' && readinessResult.useCaseGuidance !== 'Hold' && (
          <aside className="pragmatic-recommendation"><h3>{readinessResult.opportunity.kind}</h3><p>{readinessResult.opportunity.next}</p><p>{readinessResult.opportunity.measure}</p></aside>
        )}

        <section className="area-chart" aria-labelledby="dimension-summary-title">
          <header className="area-chart-heading">
            <h3 id="dimension-summary-title">Readiness by area</h3>
            <p>{knownAnswers} of 14 indicators answered</p>
          </header>
          <ul className="area-chart-rows">
            {dimensionSummary.map(area => (
              <li key={area.dimension} className="area-chart-row">
                <span className="area-name">{area.label}</span>
                <DimensionBar lower={area.lower} upper={area.upper} />
                <span className="area-value">{area.scoreText}
                  {area.known < 2 && <small>{area.known} of 2 answered</small>}
                </span>
              </li>
            ))}
          </ul>
          {dimensionSummary.some(area => area.known < 2) &&
            <p className="area-key"><i aria-hidden="true" />Striped ranges show how unanswered indicators could change the score.</p>}
        </section>

        <MethodNote />
        <div className="result-notes">
          <p>
            This summary is based on the answers recorded in this browser and is not a validated
            client assessment or certification.
          </p>
          {knownAnswers < coreQuestions.length && <p>
            Unknown answers widen uncertainty and should be checked before making a decision.
          </p>}
        </div>

      </section>
    );
  }

  const activeStep = screen === 'start' ? 'Profile' : screen === 'safety' ? 'Safety' : (screen === 'review' || screen === 'context') ? 'Review' : screen === 'results' ? 'Results' : 'Questions';

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
      {screen === 'safety' && renderSafetyScreen()}
      {screen === 'context' && (
        <AssessmentDetails
          stepId={detailStep} onStepChange={setDetailStep}
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
    </div>
  );
}
