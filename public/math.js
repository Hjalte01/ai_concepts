export const surprise = p => -Math.log2(p);
export const entropy = p => p.reduce((s,x) => s + (x === 0 ? 0 : -x*Math.log2(x)),0);
export const crossEntropy = (p,q) => p.reduce((s,x,i) => s + (x === 0 ? 0 : -x*Math.log2(q[i])),0);
export const kl = (p,q) => crossEntropy(p,q)-entropy(p);
export const bernoulli = p => [p,1-p];
export const binaryChannelInformation = error => 1-entropy(bernoulli(error));
export const euler = (x,rate,steps=12) => {const points=[x]; for(let i=0;i<steps;i++){x-=rate*2*x;points.push(x);}return points;};
