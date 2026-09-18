// Exact teaching flow dz/dt = z, with z(1)=initial. Not a trained generator.
export const exactState=(t,initial=2)=>initial*Math.exp(t-1);
export function averageVelocity(z,r,t){
 const gap=t-r;
 return Math.abs(gap)<1e-8?z*(1-gap/2+gap*gap/6):z*(-Math.expm1(-gap))/gap;
}
export function trainingExample(method,{x=-1,e=2,t=.6,r=.2,a=.5,b=.2,c=-.1,d=.1}={}){
 const z=(1-t)*x+t*e,conditional=e-x;
 const u=a*z+b*t+(method==='flow-matching'?0:c*r)+d;
 const tangent=method==='improved-mean-flow'?a*z+(b+c)*t+d:conditional;
 const derivative=a*tangent+b;
 const correction=method==='flow-matching'?0:(t-r)*derivative;
 const prediction=u+correction,error=prediction-conditional;
 return {z,conditional,u,tangent,derivative,correction,prediction,error,loss:error*error,target:conditional-correction};
}
