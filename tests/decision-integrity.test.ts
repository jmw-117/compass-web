import assert from 'node:assert/strict';
import test from 'node:test';
import bank from '../docs/domain/question_bank.json' with {type:'json'};
import {evaluate} from '../src/domain/evaluate.ts';
import {getReportGuidance} from '../src/domain/report-guidance.ts';

const profile = {current_ai_use:'team_pilot',planned_ai_use:'yes',planned_use_real_data:'no',data_category:'routine',high_impact_ai_workflow:'no',primary_goal:'efficiency',org_type:'small_sme'};
function input(level = 4) {
  return Object.fromEntries(bank.questions.map(q => [q.id,q.id + '-L' + level]));
}
const safe = {'PR-GOV-SHARE':'No'};
test('exact 77, 81 and 100 with 14 known answers name the capacity question', () => {
  for (const [count, expected] of [[1,77],[3,81],[0,100]] as const) {
    const answers = input(count ? 3 : 4);
    bank.questions.slice(0,count).forEach(q => {answers[q.id] = q.id + '-L4';});
    const r = evaluate({profile,coreAnswers:answers,probeAnswers:safe});
    assert.equal(getReportGuidance(r).scoreValue,String(expected));
    assert.equal(r.score.coverageUnits,200);
    assert.equal(r.deliveryCapacity,'Unconfirmed');
    assert.match(getReportGuidance(r).guidance,/commit|set aside time/);
    assert.equal(r.useCaseGuidance,'Eligible for controlled pilot planning');
  }
});
test('100 with critical use retains green maturity and independent hold and specialist action', () => {
  for(const role of ['decides','influences','yes']) {
    const r = evaluate({profile:{...profile,high_impact_ai_workflow:role},coreAnswers:input(),probeAnswers:safe});
    assert.equal(getReportGuidance(r).scoreValue,'100');
    assert.equal(getReportGuidance(r).signal.color,'green');
    assert.equal(r.useCaseGuidance,'Hold');
    assert.match(getReportGuidance(r).title,/Specialist Review/);
  }
});
test('confirmed disclosure takes precedence over unknown classification and unrelated negative evidence', () => {
  for(const category of ['unknown','restricted','personal']) {
    const r=evaluate({profile:{...profile,data_category:category,planned_use_real_data:'yes'},coreAnswers:input(),probeAnswers:{'PR-GOV-SHARE':'Yes','PR-GOV-PLANNED':'Yes'}});
    assert.equal(r.score.lowerEighths,800);
    assert.equal(r.useCaseGuidance,'Hold');
    assert.match(r.concerns.join(' '),/entered without safeguards/);
  }
  const planned=evaluate({profile:{...profile,data_category:'restricted',planned_use_real_data:'yes'},coreAnswers:input(),probeAnswers:{...safe,'PR-GOV-PLANNED':'No'}});
  assert.equal(planned.useCaseGuidance,'Hold');
  assert.equal(planned.score.lowerEighths,800);
  assert.match(planned.concerns.join(' '),/Restricted data is planned/);
  assert.doesNotMatch(planned.concerns.join(' '),/was entered without/);
});
test('active skipped probes remain unresolved, edits exclude inactive disclosures', () => {
  const base={profile,coreAnswers:input()};
  for(const response of ['', 'Not sure', 'invalid']) {
    const r=evaluate({...base,probeAnswers:{'PR-GOV-SHARE':response}});
    assert.equal(r.score.lowerEighths,800);
    assert.equal(r.useCaseGuidance,'Review required');
    assert.match(r.concerns.join(' '),/Confirm whether/);
    assert.ok(!r.formalGates.some(g=>g.id==='GOV-DATA'));
  }
  const r=evaluate({...base,profile:{...profile,current_ai_use:'none',planned_ai_use:'no'},probeAnswers:{'PR-GOV-SHARE':'Yes'}});
  assert.equal(r.useCaseGuidance,'Not assessed');
  assert.equal(r.score.lowerEighths,800);
  assert.ok(!r.probeEvidence.length);
});
test('financial baseline and capacity have independent outcomes', () => {
  const answers={...input(),'MET-01':'MET-01-L1'};
  for (const [answer,expected] of [['','Unverified'],['Not sure','Unverified'],['No','Unsupported']]) {
    const r=evaluate({profile:{...profile,staff_capacity:'none',budget_band:'none'},coreAnswers:answers,probeAnswers:{...safe,'PR-MET-START':answer!}});
    assert.equal(r.score.lowerEighths,770);
    assert.equal(r.financialEvidence,expected);
    assert.equal(r.deliveryCapacity,'Unavailable');
    assert.equal(r.useCaseGuidance,'Eligible for controlled pilot planning');
    assert.doesNotMatch(getReportGuidance(r).title,/Verify The Unknowns/);
  }
});
test('sole proprietor can accept responsibility and poor records are named', () => {
  const r=evaluate({profile:{...profile,org_type:'sole_proprietor'},coreAnswers:{...input(),'STR-02':'STR-02-L0','DAT-01':'DAT-01-L0'},probeAnswers:{...safe,'PR-STR-OWNER':'Owner or founder'}});
  assert.equal(r.score.lowerEighths,680);
  assert.ok(!r.formalGates.some(g=>g.id==='OWN-NONE'||g.id==='DATA-UNKNOWN'));
  assert.match(r.concerns.join(' '),/unreliable records/);
});
