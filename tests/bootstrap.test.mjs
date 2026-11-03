import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('pilot question bank contains 14 stable questions and seven dimensions',async()=>{const j=JSON.parse(await readFile('docs/domain/question_bank.json','utf8'));assert.equal(j.questions.length,14);assert.equal(j.dimensions.length,7);assert.equal(new Set(j.questions.map(q=>q.id)).size,14);});
test('preview explicitly disclaims scoring and backend submission',async()=>{const html=await readFile('public/index.html','utf8');assert.match(html,/not a validated assessment/i);assert.match(html,/does not generate a readiness score/i);assert.match(html,/does not.*submit/i);});
test('assets use relative URLs for GitHub Pages subpath hosting',async()=>{const html=await readFile('public/index.html','utf8');assert.match(html,/\.\/assets\/style\.css/);assert.match(html,/\.\/assets\/app\.js/);});
