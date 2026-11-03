#!/usr/bin/env python3
"""Static domain-contract validator and reference score invariant checks.
This is NOT an implementation or real-world validation of the recommendation engine.
"""
import json, random
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
def read(path): return json.loads((ROOT / path).read_text(encoding='utf-8'))
core=read('docs/domain/question_bank.json')
ext=read('docs/domain/technical_extension.json')
discovery=read('docs/domain/prospective_client_discovery.json')
req=read('docs/domain/product_requirements.json')
actions=read('docs/domain/action_catalog.json')
journeys=read('docs/domain/user_journeys.json')
report=read('docs/domain/report_contract.json')
manifest=read('docs/domain/VERSION_MANIFEST.json')
weights={d['id']:d['weight_pct'] for d in core['dimensions']}
assert len(weights)==7 and sum(weights.values())==100
assert len(core['questions'])==14
assert all(sum(q['dimension']==d for q in core['questions'])==2 for d in weights)
assert len({q['id'] for q in core['questions']})==14
assert all([o['score'] for o in q['options']]==[0,1,2,3,4,None] for q in core['questions'])
assert len(ext['modules'])==9 and len(ext['questions'])==18
assert len({q['id'] for q in ext['questions']})==18
assert all(q['applies_when'] in ext['module_conditions'] for q in ext['questions'])
assert all(q['score_role']=='DIAGNOSTIC_ONLY' for q in ext['questions'])
assert all(len(q['choices'])>=3 and any(c['value']=='unknown' for c in q['choices']) for q in ext['questions'])
assert len(discovery['fields'])==13 and len(req['requirements'])==23 and len(journeys['journeys'])==6
assert len({r['id'] for r in req['requirements']})==23
assert len({f['id'] for f in discovery['fields']})==13
assert len({a['id'] for a in actions['actions']})==24
assert all(a in {v['id'] for v in actions['actions']} for ids in ext['flag_to_existing_action_ids'].values() for a in ids)
for m in ext['modules']:
  assert [q['id'] for q in ext['questions'] if q['module']==m['id']]==m['question_ids']
for q in ext['questions']:
  assert set(ext['flag_generation'][q['flag']]).issubset({c['value'] for c in q['choices']})
assert len(report['mandatory_sections'])>=12
assert manifest['status']=='DRAFT_UNAPPROVED'

def score(vals):
  lower=upper=coverage=0
  for q,v in zip(core['questions'],vals):
    w=weights[q['dimension']]
    if v is None:
      upper+=4*w
    else:
      assert isinstance(v,int) and 0<=v<=4
      lower+=v*w; upper+=v*w; coverage+=w
  return lower,upper,coverage
assert score([0]*14)==(0,0,200)
assert score([4]*14)==(800,800,200)
assert score([None]*14)==(0,800,0)
random.seed(321)
for _ in range(1500):
  a=[random.choice([None,0,1,2,3,4]) for _ in range(14)]
  low, high, cov=score(a)
  assert 0<=low<=high<=800 and 0<=cov<=200
  i=random.randrange(14)
  if a[i] is not None and a[i]<4:
    b=list(a); b[i]+=1
    assert score(b)[0]>=low and score(b)[1]>=high
  if a[i] is None:
    b=list(a);b[i]=0
    assert score(b)[0]==low and score(b)[1]<=high
    c=list(a);c[i]=4
    assert score(c)[0]>=low and score(c)[1]==high
print('PASS: schemas, links, 14/18 questions, 24 actions, 23 requirements, 1500 reference-score property samples')
