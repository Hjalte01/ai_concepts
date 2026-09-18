import test from 'node:test';import assert from 'node:assert/strict';
import {entropy,crossEntropy,kl,bernoulli,binaryChannelInformation,euler,surprise} from '../public/math.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} ≠ ${b}`);
test('coding examples and the entropy / cross-entropy / KL decomposition',()=>{near(surprise(.125),3);near(entropy([.5,.5]),1);near(entropy([1,0]),0);near(entropy([0,1]),0);for(let p=.01;p<1;p+=.07)for(let q=.01;q<1;q+=.09){const P=bernoulli(p),Q=bernoulli(q);assert.ok(kl(P,Q)>=-1e-12);near(crossEntropy(P,Q),entropy(P)+kl(P,Q));near(kl(P,P),0);}near(kl([.5,.5],[.9,.1]),.7369655941662061);assert.notEqual(kl([.5,.5],[.9,.1]),kl([.9,.1],[.5,.5]));});
test('zero-mass support and impossible model outcomes',()=>{near(crossEntropy([1,0],[1,0]),0);assert.equal(crossEntropy([.5,.5],[1,0]),Infinity);assert.equal(surprise(0),Infinity);});
test('copy channel limits and joint entropy identity',()=>{near(binaryChannelInformation(0),1);near(binaryChannelInformation(.5),0);for(let e=0;e<=.5;e+=.05)near(binaryChannelInformation(e)+entropy(bernoulli(e)),1);});
test('quadratic optimizer shows convergence, oscillation and divergence',()=>{assert.ok(Math.abs(euler(2,.1).at(-1))<2);near(euler(2,1).at(-1),2);assert.ok(Math.abs(euler(2,1.1).at(-1))>2);near(euler(2,.5)[1],0);});

// Flow teaching examples: verify the mathematical identities, not SVG details.
import {exactState,averageVelocity,trainingExample} from '../public/flow-math.js';
import {runPython,sampleCode,trainCode} from '../public/python-lab.js';
test('interval velocity reconstructs endpoints, composes and has a finite boundary',()=>{
 for(const t of [0,.2,.6,1])for(const r of [0,t/2,t]){
  const z=exactState(t),u=averageVelocity(z,r,t);
  assert.ok(Math.abs(z-(t-r)*u-exactState(r))<1e-12);
  const s=(r+t)/2;
  assert.ok(Math.abs((t-r)*u-((t-s)*averageVelocity(z,s,t)+(s-r)*averageVelocity(exactState(s),r,s)))<1e-12);
 }
 assert.equal(averageVelocity(2,1,1),2);
 assert.ok(Math.abs(averageVelocity(2,1-1e-10,1)-2)<1e-9);
});
test('MeanFlow identity and training tangent distinction',()=>{
 const t=.8,r=.2,delta=1e-5,z=exactState(t),u=averageVelocity(z,r,t);
 const derivative=(averageVelocity(exactState(t+delta),r,t+delta)-averageVelocity(exactState(t-delta),r,t-delta))/(2*delta);
 assert.ok(Math.abs(u+(t-r)*derivative-z)<1e-9);
 const mf=trainingExample('mean-flow'),imf=trainingExample('improved-mean-flow');
 assert.ok(Math.abs(mf.loss-2.9584)<1e-12);
 assert.ok(Math.abs(imf.loss-4.875264)<1e-12);
 assert.notEqual(mf.tangent,imf.tangent);
 for(const method of ['mean-flow','improved-mean-flow'])assert.equal(trainingExample(method,{t:.5,r:.5}).correction,0);
});
test('numeric Python subset handles precedence, bounds and unsupported operations',()=>{
 assert.deepEqual(runPython('x = -2**2\ny = 2**-2\nprint(x, y)').rows,[[-4,.25]]);
 assert.deepEqual(runPython('for i in range(3, 0, -1):\n    print(i, i%2)').rows,[[3,1],[2,0],[1,1]]);
 assert.throws(()=>runPython('print(1, 1/0)'),/Division by zero/);
 assert.throws(()=>runPython('for i in range(1, 2, 0):\n    print(i, i)'),/must not be zero/);
 assert.throws(()=>runPython('for i in range(1000000000):\n    x = i'),/Execution limit/);
 assert.throws(()=>runPython('print(1, math.exp(1000))'),/not finite/);
 assert.throws(()=>runPython('import os\nprint(1, 2)'),/Supported statements/);
 assert.throws(()=>runPython('print(1, unknown)'),/Unknown variable/);
 assert.throws(()=>runPython('print(1, globalThis.fetch(1))'),/Unsupported function/);
 assert.throws(()=>runPython('while True:\n    print(1, 2)'),/unexpected indentation|Supported statements/);
});
