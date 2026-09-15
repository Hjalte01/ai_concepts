import test from 'node:test';import assert from 'node:assert/strict';
import {entropy,crossEntropy,kl,bernoulli,binaryChannelInformation,euler,surprise} from '../public/math.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} ≠ ${b}`);
test('coding examples and the entropy / cross-entropy / KL decomposition',()=>{near(surprise(.125),3);near(entropy([.5,.5]),1);near(entropy([1,0]),0);near(entropy([0,1]),0);for(let p=.01;p<1;p+=.07)for(let q=.01;q<1;q+=.09){const P=bernoulli(p),Q=bernoulli(q);assert.ok(kl(P,Q)>=-1e-12);near(crossEntropy(P,Q),entropy(P)+kl(P,Q));near(kl(P,P),0);}near(kl([.5,.5],[.9,.1]),.7369655941662061);assert.notEqual(kl([.5,.5],[.9,.1]),kl([.9,.1],[.5,.5]));});
test('zero-mass support and impossible model outcomes',()=>{near(crossEntropy([1,0],[1,0]),0);assert.equal(crossEntropy([.5,.5],[1,0]),Infinity);assert.equal(surprise(0),Infinity);});
test('copy channel limits and joint entropy identity',()=>{near(binaryChannelInformation(0),1);near(binaryChannelInformation(.5),0);for(let e=0;e<=.5;e+=.05)near(binaryChannelInformation(e)+entropy(bernoulli(e)),1);});
test('quadratic optimizer shows convergence, oscillation and divergence',()=>{assert.ok(Math.abs(euler(2,.1).at(-1))<2);near(euler(2,1).at(-1),2);assert.ok(Math.abs(euler(2,1.1).at(-1))>2);near(euler(2,.5)[1],0);});
