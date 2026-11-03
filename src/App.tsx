import {lazy, Suspense, useEffect, useMemo, useState} from 'react';
import {evaluate} from './domain/evaluate';
import {getReportGuidance} from './domain/report-guidance';
import ReadinessSignal from './ReadinessSignal';

const ReportModule = lazy(() => import('./report/ReportModule'));
const STORAGE_KEY = 'silverspark-compass-draft-v1';

type Question = {
  id: string;
  dimension: 'STR' | 'PRO' | 'DAT' | 'TEC' | 'PEO' | 'GOV' | 'MET';
  prompt: string;
  options: Array<{id: string; label: string; score: number | null}>;
};

type Screen = 'start' | 'preview' | 'core' | 'review' | 'results';

type Profile = {
  organizationType: string;
  industry: string;
  businessGoal: string;
};

const emptyProfile: Profile = {
  organizationType: '',
  industry: '',
  businessGoal: '',
};

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

function getProfileOptionLabel(options: readonly (readonly [string, string])[], value: string) {
  return options.find(([optionValue]) => optionValue === value)?.[1] ?? value;
}

const coreQuestions: Question[] = [
  {
    id: 'STR-01',
    dimension: 'STR',
    prompt: 'Which business outcome would an AI or automation improvement most directly improve?',
    options: [
      {id: 'STR-01-L0', label: 'We have not identified a specific business goal.', score: 0},
      {id: 'STR-01-L1', label: 'We have some ideas but no agreed outcome.', score: 1},
      {id: 'STR-01-L2', label: 'We have chosen a goal but no way to measure it.', score: 2},
      {id: 'STR-01-L3', label: 'We have a clear goal and know what improvement would look like.', score: 3},
      {id: 'STR-01-L4', label: 'We review results against goals and adjust our plans.', score: 4},
      {id: 'STR-01-UNK', label: 'I am not sure', score: null},
    ],
  },
  {
    id: 'STR-02',
    dimension: 'STR',
    prompt: 'Who has authority to approve a new AI or automation use case and the associated risk checks?',
    options: [
      {id: 'STR-02-L0', label: 'No one has a clear responsibility for that decision.', score: 0},
      {id: 'STR-02-L1', label: 'Decisions happen informally when a problem comes up.', score: 1},
      {id: 'STR-02-L2', label: 'A person usually decides, but responsibilities are not always clear.', score: 2},
      {id: 'STR-02-L3', label: 'There is a clear decision owner and a simple approval process.', score: 3},
      {id: 'STR-02-L4', label: 'Decisions have clear owners and are reviewed for business impact.', score: 4},
      {id: 'STR-02-UNK', label: 'I am not sure', score: null},
    ],
  },
  {
    id: 'PRO-01',
    dimension: 'PRO',
    prompt: 'How consistently is your highest-value operational workflow performed the same way each time?',
    options: [
      {id: 'PRO-01-L0', label: 'We work differently each time; the steps are not clear.', score: 0},
      {id: 'PRO-01-L1', label: 'We mostly rely on habit or what individuals remember.', score: 1},
      {id: 'PRO-01-L2', label: 'We use common steps but they are not always followed.', score: 2},
      {id: 'PRO-01-L3', label: 'We have repeatable steps that people normally follow.', score: 3},
      {id: 'PRO-01-L4', label: 'We review the steps, measure delays, and improve them.', score: 4},
      {id: 'PRO-01-UNK', label: 'I am not sure', score: null},
    ],
  },
  {
    id: 'PRO-02',
    dimension: 'PRO',
    prompt: 'When work slows down, repeats, or creates errors, how do you identify the root cause?',
    options: [
      {id: 'PRO-02-L0', label: 'We rarely identify recurring problems.', score: 0},
      {id: 'PRO-02-L1', label: 'We notice problems when a customer or colleague complains.', score: 1},
      {id: 'PRO-02-L2', label: 'We discuss recurring problems but do not track them.', score: 2},
      {id: 'PRO-02-L3', label: 'We record the main recurring problems and act on them.', score: 3},
      {id: 'PRO-02-L4', label: 'We track patterns, investigate causes, and verify improvement.', score: 4},
      {id: 'PRO-02-UNK', label: 'I am not sure', score: null},
    ],
  },
  {
    id: 'DAT-01',
    dimension: 'DAT',
    prompt: 'How reliable are the records you rely on to run sales, service, operations, or finance each week?',
    options: [
      {id: 'DAT-01-L0', label: 'Important records are often missing or unusable.', score: 0},
      {id: 'DAT-01-L1', label: 'Records exist but are frequently incomplete or out of date.', score: 1},
      {id: 'DAT-01-L2', label: 'Most records are usable but require occasional correction.', score: 2},
      {id: 'DAT-01-L3', label: 'Important records are usually accurate and easy to find.', score: 3},
      {id: 'DAT-01-L4', label: 'We regularly check record quality and fix recurring errors.', score: 4},
      {id: 'DAT-01-UNK', label: 'I am not sure', score: null},
    ],
  },
  {
    id: 'DAT-02',
    dimension: 'DAT',
    prompt: 'Who owns the upkeep, access, and trustworthiness of the business records used in day-to-day decisions?',
    options: [
      {id: 'DAT-02-L0', label: 'Nobody takes responsibility for maintaining our records.', score: 0},
      {id: 'DAT-02-L1', label: 'People update records when they remember or have time.', score: 1},
      {id: 'DAT-02-L2', label: 'Someone usually maintains records, but checks are informal.', score: 2},
      {id: 'DAT-02-L3', label: 'There is a clear owner and a regular review process.', score: 3},
      {id: 'DAT-02-L4', label: 'We monitor quality, maintain access and fix drift early.', score: 4},
      {id: 'DAT-02-UNK', label: 'I am not sure', score: null},
    ],
  },
  {
    id: 'TEC-01',
    dimension: 'TEC',
    prompt: 'How well are your current systems and tools supporting the work you want to improve with AI?',
    options: [
      {id: 'TEC-01-L0', label: 'Tools are fragmented, brittle, or difficult to use.', score: 0},
      {id: 'TEC-01-L1', label: 'Systems mostly work, but they create friction or manual work.', score: 1},
      {id: 'TEC-01-L2', label: 'We can use the main tools, but connections are inconsistent.', score: 2},
      {id: 'TEC-01-L3', label: 'The main systems are usable and fairly reliable.', score: 3},
      {id: 'TEC-01-L4', label: 'We understand our technology dependencies and support improvements.', score: 4},
      {id: 'TEC-01-UNK', label: 'I am not sure', score: null},
    ],
  },
  {
    id: 'TEC-02',
    dimension: 'TEC',
    prompt: 'How prepared are you to pilot new technology, measure impact, and manage change without disrupting core work?',
    options: [
      {id: 'TEC-02-L0', label: 'We avoid change because risks and dependencies are unclear.', score: 0},
      {id: 'TEC-02-L1', label: 'We trial changes informally and do not have a clear review process.', score: 1},
      {id: 'TEC-02-L2', label: 'We test improvements but documentation and safeguards are uneven.', score: 2},
      {id: 'TEC-02-L3', label: 'We have a practical process for trials and review.', score: 3},
      {id: 'TEC-02-L4', label: 'We test changes with evidence, fallback plans, and owners.', score: 4},
      {id: 'TEC-02-UNK', label: 'I am not sure', score: null},
    ],
  },
  {
    id: 'PEO-01',
    dimension: 'PEO',
    prompt: 'How confident are the people involved in learning new ways of working and checking AI-assisted output?',
    options: [
      {id: 'PEO-01-L0', label: 'People are unsure, resistant, or not ready to change.', score: 0},
      {id: 'PEO-01-L1', label: 'Some people want to try new approaches, but support is uneven.', score: 1},
      {id: 'PEO-01-L2', label: 'People are curious but need clearer guidance and practice.', score: 2},
      {id: 'PEO-01-L3', label: 'Most people are open to learning and can use new tools.', score: 3},
      {id: 'PEO-01-L4', label: 'The team consistently learns, supports each other, and improves adoption.', score: 4},
      {id: 'PEO-01-UNK', label: 'I am not sure', score: null},
    ],
  },
  {
    id: 'PEO-02',
    dimension: 'PEO',
    prompt: 'Who is accountable for coaching teams through change and helping adoption stick?',
    options: [
      {id: 'PEO-02-L0', label: 'There is no clear ownership for skills or adoption.', score: 0},
      {id: 'PEO-02-L1', label: 'Training is ad hoc and depends on individuals.', score: 1},
      {id: 'PEO-02-L2', label: 'Someone helps, but responsibilities are not always clear.', score: 2},
      {id: 'PEO-02-L3', label: 'There is a clear owner and practical support for adoption.', score: 3},
      {id: 'PEO-02-L4', label: 'There is active support, feedback, and clear success measures.', score: 4},
      {id: 'PEO-02-UNK', label: 'I am not sure', score: null},
    ],
  },
  {
    id: 'GOV-01',
    dimension: 'GOV',
    prompt: 'How clearly are decisions and responsibilities defined when work involves sensitive information or new tools?',
    options: [
      {id: 'GOV-01-L0', label: 'Rules and ownership are unclear or inconsistent.', score: 0},
      {id: 'GOV-01-L1', label: 'Some responsibilities exist but are not well documented.', score: 1},
      {id: 'GOV-01-L2', label: 'There is reasonable clarity but no regular review.', score: 2},
      {id: 'GOV-01-L3', label: 'Authority and decisions are defined for the main risks.', score: 3},
      {id: 'GOV-01-L4', label: 'Responsibilities and controls are reviewed and updated regularly.', score: 4},
      {id: 'GOV-01-UNK', label: 'I am not sure', score: null},
    ],
  },
  {
    id: 'GOV-02',
    dimension: 'GOV',
    prompt: 'How well do you understand the risks of using data or AI in your current work?',
    options: [
      {id: 'GOV-02-L0', label: 'We are not clear what the main risks or controls are.', score: 0},
      {id: 'GOV-02-L1', label: 'We know some risks but do not review them systematically.', score: 1},
      {id: 'GOV-02-L2', label: 'We identify obvious risks but do not always act on them.', score: 2},
      {id: 'GOV-02-L3', label: 'We know the main risks and have practical controls.', score: 3},
      {id: 'GOV-02-L4', label: 'We review risks, document controls, and act before issues spread.', score: 4},
      {id: 'GOV-02-UNK', label: 'I am not sure', score: null},
    ],
  },
  {
    id: 'MET-01',
    dimension: 'MET',
    prompt: 'How well do you measure whether a new tool or change is helping your organisation?',
    options: [
      {id: 'MET-01-L0', label: 'We do not have a clear way to tell if it helps.', score: 0},
      {id: 'MET-01-L1', label: 'We notice outcomes but do not measure them regularly.', score: 1},
      {id: 'MET-01-L2', label: 'We track some information, but results are uneven.', score: 2},
      {id: 'MET-01-L3', label: 'We measure the main outcomes and review the trend.', score: 3},
      {id: 'MET-01-L4', label: 'We measure, reflect, and improve the work based on evidence.', score: 4},
      {id: 'MET-01-UNK', label: 'I am not sure', score: null},
    ],
  },
  {
    id: 'MET-02',
    dimension: 'MET',
    prompt: 'How confident are you that the organisation would notice if a change did not work as expected?',
    options: [
      {id: 'MET-02-L0', label: 'We would likely miss the issue until it created a bigger problem.', score: 0},
      {id: 'MET-02-L1', label: 'We would notice some issues but not quickly or consistently.', score: 1},
      {id: 'MET-02-L2', label: 'We have some checks, but they are not trusted or well used.', score: 2},
      {id: 'MET-02-L3', label: 'We have a practical monitoring and review process.', score: 3},
      {id: 'MET-02-L4', label: 'We review results, act on problems early, and learn quickly.', score: 4},
      {id: 'MET-02-UNK', label: 'I am not sure', score: null},
    ],
  },
];

