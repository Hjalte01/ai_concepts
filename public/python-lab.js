// Deliberately small numeric Python subset. No eval, generated JS, network, or host access.
// The examples are also valid standard Python; this is not a general Python runtime.
export function runPython(source){
 if(source.length>16000)throw Error('Keep the experiment below 16,000 characters.');
 const env=Object.create(null),rows=[];let budget=20000;
 const tick=()=>{if(--budget<0)throw Error('Execution limit reached. Reduce the number of steps.');};
 const finite=v=>{if(!Number.isFinite(v))throw Error('Calculation is not finite (check division, powers, and step sizes).');return v;};
 function expr(s){
  const tokens=[];const re=/\s*(?:(\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)?)|(\*\*|\/\/|[+\-*/%(),]))/y;
  let pos=0;while(pos<s.length){if(!s.slice(pos).trim())break;re.lastIndex=pos;const m=re.exec(s);if(!m)throw Error(`Unsupported expression near: ${s.slice(pos, pos+24)}`);tokens.push(m[1]??m[2]??m[3]);pos=re.lastIndex;}
  let i=0;const take=t=>{if(tokens[i]!==t)throw Error(`Expected ${t}.`);i++;};
  function atom(){tick();const t=tokens[i++];if(t==='('){const v=sum();take(')');return v;}if(t&&/^(\d|\.)/.test(t))return Number(t);
   if(!t||!/^\w/.test(t))throw Error('Expected a number or variable.');
   if(tokens[i]==='('){i++;const args=[];if(tokens[i]!==')'){args.push(sum());while(tokens[i]===','){i++;args.push(sum());}}take(')');
    const unary={'math.exp':Math.exp,'math.expm1':Math.expm1,'math.sqrt':Math.sqrt,'math.sin':Math.sin,'math.cos':Math.cos,'abs':Math.abs};
    if(Object.hasOwn(unary,t)){if(args.length!==1)throw Error(`${t} needs one number.`);return finite(unary[t](args[0]));}
    if(t==='min'||t==='max'){if(!args.length)throw Error(`${t} needs numbers.`);return Math[t](...args);}
    throw Error(`Unsupported function: ${t}. Use the functions listed below the editor.`);
   }
   if(!Object.hasOwn(env,t))throw Error(`Unknown variable: ${t}.`);return env[t];
  }
  function power(){const a=atom();if(tokens[i]==='**'){i++;return finite(a**unary());}return a;}
  function unary(){if(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++];return (op==='-'?-1:1)*unary();}return power();}
  function product(){let v=unary();while(['*','/','//','%'].includes(tokens[i])){const op=tokens[i++],b=unary();if((op==='/'||op==='//'||op==='%')&&b===0)throw Error('Division by zero.');v=finite(op==='*'?v*b:op==='/'?v/b:op==='//'?Math.floor(v/b):v-Math.floor(v/b)*b);}return v;}
  function sum(){let v=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],b=product();v=finite(op==='+'?v+b:v-b);}return v;}
  const value=sum();if(i!==tokens.length)throw Error(`Unexpected token: ${tokens[i]}.`);return finite(value);
 }
 const lines=source.split('\n').map((raw,index)=>{if(raw.includes('\t'))throw Error('Use spaces, not tabs, for indentation.');const text=raw.split('#')[0].trimEnd();return {text:text.trim(),indent:text.length-text.trimStart().length,line:index+1};}).filter(l=>l.text);
 function parse(start,indent){const out=[];let i=start;while(i<lines.length){const l=lines[i];if(l.indent<indent)break;if(l.indent!==indent)throw Error(`Line ${l.line}: unexpected indentation.`);
   const loop=l.text.match(/^for ([A-Za-z_]\w*) in range\((.*)\):$/);
   if(loop){if(!lines[i+1]||lines[i+1].indent<=indent)throw Error(`Line ${l.line}: indent the loop body.`);const [body,end]=parse(i+1,lines[i+1].indent);out.push({...l,loop:loop[1],range:loop[2],body});i=end;}
   else{out.push(l);i++;}
  }return [out,i];}
 // Split call arguments while respecting parentheses.
 function args(s){let depth=0,start=0,result=[];for(let i=0;i<s.length;i++){if(s[i]==='(')depth++;if(s[i]===')')depth--;if(s[i]===','&&depth===0){result.push(s.slice(start,i));start=i+1;}}result.push(s.slice(start));return result.map(expr);}
 function execute(block){for(const l of block){tick();try{
   if(l.loop){const a=args(l.range);if(a.length<1||a.length>3||a.some(v=>!Number.isSafeInteger(v)))throw Error('range needs one to three integers.');const start=a.length===1?0:a[0],stop=a.length===1?a[0]:a[1],step=a[2]??1;if(step===0)throw Error('range step must not be zero.');for(let v=start;step>0?v<stop:v>stop;v+=step){tick();env[l.loop]=v;execute(l.body);}continue;}
   if(l.text==='import math')continue;
   const print=l.text.match(/^print\((.*)\)$/);if(print){if(rows.length>=1000)throw Error('Output limit reached (1,000 rows).');const values=args(print[1]);if(values.length!==2)throw Error('Use print(horizontal, vertical) to plot two numbers.');rows.push(values);continue;}
   const assignment=l.text.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);if(!assignment)throw Error('Supported statements: numeric assignment, import math, for … in range(…), print(x, y).');env[assignment[1]]=expr(assignment[2]);
  }catch(e){throw Error(`Line ${l.line}: ${e.message}`);}}
 }
 if(lines.length&&lines[0].indent!==0)throw Error('The first statement must not be indented.');
 execute(parse(0,0)[0]);if(!rows.length)throw Error('Add print(x, y) to show a graph and output.');return {rows,variables:env};
}
export function sampleCode(method){return method==='flow-matching'?`# Toy ODE: dz/dt = z. Euler sampling, t=1 to 0.
# Edit steps and compare with the exact endpoint 2/exp(1).
steps = 8
z = 2
t = 1
print(t, z)
for step in range(steps):
    velocity = z
    z = z - velocity / steps
    t = t - 1 / steps
    print(t, z)`:`import math
# Toy ODE: dz/dt = z. Exact average velocity is known here.
# This is an oracle, NOT a trained MeanFlow neural network.
# MF and iMF share this same sampling rule.
steps = 1
z = 2
t = 1
print(t, z)
for step in range(steps):
    r = t - 1 / steps
    u = z * (-math.expm1(r - t)) / (t - r)
    z = z - (t - r) * u
    t = r
    print(t, z)`;}
export function trainCode(method){const fm=method==='flow-matching',imf=method==='improved-mean-flow';return `# Scalar training microscope, one fixed pair; not image training.
# Model = a*z + b*t + c*r + d. All four weights are learned.
x = -1
e = 2
t = 0.6
r = ${fm?'0':'0.2'}
a = 0.5
b = 0.2
c = -0.1
d = 0.1
rate = 0.03
z = (1 - t) * x + t * e
conditional = e - x
for step in range(40):
    u = a*z + b*t + c*r + d
${fm?'    error = u - conditional':`    tangent = ${imf?'a*z + (b+c)*t + d':'conditional'}
    dudt = a*tangent + b
    correction = (t-r)*dudt
    error = u + correction - conditional`}
    print(step, error**2)
    # Stop-gradient: differentiate only u, holding correction fixed.
    gradient = 2*error
    a = a - rate*gradient*z
    b = b - rate*gradient*t
    c = c - rate*gradient*r
    d = d - rate*gradient`;}
