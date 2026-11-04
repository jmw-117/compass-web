import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'docs/domain');
const filenames=['question_bank.json','technical_extension.json','action_catalog.json','decision_predicates.json','report_contract.json','rules.json','golden_cases.json','user_journeys.json','product_requirements.json','probes.json','profile_schema.json','VERSION_MANIFEST.json'];
const documents={};
for(const name of filenames)documents[name]=JSON.parse(await readFile(path.join(dir,name),'utf8'));
const qb=documents['question_bank.json'];
if(qb.questions?.length!==14||qb.dimensions?.length!==7)throw Error('Core assessment contract failed (14 questions / 7 dimensions).');
const questionIds=new Set(qb.questions.map(q=>q.id));if(questionIds.size!==14)throw Error('Duplicate question IDs');
const dimensionIds=new Set(qb.dimensions.map(d=>d.id));
if(qb.dimensions.reduce((sum,d)=>sum+d.weight_pct,0)!==100)throw Error('Dimension weights must total 100.');
for(const d of qb.dimensions){if(qb.questions.filter(q=>q.dimension===d.id).length!==2)throw Error('Each dimension must have two core indicators: '+d.id);}
for(const q of qb.questions){
  if(q.options?.length!==6||q.options.some(o=>!o.id||o.label===undefined))throw Error('Question options invalid: '+q.id);
  if(q.options.map(o=>o.score).join(',')!=='0,1,2,3,4,')throw Error('Core score options must be 0..4 and unknown: '+q.id);
}
const probeIds=new Set(documents['probes.json'].rules.map(p=>p.id));
const actionIds=new Set(documents['action_catalog.json'].actions.map(a=>a.id));
const predicateIds=new Set(Object.keys(documents['decision_predicates.json'].predicates));
const gateIds=new Set(documents['rules.json'].gates.map(g=>g.id));
const manifest=documents['VERSION_MANIFEST.json'];
if(documents['rules.json'].version!==manifest.gates_version||documents['decision_predicates.json'].version!==manifest.gates_version)throw Error('Rules, predicate and manifest gate versions must match.');
if(documents['report_contract.json'].version!==manifest.report_version)throw Error('Report contract and manifest report versions must match.');
const containsBudgetReference=value=>typeof value==='string'?/budget/i.test(value):Array.isArray(value)?value.some(containsBudgetReference):value&&typeof value==='object'?Object.values(value).some(containsBudgetReference):false;
if(documents['rules.json'].gates.some(g=>g.id.includes('BUDGET')||containsBudgetReference(documents['decision_predicates.json'].predicates[g.predicate_ast_id])))throw Error('Budget must not influence a formal gate.');
if(!documents['rules.json'].budget.effect_scope?.includes('never changes readiness scores')||!documents['rules.json'].budget.effect_scope.includes('formal gates'))throw Error('Budget non-effect policy is missing.');
const profile=documents['profile_schema.json'];
const profileIds=new Set([...profile.early_fields,...profile.later_fields].map(f=>f.id));
const knownMetrics=new Set(['unknownCount','coverageUnits','pilotBlockingGateCount']);
for(const gate of documents['rules.json'].gates)if(!predicateIds.has(gate.predicate_ast_id))throw Error('Missing gate predicate: '+gate.predicate_ast_id);
for(const gate of documents['rules.json'].gate_precedence)if(!gateIds.has(gate))throw Error('Unknown gate in precedence: '+gate);
for(const pathId of documents['rules.json'].path_priority)if(!predicateIds.has('P-'+pathId))throw Error('Missing path predicate: P-'+pathId);
const astText=JSON.stringify(documents['decision_predicates.json'].predicates);
for(const [,id] of astText.matchAll(/answer\.([A-Z]+-\d+)/g))if(!questionIds.has(id))throw Error('Predicate references unknown answer: '+id);
for(const [,id] of astText.matchAll(/probe\.([A-Z]+-[A-Z]+-[A-Z]+)/g))if(!probeIds.has(id))throw Error('Predicate references unknown probe: '+id);
for(const [,id] of astText.matchAll(/profile\.([a-z_]+)/g))if(!profileIds.has(id))throw Error('Predicate references unknown profile field: '+id);
for(const [,id] of astText.matchAll(/dimension\.([A-Z]+)\.(?:lower|upper)/g))if(!dimensionIds.has(id))throw Error('Predicate references unknown dimension: '+id);
for(const [,id] of astText.matchAll(/gate\.([A-Z-]+)/g))if(!gateIds.has(id))throw Error('Predicate references unknown gate: '+id);
for(const [,id] of astText.matchAll(/metrics\.([A-Za-z]+)/g))if(!knownMetrics.has(id))throw Error('Predicate references unknown metric: '+id);
const actionById=new Map(documents['action_catalog.json'].actions.map(a=>[a.id,a]));
for(const action of actionById.values()){
  for(const prerequisite of action.prerequisite_ids||[])if(!actionIds.has(prerequisite))throw Error('Unknown action prerequisite: '+action.id+' -> '+prerequisite);
  for(const source of action.evidence_question_ids||[])if(!questionIds.has(source)&&!probeIds.has(source))throw Error('Unknown action evidence source: '+action.id+' -> '+source);
}
const visiting=new Set(),visited=new Set();
function visitAction(id){
  if(visiting.has(id))throw Error('Action prerequisite cycle at '+id);
  if(visited.has(id))return;
  visiting.add(id);
  for(const prerequisite of actionById.get(id).prerequisite_ids||[])visitAction(prerequisite);
  visiting.delete(id);visited.add(id);
}
for(const id of actionIds)visitAction(id);
const extension=documents['technical_extension.json'];
const extensionIds=new Set(extension.questions.map(q=>q.id));
if(extensionIds.size!==18||extension.modules.length!==9)throw Error('Technical extension must contain 18 unique questions in 9 modules.');
for(const question of extension.questions){
  if(question.score_role!=='DIAGNOSTIC_ONLY')throw Error('Technical questions must remain diagnostic-only: '+question.id);
  if(!extension.module_conditions[question.applies_when])throw Error('Unknown technical question condition: '+question.id);
}
for(const module of extension.modules)for(const id of module.question_ids){
  if(!extension.questions.some(q=>q.id===id&&q.module===module.id))throw Error('Technical module question mismatch: '+module.id+' -> '+id);
}
const generatedFlags=new Set(Object.values(extension.flag_generation).flatMap(mapping=>Object.values(mapping)));
for(const [flag,ids] of Object.entries(extension.flag_to_existing_action_ids)){
  if(!generatedFlags.has('flag.'+flag))throw Error('Action mapping references an unknown technical flag: '+flag);
  for(const id of ids)if(!actionIds.has(id))throw Error('Technical flag maps to unknown action: '+flag+' -> '+id);
}
const unmappedFlags=[...generatedFlags].filter(flag=>!extension.flag_to_existing_action_ids[flag.replace(/^flag\./,'')]);
for(const fixture of documents['golden_cases.json'].cases){
  for(const [questionId,optionId] of Object.entries(fixture.answers||{})){
    const question=qb.questions.find(q=>q.id===questionId);
    if(!question)throw Error('Golden case references unknown question: '+fixture.id+' -> '+questionId);
    if(!question.options.some(option=>option.id===optionId))throw Error('Golden case references unknown option: '+fixture.id+' -> '+optionId);
  }
}
const budgetFixture=documents['golden_cases.json'].cases.find(f=>f.id==='F01');
if(!budgetFixture?.expected?.budget_must_not_change_score||!budgetFixture.expected?.budget_must_not_change_gates||!budgetFixture.expected?.budget_must_not_change_confidence)throw Error('F01 must assert budget independence for score, gates, and confidence.');
console.log(`PASS: ${filenames.length} contracts parse; core IDs, scoring shape, predicates, gates, action DAG, technical mappings, golden references and budget invariants resolve.`);
if(unmappedFlags.length)console.log(`NOTE: ${unmappedFlags.length} technical diagnostic flags have no action mapping and remain consultant-review findings: ${unmappedFlags.join(', ')}.`);
console.log('NOTE: Golden cases remain proposed and require independent human review before implementation.');
console.log('NOTE: Run python scripts/validate_kit.py and python scripts/validate_product_v13.py for the extended audits.');
