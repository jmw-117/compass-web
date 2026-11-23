
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

async function run(reduceMotion = false) {
  const basePath = process.env.COMPASS_BASE_PATH || '/compass-web/';
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
    const call=(method,params={},sessionId)=>new Promise((resolve,reject)=>{
      const key=++id;
      pending.set(key,{resolve,reject});
      socket.send(JSON.stringify({id:key,method,params,sessionId}));
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
    await js(`(()=>{
      window.longButtons=[];
      window.celebrations=0;
      const scan=()=>{
        if (document.querySelector('.compass-draft-controls')) window.sawDraftControls = true;
        for(const button of document.querySelectorAll('button,a.button-primary,a.button-secondary')){
          const copy=button.cloneNode(true);
          copy.querySelectorAll('[aria-hidden=true]').forEach(node=>node.remove());
          const label=copy.textContent.trim();
          if(label.split(/\\s+/).length>2 && !window.longButtons.includes(label))window.longButtons.push(label);
        }
        const burst=document.querySelector('.completion-confetti');
        if(burst && burst!==window.lastBurst){
          window.lastBurst=burst;window.celebrations++;
          window.burstLayout={count:burst.children.length,height:burst.getBoundingClientRect().height,screen:innerHeight,hit:getComputedStyle(burst).pointerEvents};
        }
      };
      scan();
      new MutationObserver(scan).observe(document.body,{subtree:true,childList:true,characterData:true});
      return true;
    })()`);
    assert.equal(await js("document.querySelector('.landing-guide').textContent.includes('Fictional sample report')"),false,'Removed landing sample returned');
    await click('#take-assessment');
    try {
      await until(()=>js("document.querySelectorAll('.profile-form select').length === 3"),'Profile not rendered');
    } catch (error) {
      console.error('Page status:', await js("document.body.innerText.slice(0, 500)"), errors);
      throw error;
    }
    await until(()=>js("document.activeElement.id==='assessment-title'"),'Profile heading did not receive focus');
    const schema = JSON.parse(await fs.readFile('docs/domain/profile_schema.json','utf8'));
    const goals = schema.early_fields.find(field=>field.id==='primary_goal').values;
    assert.equal(await js("[...document.querySelectorAll('.profile-form select')].every(el=>el.required)"),true);
    assert.deepEqual(await js("[...document.querySelector('#profile-goal').options].slice(1).map(o=>[o.value,o.text])"),goals.map(id=>[id,schema.business_goals[id].label]));
    assert.equal(await js("Array.from(document.querySelectorAll('.profile-form select')).every(el=>el.labels.length&&parseFloat(getComputedStyle(el).fontSize)>=16)"),true);
    assert.equal(await js(`[...document.querySelectorAll('.profile-form select')].every(select=>
      getComputedStyle(select).fontWeight==='400' && getComputedStyle(select.options[0]).fontWeight==='400' &&
      Number(getComputedStyle(select.labels[0]).fontWeight)>=600)`),true,'Question labels and dropdown answers need distinct weights');
    await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    assert.equal(await js("document.activeElement.id"),'profile-organisation');
    await js(`Array.from(document.querySelectorAll('.profile-form select')).forEach(select=>{select.selectedIndex=1; select.dispatchEvent(new Event('change',{bubbles:true}));}); true`);
    await js("(()=>{const select=document.querySelector('#profile-goal');select.value='cash_flow';select.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
    await until(()=>js("document.querySelector('#goal-measure').textContent.includes('receiving payment')"),'Goal-specific measure missing');
    await click('.profile-form button[type="submit"]');
    const {questions}=JSON.parse(await fs.readFile('docs/domain/question_bank.json','utf8'));
    const answer=async(index)=>{
      const {prompt,options}=questions[index];
      await until(()=>js("document.activeElement.id==='question-panel-title' && document.activeElement.textContent==="+JSON.stringify(prompt)),
        'Question '+(index+1)+' was not shown and focused');
      assert.equal(await js("document.querySelector('.progress-bar').getAttribute('aria-valuenow')"),String(index+1));
      assert.equal(await noHorizontalOverflow(),true,'Question '+(index+1)+' overflows at 320px');
      assert.equal(await js("document.querySelector('.progress-wrap').getBoundingClientRect().top>=0"),true,
        'Question progress is above the viewport');
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
    for (const [index,value] of ['team_pilot','restricted','yes','yes','yes'].entries()) {
      await until(()=>js("document.querySelector('.question-panel .eyebrow')?.textContent.includes("+JSON.stringify((index+1)+' of 5')+")"),'Safety phase did not advance');
      assert.equal(await js("document.querySelector('.question-panel .button-primary').disabled"),true);
      await click('.question-panel input[value="'+value+'"]');
      await click('.question-panel .button-primary');
    }
    await until(()=>js("document.activeElement.id==='review-title'"),'Safety phase did not open review');
    assert.equal(await js("document.querySelector('[aria-controls=report-module-panel]')===null"),true);
    assert.equal(await js("document.querySelector('.compass-field-grid')===null"),true);
    await checkTextContrast('.answer-review summary','.assessment-panel');
    // Review edits must return directly and commit only when saved.
    const reviewButton = label => click('button[aria-label^="' + label + '"]');
    const pickGoal = async value => js(`(() => {
      const el = document.querySelector('#profile-goal');
      el.value = ${JSON.stringify(value)};
      el.dispatchEvent(new Event('change', {bubbles:true}));
    })()`);
    await click('.summary-card button');
    await until(()=>js("document.activeElement.id==='assessment-title'"),'Profile editor did not receive focus');
    await pickGoal(goals.find(id=>id!=='cash_flow'));
    await click('.profile-form .nav-back');
    await until(()=>js("document.querySelector('.summary-card')?.textContent.includes('Get paid sooner')"),'Back committed the unsaved profile');
    await click('.summary-card button');
    await pickGoal(goals.find(id=>id!=='cash_flow'));
    await click('.profile-form [type=submit]');
    await until(()=>js("document.querySelector('#review-title') && !document.querySelector('.summary-card').textContent.includes('Get paid sooner')"),'Changed profile did not return to review');
    await click('.summary-card button');
    await pickGoal('cash_flow');
    await click('.profile-form [type=submit]');
    await click('.answer-review:nth-of-type(2) summary');
    await reviewButton('Edit safety question 3');
    await until(()=>js("document.activeElement.id==='safety-question-title' && !!document.querySelector('input[value=decides]')"),'Wrong safety question opened');
    await click('.question-panel input[value="decides"]');
    await click('.question-panel .nav-back');
    await until(()=>js("document.querySelector('#review-title') && document.querySelector('.answer-review:nth-of-type(2) li:nth-child(3) p').textContent.includes('still to clarify')"),'Back committed an unsaved safety change');
    await click('.answer-review:nth-of-type(2) summary');
    await reviewButton('Edit safety question 3');
    await click('.question-panel input[value="decides"]');
    await click('.question-panel .button-primary');
    await until(()=>js("document.activeElement.id==='review-title' && document.querySelector('.answer-review:nth-of-type(2) li:nth-child(3) p').textContent.includes('approving credit')"),'Safety edit did not save directly to review');
    await click('.answer-review summary');
    await click('[aria-label="Edit Q6"]');
    await until(()=>js("document.activeElement.id==='question-panel-title' && document.activeElement.textContent==="+JSON.stringify(questions[5].prompt)),
      'Editing answer did not return to question 6');
    await click('input[id="'+questions[5].options[3].id+'"]');
    await click('.question-panel .button-primary');
    await until(()=>js("document.activeElement.id==='review-title'"),'Edited answer did not return to review');
    assert.equal(await js("document.querySelector('.answer-review li:nth-child(6) p').textContent"),questions[5].options[3].label);
    assert.equal(await js("document.querySelector('.assessment-panel .button-row .button-primary').disabled"),false);
    const pressButton=text=>until(()=>js(`(()=>{
      const button=[...document.querySelectorAll('.assessment-panel button')]
        .find(item=>item.textContent.trim()===${JSON.stringify(text)});
      if (!button || button.disabled) return false;
      button.click();
      return true;
    })()`),'Missing enabled button '+text);
    await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:reduceMotion ? 'reduce' : 'no-preference'}]});
    await pressButton('View Result');
    await until(()=>js("document.activeElement.id==='results-title'"),'Review did not lead directly to results');
    if(reduceMotion) {
      assert.equal(await js("window.matchMedia('(prefers-reduced-motion: reduce)').matches"),true);
      assert.equal(await js('window.celebrations'),0,'Reduced motion should suppress confetti');
      return;
    }
    assert.equal(await js('window.celebrations'),1,'Results should celebrate completion once');
    if (process.env.COMPASS_PDF_PROOF) {
      await fs.mkdir(process.env.COMPASS_PDF_PROOF,{recursive:true});
      const frame = await call('Page.captureScreenshot',{format:'jpeg',quality:65});
      await fs.writeFile(path.join(process.env.COMPASS_PDF_PROOF,'results-celebration.jpg'),Buffer.from(frame.data,'base64'));
    }
    const burstLayout = await js('window.burstLayout');
    assert.ok(burstLayout.count >= 60 && burstLayout.height >= burstLayout.screen * 0.8, 'Celebration should cover the screen');
    assert.equal(burstLayout.hit, 'none', 'Confetti intercepted the results controls');
    await pressButton('Back');
    await pressButton('More Details');
    await until(()=>js("document.activeElement.textContent==='Business workflow'"),'Business workflow step missing');
    await checkTextContrast('.compass-context .eyebrow','.assessment-panel');
    const toolLayout=()=>js(`(()=>{
      const grid=document.querySelector('.compass-option-grid');
      const labels=[...grid.querySelectorAll('label')];
      return {
        columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,
        count:labels.length,
        aligned:labels.every(label=>{
          const row=label.getBoundingClientRect();
          const box=label.querySelector('input').getBoundingClientRect();
          const caption=label.querySelector('span').getBoundingClientRect();
          return box.width===18 && box.height===18 && row.height>=48 &&
            box.left-row.left<16 && caption.left-box.right<16 && caption.left>box.right;
        }),
      };
    })()`);
    const fieldPairs=()=>js(`(()=>{
      const first=document.querySelector('.compass-field-grid select').getBoundingClientRect();
      const second=document.querySelectorAll('.compass-field-grid select')[1].getBoundingClientRect();
      return first.right < second.left && first.top === second.top;
    })()`);
    assert.equal(await fieldPairs(),false);
    assert.deepEqual(await toolLayout(),{columns:1,count:10,aligned:true});
    assert.equal(await noHorizontalOverflow(),true,'Tool options overflow at 320px');
    await click('.compass-option-grid label:first-child');
    assert.equal(await js("document.querySelector('.compass-option-grid input').checked"),true);
    await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
    const desktopTools=await until(async()=>{
      const layout=await toolLayout();
      return layout.columns>1 ? layout : null;
    },'Tool options did not switch to multiple columns');
    assert.equal(desktopTools.aligned,true);
    assert.equal(await fieldPairs(),true,'Business workflow fields should sit side by side');
    await pressButton('Next Section');
    await until(()=>js("document.activeElement.textContent==='Staff capacity, timing and budget'"),'Staff and budget step missing');
    assert.equal(await fieldPairs(),true,'Staff and budget fields should sit side by side');
    assert.equal(await js("document.querySelector('.budget-detail details').open"),false);
    await click('.budget-detail summary');
    assert.equal(await js(`(()=>{
      const inputs=[...document.querySelectorAll('.compass-field-grid input[type="number"]')];
      const first=inputs[0].getBoundingClientRect(), second=inputs[1].getBoundingClientRect();
      return first.right<second.left && first.top===second.top;
    })()`),true);
    await call('Emulation.setDeviceMetricsOverride',{width:320,height:780,deviceScaleFactor:1,mobile:true});
    await until(async()=>!(await fieldPairs()),'Staff and budget columns did not stack at 320px');
    await pressButton('Previous');
    await until(()=>js("document.activeElement.textContent==='Business workflow'"),'Previous did not return to business workflow');
    assert.equal(await js("document.querySelector('.compass-option-grid input').checked"),true);
    await pressButton('Next Section');
    await pressButton('Next Section');
    await until(()=>js("document.activeElement.textContent==='Evidence checks'"),'Applicable evidence step missing');
    await pressButton('Next Section');
    await until(()=>js("document.activeElement.textContent==='Technical assessment'"),'Technical assessment step missing');
    await pressButton('View Result');
    await until(()=>js("document.body.innerText.includes('readiness snapshot') || document.body.innerText.includes('Readiness Snapshot')"),'Results not rendered');
    assert.equal(await js("/specialist review/i.test(document.body.innerText)"),true);
    assert.equal(await noHorizontalOverflow(),true,'Results overflow at 320px');
    assert.equal(await js("document.querySelector('.readiness-signal').classList.contains('readiness-signal--amber')"),true);
    const activeLight=async scope=>js(`(()=>{
      const lights=document.querySelector(${JSON.stringify(scope)}+' .traffic-light');
      const active=Array.from(lights.querySelectorAll('[data-active]'));
      return {
        decorative:lights.getAttribute('aria-hidden')==='true',
        active:active.map(light=>light.classList.contains('traffic-light__bulb--amber')),
        width:active[0]?.getBoundingClientRect().width,
        ring:active[0] && getComputedStyle(active[0]).borderTopColor,
      };
    })()`);
    const resultLight=await activeLight('.assessment-panel');
    assert.equal(resultLight.decorative,true);
    assert.deepEqual(resultLight.active,[true]);
    assert.ok(resultLight.width>=32);
    assert.notEqual(resultLight.ring,'rgba(0, 0, 0, 0)');
    await checkTextContrast('.readiness-signal__copy .eyebrow','.readiness-signal');
    await checkTextContrast('.readiness-signal__copy p:nth-of-type(2)','.readiness-signal');
    await checkTextContrast('#practical-next-step-title','.pragmatic-recommendation[aria-labelledby=practical-next-step-title]');
    assert.equal(await js("document.querySelector('[aria-labelledby=practical-next-step-title]').innerText.includes('Start here.')"),true);
    await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
    assert.ok((await activeLight('.assessment-panel')).width>=32,'Desktop readiness lamp collapsed');
    await js("document.documentElement.style.fontSize='200%'");
    assert.equal(await noHorizontalOverflow(),true,'Results overflow at 200% text size');
    await js("document.documentElement.style.fontSize=''");
    await call('Emulation.setDeviceMetricsOverride',{width:320,height:780,deviceScaleFactor:1,mobile:true});
    await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
    await until(()=>js(`(()=>{
      const back=document.querySelector('.results-back').getBoundingClientRect();
      const buttons=[...document.querySelectorAll('.report-actions > *')].map(el=>el.getBoundingClientRect());
      return buttons.length===3 && buttons.every(b=>Math.abs(b.top-back.top)<2) && buttons[0].left>back.right+12;
    })()`),'Desktop navigation and report actions are misaligned');
    await call('Emulation.setDeviceMetricsOverride',{width:320,height:780,deviceScaleFactor:1,mobile:true});
    const previewLink='.report-actions a[target="_blank"]';
    await until(()=>js("Boolean(document.querySelector('.report-actions a[href]'))"),'Preview link missing');
    assert.equal(await noHorizontalOverflow(),true,'Result actions overflow at 320px');
    assert.equal(await js("document.querySelector('.report-module').getClientRects().length"),0,'Report should stay off the results page');
    assert.deepEqual(await js("[...document.querySelectorAll('.results-toolbar > .results-back, .report-actions > *')].map(el=>[el.textContent.trim(),!!el.querySelector('svg[aria-hidden=true]')])"),
      [['Back',true],['Export Report',true],['Send Report',true],['Preview Report',true]]);
    assert.equal(await js("document.querySelector('#compass-share-preview').hidden"),true);
    await js(`window.open=(url)=>{window.testShareDestination=url;}; true`);
    await click('[aria-controls="compass-share-preview"]');
    await until(()=>js("!document.querySelector('#compass-share-preview').hidden"),'Message preview did not open');
    assert.equal(await js('window.testShareDestination===undefined'),true);
    await click('#compass-share-preview button.button-primary');
    const share=await js('window.testShareDestination');
    assert.equal(new URL(share).origin,'https://wa.me');
    assert.equal(new URL(share).pathname,'/254762057288');
    assert.equal(new URL(share).searchParams.get('text'),await js("document.querySelector('#compass-share-text').value"));
    await call('Page.setDownloadBehavior',{behavior:'deny'});
    await pressButton('Export Report');
    const recovery = await until(()=>js("document.querySelector('.inline-note a[href^=blob]')?.href"),'Missing manual PDF fallback');
    assert.equal(await js("fetch("+JSON.stringify(recovery)+").then(r=>r.blob()).then(b=>b.type==='application/pdf' && b.size>3000)"),true);
    await call('Page.setDownloadBehavior',{behavior:'allow',downloadPath:profile});
    await pressButton('Export Report');
    const bytes=await until(async()=>{
      const filename=(await fs.readdir(profile)).find(name=>/^Silverspark_Compass_AI_Readiness_Report_\d{4}-\d{2}-\d{2}\.pdf$/.test(name));
      return filename && await fs.readFile(path.join(profile,filename));
    },'Export Report did not download a PDF',20000);
    assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
    assert.ok(bytes.length>3000);
    assert.ok(bytes.includes(Buffer.from('%%EOF')));
    const {PDFDocument}=await import('pdf-lib');
    const downloadedReport=await PDFDocument.load(bytes);
    assert.match(downloadedReport.getSubject(), /SELF-/);
    if(process.env.COMPASS_PDF_PROOF) {
      await fs.mkdir(process.env.COMPASS_PDF_PROOF,{recursive:true});
      await fs.writeFile(path.join(process.env.COMPASS_PDF_PROOF,'synthetic-report.pdf'),bytes);
    }
    const {PDFName}=await import('pdf-lib');
    for(const page of downloadedReport.getPages()){
      const resources=page.node.Resources();
      assert.ok(resources.lookup(PDFName.of('XObject')).keys().length,'Every report page should carry the brand mark');
    }
    assert.equal(downloadedReport.getTitle(),'Silverspark Compass Assessment Report');
    assert.ok(downloadedReport.getPageCount()>1,'Expected a paginated report');
    assert.ok(downloadedReport.getPageCount()<=3,'The synthetic report should fit its summary, actions and evidence in three pages');
    const previewUrl=await js("document.querySelector('.report-actions a').href");
    await call('Runtime.evaluate',{expression:"document.querySelector("+JSON.stringify(previewLink)+").click()",userGesture:true});
    const target=await until(async()=>(await call('Target.getTargets')).targetInfos.find(item=>item.type==='page' && item.url===previewUrl),'Report did not open in a new tab');
    const {sessionId}=await call('Target.attachToTarget',{targetId:target.targetId,flatten:true});
    const previewJs=async(expression)=>{
      const response=await call('Runtime.evaluate',{expression,returnByValue:true},sessionId);
      if(response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description??response.exceptionDetails.text);
      return response.result.value;
    };
    await call('Emulation.setDeviceMetricsOverride',{width:320,height:780,deviceScaleFactor:1,mobile:true},sessionId);
    await until(()=>previewJs("document.readyState==='complete' && document.querySelector('.report-module') && document.querySelector('.traffic-light__bulb[data-active]').getBoundingClientRect().width>=32"),'Preview content or styles missing');
    assert.equal(await previewJs("window.opener===null && !document.querySelector('.report-actions')"),true);
    assert.equal(await previewJs("document.documentElement.scrollWidth<=document.documentElement.clientWidth"),true,'Report overflows at 320px');
    assert.equal(await previewJs("document.querySelectorAll('.traffic-light__bulb--amber[data-active]').length"),1);
    assert.equal(await previewJs("document.querySelector('.report-next-step').innerText.includes('Recommended next step')"),true);
    assert.equal(await previewJs("document.querySelector('.report-safety').innerText.includes('specialist review')"),true);
    assert.equal(await previewJs("document.querySelector('.decision-summary').innerText.includes('Hold')"),true);
    assert.equal(await previewJs("document.querySelector('.report-score-value').textContent.includes('out of 100')"),true);
    assert.equal(await previewJs("document.querySelector('.report-module').textContent.includes('Get paid sooner') && document.querySelector('.report-module').textContent.includes('receiving payment')"),true,'Missing selected goal or measure in preview');
    assert.equal(await previewJs(`(()=>{
      const metadata=document.querySelector('.report-metadata');
      const appendix=metadata.closest('details');
      return !appendix.open && appendix.querySelector('summary').textContent.includes('Provenance');
    })()`),true);
    const bounds = "Array.from(document.querySelectorAll(SELECTOR), row => [row.querySelector('.area-known').style.width,row.querySelector('.area-range')?.style.left,row.querySelector('.area-range')?.style.width])";
    const resultBounds = await js(bounds.replace('SELECTOR', "'.area-chart-row'"));
    const previewBounds = await previewJs(bounds.replace('SELECTOR', "'.report-dimension-item'"));
    assert.deepEqual(previewBounds, resultBounds, 'Report must distinguish confirmed readiness from the uncertain range');
    await previewJs("document.querySelector('#report-appendix-answers-and-provenance-title').click()");
    await until(()=>previewJs("document.querySelector('.report-metadata').closest('details').open && document.querySelector('.report-metadata code').innerText.startsWith('SELF-')"),'Opening the appendix did not show the assessment reference');
    assert.equal(await previewJs("document.querySelectorAll('.report-answers dd').length"),questions.length);
    assert.equal(await previewJs("document.querySelector('.report-answers dd').textContent"),questions[0].options.at(-1).label);
    assert.equal(await previewJs("document.querySelector('.report-score').textContent.includes('13 of 14 core answers are known')"),true);
    await previewJs("document.querySelector('#report-appendix-answers-and-provenance-title').click()");
    await call('Target.closeTarget',{targetId:target.targetId});
    assert.deepEqual(await js('window.longButtons'),[],'All button labels must fit within two words');
    assert.equal(await js('window.celebrations'),1,'Revisiting Results must not replay confetti');
    for (const width of [768,1280,320]) {
      await call('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:width<1000});
      assert.equal(await noHorizontalOverflow(),true,'Results overflow at '+width);
      const aligned = await js(`(()=>{
        const steps = [...document.querySelectorAll('.wizard-steps li')].map(el=>el.getBoundingClientRect());
        return steps.length===5 && steps.every(rect=>rect.top===steps[0].top && Math.abs(rect.width-steps[0].width)<1) &&
          document.querySelector('.wizard-steps').scrollWidth <= document.querySelector('.wizard-steps').clientWidth+1;
      })()`);
      assert.equal(aligned,true,'Progress labels should share one equally spaced row at '+width+' '+await js("JSON.stringify([...document.querySelectorAll('.wizard-steps li')].map(el=>[el.offsetWidth,el.offsetTop,el.scrollWidth]))"));
      if (width === 1280 && process.env.COMPASS_PDF_PROOF) {
        const clip = await js("(()=>{const r=document.querySelector('.area-chart').getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:0.8}})()");
        const shot = await call('Page.captureScreenshot',{format:'jpeg',quality:75,clip,captureBeyondViewport:true});
        await fs.writeFile(path.join(process.env.COMPASS_PDF_PROOF,'readiness-by-area.jpg'),Buffer.from(shot.data,'base64'));
      }
      assert.equal(await js("document.querySelectorAll('.area-chart-row').length"),7);
      assert.equal(await js("document.querySelectorAll('.area-chart .area-range').length"),1,'Fixture contains one uncertain dimension');
    }
    const ax=await call('Accessibility.getFullAXTree');
    assert.ok(ax.nodes.some(n=>n.role?.value==='heading' && /readiness/i.test(n.name?.value)),'Missing accessible results heading');
    assert.equal(await js("Boolean(window.sawDraftControls)"),false,'Draft controls appeared in the journey');
    assert.ok(await js("document.querySelector('.results-toolbar').compareDocumentPosition(document.querySelector('.area-chart')) & Node.DOCUMENT_POSITION_FOLLOWING"));
    const key = 'silverspark-compass-draft-v1';
    const saved = await js("JSON.parse(sessionStorage.getItem('"+key+"'))");
    await call('Page.navigate',{url:app.href});
    await click('#take-assessment');
    await until(()=>js("!!document.querySelector('#results-title')"),'Could not resume completed results after refresh');
    assert.equal(await js("JSON.parse(sessionStorage.getItem('"+key+"')).assessmentId"),saved.assessmentId);
    assert.deepEqual(await js("JSON.parse(sessionStorage.getItem('"+key+"')).answers"),saved.answers);
    assert.equal(await js("!!document.querySelector('.completion-confetti')"),false);
    const draftTab=await call('Target.createTarget',{url:app.href});
    const {sessionId:otherSession}=await call('Target.attachToTarget',{targetId:draftTab.targetId,flatten:true});
    const other=async expression=>(await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},otherSession)).result?.value;
    async function openProfile() {
      await until(()=>other("document.querySelector('#take-assessment')?.disabled===false"),'Second tab did not load');
      await other("document.querySelector('#take-assessment').click()");
      await until(()=>other("!!document.querySelector('#profile-goal')"),'Missing profile in independent tab');
    }
    await openProfile();
    assert.equal(await other("document.querySelector('#profile-goal').value"),'','Fresh tabs must start blank');
    assert.equal(await other("!!document.querySelector('[aria-label=\"Previously saved assessment\"]')"),false);
    await other(`document.querySelectorAll('.profile-form select').forEach(select=>{
      select.selectedIndex=1; select.dispatchEvent(new Event('change',{bubbles:true}));
    })`);
    await other("document.querySelector('.profile-form [type=submit]').click()");
    await until(()=>other("!!document.querySelector('.option-card input')"),'Question one missing');
    await other("document.querySelector('.option-card input').click()");
    await other("document.querySelector('.question-panel .button-primary').click()");
    await until(()=>other("document.querySelector('.progress-bar')?.getAttribute('aria-valuenow')==='2'"),'Question two missing');
    await call('Page.navigate',{url:app.href},otherSession);
    await until(()=>other("document.querySelector('#take-assessment')?.disabled===false"),'Reload failed');
    await other("document.querySelector('#take-assessment').click()");
    await until(()=>other("document.querySelector('.progress-bar')?.getAttribute('aria-valuenow')==='2'"),'Refresh skipped the current question');
    await other("sessionStorage.removeItem('"+key+"')");
    // Seed the previous release's explicitly saved device record. New assessments never write one.
    const legacy = JSON.stringify({...saved,atResults:false});
    await js(`new Promise((resolve,reject)=>{
      const open=indexedDB.open('silverspark-compass',1);
      open.onupgradeneeded=()=>open.result.createObjectStore('local-drafts');
      open.onerror=()=>reject(open.error);
      open.onsuccess=()=>{
        const db=open.result;
        const tx=db.transaction('local-drafts','readwrite');
        tx.objectStore('local-drafts').put({draft:${JSON.stringify(legacy)},savedAt:Date.now()},'current');
        tx.oncomplete=()=>{db.close();resolve(true);};
        tx.onerror=()=>reject(tx.error);
      };
    })`);
    await call('Page.navigate',{url:app.href},otherSession);
    await openProfile();
    const legacyButtons = "document.querySelectorAll('aside[aria-label] button')";
    await until(()=>other(legacyButtons+".length===2"),'Missing previously saved copy');
    await other(legacyButtons+"[0].click()");
    await until(()=>other("document.querySelector('#profile-goal').value==='cash_flow'"),'Explicit resume failed');
    assert.deepEqual(await other("JSON.parse(sessionStorage.getItem('"+key+"')).answers"),saved.answers);
    await other("sessionStorage.removeItem('"+key+"')");
    await call('Page.navigate',{url:app.href},otherSession);
    await openProfile();
    await until(()=>other(legacyButtons+".length===2"),'Missing removal option');
    await other(legacyButtons+"[1].click()");
    await until(()=>other(legacyButtons+".length===0"),'Could not remove legacy copy');
    assert.equal(await js(`new Promise(resolve=>{
      const open=indexedDB.open('silverspark-compass',1);
      open.onsuccess=()=>{
        const db=open.result;
        const request=db.transaction('local-drafts').objectStore('local-drafts').get('current');
        request.onsuccess=()=>{db.close();resolve(request.result===undefined);};
      };
    })`),true,'Device still contains deleted copy');
    await call('Network.enable',{},otherSession);
    await call('Network.setCacheDisabled',{cacheDisabled:true},otherSession);
    await call('Network.setBlockedURLs',{urls:['*/assets/App-*.js']},otherSession);
    await call('Page.navigate',{url:app.href},otherSession);
    await until(()=>other("document.querySelector('#take-assessment')?.disabled===false"),'Landing unavailable');
    await other("document.querySelector('#take-assessment').click()");
    await until(()=>other("document.querySelector('[role=alert]')?.textContent.includes('could not open the assessment')"),'Missing failed-load recovery');
    await call('Network.setBlockedURLs',{urls:[]},otherSession);
    await other("document.querySelector('.storage-error button').click()");
    await openProfile();
    await call('Target.closeTarget',{targetId:draftTab.targetId});
    assert.equal(errors.length,0,errors.join('\n'));
    assert.deepEqual([...destinations].filter(url=>new URL(url).origin!==app.origin),[]);
    console.log('PASS Chrome: keyboard focus, 320px reflow, 18px answers, contract copy, edit from review, direct results, optional step navigation, responsive field pairs and checkboxes, report hierarchy, text contrast, 200% results text, specialist review, exact WhatsApp preview/destination, and direct PDF download ('+bytes.length+' bytes). No external requests.');
  } catch(error) { if(messages) console.error(messages.split('\n').slice(0,5).join('\n')); throw error; }
  finally { socket?.close(); child.kill(); preview?.kill(); }
}
run().then(()=>run(true)).catch(error=>{console.error(error);process.exitCode=1;});
