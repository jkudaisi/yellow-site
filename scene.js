// Shared 3D world + grading post-process for the Yellow demo (used by index.html and render.html)
export function makeWorld(THREE){
const S=new THREE.Scene();S.background=new THREE.Color(0x0c1018);S.fog=new THREE.FogExp2(0x101626,0.05);
const cam=new THREE.PerspectiveCamera(38,2,0.1,120);
S.add(new THREE.HemisphereLight(0x5a6a90,0x201410,1.3));
const ground=new THREE.Mesh(new THREE.PlaneGeometry(60,80),new THREE.MeshStandardMaterial({color:0x22242a,roughness:0.22,metalness:0.6}));ground.rotation.x=-Math.PI/2;S.add(ground);
const bm=new THREE.MeshStandardMaterial({color:0x2a2d36,roughness:.85}),winM=new THREE.MeshBasicMaterial({color:0xffb860});
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
for(let side of[-1,1])for(let i=0;i<8;i++){const h=4+rnd()*7,b=new THREE.Mesh(new THREE.BoxGeometry(4,h,4),bm);b.position.set(side*7.5,h/2,-i*5+4);S.add(b);
 for(let k=0;k<6;k++)if(rnd()<.45){const w=new THREE.Mesh(new THREE.PlaneGeometry(.6,.8),winM);w.position.set(side*5.49,1.5+rnd()*(h-2),-i*5+4+(rnd()-.5)*3);w.rotation.y=-side*Math.PI/2;S.add(w);}}
for(let i=0;i<4;i++)for(let side of[-1,1]){const z=4-i*9+(side>0?4:0),p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,4),bm);p.position.set(side*4.2,2,z);S.add(p);
 const bulb=new THREE.Mesh(new THREE.SphereGeometry(.15),new THREE.MeshBasicMaterial({color:0xffd9a0}));bulb.position.set(side*4,4,z);S.add(bulb);
 const L=new THREE.PointLight(0xffb070,14,14,1.6);L.position.copy(bulb.position);S.add(L);}
const neon=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.5),new THREE.MeshBasicMaterial({color:0xff3070}));neon.position.set(-5.48,3.2,-1);neon.rotation.y=Math.PI/2;S.add(neon);
const nl=new THREE.PointLight(0xff3070,8,9);nl.position.set(-4.6,3,-1);S.add(nl);
const car=new THREE.Group(),cm=new THREE.MeshStandardMaterial({color:0x202830,roughness:.3,metalness:.8});
const body=new THREE.Mesh(new THREE.BoxGeometry(1.9,.6,4.2),cm);body.position.y=.55;car.add(body);const top=new THREE.Mesh(new THREE.BoxGeometry(1.6,.5,2),cm);top.position.set(0,1.1,.2);car.add(top);
for(const x of[-.65,.65]){const hl=new THREE.Mesh(new THREE.CircleGeometry(.14),new THREE.MeshBasicMaterial({color:0xffffff}));hl.position.set(x,.6,2.11);car.add(hl);
 const tl=new THREE.Mesh(new THREE.PlaneGeometry(.4,.1),new THREE.MeshBasicMaterial({color:0xff1010}));tl.position.set(x,.7,-2.11);tl.rotation.y=Math.PI;car.add(tl);}
const sp=new THREE.SpotLight(0xf0f4ff,40,30,.5,.5,1.2);sp.position.set(0,.7,2.2);sp.target.position.set(0,0,10);car.add(sp,sp.target);car.position.set(1.6,0,-6);S.add(car);
const fig=new THREE.Group(),fm=new THREE.MeshStandardMaterial({color:0x0c0c0e,roughness:.7});
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.25,.9,4,8),fm);torso.position.y=1.15;fig.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.16,12,10),fm);head.position.y=1.95;fig.add(head);
for(const x of[-.12,.12]){const l=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.6,4,6),fm);l.position.set(x,.4,0);fig.add(l);}
const umb=new THREE.Mesh(new THREE.ConeGeometry(.75,.3,12,1,true),new THREE.MeshStandardMaterial({color:0x222226,side:2}));umb.position.y=2.35;fig.add(umb);fig.position.set(-1.6,0,2);S.add(fig);
const RN=2200,rg=new THREE.BufferGeometry(),rp=new Float32Array(RN*6),y0=new Float32Array(RN);
for(let i=0;i<RN;i++){const x=(rnd()-.5)*20,y=rnd()*10,z=rnd()*-30+8;y0[i]=y;rp.set([x,y,z,x+.02,y-.35,z],i*6);}
rg.setAttribute('position',new THREE.BufferAttribute(rp,3));S.add(new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0x9aa8c0,transparent:true,opacity:.35})));
// time-based (deterministic, loops every 4s) so recorded clips loop seamlessly
function update(t){const p=rp;for(let i=0;i<RN;i++){const y=(((y0[i]-t*12.5)%10)+10)%10;p[i*6+1]=y;p[i*6+4]=y-.35;}rg.attributes.position.needsUpdate=true;
 car.position.z=-6+((t*3.5)%14);nl.intensity=8*(Math.sin(t*23)>-.9?1:.2);fig.rotation.y=Math.sin(t*Math.PI/2)*.2;}
