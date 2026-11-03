import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'docs/domain');
const filenames=['question_bank.json','technical_extension.json','action_catalog.json','decision_predicates.json','report_contract.json','rules.json','golden_cases.json','user_journeys.json','product_requirements.json'];
const documents={};
for(const name of filenames)documents[name]=JSON.parse(await readFile(path.join(dir,name),'utf8'));
const qb=documents['question_bank.json'];
if(qb.questions?.length!==14||qb.dimensions?.length!==7)throw Error('Core assessment contract failed (14 questions / 7 dimensions).');
const ids=new Set(qb.questions.map(q=>q.id));if(ids.size!==14)throw Error('Duplicate question IDs');
for(const q of qb.questions){if(q.options?.length!==6||q.options.some(o=>!o.id||o.label===undefined))throw Error('Question options invalid: '+q.id);}
console.log(`PASS: ${filenames.length} contract files parse; 14 unique questions and 7 dimensions.`);
console.log('NOTE: Run python scripts/validate_kit.py and python scripts/validate_product_v13.py for the extended audits.');
