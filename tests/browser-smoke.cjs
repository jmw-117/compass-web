
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const {setTimeout:pause}=require('node:timers/promises');

async function until(action,message,timeout=8500) {
  let last;
  const deadline=Date.now()+timeout;
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
    const page=await until(async()=>{
      if(child.exitCode!==null || child.signalCode!==null) {
        throw Error('Chrome exited before opening a page');
      }
      const [port]=(await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n');
      const response=await fetch('http://127.0.0.1:'+port+'/json/list',{signal:AbortSignal.timeout(1500)});
      return (await response.json()).find(target=>target.type==='page');
    },'Chrome headless startup failed',30000);
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
    await until(async()=> (await fetch(app,{signal:AbortSignal.timeout(4000),cache:'no-store'})).ok,
      'The Compass test URL did not return HTTP 200',externalUrl ? 45000 : 15000);
    await call('Page.navigate',{url:app.href});
    const click=async(selector)=>until(()=>js('(()=>{ const el=document.querySelector('+JSON.stringify(selector)+'); if (!el || el.disabled) return false; el.click(); return true; })()'),'Missing enabled '+selector);
    await until(() => js("document.readyState === 'complete'"), 'The static page did not finish loading');
    const noHorizontalOverflow=()=>js("document.documentElement.scrollWidth<=document.documentElement.clientWidth");
    const checkTextContrast=async(selector,backgroundSelector)=>{
      const ratio=await js(`(()=>{
        const element=document.querySelector(${JSON.stringify(selector)});
        const background=document.querySelector(${JSON.stringify(backgroundSelector)});
        if(!element || !background) throw Error('Missing text contrast test element');
        const luminance=color=>{
          const channels=color.match(/[\\d.]+/g).slice(0,3).map(value=>{
            const channel=Number(value)/255;
            return channel<=0.04045 ? channel/12.92 : ((channel+0.055)/1.055)**2.4;
          });
          return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;
        };
        const foreground=luminance(getComputedStyle(element).color);
        const surface=luminance(getComputedStyle(background).backgroundColor);
        return (Math.max(foreground,surface)+0.05)/(Math.min(foreground,surface)+0.05);
      })()`);
      assert.ok(ratio>=4.5,selector+' contrast '+ratio.toFixed(2)+':1');
    };
    assert.equal(await noHorizontalOverflow(),true,'Landing page overflows at 320px');
    await click('#take-assessment');
    try {
      await until(()=>js("document.querySelectorAll('.profile-form select').length === 3"),'Profile not rendered');
    } catch (error) {
      console.error('Page status:', await js("document.body.innerText.slice(0, 500)"), errors);
      throw error;
    }
    await until(()=>js("document.activeElement.id==='assessment-title'"),'Profile heading did not receive focus');
    assert.equal(await js("Array.from(document.querySelectorAll('.profile-form select')).every(el=>el.labels.length&&parseFloat(getComputedStyle(el).fontSize)>=16)"),true);
    await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    assert.equal(await js("document.activeElement.id"),'profile-organisation');
    await js(`Array.from(document.querySelectorAll('.profile-form select')).forEach(select=>{select.selectedIndex=1; select.dispatchEvent(new Event('change',{bubbles:true}));}); true`);
    await click('.profile-form button[type="submit"]');
    const {questions}=JSON.parse(await fs.readFile('docs/domain/question_bank.json','utf8'));
    const answer=async(index)=>{
      const {prompt,options}=questions[index];
      await until(()=>js("document.activeElement.id==='question-panel-title' && document.activeElement.textContent==="+JSON.stringify(prompt)),
        'Question '+(index+1)+' was not shown and focused');
      assert.equal(await js("document.querySelector('.progress-bar').getAttribute('aria-valuenow')"),String(index+1));
      assert.equal(await noHorizontalOverflow(),true,'Question '+(index+1)+' overflows at 320px');
      assert.equal(await js("Array.from(document.querySelectorAll('.option-card span')).map(el=>el.textContent).join('|')"),options.map(option=>option.label).join('|'));
      if(index===0) {
        assert.equal(await js("document.querySelector('.question-panel .button-primary').disabled"),true);
        assert.equal(await js("parseFloat(getComputedStyle(document.querySelector('#question-panel-title')).fontSize)>=22"),true);
        assert.equal(await js("parseFloat(getComputedStyle(document.querySelector('.option-card span')).fontSize)>=18"),true);
        await checkTextContrast('.option-card span','.option-card');
      }
      const option=index===0?options.at(-1):options[2];
      await click('input[id="'+option.id+'"]');
      await click('.question-panel .button-primary');
    };
    for(let i=0;i<5;i++) await answer(i);
    await until(()=>js("document.activeElement.id==='preview-summary-title'"),'Quick preview step missing focus');
    assert.equal(await js("document.querySelector('.panel-header').innerText.includes('1 of the first five answers needs confirmation')"),true);
    await click('.assessment-panel .button-row .button-primary');
    for(let i=5;i<questions.length;i++) await answer(i);
    await until(()=>js("document.querySelectorAll('.safety-context-form select').length===5"),'Safety context form missing');
    assert.equal(await js("document.querySelector('[aria-controls=report-module-panel]')===null"),true);
    const lastContext=await js("Array.from(document.querySelectorAll('.compass-context details summary')).map(el=>el.textContent)");
    assert.ok(lastContext.some(label=>label.includes('Business workflow')));
    await checkTextContrast('.compass-context summary','.assessment-panel');
    await checkTextContrast('.compass-context summary small','.assessment-panel');
    assert.equal(await js("document.querySelector('.compass-context summary').getBoundingClientRect().height>=48"),true);
    await click('.answer-review summary');
    await click('[aria-label="Edit question 6"]');
    await until(()=>js("document.activeElement.id==='question-panel-title' && document.activeElement.textContent==="+JSON.stringify(questions[5].prompt)),
      'Editing answer did not return to question 6');
    await click('input[id="'+questions[5].options[3].id+'"]');
    await click('.question-panel .button-primary');
    await until(()=>js("document.activeElement.id==='review-title'"),'Edited answer did not return to review');
    assert.equal(await js("document.querySelector('.answer-review li:nth-child(6) p').textContent"),questions[5].options[3].label);
    assert.equal(await js("document.querySelector('.assessment-panel .button-row .button-primary').disabled"),true);
    await js(`(()=>{const values=['team_pilot','restricted','yes','yes','yes']; Array.from(document.querySelectorAll('.safety-context-form select')).forEach((select,i)=>{select.value=values[i]; select.dispatchEvent(new Event('change',{bubbles:true}));}); return true;})()`);
    await until(()=>js(`(()=>{const button=Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('See readiness snapshot')); if(!button||button.disabled) return false; button.click(); return true;})()`),'Results unavailable');
    await until(()=>js("document.body.innerText.includes('readiness snapshot') || document.body.innerText.includes('Readiness Snapshot')"),'Results not rendered');
    assert.equal(await js("/specialist review/i.test(document.body.innerText)"),true);
    assert.equal(await noHorizontalOverflow(),true,'Results overflow at 320px');
    assert.equal(await js("document.querySelector('.readiness-signal').classList.contains('readiness-signal--amber')"),true);
    await checkTextContrast('.readiness-signal__copy .eyebrow','.readiness-signal');
    await checkTextContrast('.readiness-signal__copy p:nth-of-type(2)','.readiness-signal');
    await checkTextContrast('#practical-next-step-title','.pragmatic-recommendation[aria-labelledby=practical-next-step-title]');
    assert.equal(await js("document.querySelector('[aria-labelledby=practical-next-step-title]').innerText.includes('Start here.')"),true);
    await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
    await js("document.documentElement.style.fontSize='200%'");
    assert.equal(await noHorizontalOverflow(),true,'Results overflow at 200% text size');
    await js("document.documentElement.style.fontSize=''");
    await call('Emulation.setDeviceMetricsOverride',{width:320,height:780,deviceScaleFactor:1,mobile:true});
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
    console.log('PASS Chrome: keyboard focus, 320px reflow, 18px answers, contract copy, edit from review, text contrast, 200% results text, specialist review, exact WhatsApp preview/destination, and PDF ('+bytes.length+' bytes). No external requests.');
  } catch(error) { if(messages) console.error(messages.split('\n').slice(0,5).join('\n')); throw error; }
  finally { socket?.close(); child.kill(); preview?.kill(); }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