return{S,cam,car,fig,update};}
export function makePost(THREE,rt){
const U={tex:{value:rt.texture},lift:{value:new THREE.Vector3()},gam:{value:new THREE.Vector3(1,1,1)},gain:{value:new THREE.Vector3(1,1,1)},off:{value:new THREE.Vector3()},
 con:{value:1},sat:{value:1},tmp:{value:0},intro:{value:1},logAll:{value:0},t:{value:0},grain:{value:1},box:{value:0},blur:{value:0},focus:{value:.5},px:{value:new THREE.Vector2(1/640,1/360)}};
const post=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:U,vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0,1);}`,
fragmentShader:`precision highp float;varying vec2 v;uniform sampler2D tex;uniform vec3 lift,gam,gain,off;uniform float con,sat,tmp,intro,logAll,t,grain,box,blur,focus;uniform vec2 px;
float l(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
vec3 tm(vec3 c){c*=2.6;return clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);}
vec3 toLog(vec3 c){c=clamp(log2(c*8.+1.)/log2(9.)*.78+.08,0.,1.);return mix(vec3(l(c)),c,.55);}
vec3 grade(vec3 c){c=c*gain;c=c+lift*(1.-c);c=c+off;c=pow(max(c,0.),1./max(gam,vec3(.05)));c=(c-.42)*con+.42;c+=vec3(.06,.0,-.06)*tmp;float y=l(c);c=mix(vec3(y),c,sat);return clamp(c,0.,1.);}
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec3 s=texture2D(tex,v).rgb;
 if(blur>0.){float r=blur*smoothstep(.05,.45,abs(v.y-focus));vec3 a=s;for(int i=0;i<12;i++){float g=float(i)*2.39996;vec2 o=vec2(cos(g),sin(g))*sqrt(float(i+1)/12.)*r;a+=texture2D(tex,v+o*px*6.).rgb;}s=a/13.;}
 vec3 d=tm(s);vec3 c=logAll>.5?toLog(d):grade(d);
 float y=l(c);float k=smoothstep(0.,1.,intro-(1.-y)*.5);c=mix(vec3(y),c,clamp(k*1.6,0.,1.));
 c+=(h(v*vec2(1917.,1033.)+fract(t)*91.)-.5)*.06*grain;vec2 q=v-.5;c*=1.-dot(q,q)*.6;
 if(abs(v.y-.5)>.5-box)c=vec3(0);gl_FragColor=vec4(c,1);}`}));
const PS=new THREE.Scene(),PC=new THREE.OrthographicCamera(-1,1,1,-1,0,1);PS.add(post);return{U,PS,PC};}
export const LOOKS={
 'YELLOW':{d:'Warm gold highlights · teal-green shadows',lift:[0.0,.035,.045],gam:[1.14,1.09,.98],gain:[1.3,1.16,.86],off:[.01,.01,0],con:1.1,sat:1.12,tmp:.2,sw:['#173a36','#4f6b4a','#d9a640','#ffd65a']},
 'NOCTURNE':{d:'Cold moonlight · inky blue night',lift:[-.01,.01,.07],gam:[1.0,1.06,1.16],gain:[.98,1.08,1.22],off:[0,0,0],con:1.12,sat:.9,tmp:-.5,sw:['#0b1730','#244a70','#7aa0c8','#d8e6ff']},
 'BLEACH':{d:'Bleach bypass · silver, gritty',lift:[.02,.02,.03],gam:[1.05,1.06,1.08],gain:[1.12,1.12,1.1],off:[0,0,0],con:1.4,sat:.4,tmp:-.05,sw:['#1c1d1f','#55585c','#a7a9a6','#eeeeea']},
 'EMBER':{d:'Burnt orange · nostalgic 35mm',lift:[.04,.01,-.02],gam:[1.12,1.02,.92],gain:[1.3,1.05,.82],off:[0,0,0],con:1.18,sat:1.0,tmp:.55,sw:['#2a120a','#7a3a1e','#d9824a','#ffd3a0']},
 'RAW / LOG':{d:'Flat camera log · ungraded',lift:[0,0,0],gam:[1,1,1],gain:[1,1,1],off:[0,0,0],con:.62,sat:.45,tmp:0,sw:['#3a3a3c','#5c5c5e','#888886','#aaaaa8']}};
export function applyLook(U,s){U.lift.value.fromArray(s.lift);U.gam.value.fromArray(s.gam);U.gain.value.fromArray(s.gain);U.off.value.fromArray(s.off);U.con.value=s.con;U.sat.value=s.sat;U.tmp.value=s.tmp;}
// Camera moves for the placeholder shots. p = 0..1 loop phase (seamless).
export const SHOTS=[
 {look:'YELLOW',  move:'Dolly in',     cam:(c,p,w)=>{const s=.5-.5*Math.cos(p*6.283);c.position.set(0,1.6,9-3*s);c.lookAt(0,1.4,-6);}},
 {look:'NOCTURNE',move:'Orbit',        cam:(c,p,w)=>{const a=p*6.283;c.position.set(-1.6+Math.sin(a)*3,1.8,2+Math.cos(a)*3);c.lookAt(-1.6,1.6,2);}},
 {look:'EMBER',   move:'Low tracking', cam:(c,p,w)=>{const s=.5-.5*Math.cos(p*6.283);c.position.set(3.4-1.4*s,.55,4);c.lookAt(w.car.position.x,.6,w.car.position.z);}},
 {look:'BLEACH',  move:'Crane up',     cam:(c,p,w)=>{const s=.5-.5*Math.cos(p*6.283);c.position.set(-2.2,.7+3*s,3.2);c.lookAt(-5,2+s,-1);}},
 {look:'YELLOW',  move:'Handheld',     cam:(c,p,w)=>{const a=p*6.283;c.position.set(.3+.06*Math.sin(3*a)+.03*Math.sin(7*a),1.8+.05*Math.sin(5*a),5.5);c.lookAt(-1.6+.04*Math.sin(4*a),1.5+.03*Math.cos(6*a),2);}},
 {look:'NOCTURNE',move:'Rack focus',   cam:(c,p,w)=>{c.position.set(-.9,1.5,4.6);c.lookAt(-1.4,1.3,-4);}, focus:p=>.5-.5*Math.cos(p*6.283)}];
