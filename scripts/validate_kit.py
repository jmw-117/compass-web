#!/usr/bin/env python3
"""Validation of planning-kit structure only, NOT app or business-rule correctness."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
ledger=json.loads((root/'docs/handoffs/ledger.json').read_text())
assert ledger['hosting']=='github-pages'
assert [x['id'] for x in ledger['stages']]==[f'S{i}' for i in range(9)]
for i, item in enumerate(ledger['stages']):
    assert item['status']=='not_started' or item['status'] in ('draft','review_requested','approved','blocked')
    assert item['requiredPrevious']==(f'S{i-1}' if i else None)
    matches=list((root/'docs/stages').glob(f'S{i}-*.md'))
    assert len(matches)==1, (i,matches)
    assert (root/f'.github/prompts/S{i}.prompt.md').exists()
    if item['status']=='approved':
        assert item['approvedBy'] and (root/item['handoffPath']).exists(), item
for name in ['profile_schema','question_bank','probes','rules','decision_predicates','action_catalog','golden_cases']:
    json.loads((root/f'docs/domain/{name}.json').read_text())
assert (root/'.github/workflows/deploy-pages.yml').exists()
assert (root/'AGENTS.md').exists()
print('PASS: 9 stages, all proposed JSON parse, required prompts/README/Pages workflow present. NO application tests executed.')
