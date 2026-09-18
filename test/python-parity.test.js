import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {runPython,sampleCode,trainCode} from '../public/python-lab.js';
test('all editable examples agree with standard Python execution',()=>{
 for(const method of ['flow-matching','mean-flow','improved-mean-flow'])for(const code of [sampleCode(method),trainCode(method)]){
  const actual=runPython(code).rows;
  const expected=execFileSync('python',['-c',code],{encoding:'utf8'}).trim().split('\n').map(l=>l.split(/\s+/).map(Number));
  assert.equal(actual.length,expected.length);
  actual.forEach((row,i)=>row.forEach((v,j)=>assert.ok(Math.abs(v-expected[i][j])<=1e-10*Math.max(1,Math.abs(v)))));
 }
 const fm=runPython(sampleCode('flow-matching')).rows.at(-1)[1];
 const mf=runPython(sampleCode('mean-flow')).rows.at(-1)[1];
 assert.ok(Math.abs(mf-2/Math.E)<1e-12);assert.ok(Math.abs(fm-mf)>.04);
});
