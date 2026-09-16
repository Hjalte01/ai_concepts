import {entropy,crossEntropy,kl,bernoulli,binaryChannelInformation,euler} from './math.js';
const svg=(title,body)=>`<svg viewBox="0 0 620 280" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>`;
const text=(x,y,s,cls='')=>`<text x="${x}" y="${y}" class="${cls}">${s}</text>`;
const line=(x,y,a,b,cls='')=>`<line x1="${x}" y1="${y}" x2="${a}" y2="${b}" class="${cls}"/>`;
const circle=(x,y,r=6,cls='dot')=>`<circle cx="${x}" cy="${y}" r="${r}" class="${cls}"/>`;
const path=(d,cls='curve')=>`<path d="${d}" class="${cls}"/>`;
const slider=(id,label,min,max,value,step='.01')=>`<label class="slider-label" for="${id}"><span>${label}</span><output id="${id}-value">${value}</output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;
const f=n=>Number.isFinite(n)?n.toFixed(3):'∞';
const axis=()=>line(55,225,590,225)+line(55,225,55,30);
const pointsPath=ps=>'M'+ps.map(p=>p.join(',')).join(' L');
export function visualMarkup(c){
 let controls='',caption='Concept sketch · illustrates the mechanism; not experimental measurements.';
 if(['entropy','surprise','distribution','mismatch'].includes(c.visual)){
 controls=slider('p','Reality P: probability of outcome A',0,1,.5);
 if(c.visual==='mismatch')controls+=slider('q','Model Q: probability of outcome A',0,1,.9);
 caption='An exact two-outcome calculation. All information quantities use log₂ and are measured in bits.';
 }else if(c.visual==='information'){
 controls=slider('error','Chance the copied bit is flipped',0,.5,.1);caption='Exact binary symmetric channel: X is a fair bit; Y copies it with independent flip probability e.';
 }else if(c.visual==='gradient-noise'){
 controls=slider('signal','Mean gradient magnitude',0,2,.5)+slider('noise','RMS gradient fluctuation',.05,2,.8);caption='Illustrative batch gradients: a fixed set of zero-mean fluctuations with controlled RMS. The ratio uses the mean-gradient / RMS-noise convention.';
 }else if(c.visual==='optimization'){
 controls=slider('rate','Learning rate η',.01,1.1,.15);caption='Exact gradient descent on L(w)=w², starting at w=2. This isolates step size; the trace has no mini-batch noise.';
 }else if(c.visual==='flow'||c.visual==='diffusion'){
 controls=slider('time',c.visual==='diffusion'?'Noise fraction t':'Path time t',0,1,.35);caption=c.visual==='diffusion'?'Fixed illustrative signal and noise: xₜ=√(1−t)x₀+√t ε. This uses t as a noise fraction, not a specific DDPM schedule.':'Toy conditional straight paths from fixed noise points to a two-cluster target. Not a trained marginal velocity field.';
 }else if(c.visual==='binary'){
 controls='<div class="segmented"><button data-pattern="repeat" aria-pressed="true">Repeated motif</button><button data-pattern="shuffle" aria-pressed="false">Shuffled bits</button></div>';caption='Both grids contain 32 zeroes and 32 ones: identical one-symbol entropy, different arrangement. This is a structural illustration, not a computed CTM or BDM score.';
 }
 return `<div class="visual-card"><div class="visual-heading"><span class="eyebrow">${controls?'Explore the idea':'See the mechanism'}</span><span class="live-badge">${controls?'Interactive':'Visual guide'}</span></div><div id="figure"></div><div id="visual-stats" class="visual-stats" aria-live="polite"></div><div class="controls">${controls}</div><p class="caption">${caption}</p></div>`;
}
export function mountVisual(c){
 let pattern='repeat';
 const figure=document.querySelector('#figure');if(!figure)return;
 const stats=document.querySelector('#visual-stats');
 function draw(){
  const val=(id,fallback)=>Number(document.getElementById(id)?.value??fallback);
  document.querySelectorAll('.controls input').forEach(el=>document.getElementById(el.id+'-value').value=Number(el.value).toFixed(2));
  let b='',s='';
  const stat=(n,v)=>`<div><strong>${v}</strong><span>${n}</span></div>`;
  if(['entropy','surprise','distribution','mismatch'].includes(c.visual)){
   const p=val('p',.5),q=val('q',p),P=bernoulli(p),Q=bernoulli(q);
   if(c.visual==='surprise'){
    b=axis()+path(pointsPath(Array.from({length:100},(_,i)=>{let x=(i+1)/100;return [55+x*520,225-(-Math.log2(x))*27];})))+circle(55+p*520,225-(-Math.log2(Math.max(p,.001)))*27,8,'accent-dot')+text(60,22,'surprise (bits)')+text(410,260,'outcome probability →');
    s=stat('Surprise of A',f(-Math.log2(p)))+stat('Probability of A',p.toFixed(2));
   }else{
    b=line(55,220,585,220);
    for(let i=0;i<2;i++){
     const x=140+i*265;
     b+=`<rect x="${x}" y="${220-170*P[i]}" width="66" height="${170*P[i]}" rx="5" class="bar"/>`+text(x+5,245,i===0?'A':'B')+text(x,35,`${Math.round(P[i]*100)}%`);
     if(c.visual==='mismatch')b+=`<rect x="${x+76}" y="${220-170*Q[i]}" width="46" height="${170*Q[i]}" rx="5" class="accent-fill"/>`+text(x+74,265,'model');
    }
    s=stat('Entropy H(P)',f(entropy(P)));
    if(c.visual==='mismatch')s+=stat('Extra cost KL',f(kl(P,Q)))+stat('Total H(P,Q)',f(crossEntropy(P,Q)));
    else s+=stat('Surprise if A occurs',f(-Math.log2(p)))+stat('Surprise if B occurs',f(-Math.log2(1-p)));
   }
  }else if(c.visual==='information'){
   const e=val('error',.1),mi=binaryChannelInformation(e),cond=1-mi;
   b=text(55,40,'Uncertainty in X: 1 bit')+`<rect x="55" y="80" width="510" height="65" rx="8" class="pale-fill"/><rect x="55" y="80" width="${510*mi}" height="65" rx="8" class="bar"/>`+text(55,175,`Shared I(X;Y): ${f(mi)} bits`)+text(55,207,`Remaining H(X|Y): ${f(cond)} bits`)+text(55,248,'shared + remaining = original uncertainty');
   s=stat('Flip probability',e.toFixed(2))+stat('Mutual information',f(mi))+stat('Joint entropy',f(1+cond));
  }else if(c.visual==='gradient-noise'){
   const mean=val('signal',.5),noise=val('noise',.8);
   b=line(55,140,590,140,'dashed')+text(55,25,'batch gradient: consistent signal + fluctuation');
   const deviations=[-1,1,-1,1,1,-1,1,-1,-1,1,1,-1];
   const y=v=>140-v*26;
   b+=line(55,y(mean),590,y(mean),'strong-line');
   deviations.forEach((d,i)=>{let x=75+i*43;const g=mean+noise*d;b+=line(x,y(mean),x,y(g),'faint')+circle(x,y(g),6);});
   b+=text(55,253,'orange: mean · green: batch estimates');
   s=stat('Signal',mean.toFixed(2))+stat('RMS noise',noise.toFixed(2))+stat('SNR',f(mean/noise));
  }else if(c.visual==='metrics'){
   b=axis()+text(55,23,'Two feature distributions: both moments matter');
   const density=(mu,sd)=>Array.from({length:100},(_,i)=>{const x=i/99*6-3;return [55+i/99*520,225-(95/sd)*Math.exp(-.5*((x-mu)/sd)**2)];});
   b+=path(pointsPath(density(-.5,.6)))+path(pointsPath(density(.5,.95)),'accent-curve')+text(90,90,'real')+text(380,90,'generated')+text(380,260,'feature coordinate →');
  }else if(c.visual==='optimization'){
   const rate=val('rate',.15),ps=euler(2,rate),scale=Math.max(2,...ps.map(Math.abs));
   b=axis()+line(55,130,590,130,'dashed')+path(pointsPath(ps.map((v,i)=>[55+i*43,130-v/scale*85])))+ps.map((v,i)=>circle(55+i*43,130-v/scale*85,4)).join('')+text(60,22,'parameter w')+text(450,260,'update step →');
   s=stat('Initial loss','4.000')+stat('Loss after 12 steps',f(ps.at(-1)**2))+stat('Behavior',rate<1?(rate>.5?'Oscillating → 0':'Approaching 0'):rate===1?'Oscillating':'Diverging');
  }else if(c.visual==='flow'){
   const t=val('time',.35);
   for(let i=0;i<14;i++){
    const y0=45+(i*43%185),y1=i<7?80+(i%4)*8:190+(i%4)*8;
    b+=line(65,y0,550,y1,'faint')+circle(65,y0,3,'muted-dot')+circle(550,y1,3,'accent-dot')+circle(65+485*t,y0*(1-t)+y1*t,6);
   }
   b+=text(55,265,'noise / start')+text(443,265,'data / destination');s=stat('Path time',t.toFixed(2))+stat('Rule','(1−t)x₀ + tx₁');
  }else if(c.visual==='diffusion'){
   const t=val('time',.35);let ps=[];
   for(let i=0;i<75;i++){const signal=Math.sin(i/10)*.8,noise=Math.sin(i*73.1)*1.5;ps.push([55+i*7,130-70*(Math.sqrt(1-t)*signal+Math.sqrt(t)*noise)]);}
   b=path(pointsPath(ps))+text(55,255,'structured signal + fixed noise');s=stat('Signal amplitude',f(Math.sqrt(1-t)))+stat('Noise amplitude',f(Math.sqrt(t)));
  }else if(c.visual==='binary'){
   let bits=Array.from({length:64},(_,i)=>i%2);
   if(pattern==='shuffle'){for(let i=63;i>0;i--){const j=(i*37+13)%(i+1);[bits[i],bits[j]]=[bits[j],bits[i]];}}
   bits.forEach((v,i)=>{b+=`<rect x="${60+(i%8)*25}" y="${25+Math.floor(i/8)*25}" width="22" height="22" rx="3" class="${v?'bar':'pale-fill'}"/>`;});
   b+=text(310,85,pattern==='repeat'?'A short rule:':'Same symbol counts:')+text(310,118,pattern==='repeat'?'alternate 0 and 1':'a different arrangement')+text(310,170,'32 zeros + 32 ones')+text(310,205,'symbol entropy = 1 bit');s=stat('Pattern',pattern==='repeat'?'Repeated':'Shuffled')+stat('One-symbol entropy','1.000 bit');
  }else if(c.visual==='network'||c.visual==='attention'){
   const layers=c.visual==='attention'?[4,4]:[4,6,3];let nodes=layers.map((n,l)=>Array.from({length:n},(_,i)=>[85+l*440/(layers.length-1),45+i*180/(n-1)]));
   nodes.slice(0,-1).forEach((layer,l)=>layer.forEach(a=>nodes[l+1].forEach((d,k)=>{b+=line(...a,...d,c.visual==='attention'&&k===1?'strong-line':'faint');})));
   nodes.flat().forEach(p=>b+=circle(...p,12));b+=text(55,267,c.visual==='attention'?'queries':'input')+text(455,267,c.visual==='attention'?'keys / values':'features');
  }else if(c.visual==='plane'){
   b=axis()+text(60,24,'I(T;Y): predictive information ↑')+text(330,260,'I(X;T): retained input →')+path('M510,204 C525,105 500,72 455,68 S260,65 200,65')+circle(510,204,8,'muted-dot')+circle(200,65,8,'accent-dot')+text(365,185,'1. fit ↑')+text(200,45,'2. proposed compression ←');
  }else if(c.visual==='double'||c.visual==='grokking'||c.visual==='fit'){
   b=axis()+text(60,22,c.visual==='grokking'?'accuracy':'error')+text(365,260,c.visual==='double'?'model capacity →':'training / complexity →');
   if(c.visual==='double')b+=path('M55,60 C120,225 190,205 250,75 S290,40 305,80 S360,215 580,207')+line(280,225,280,35,'dashed')+text(305,47,'interpolation');
   else if(c.visual==='grokking')b+=path('M55,210 C100,205 90,45 200,45 L580,45')+path('M55,215 L350,215 C455,215 425,60 580,60','accent-curve')+text(170,80,'train')+text(435,185,'test');
   else b+=path('M55,50 Q210,240 580,215')+path('M55,65 Q260,265 580,75','accent-curve')+text(400,197,'training')+text(440,85,'held-out');
  }else if(c.visual==='scatter'){
   b=axis();for(let i=0;i<12;i++){let x=75+i*42,y=c.id==='spearman'?215-i*i*1.2:210-i*14+(i%3-1)*9;b+=circle(x,y,6);}
   b+=text(65,25,c.id==='spearman'?'same ordering, curved relation':'approximately linear association')+text(450,260,'quantity X →');
  }else if(c.visual==='regularization'){
   b=axis()+path('M100,45 L310,220 L520,45')+path('M130,35 Q310,405 490,35','accent-curve')+text(115,77,'L1: |w|')+text(420,115,'L2: w²')+text(290,250,'0')+text(510,260,'weight →');
  }else if(c.visual==='batches'){
   for(let i=0;i<40;i++)b+=`<rect x="${55+i%10*30}" y="${45+Math.floor(i/10)*35}" width="24" height="24" rx="4" class="${i<10?'bar':'pale-fill'}"/>`;
   b+=text(380,65,c.id==='bootstrap'?'resample units':'one row = batch')+text(380,105,c.id==='bootstrap'?'with replacement':'all rows = epoch')+text(55,230,c.id==='bootstrap'?'Recompute a statistic for each resampled dataset.':'Each batch supplies one parameter update.');
  }else{
   const labels=c.visual==='counterfactual'?['original image','plausible edit','classifier flips']:c.visual==='joint-model'?['image + mask','joint diffusion','infer mask']:c.visual==='vae'?['encode / infer','latent z','decode x']:c.visual==='gan'?['noise z','generator','critic feedback']:c.visual==='chain'?['source X','state T','next state Z']:c.visual==='bottleneck'?['input X','keep useful T','predict Y']:c.visual==='tradeoff'?['fit / reward','choose balance','cost / constraint']:c.id==='ctm'?['run machines','count outputs','−log frequency']:c.id==='ste'?['real weights','binary forward','proxy gradient']:c.id==='algorithmic-probability'?['random program','execute','weight outputs']:['starting point','transformation','new quantity'];
   labels.forEach((v,i)=>{let x=30+i*205;b+=`<rect x="${x}" y="90" width="175" height="75" rx="12" class="${i===1?'bar':'pale-fill'}"/>`+text(x+12,132,v,i===1?'inverse':'');if(i<2)b+=text(x+181,133,'→');});
   b+=text(35,215,c.visual==='bottleneck'?'Discard nuisance detail; preserve target information.':c.visual==='tradeoff'?'A better fit must justify its additional cost.':'Follow the transformation from left to right.');
  }
  figure.innerHTML=svg(c.title+' visual explanation',b);stats.innerHTML=s;
 }
 document.querySelectorAll('.controls input').forEach(e=>e.addEventListener('input',draw));
 document.querySelectorAll('[data-pattern]').forEach(e=>e.addEventListener('click',()=>{pattern=e.dataset.pattern;document.querySelectorAll('[data-pattern]').forEach(b=>b.setAttribute('aria-pressed',b===e));draw();}));draw();
}
