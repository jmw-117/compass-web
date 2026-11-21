
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const {setTimeout:pause}=require('node:timers/promises');

async function until(action,message) {
  let last;
  const deadline=Date.now()+8500;
  do {
    try { const value=await action(); if(value) return value; } catch(error) { last=error; }
    await pause(100);
  } while(Date.now()<deadline);
  throw Error(message,{cause:last});
}

async function run() {
  const basePath = process.env.COMPASS_BASE_PATH || '/silverspark-compass/';
  const externalUrl = process.env.COMPASS_SMOKE_URL;
  const app = new URL(externalUrl || 'http://127.0.0.1:4187' + basePath);
  const preview = externalUrl ? null : spawn(process.execPath,
    ['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4187','--strictPort'],
    {stdio:'ignore',windowsHide:true});
  const profile=await fs.mkdtemp(path.join(os.tmpdir(),'compass-chrome-'));
  const browser = process.env.COMPASS_CHROME || (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'google-chrome');
  const child=spawn(browser,
    ['--headless',...(process.platform === 'linux' ? ['--no-sandbox'] : []),'--disable-background-networking','--disable-component-update','--no-first-run',
      '--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let messages='';
  child.on('error',error=>{messages+=error.message;});
  child.stderr.on('data',chunk=>{ if(messages.length<2000) messages+=chunk; });
  let socket;
  try {
    const port=await until(async()=>Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]),'Chrome headless startup failed');
    const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();
    const page=targets.find(target=>target.type==='page');
    socket=new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
    const pending=new Map();
    const errors=[];
    const destinations=new Set();
    let id=0;
    socket.addEventListener('message',({data})=>{
      const message=JSON.parse(data);
      if(message.id) {
        const resolver=pending.get(message.id);
        pending.delete(message.id);
        if(message.error) resolver?.reject(Error(message.error.message)); else resolver?.resolve(message.result);
      }
      if(message.method==='Runtime.exceptionThrown') {
        const details = message.params.exceptionDetails;
        errors.push(details.exception?.description ?? details.text);
      }
      if(message.method==='Network.requestWillBeSent') destinations.add(message.params.request.url);
    });
    const call=(method,params={})=>new Promise((resolve,reject)=>{
      const key=++id;
      pending.set(key,{resolve,reject});
      socket.send(JSON.stringify({id:key,method,params}));
    });
    const js=async(expression)=>{
      const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
      if(result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);
      return result.result.value;
    };
    await call('Page.enable');
    await call('Runtime.enable');
    await call('Network.enable');
    await call('Emulation.setDeviceMetricsOverride',{width:320,height:780,deviceScaleFactor:1,mobile:true});
    await until(async () => (await fetch(app)).ok, 'The Compass test URL did not return HTTP 200');
    await call('Page.navigate',{url:app.href});
    const click=async(selector)=>until(()=>js('(()=>{ const el=document.querySelector('+JSON.stringify(selector)+'); if (!el || el.disabled) return false; el.click(); return true; })()'),'Missing enabled '+selector);
    await until(() => js("document.readyState === 'complete'"), 'The static page did not finish loading');
    await click('#take-assessment');
    try {
      await until(()=>js("document.querySelectorAll('.profile-form select').length === 3"),'Profile not rendered');
    } catch (error) {
      console.error('Page status:', await js("document.body.innerText.slice(0, 500)"), errors);
      throw error;
    }
    await js(`Array.from(document.querySelectorAll('.profile-form select')).forEach(select=>{select.selectedIndex=1; select.dispatchEvent(new Event('change',{bubbles:true}));}); true`);
    await click('.profile-form button[type="submit"]');
    const answer = async () => {
      await until(()=>js("document.querySelector('fieldset input[type=radio]') !== null"),'Question not rendered');
      await js("Array.from(document.querySelectorAll('fieldset input[type=radio]')).at(-1).click()");
      await click('.assessment-panel .button-row .button-primary');
    };
    for(let i=0;i<5;i++) await answer();
    await until(()=>js("document.body.innerText.includes('Your quick preview')"),'Quick preview step missing');
    await click('.assessment-panel .button-row .button-primary');
    for(let i=0;i<9;i++) await answer();
    await until(()=>js("document.querySelectorAll('.safety-context-form select').length===5"),'Safety context form missing');
    await js(`(()=>{const values=['team_pilot','restricted','yes','yes','yes']; Array.from(document.querySelectorAll('.safety-context-form select')).forEach((select,i)=>{select.value=values[i]; select.dispatchEvent(new Event('change',{bubbles:true}));}); return true;})()`);
    await until(()=>js(`(()=>{const button=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('See readiness snapshot')); if(!button||button.disabled) return false; button.click(); return true;})()`),'Results unavailable');
    await until(()=>js("document.body.innerText.includes('readiness snapshot') || document.body.innerText.includes('Readiness Snapshot')"),'Results not rendered');
    assert.equal(await js("/specialist review/i.test(document.body.innerText)"),true);
    assert.equal(await js("document.documentElement.scrollWidth<=window.innerWidth"),true);
    await until(()=>js(`(()=>{const button=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('View report preview')); if(!button) return false; button.click(); return true;})()`),'Report control missing');
    await until(()=>js("document.querySelector('.report-module') !== null"),'Report did not render');
    assert.equal(await js("document.querySelector('#compass-share-preview').hidden"),true);
    await js(`window.open=(url)=>{window.testShareDestination=url;}; window.print=()=>{window.testPrintRequested=document.querySelectorAll('.report-section:not([open])').length===0;}; true`);
    await click('[aria-controls="compass-share-preview"]');
    await until(()=>js("!document.querySelector('#compass-share-preview').hidden"),'Message preview did not open');
    assert.equal(await js('window.testShareDestination===undefined'),true);
    await click('#compass-share-preview button.button-primary');
    const share=await js('window.testShareDestination');
    assert.equal(new URL(share).origin,'https://wa.me');
    assert.equal(new URL(share).pathname,'/254762057288');
    assert.equal(new URL(share).searchParams.get('text'),await js("document.querySelector('#compass-share-text').value"));
    await click('.report-actions button.button-secondary');
    assert.equal(await until(()=>js('window.testPrintRequested===true'),'Print report sections did not expand'),true);
    await call('Emulation.setEmulatedMedia',{media:'print'});
    const pdf=await call('Page.printToPDF',{paperWidth:8.27,paperHeight:11.69,printBackground:true});
    const bytes=Buffer.from(pdf.data,'base64');
    assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
    assert.ok(bytes.length>3000);
    assert.equal(errors.length,0,errors.join('\n'));
    assert.deepEqual([...destinations].filter(url=>new URL(url).origin!==app.origin),[]);
    console.log('PASS Chrome 320px: 14 answers, preview, specialist review, report, exact WhatsApp preview/destination, and rendered PDF ('+bytes.length+' bytes). No external requests.');
  } catch(error) { if(messages) console.error(messages.split('\n').slice(0,5).join('\n')); throw error; }
  finally { socket?.close(); child.kill(); preview?.kill(); }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
