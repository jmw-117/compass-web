export function discoverOpportunity(profile:Record<string,unknown>,eligible:boolean) {
  const {primary_goal:goal,value_stream:workflow,workflow_bottleneck:delay,baseline_known:baseline}=profile;
  const systems=Array.isArray(profile.workflow_systems)?profile.workflow_systems.filter(x=>typeof x==='string'&&x!=='unknown'):[];
  if(!goal||goal==='explore'||!workflow||['unknown','other'].includes(String(workflow))||!delay||['unknown','other'].includes(String(delay))||!systems.length)
    return {kind:'Foundation',next:'Choose one recurring task and follow one example from start to finish.',measure:'Record where it waits, repeats or fails.'};
  if(workflow==='lead_to_sale' && (delay==='lost_leads'||systems.includes('whatsapp')))return {kind:'Process improvement',next:'Keep an enquiry list with a responsible person and a follow-up date.',measure:'Compare missed follow-ups before and after the change.'};
  if(delay==='manual_entry'&&systems.length>1&&baseline==='yes')return {kind:'Conventional automation',next:'Map the repeated fields and trial one checked transfer between your existing tools.',measure:'Count duplicate entries and corrections in a sample.'};
  if(delay==='knowledge_search'&&baseline==='yes'&&eligible)return {kind:'AI exploration',next:'Compare a human-reviewed search assistant with the current lookup process on non-sensitive examples.',measure:'Check accuracy and lookup time on the same examples.'};
  return {kind:'Process improvement',next:'Map one '+String(workflow).replaceAll('_',' ')+' case and address the reported '+String(delay).replaceAll('_',' ')+'.',measure:'Record a starting measure and compare it after the change.'};
}
