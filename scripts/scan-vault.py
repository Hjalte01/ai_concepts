#!/usr/bin/env python3
"""Read-only inventory of ATDL sources. Raw note content is never printed."""
import argparse, hashlib, json
from pathlib import Path
parser=argparse.ArgumentParser()
parser.add_argument('--root',type=Path,default=Path('/srv/obsidian-webdav/study/ATDL'))
parser.add_argument('--json',action='store_true',help='Print current inventory for an explicitly reviewed baseline update')
args=parser.parse_args()
if not args.root.is_dir():raise SystemExit(f'Vault root unavailable: {args.root}')
try:
 records=[{'path':str(p.relative_to(args.root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in sorted(args.root.rglob('*')) if p.is_file()]
except PermissionError:raise SystemExit('Vault read denied. Run with sudo -n; do not change vault permissions.')
if args.json:print(json.dumps(records,indent=2));raise SystemExit
baseline=Path(__file__).resolve().parent.parent/'docs/vault-inventory.json'
old={r['path']:r for r in json.loads(baseline.read_text())} if baseline.exists() else {}
new={r['path']:r for r in records}
for label,paths in [('Added',new.keys()-old.keys()),('Removed',old.keys()-new.keys()),('Changed',[p for p in new.keys()&old.keys() if new[p]['sha256']!=old[p]['sha256']])]:
 print(label+':')
 for p in sorted(paths):print('  '+p)
print(f'{len(records)} current files. Read the changed sources and update coverage before updating the baseline.')
