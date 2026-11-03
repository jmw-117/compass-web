import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const preview=process.argv.includes('--dist');
const directory=path.join(root,preview?'dist':'public');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
const port=Number(process.env.PORT||4173);
const server=createServer(async (req,res)=>{
 try{
  const requested=new URL(req.url||'/',`http://localhost:${port}`).pathname;
  let clean=decodeURIComponent(requested).replace(/^\/silverspark-compass\/?/,'/');
  if(clean==='/')clean='/index.html';
  const special=!preview&&clean==='/data/question_bank.json';
  const target=special?path.join(root,'docs/domain/question_bank.json'):path.resolve(directory,'.'+clean);
  if(!special&&!target.startsWith(directory+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  const info=await stat(target);if(!info.isFile())throw Error('Not a file');
  const data=await readFile(target);
  res.writeHead(200,{'content-type':types[path.extname(target)]||'application/octet-stream','cache-control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Compass ${preview?'build preview':'pilot development preview'}: http://localhost:${port}/ (also /silverspark-compass/)`));
