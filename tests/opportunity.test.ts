import assert from 'node:assert/strict';
import test from 'node:test';
import {discoverOpportunity} from '../src/domain/opportunity.ts';
test('choose a simpler intervention first and require safe evidence before suggesting AI',()=>{
 const base={primary_goal:'efficiency',value_stream:'lead_to_sale',workflow_bottleneck:'lost_leads',workflow_systems:['whatsapp'],baseline_known:'yes'};
 assert.equal(discoverOpportunity({},true).kind,'Foundation');
 assert.match(discoverOpportunity(base,false).next,/enquiry list/);
 const manual={...base,value_stream:'order_to_cash',workflow_bottleneck:'manual_entry',workflow_systems:['paper','spreadsheets']};
 assert.equal(discoverOpportunity(manual,false).kind,'Conventional automation');
 const search={...manual,workflow_bottleneck:'knowledge_search'};
 assert.equal(discoverOpportunity(search,false).kind,'Process improvement');
 assert.equal(discoverOpportunity(search,true).kind,'AI exploration');
 assert.equal(discoverOpportunity({...search,baseline_known:'unknown'},true).kind,'Process improvement');
});
