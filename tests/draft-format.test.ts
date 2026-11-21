import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeDraft,decodeDraft,draftLifetime} from '../src/assessment/draft-format.ts';
const fields={profile:{industry:'retail'},answers:{'STR-01':'STR-01-L2'}};
test('saved data round-trips until its exact expiry and invalid records fail closed',()=>{
 const raw=encodeDraft(fields,500);
 assert.deepEqual(decodeDraft(raw,501).fields.answers,fields.answers);
 for(const invalid of ['oops','[]','{}',JSON.stringify({...fields,draftVersion:3})])assert.throws(()=>decodeDraft(invalid));
 assert.throws(()=>decodeDraft(raw,500+draftLifetime));
 assert.throws(()=>decodeDraft(raw,499));
});
test('old semantic versions preserve profile while requiring fresh core and probe answers',()=>{
 const r=decodeDraft(JSON.stringify({...fields,probeAnswers:{'PR-GOV-SHARE':'No'}}));
 assert.equal(r.migrated,true);assert.deepEqual(r.fields.profile,fields.profile);
 assert.deepEqual(r.fields.answers,{});assert.deepEqual(r.fields.probeAnswers,{});
});
