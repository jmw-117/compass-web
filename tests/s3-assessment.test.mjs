import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('The assessment begins with the required three-field start profile and preview flow', async () => {
  const app = await readFile('src/App.tsx', 'utf8');
  const profileSchema = JSON.parse(await readFile('docs/domain/profile_schema.json', 'utf8'));

  for (const [id, label] of [
    ['profile-organisation', 'Organisation type'],
    ['profile-industry', 'Industry or sector'],
    ['profile-goal', 'Business goal'],
  ]) {
    assert.ok(app.includes(`htmlFor="${id}"`));
    assert.ok(app.includes(`<span>${label}</span>`));
    assert.ok(app.includes(`id="${id}" required`));
  }

  for (const fieldId of ['industry', 'primary_goal']) {
    const field = profileSchema.early_fields.find(({id}) => id === fieldId);
    assert.ok(field, `Missing ${fieldId} in the profile schema`);
    if (fieldId === 'industry') {
      assert.match(app, /profileSchema\.early_fields\.find/);
      for (const added of ['agriculture','trades','creators']) assert.ok(field.values.includes(added));
      continue;
    }
    for (const value of field.values) {
      assert.ok(app.includes(`['${value}',`), `Missing dropdown option ${value}`);
    }
  }

  assert.match(app, /INDUSTRY_OPTIONS\.some/);
  assert.match(app, /BUSINESS_GOAL_OPTIONS\.some/);
  assert.match(app, /coreQuestions\.slice\(0, 5\)/);
  assert.match(app, /Your quick preview/);
});

test('S3 keeps local draft behavior explicit and self-reported results separate from validation', async () => {
  const app = await readFile('src/App.tsx', 'utf8');

  assert.match(app, /sessionStorage/);
  assert.match(app, /Your progress is saved only in this browser/);
  assert.match(app, /storageError &&/);
  assert.doesNotMatch(app, /Draft saved locally in this browser|Clear saved draft|assessment-footer/);
  assert.match(app, /not a validated\s+client assessment/i);
  assert.match(app, /Unknown answers widen uncertainty/);
});

test('S3 maps the selected business goal to the evaluator profile contract', async () => {
  const app = await readFile('src/App.tsx', 'utf8');

  assert.match(app, /primary_goal:\s*profile\.businessGoal/);
});

test('the review flow collects every existing safety-context profile field before results', async () => {
  const app = await readFile('src/App.tsx', 'utf8');
  const profileSchema = JSON.parse(await readFile('docs/domain/profile_schema.json', 'utf8'));
  const fieldIds = [
    'current_ai_use',
    'data_category',
    'high_impact_ai_workflow',
    'planned_ai_use',
    'planned_use_real_data',
  ];

  for (const fieldId of fieldIds) {
    const field = profileSchema.later_fields.find(({id}) => id === fieldId);
    assert.ok(field, `Missing ${fieldId} in the profile schema`);
    assert.ok(app.includes(`id: '${fieldId}'`), `Missing UI question for ${fieldId}`);
    for (const value of field.values) {
      assert.ok(app.includes(`value: '${value}'`), `Missing ${fieldId} option ${value}`);
    }
  }

  assert.match(app, /safetyContextAnswered/);
  assert.match(app, /disabled=\{!allCoreQuestionsAnswered\s*\|\|\s*!safetyContextAnswered\}/);
  assert.match(app, /“Not sure” is valid/);
});

test('S3 retains the lazy report preview contract required by the foundation shell', async () => {
  const app = await readFile('src/App.tsx', 'utf8');

  assert.match(app, /lazy\(\(\) => import\('\.\/report\/ReportModule'\)\)/);
  assert.match(app, /results-toolbar/);
  assert.doesNotMatch(app, /View report preview|Hide report preview/);
});

test('questions and results cannot be advanced to without valid selected answers', async () => {
  const app = await readFile('src/App.tsx', 'utf8');

  assert.match(app, /const hasCurrentAnswer = currentQuestion\.options\.some/);
  assert.match(app, /disabled=\{!hasCurrentAnswer\}/);
  assert.match(app, /function handleQuestionContinue\(question: Question\)/);
  assert.match(app, /if \(!question\.options\.some/);
  assert.match(app, /Choose the answer that best describes how things work today/);
  assert.match(app, /Choose “I am not sure”/);
  assert.match(app, /disabled=\{!allCoreQuestionsAnswered\s*\|\|\s*!safetyContextAnswered\}/);
  assert.match(app, /if \(!allCoreQuestionsAnswered \|\| !safetyContextAnswered\) return;/);
  assert.match(app, /Answer all \{coreQuestions\.length\} questions before viewing your results\./);
});

test('the wizard uses the approved question bank as its source and labels each radio group', async () => {
  const app = await readFile('src/App.tsx', 'utf8');

  assert.match(app, /import questionBank from '\.\.\/docs\/domain\/question_bank\.json'/);
  assert.match(app, /const coreQuestions = questionBank\.questions/);
  assert.match(app, /<fieldset[\s\S]*?className="question-block"[\s\S]*?>\s*<legend>/);
  assert.match(app, /<h2 id="question-panel-title" tabIndex=\{-1\}>\{currentQuestion\.prompt\}/);
  assert.match(app, /htmlFor=\{option\.id\}/);
  assert.match(app, /<span>\{option\.label\}<\/span>/);
});
