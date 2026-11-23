import {safetyFields} from '../src/domain/safety-scope.ts';
import {measuredBenefit} from '../src/domain/measured-benefit.ts';
import {businessGoalOptions, getBusinessGoal} from '../src/domain/business-goals.ts';
import assert from 'node:assert/strict';
import test from 'node:test';
import {evaluate} from '../src/domain/evaluate.ts';
import {getReportGuidance, positiveCapabilities} from '../src/domain/report-guidance.ts';
import bank from '../docs/domain/question_bank.json' with {type:'json'};
const core=Object.fromEntries(bank.questions.map(q=>[q.id,q.id+'-L4']));
const base={current_ai_use:'team_pilot',data_category:'routine',planned_ai_use:'yes',planned_use_real_data:'no',high_impact_ai_workflow:'no',staff_capacity:'available',primary_goal:'service',extended_assessment:true};
const safe={'PR-GOV-SHARE':'No'};
test('four personas retain the same method and report their next practical action',()=>{
 for(const org_type of ['sole_proprietor','small_sme','established_sme','enterprise']){
  const r=evaluate({profile:{...base,org_type},coreAnswers:core,probeAnswers:safe});
  assert.equal(r.score.lowerEighths,800);assert.equal(r.useCaseGuidance,'Eligible for controlled pilot planning');
  assert.match(getReportGuidance(r).title,/pilot/i);assert.ok(r.actionPlan.every(a=>a.step&&a.validation));
 }
});
test('assistive oversight, technical conflicts and edits qualify guidance without changing the score',()=>{
 const initial=evaluate({profile:{...base,high_impact_ai_workflow:'assists'},coreAnswers:core,probeAnswers:safe});
 assert.equal(initial.useCaseGuidance,'Review required');assert.match(initial.concerns.join(' '),/accountable person/);
 const qualified=evaluate({profile:{...base,high_impact_ai_workflow:'assists'},coreAnswers:core,probeAnswers:{...safe,'PR-HUMAN-REVIEW':'An accountable reviewer with authority'}});
 assert.equal(qualified.useCaseGuidance,'Eligible for controlled pilot planning');assert.deepEqual(initial.score,qualified.score);
 const conflict=evaluate({profile:{...base,baseline_known:'no'},coreAnswers:core,probeAnswers:safe,extendedAnswers:{'EX-DEP-02':'EX-DEP-02-none','EX-ARC-02':'EX-ARC-02-none'}});
 assert.equal(conflict.score.lowerEighths,800);assert.equal(conflict.useCaseGuidance,'Review required');assert.match(conflict.concerns.join(' '),/baseline/);assert.match(conflict.concerns.join(' '),/fallback/);
});
test('unscored novice guidance and vendor checks affect evidence only',()=>{
 const r=evaluate({profile:{...base,diagnostic_scope:'guided',current_ai_use:'none',planned_ai_use:'no'},coreAnswers:core,extendedAnswers:{'EX-QUICK-FIRST':'EX-QUICK-FIRST-none'}});
 assert.equal(r.score.lowerEighths,800);assert.equal(r.useCaseGuidance,'Not assessed');
 assert.match(r.technicalFindings[0]!.response,/Nothing yet/);
});
test('financial support requires an actual comparison, never changes the decision',()=>{
 for(const [answer,status] of [['','Unverified'],['Yes','Supported by available evidence'],['No','Unsupported']]){
  const r=evaluate({profile:{...base,baseline_known:'yes',impact_measure:'cost'},coreAnswers:core,probeAnswers:{...safe,'PR-FIN-COMPARE':answer!}});
  assert.equal(r.score.lowerEighths,800);assert.equal(r.financialEvidence,status);assert.equal(r.useCaseGuidance,'Eligible for controlled pilot planning');
 }
});

test('fully answered zero dimensions never appear among strengths', () => {
  const answers = Object.fromEntries(bank.questions.map(q => [q.id, q.id + '-L0']));
  const result = evaluate({profile:base, coreAnswers:answers});
  assert.deepEqual(positiveCapabilities(result.dimensions), []);
  const improved = evaluate({profile:base, coreAnswers:{...answers, 'STR-01':'STR-01-L3'}});
  assert.deepEqual(positiveCapabilities(improved.dimensions).map(([id]) => id), ['STR']);
});

test('action context reflects the reported industry, goal and workflow', () => {
  const profile = {...base, industry:'trades', value_stream:'lead_to_sale', workflow_bottleneck:'lost_leads'};
  const result = evaluate({profile, coreAnswers:core, probeAnswers:safe});
  assert.match(result.actionPlan[0]!.context, /repair booking.*lead to sale.*lost leads.*customer experience/);
  assert.deepEqual(result.score, evaluate({profile:base, coreAnswers:core, probeAnswers:safe}).score);
});

test('all profile goals preserve maturity and safety and carry an appropriate measure into the plan', () => {
  const reference = evaluate({profile:base, coreAnswers:core, probeAnswers:safe});
  const ids = businessGoalOptions.map(([id]) => id);
  for (const id of ['efficiency','growth','service','risk','explore','cash_flow','quality','insight']) assert.ok(ids.includes(id));
  for (const [id,label] of businessGoalOptions) {
    const goal = getBusinessGoal(id)!;
    assert.equal(goal.label, label);
    const result = evaluate({profile:{...base, primary_goal:id}, coreAnswers:core, probeAnswers:safe});
    assert.deepEqual(result.score, reference.score);
    assert.equal(result.useCaseGuidance, reference.useCaseGuidance);
    assert.ok(result.actionPlan[0]!.context.includes(goal.measure));
  }
});

test('unneeded safety fields stay unassessed while uncertainty and consequential use trigger review', () => {
  const noUse = {current_ai_use:'none', planned_ai_use:'no'};
  assert.deepEqual(safetyFields(noUse), ['current_ai_use','planned_ai_use']);
  const dormant = evaluate({coreAnswers:core, profile:noUse});
  assert.equal(dormant.useCaseGuidance,'Not assessed');
  assert.equal(dormant.safetyContextConfirmed,true);
  assert.equal(safetyFields({...noUse,current_ai_use:'unknown'}).length,4);
  const disclosed = evaluate({coreAnswers:core,profile:{...base,high_impact_ai_workflow:'decides'},probeAnswers:safe});
  assert.deepEqual(disclosed.score,dormant.score);
  assert.equal(disclosed.useCaseGuidance,'Hold');
});
test('measured capacity, net cash and modelled ROI have independent evidence requirements', () => {
  const input = {baseline_known:'yes',benefit_comparable:true,minutes_before:18,minutes_after:12,cases_month:100,
    benefit_currency:'USD',cash_benefit:100,cash_running:40,cash_setup:240};
  assert.deepEqual(measuredBenefit({...input,benefit_comparable:false},'Supported by available evidence'),[]);
  assert.match(measuredBenefit(input,'Unsupported').join(' '),/10 staff hours released/);
  assert.equal(measuredBenefit(input,'Unverified').length,1);
  assert.match(measuredBenefit(input,'Supported by available evidence').join(' '),/USD 60.*200%/);
  assert.match(measuredBenefit({...input,cash_running:125},'Supported by available evidence').join(' '),/USD -25/);
  assert.equal(measuredBenefit({...input,cash_setup:0},'Supported by available evidence').length,2);
  assert.deepEqual(measuredBenefit({...input,minutes_before:Infinity,benefit_currency:''},'Supported by available evidence'),[]);
});
