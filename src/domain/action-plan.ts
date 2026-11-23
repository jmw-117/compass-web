import {getBusinessGoal} from './business-goals.ts';
import {industryExamples} from './market.ts';
import {catalogActions} from './recommendations.ts';

const steps: Record<string,[string,string]> = {
 A00:['Ask the person who performs the task to show a recent example.','Reduce uncertainty before choosing a change.'],
 A01:['Trace a recent record from creation to correction.','Locate where errors enter the workflow.'],
 A02:['Write down the decision, its owner and the result you want.','Agree the outcome before selecting tools.'],
 A03:['Follow one case from start to finish and mark each handover.','Expose a repeated delay or unnecessary step.'],
 A04:['Compare duplicate records and agree which copy takes precedence.','Prevent decisions based on conflicting versions.'],
 A05:['Check a sample against original documents and record corrections.','Establish whether records can support the proposed use.'],
 A06:['Count time, volume or errors for one typical cycle.','Establish a starting point for comparison.'],
 A07:['List information that may enter the tool and who may approve exceptions.','Prevent uncontrolled disclosure.'],
 A08:['Review access with the person responsible for the records.','Limit access to people who need it.'],
 A09:['Pause the affected use and establish what information was entered.','Contain a reported disclosure.'],
 A10:['Name a reviewer who may stop the decision.','Keep a person accountable for consequential outcomes.'],
 A11:['Try a task with fictional data and compare the answer with a trusted source.','Build practical checking skills.'],
 A12:['Choose a person who can demonstrate the change and answer questions.','Give people a reliable point of contact.'],
 A13:['Write a checklist for comparing output with a trusted source.','Catch errors before action is taken.'],
 A14:['Follow one record across the existing tools and mark each re-entry.','Find duplicated effort.'],
 A15:['Agree names and formats for the most frequently copied fields.','Reduce handover errors.'],
 A16:['Test a transfer on sample records and compare both copies.','Check that automation preserves accuracy.'],
 A17:['State a low-risk hypothesis, its measure and a stopping condition.','Keep the pilot bounded.'],
 A18:['Collect non-sensitive examples with known answers and appoint a reviewer.','Establish a fair test of accuracy.'],
 A19:['Review results, exceptions and resource needs with the owner.','Make an informed continuation decision.'],
 A20:['Ask a qualified specialist to review the use, safeguards and escalation steps.','Address consequential risk before piloting.'],
 A21:['Record who may approve, override and investigate a decision.','Provide a clear escalation route.'],
 A22:['Retrieve a recent record using ordinary permissions.','Verify practical access before planning work.'],
 A23:['List the intended personal information and review the proposed handling with an adviser.','Identify privacy questions needing specialist review.'],
};
export function buildActionPlan(ids:string[],profile:Record<string,unknown>) {
  const example = industryExamples[String(profile.industry)] ?? 'a recent case';
  const goal = getBusinessGoal(profile.primary_goal);
  const workflow = String(profile.value_stream ?? '').replaceAll('_', ' ');
  const bottleneck = String(profile.workflow_bottleneck ?? '').replaceAll('_', ' ');
  const details = [workflow, bottleneck].filter(value => value && !['unknown','other'].includes(value));
  const context = 'Use ' + example + ' as an example' + (details.length ? ' (' + details.join(', ') + ')' : '') + '.';
  return ids.map(id=>{
    const action=catalogActions.get(id)!;
    const [step,outcome]=steps[id]!;
    const category = ['A20','A23'].includes(id)?'Specialist review':id==='A11'?'Training and enablement':id==='A16'?'Integration or implementation':
      action.cost_class==='C0'?'No external cash':action.cost_class==='C1'?'Low-cost or no-code':'Software or implementation support';
    const verifyImpact: Record<string,string> = {
      A03:'Count handovers and time spent waiting per completed case.',
      A04:'Count conflicting versions in the next sample of records.',
      A05:'Record the share of sampled records that agree with their source.',
      A09:'Document the affected records and verify that the unsafe route is closed.',
      A10:'Check whether the reviewer can stop or reverse a sample decision.',
      A13:'Record how many errors the checklist catches before release.',
      A14:'Count entries made more than once per completed case.',
      A16:'Compare corrections per transfer with the previous manual process.',
      A20:'Record the specialist’s decision, unresolved conditions and who owns each condition.',
    };
    const outcomeMeasure = verifyImpact[id];
    return {id,title:action.title,step,outcome:outcomeMeasure ? outcome + ' ' + outcomeMeasure : outcome,
      context: context + (goal ? ' ' + goal.measure : ''),
      owner:profile.org_type==='sole_proprietor'?'Business owner':action.owner_role,
      effort:action.effort.toLowerCase(),category,validation:action.validation,dependencies:action.prerequisite_ids};
  });
}
