import assert from 'node:assert/strict';
import fs from 'node:fs';
const cs=JSON.parse(fs.readFileSync('public/concepts.json'));
const coverage=JSON.parse(fs.readFileSync('public/coverage.json'));
const ids=new Set(cs.map(c=>c.id));assert.equal(ids.size,cs.length,'Duplicate concept ID');
for(const c of cs){for(const k of ['id','title','group','question','intuition','formula','example','caveat','origin','source','visual','check','answer'])assert.ok(typeof c[k]==='string'&&c[k].trim(),`${c.id} missing ${k}`);assert.ok(c.steps.length>=3);for(const id of c.prerequisites)assert.ok(ids.has(id),`${c.id}: missing prerequisite ${id}`);assert.match(c.source,/^(https:\/\/|vault:)/);}
const visit=(id,stack=new Set())=>{assert.ok(!stack.has(id),`Prerequisite cycle at ${id}`);let next=new Set([...stack,id]);cs.find(c=>c.id===id).prerequisites.forEach(p=>visit(p,next));};
cs.forEach(c=>visit(c.id));for(const k of coverage.keywords)assert.ok(ids.has(k.id),`Uncovered note keyword: ${k.term}`);
assert.equal(coverage.keywords.length,new Set(coverage.keywords.map(k=>k.term)).size);
console.log(`${cs.length} complete concept records; ${coverage.keywords.length} mapped note keywords; no dangling prerequisites or cycles.`);
for(const c of cs.filter(c=>c.study)){
 const s=c.study;
 assert.ok(s.sections.length>=6,`${c.id}: incomplete paper walkthrough`);
 for(const section of s.sections){assert.ok(section.title&&section.kind&&section.body.length);assert.ok(section.body.every(p=>typeof p==='string'&&p.length>20));}
 assert.ok(s.architecture.length>=5&&s.architecture.every(row=>row.length===3));
 assert.ok(s.research.length>=2&&s.sources.length>=2);
 for(const [label,url] of s.sources){assert.ok(label);assert.match(url,/^https:\/\//);}
}
assert.ok(['flow-matching','mean-flow','improved-mean-flow'].every(id=>cs.find(c=>c.id===id)?.study));
console.log('Three connected paper walkthroughs include architecture, derivations, research prompts and sources.');