const previewQuestions = coreQuestions.slice(0, 5);
const remainingQuestions = coreQuestions.slice(5);

function getDimensionLabel(dimension: Question['dimension']) {
  return {
    STR: 'Strategy',
    PRO: 'Processes',
    DAT: 'Data',
    TEC: 'Technology',
    PEO: 'People',
    GOV: 'Governance',
    MET: 'Measurement',
  }[dimension];
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [storageError, setStorageError] = useState('');
  const [isReportModuleOpen, setIsReportModuleOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as {profile?: Profile; answers?: Record<string, string>};
      if (draft.profile) setProfile(draft.profile);
      if (draft.answers) setAnswers(draft.answers);
    } catch {
      setStorageError('Draft storage is unavailable in this browser, so the assessment will only stay in this tab.');
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({profile, answers}));
    } catch {
      setStorageError('Draft storage is blocked, so you can continue in this session without saving.');
    }
  }, [profile, answers]);

  useEffect(() => {
    const target = document.getElementById('react-enhancement');
    if (target) {
      target.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }
  }, [screen]);

  useEffect(() => {
    document.getElementById('assessment-title')?.focus();
  }, []);

  useEffect(() => {
    if (isReportModuleOpen) {
      document.getElementById('report-module-panel')?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }, [isReportModuleOpen]);

  const answeredCount = coreQuestions.filter((question) =>
    question.options.some((option) => option.id === answers[question.id]),
  ).length;
  const readinessResult = useMemo(
    () =>
      evaluate({
        assessmentId: 'assessment-local',
        schemaVersion: '1.3.1',
        questionBankVersion: '1.1.0',
        profile: {
          ...profile,
          organizationType: profile.organizationType,
          industry: profile.industry,
          businessGoal: profile.businessGoal,
          primary_goal: profile.businessGoal,
        },
        coreAnswers: answers,
      }),
    [answers, profile],
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
  const reportProfile = {
    ...profile,
    industry: getProfileOptionLabel(INDUSTRY_OPTIONS, profile.industry),
    businessGoal: getProfileOptionLabel(BUSINESS_GOAL_OPTIONS, profile.businessGoal),
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
    if (screen === 'preview' && questionIndex === 0) {
      setScreen('start');
      return;
    }

    if (screen === 'core' && questionIndex === 0) {
      setQuestionIndex(0);
      setScreen('preview');
      return;
    }

    setQuestionIndex((current) => Math.max(0, current - 1));
  }

  function handleQuestionContinue(question: Question) {
    if (!question.options.some((option) => option.id === answers[question.id])) {
      return;
    }

    if (screen === 'preview') {
      if (questionIndex < previewQuestions.length - 1) {
        setQuestionIndex((current) => current + 1);
        return;
      }

      setQuestionIndex(0);
      setScreen('core');
      return;
    }

    if (questionIndex < remainingQuestions.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }

    setQuestionIndex(0);
    setScreen('review');
  }

  function renderStartScreen() {
    return (
      <section className="assessment-panel start-panel" aria-labelledby="assessment-title">
        <div className="panel-header">
          <p className="eyebrow">AI Readiness Profile</p>
          <h2 id="assessment-title" tabIndex={-1}>Tell Us A Little About The Business Case.</h2>
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
          <label>
            <span>Organisation Type</span>
            <select
              value={profile.organizationType}
              onChange={(event) => updateProfile('organizationType', event.target.value)}
              aria-label="Organisation Type"
            >
              <option value="">Select One</option>
              <option value="Sole proprietor">Sole proprietor</option>
              <option value="SME">SME team</option>
              <option value="Department">Department</option>
              <option value="Enterprise">Enterprise function</option>
            </select>
          </label>

          <label>
            <span>Industry / Sector</span>
            <select
              value={profile.industry}
              onChange={(event) => updateProfile('industry', event.target.value)}
              aria-label="Industry / Sector"
            >
              <option value="">Select An Industry / Sector</option>
              {INDUSTRY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Business Goal</span>
            <select
              value={profile.businessGoal}
              onChange={(event) => updateProfile('businessGoal', event.target.value)}
              aria-label="Business Goal"
            >
              <option value="">Select A Business Goal</option>
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
              Continue to assessment
            </button>
          </div>
        </form>
      </section>
    );
  }

  function renderQuestionScreen(
    questions: Question[],
    title: string,
    description: string,
    step: Screen,
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
        <div className="panel-header compact-header">
          <p className="eyebrow">{title}</p>
          <h2 id="question-panel-title">{description}</h2>
        </div>

        <div className="progress-wrap" aria-live="polite">
          <span>
            Question {progressQuestionNumber} of {coreQuestions.length}
          </span>
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
          aria-describedby={!hasCurrentAnswer ? 'question-answer-hint' : undefined}
        >
          <legend>
            <span className="question-number">{currentIndex + 1}</span>
            {currentQuestion.prompt}
          </legend>
          <div className="option-list">
            {currentQuestion.options.map((option) => (
              <label key={option.id} className={`option-card ${answers[currentQuestion.id] === option.id ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={currentQuestion.id}
                  checked={answers[currentQuestion.id] === option.id}
                  onChange={() => setAnswer(currentQuestion.id, option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {!hasCurrentAnswer && (
          <p id="question-answer-hint" className="inline-note answer-required-note" role="status" aria-live="polite">
            Choose one response to continue. “I am not sure” is a valid answer.
          </p>
        )}

        <div className="button-row">
          <button type="button" className="button-secondary" onClick={handleQuestionBack}>
            {screen === 'preview' && currentIndex === 0 ? 'Back to profile' : 'Previous'}
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={() => handleQuestionContinue(currentQuestion)}
            disabled={!hasCurrentAnswer}
          >
            {isFinalQuestion ? (step === 'preview' ? 'Continue to core assessment' : 'Review your answers') : 'Next question'}
          </button>
        </div>
      </section>
    );
  }

  function renderReviewScreen() {
    return (
      <section className="assessment-panel" aria-labelledby="review-title">
        <div className="panel-header">
          <p className="eyebrow">UX-08 · Review</p>
          <h2 id="review-title">Review And Refine Your Draft.</h2>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Profile</h3>
            <p><strong>Type:</strong> {profile.organizationType || 'Not entered'}</p>
            <p><strong>Industry:</strong> {getProfileOptionLabel(INDUSTRY_OPTIONS, profile.industry) || 'Not entered'}</p>
            <p><strong>Goal:</strong> {getProfileOptionLabel(BUSINESS_GOAL_OPTIONS, profile.businessGoal) || 'Not entered'}</p>
          </div>
          <div className="summary-card">
            <h3>Progress</h3>
            <p>{answeredCount} of {coreQuestions.length} questions answered</p>
            <p>{scoreSummary.answered} scored answers included</p>
          </div>
        </div>

        <div className="button-row">
          <button type="button" className="button-secondary" onClick={() => {
            setQuestionIndex(0);
            setScreen('core');
          }}>
            Edit answers
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={() => {
              if (allCoreQuestionsAnswered) setScreen('results');
            }}
            disabled={!allCoreQuestionsAnswered}
          >
            See readiness snapshot
          </button>
        </div>
        {!allCoreQuestionsAnswered && (
          <p className="inline-note answer-required-note" role="status">
            Answer all {coreQuestions.length} questions before viewing your results.
          </p>
        )}
      </section>
    );
  }

  function renderResultsScreen() {
    return (
      <section className="assessment-panel" aria-labelledby="results-title">
        <div className="panel-header">
          <p className="eyebrow">UX-09 · Results</p>
          <h2 id="results-title">Self-Reported Readiness Snapshot</h2>
        </div>

        <div className="result-summary">
          <div>
            <p className="result-label">{reportGuidance.scoreLabel}</p>
            <h3>{reportGuidance.scoreText}</h3>
            {reportGuidance.scoreNote && <p className="result-score-note">{reportGuidance.scoreNote}</p>}
          </div>
          <div>
            <p className="result-label">Known Answers</p>
            <h3>{scoreSummary.answered} of {coreQuestions.length}</h3>
          </div>
        </div>

        <ReadinessSignal signal={reportGuidance.signal} />

        <aside className="pragmatic-recommendation" aria-labelledby="practical-next-step-title">
          <p className="eyebrow">Practical Next Step</p>
          <h3 id="practical-next-step-title">{reportGuidance.title}</h3>
          <p>{reportGuidance.bandText} {reportGuidance.guidance}</p>
        </aside>

        <div className="dimension-list" aria-label="Dimension summary">
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
        </div>

        <div className="result-notes">
          <p>
            This summary is based on the answers recorded in this browser and is not a validated
            client assessment or certification.
          </p>
          <p>
            Unknown answers widen uncertainty and should be checked before making a decision.
          </p>
        </div>

        <div className="privacy-banner" aria-live="polite">
          <p className="eyebrow">Designed With Care</p>
          <h3>Your Information Stays Yours.</h3>
        </div>

        <div className="button-row">
          <button type="button" className="button-secondary" onClick={() => setScreen('review')}>
            Back to review
          </button>
          <button
            type="button"
            className="button-primary"
            aria-expanded={isReportModuleOpen}
            aria-controls="report-module-panel"
            disabled={!allCoreQuestionsAnswered}
            onClick={() => {
              if (allCoreQuestionsAnswered) setIsReportModuleOpen((open) => !open);
            }}
          >
            {isReportModuleOpen ? 'Hide report preview' : 'View report preview'}
          </button>
        </div>
        {!allCoreQuestionsAnswered && (
          <p className="inline-note answer-required-note" role="status">
            Answer all {coreQuestions.length} questions before viewing the report.
          </p>
        )}

        <div id="report-module-panel" className="report-module-panel">
          {isReportModuleOpen && (
            <Suspense
              fallback={<p role="status">Preparing your report preview…</p>}
            >
              <ReportModule profile={reportProfile} answers={answers} readiness={readinessResult} />
            </Suspense>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="assessment-shell">
      <div className="assessment-topbar">
        <p>Silverspark Compass</p>
        {screen !== 'start' && (
          <span>{screen === 'preview' ? 'Quick Preview' : screen === 'core' ? 'Core Questions' : screen === 'review' ? 'Review' : 'Results'}</span>
        )}
      </div>

      {storageError && <p className="storage-error" role="alert">{storageError}</p>}

      {screen === 'start' && renderStartScreen()}
      {screen === 'preview' &&
        renderQuestionScreen(
          previewQuestions,
          'Quick Preview',
          'Five-Question Quick Preview',
          'preview',
          questionIndex,
        )}
      {screen === 'core' &&
        renderQuestionScreen(
          remainingQuestions,
          'Core Assessment',
          'Complete The Remaining Scoring Questions.',
          'core',
          questionIndex,
        )}
      {screen === 'review' && renderReviewScreen()}
      {screen === 'results' && renderResultsScreen()}
    </div>
  );
}
