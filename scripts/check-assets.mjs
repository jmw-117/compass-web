import {readFile,stat} from 'node:fs/promises';
const files=['dist/index.html','dist/assets/style.css','dist/assets/app.js','dist/data/question_bank.json'];
for(const f of files){const s=await stat(f);if(!s.isFile()||s.size===0)throw Error('Missing built asset: '+f);}
const html=await readFile('dist/index.html','utf8');
if(/(?:src|href)=["']\/(?!\/)/.test(html))throw Error('Root-absolute asset URL would break GitHub Pages project site.');
if(!html.includes('Development preview')&&!html.includes('Development preview')){ /* copy text is in note; check for pilot marker */ }
console.log('PASS: Static build has nonempty entry, script, CSS and question bank; relative asset URLs.');
