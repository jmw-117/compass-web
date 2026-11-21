import {lazy, Suspense, useEffect, useMemo, useState} from 'react';
import {evaluate} from './domain/evaluate';
import {getGateLabel, getReportGuidance, getSafetyChecksMessage} from './domain/report-guidance';
import ReadinessSignal from './ReadinessSignal';
import AssessmentDetails from './assessment/AssessmentDetails';
import {clearDeviceDraft, restoreDeviceDraft, saveDeviceDraft} from './assessment/local-draft';

const ReportModule = lazy(() => import('./report/ReportModule'));
const STORAGE_KEY = 'silverspark-compass-draft-v1';

type Question = {
  id: string;
  dimension: 'STR' | 'PRO' | 'DAT' | 'TEC' | 'PEO' | 'GOV' | 'MET';
  prompt: string;
  options: Array<{id: string; label: string; score: number | null}>;
};

type Screen = 'start' | 'preview' | 'preview-summary' | 'core' | 'review' | 'results';

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
    label: 'Will AI help make decisions about healthcare, credit, hiring, access to important services, or a similarly high-impact matter?',
    options: [
      {value: 'yes', label: 'Yes'},
      {value: 'no', label: 'No'},
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

function newAssessmentId() {
  return 'SELF-' + (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).toUpperCase();
}

export default function App() {
  const [assessmentId, setAssessmentId] = useState(newAssessmentId);
  const [screen, setScreen] = useState<Screen>('start');
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [context, setContext] = useState<Record<string, unknown>>({});
  const [probeAnswers, setProbeAnswers] = useState<Record<string, string>>({});
  const [extendedAnswers, setExtendedAnswers] = useState<Record<string, string>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [storageError, setStorageError] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [draftBusy, setDraftBusy] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [isReportModuleOpen, setIsReportModuleOpen] = useState(false);

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
    const target = document.getElementById('react-enhancement');
    if (target) {
      target.scrollIntoView({block: 'nearest'});
      const heading = target.querySelector('h2');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({preventScroll: true});
    }
  }, [screen, questionIndex]);

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
        setIsReportModuleOpen(false);
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
              <option value="sole_proprietor">Sole proprietor</option>
              <option value="small_sme">Small SME</option>
              <option value="established_sme">Established SME</option>
              <option value="enterprise">Enterprise or department</option>
              <option value="nonprofit">Nonprofit</option>
              <option value="other">Other</option>
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

  function renderPreviewSummary() {
    return (
      <section className="assessment-panel" aria-labelledby="preview-summary-title">
        <div className="panel-header">
          <h2 id="preview-summary-title">Your quick preview</h2>
          <p>You answered five questions. {previewQuestions.filter((question) => answers[question.id]?.endsWith('-UNK')).length} are marked for follow-up because the answer is uncertain.</p>
          <p>The remaining questions cover operating conditions and safeguards. Compass calculates readiness after the full core assessment.</p>
        </div>
        <div className="button-row">
          <button type="button" className="button-secondary" onClick={() => {setQuestionIndex(previewQuestions.length - 1); setScreen('preview');}}>Review last answer</button>
          <button type="button" className="button-primary" onClick={() => {setQuestionIndex(0); setScreen('core');}}>Continue assessment</button>
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

        <div className="profile-form safety-context-form" role="group" aria-labelledby="safety-context-title">
          <h3 id="safety-context-title">Safety And Data Context</h3>
          <p className="inline-note" id="safety-context-note">
            These answers help identify relevant checks. Choose “Not sure” when uncertain; that context will be clearly marked as unverified.
          </p>
          {SAFETY_CONTEXT_QUESTIONS.map((question) => (
            <label key={question.id}>
              <span>{question.label}</span>
              <select
                value={profile[question.id]}
                onChange={(event) => updateProfile(question.id, event.target.value)}
                aria-label={question.label}
                aria-describedby="safety-context-note"
              >
                <option value="">Choose One</option>
                {question.options.map(({value, label}) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <AssessmentDetails
          profile={{...context, ...profile, primary_goal: profile.businessGoal}}
          answers={answers}
          probeAnswers={probeAnswers}
          extendedAnswers={extendedAnswers}
          update={(id, value) => setContext((current) => ({...current, [id]: value}))}
          answerProbe={(id, value) => setProbeAnswers((current) => ({...current, [id]: value}))}
          answerTechnical={(id, value) => setExtendedAnswers((current) => ({...current, [id]: value}))}
        />

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
              if (allCoreQuestionsAnswered && safetyContextAnswered) setScreen('results');
            }}
            disabled={!allCoreQuestionsAnswered || !safetyContextAnswered}
          >
            See readiness snapshot
          </button>
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

        <aside className="pragmatic-recommendation" aria-labelledby="safety-results-title">
          <h3 id="safety-results-title">Safety and evidence checks</h3>
          <p>{getSafetyChecksMessage(readinessResult)}</p>
          {readinessResult.formalGates.length > 0 && <ul>{readinessResult.formalGates.map((gate) => <li key={gate.id}>{getGateLabel(gate.id)}</li>)}</ul>}
        </aside>
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
              <ReportModule profile={reportProfile} assessmentId={assessmentId} answers={answers} readiness={readinessResult} />
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
          <span>{(screen === 'preview' || screen === 'preview-summary') ? 'Quick Preview' : screen === 'core' ? 'Core Questions' : screen === 'review' ? 'Review' : 'Results'}</span>
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
      {screen === 'preview-summary' && renderPreviewSummary()}
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
      <details className="compass-draft-controls">
        <summary>Draft controls</summary>
        <p>Your progress is saved for this browser tab. You can explicitly save a copy on this device to restore later. Copies expire after 30 days and are removed when you next try to restore them.</p>
        <div className="button-row">
          <button className="button-secondary" type="button" disabled={draftBusy} onClick={() => void manageDeviceDraft('save')}>Save on device</button>
          {screen === 'start' && <button className="button-secondary" type="button" disabled={draftBusy} onClick={() => void manageDeviceDraft('restore')}>Restore device draft</button>}
          <button className="button-secondary" type="button" disabled={draftBusy} onClick={() => void manageDeviceDraft('clear')}>Clear draft</button>
        </div>
        {draftStatus && <p role="status">{draftStatus}</p>}
      </details>
    </div>
  );
}
