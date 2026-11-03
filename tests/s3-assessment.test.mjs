import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('S3 assessment begins with the required three-field start profile and preview flow', async () => {
  const app = await readFile('src/App.tsx', 'utf8');
  const profileSchema = JSON.parse(await readFile('docs/domain/profile_schema.json', 'utf8'));

  assert.match(app, /Organisation Type/);
  assert.match(app, /Industry \/ Sector/);
  assert.match(app, /Business Goal/);
  assert.match(app, /<span>Industry \/ Sector<\/span>[\s\S]*?<select[\s\S]*?<\/select>/);
  assert.match(app, /<span>Business Goal<\/span>[\s\S]*?<select[\s\S]*?<\/select>/);
  assert.match(app, /aria-label="Industry \/ Sector"/);
  assert.match(app, /aria-label="Organisation Type"/);

  for (const fieldId of ['industry', 'primary_goal']) {
    const field = profileSchema.early_fields.find(({id}) => id === fieldId);
    assert.ok(field, `Missing ${fieldId} in the profile schema`);
    for (const value of field.values) {
      assert.ok(app.includes(`['${value}',`), `Missing dropdown option ${value}`);
    }
  }

  assert.match(app, /INDUSTRY_OPTIONS\.some/);
  assert.match(app, /BUSINESS_GOAL_OPTIONS\.some/);
  assert.match(app, /Five-Question Quick Preview/);
  assert.match(app, /Quick Preview/);
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

test('S3 retains the lazy report preview contract required by the foundation shell', async () => {
  const app = await readFile('src/App.tsx', 'utf8');

  assert.match(app, /lazy\(\(\) => import\('\.\/report\/ReportModule'\)\)/);
  assert.match(app, /View report preview/);
  assert.match(app, /report-module-panel/);
});

test('questions and results cannot be advanced to without valid selected answers', async () => {
  const app = await readFile('src/App.tsx', 'utf8');

  assert.match(app, /const hasCurrentAnswer = currentQuestion\.options\.some/);
  assert.match(app, /disabled=\{!hasCurrentAnswer\}/);
  assert.match(app, /function handleQuestionContinue\(question: Question\)/);
  assert.match(app, /if \(!question\.options\.some/);
  assert.match(app, /Choose one response to continue\./);
  assert.match(app, /“I am not sure” is a valid answer\./);
  assert.match(app, /disabled=\{!allCoreQuestionsAnswered\}/);
  assert.match(app, /if \(allCoreQuestionsAnswered\) setScreen\('results'\)/);
  assert.match(app, /Answer all \{coreQuestions\.length\} questions before viewing your results\./);
});

test('question numbers use a centered grid inside the circular badge', async () => {
  const styles = await readFile('src/styles/global.css', 'utf8');
  const badgeStyles = styles.match(/\.question-number\s*\{([^}]+)\}/)?.[1];

  assert.ok(badgeStyles, 'Missing question number badge styles');
  assert.match(badgeStyles, /display:\s*inline-grid/);
  assert.match(badgeStyles, /place-items:\s*center/);
});
