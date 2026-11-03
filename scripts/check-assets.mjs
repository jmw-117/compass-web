import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const assets=path.join(dist,'assets');
const html=await readFile(path.join(dist,'index.html'),'utf8');
const base='/silverspark-compass/';

for(const attribute of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const url=attribute[1];
  if(url.startsWith('/')&&!url.startsWith(base))throw Error(`Asset URL is outside the GitHub Pages project base: ${url}`);
  if(url.startsWith(base)){
    const file=path.join(dist,url.slice(base.length));
    const info=await stat(file);
    if(!info.isFile()||info.size===0)throw Error(`Missing or empty built asset: ${file}`);
  }
}

if(!html.includes('This page remains readable without JavaScript'))throw Error('Static HTML fallback is missing.');
if(!html.includes('The questionnaire, scoring, recommendations'))throw Error('Landing shell must disclose unfinished assessment features.');
const bundleNames=await readdir(assets);
const javascript=bundleNames.filter(name=>name.endsWith('.js'));
if(javascript.length<2)throw Error('Expected a separate, code-split report placeholder chunk.');
if(bundleNames.some(name=>name==='app.js'||name==='style.css'))throw Error('Legacy S0 pilot assets must not be copied into the S2 app build.');

const entryScript=html.match(/<script[^>]+src="([^"]+\.js)"/);
if(!entryScript)throw Error('Built application entry script is missing.');
const entryPath=path.join(dist,entryScript[1].slice(base.length));
const entrySource=await readFile(entryPath);
const entryGzipBytes=gzipSync(entrySource).byteLength;
if(entryGzipBytes>90*1024)throw Error(`Initial JavaScript exceeds the proposed 90 KiB gzip budget: ${entryGzipBytes} bytes.`);

const reportChunk=await Promise.all(javascript.map(async name=>({
  name,
  source:await readFile(path.join(assets,name),'utf8'),
}))).then(chunks=>chunks.find(chunk=>chunk.source.includes('appendix-answers-and-provenance')));
if(!reportChunk)throw Error('Code-split report component is missing.');

console.log(`PASS: Static app uses ${base}; fallback and nonempty assets resolve; report component is code-split; entry JS gzip is ${(entryGzipBytes/1024).toFixed(2)} KiB / 90 KiB.`);
