/* 09X Glass round 2 map definitions */
export function makeNoise(seed){
 const P=new Uint8Array(512);let s=seed|0;const r=()=>{s=(s*1664525+1013904223)|0;return(s>>>8)/16777216};
 const a=[...Array(256).keys()];for(let i=255;i>0;i--){const j=(r()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}for(let i=0;i<512;i++)P[i]=a[i&255];
 const V=new Float32Array(256).map(()=>r());
 const f=t=>t*t*(3-2*t);
 const v=(x,z)=>{const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi;const h=(i,j)=>V[P[(P[(xi+i)&255]+zj(j,zi))&255]];
  const zj=(j,z0)=>(z0+j)&255;const u=f(xf),w=f(zf);const a0=h(0,0),b0=h(1,0),c0=h(0,1),d0=h(1,1);return a0+(b0-a0)*u+(c0-a0)*w+(a0-b0-c0+d0)*u*w};
 const fn=(x,z,oct=4)=>{let t=0,amp=.5,fr=1,n=0;for(let i=0;i<oct;i++){t+=v(x*fr,z*fr)*amp;n+=amp;amp*=.5;fr*=2}return t/n};
 return fn;
}
const hex=(h)=>[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255];
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};

/* helper: scatter instanced boxes with colliders */
function boxes(W,list,mat,geoDims,col=true){const T=W.T;const geo=new T.BoxGeometry(1,1,1);
 W.inst(geo,mat,list.map(o=>({x:o.x,y:o.y,z:o.z,ry:o.yaw||0,sx:o.w,sy:o.h,sz:o.d,c:o.c})));
 if(col)list.forEach(o=>W.addCol({x:o.x,z:o.z,hx:o.w/2,hz:o.d/2,yaw:-(o.yaw||0),top:o.y+o.h/2,y0:o.y-o.h/2}))}
function pines(W,list){const T=W.T;const m=new T.MeshStandardMaterial({color:0x1d4a3a,roughness:.9,emissive:0x07140f,emissiveIntensity:.5,flatShading:true});
 const cone=new T.ConeGeometry(1,1,7);W.inst(cone,m,list.map(o=>({x:o.x,y:o.y+o.h*.62,z:o.z,sx:o.h*.28,sy:o.h*.9,sz:o.h*.28,ry:o.x})));
 W.inst(cone,m,list.map(o=>({x:o.x,y:o.y+o.h*.9,z:o.z,sx:o.h*.2,sy:o.h*.6,sz:o.h*.2,ry:o.z})));
 const tr=new T.CylinderGeometry(.3,.4,1,5),tm=new T.MeshStandardMaterial({color:0x3a2418});W.inst(tr,tm,list.map(o=>({x:o.x,y:o.y+o.h*.15,z:o.z,sy:o.h*.3})));
 list.forEach(o=>W.addCol({x:o.x,z:o.z,r:o.h*.08+.4,top:o.y+o.h}))}
function scatter(W,n,f,ok){const out=[];for(let k=0;k<n*6&&out.length<n;k++){const x=W.rand(40,W.SIZE-40),z=W.rand(40,W.SIZE-40);if(!ok(x,z))continue;out.push(f(x,z,W.ground(x,z)))}return out}
function lamps(W,r,every,col,h=7){const T=W.T;const pts=[];r.pts.forEach((q,i)=>{if(i%every)return;const nx=0,hw=r.w/2+1.2;pts.push([q[0]+hw,q[2]+h,q[1],1.2],[q[0]-hw,q[2]+h,q[1],1.2])});W.glowPts(pts,col,12,.9)}

export const MAPS={};

/* ===== TRUCKS ===== */
MAPS['trucks:port']={nm:'Neon Port',size:1500,pal:'night',cell:7,water:-1.2,waterDeep:0x050c26,waterShallow:0x0b3a66,waterGlint:0xff4fb8,waveAmp:.5,foam:.15,mmLand:true,
 spawn:[760,760,0],fogD:.0028,
 H:(x,z,n)=>{const e=Math.min(x,z,1500-x,1500-z);const dock=Math.max(0,1-Math.abs(x-1250)/50);return e<160?-3+sm(40,160,e)*3.4:(x>1250?-3+sm(1250,1310,1500-x<0?0:1250+0)*0:0.4+n(x*.01,z*.01)*.6)+(x>1250?-(x-1250)*.02:0)},
 roads:[{pts:[[100,760],[500,760],[900,760],[1200,760]],w:20,glow:[0xff3da8,0x35e6ff]},{pts:[[760,100],[760,760],[760,1400]],w:18,glow:[0x35e6ff,0xff3da8]},{pts:[[300,300],[760,300],[1100,300],[1100,760],[1100,1200],[760,1200],[300,1200],[300,760],[300,300]].map(p=>p),w:16,closed:true,glow:[0xff3da8,0xffc83d]}],
 col:(x,z,h,sl,n,r)=>{if(h<-.6)return hex(0x15152a);const base=mix(hex(0x20202e),hex(0x2c2a3c),n(x*.05,z*.05));return r&&r.d<r.w/2+4?hex(0x2a2a3a):base},
 props:(W)=>{const T=W.T;const cols=[0xff3da8,0x35e6ff,0xffa13d,0x8a5cff,0x2de28a,0xe8e8f0];const list=[];
  for(let k=0;k<150;k++){const x=W.rand(120,1380),z=W.rand(120,1380);if(W.roadNear(x,z)&&W.roadNear(x,z).d<22)continue;if(W.ground(x,z)<0)continue;
   const gx=Math.round(x/14)*14,gz=Math.round(z/30)*30;if(W.roadNear(gx,gz)&&W.roadNear(gx,gz).d<22)continue;const st=1+((rngI(W,3))|0);
   for(let s=0;s<st;s++)list.push({x:gx,y:W.ground(gx,gz)+1.3+s*2.6,z:gz,w:5.8,h:2.6,d:12,c:cols[(W.rng()*6)|0],yaw:0})}
  boxes(W,list,new T.MeshStandardMaterial({roughness:.5,metalness:.6,emissive:0x111122,envMapIntensity:1.6}));
  // cranes
  for(let k=0;k<6;k++){const x=1220+W.rand(-10,10),z=200+k*220;const g=new T.Group();g.position.set(x,W.ground(x,z),z);const m=new T.MeshStandardMaterial({color:0xff9a2a,metalness:.4,roughness:.5,emissive:0x331500});
   const add=(w,h,d,px,py,pz)=>{const b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(px,py,pz);g.add(b)};add(1.6,40,1.6,-8,20,-8);add(1.6,40,1.6,8,20,-8);add(1.6,40,1.6,-8,20,8);add(1.6,40,1.6,8,20,8);add(2,2,70,0,41,-20);add(18,3,6,0,38,0);
   const l=new T.Mesh(new T.SphereGeometry(1,8,8),new T.MeshBasicMaterial({color:0xff2d2d}));l.position.set(0,43,-52);g.add(l);W.scene.add(g);
   [[-8,-8],[8,-8],[-8,8],[8,8]].forEach(c=>W.addCol({x:x+c[0],z:z+c[1],r:1.4,top:40}))}
  W.addRamp(760,500,0,60,20,.5,9,'ramp',{col:0xff3da8});W.addRamp(1100,980,Math.PI,60,20,.5,9,'ramp',{col:0x35e6ff});
  W.roads.forEach(r=>lamps(W,r,4,0xffd9a0,6));
  return{}}};
function rngI(W,k){return W.rng()*k}

MAPS['trucks:mountain']={nm:'Mountain Haul',size:1700,pal:'dusk',cell:8,water:null,sun:true,spawn:[200,200,.8],mmR:260,dust:false,
 H:(x,z,n)=>{const d=Math.hypot(x-850,z-850)/850;const ridge=Math.pow(Math.max(0,1-d),1.2)*160;return ridge*(.55+n(x*.004,z*.004,5)*.9)-4+n(x*.03,z*.03,3)*6},
 roads:[{pts:[]}],
 col:(x,z,h,sl,n,r)=>{const rock=mix(hex(0x6a5a64),hex(0x3a2f42),n(x*.02,z*.02));const grass=mix(hex(0x1e4a36),hex(0x2d6a44),n(x*.06,z*.06));let c=mix(grass,rock,sm(.28,.55,sl));if(h>120)c=mix(c,hex(0xe8e0f0),sm(120,150,h));if(r&&r.d<r.w/2+1)c=hex(0x2c2c36);return c},
 props:(W)=>{ // switchback road built after terrain: replace road via roads list at build time is too late; add dirt tracks via ramps only
  const list=scatter(W,500,(x,z,y)=>({x,y,z,h:rngH(W)}),(x,z)=>{const y=W.ground(x,z);const r=W.roadNear(x,z);return y>6&&y<95&&!(r&&r.d<20)});pines(W,list);
  W.addRamp(260,260,.8,50,16,W.ground(260,260),W.ground(260,260)+8,'ramp',{col:0xffa13d});
  return{}}};
function rngH(W){return 8+W.rng()*12}

MAPS['trucks:freeway']={nm:'Night Freeway',size:1800,pal:'night',cell:8,water:null,sun:true,spawn:[900,200,Math.PI/2*0+0],fogD:.0024,
 H:(x,z,n)=>n(x*.006,z*.006)*3,
 roads:[{pts:[[900,60],[900,500],[900,900],[900,1300],[900,1740]],w:44,glow:[0xff3da8,0x35e6ff]},{pts:[[60,900],[500,900],[900,900],[1300,900],[1740,900]],w:30,glow:[0x35e6ff,0xff3da8]}],
 col:(x,z,h,sl,n,r)=>mix(hex(0x14132a),hex(0x1f1b38),n(x*.03,z*.03)),
 props:(W)=>{const T=W.T;const list=[];for(let k=0;k<420;k++){const x=W.rand(60,1740),z=W.rand(60,1740),r=W.roadNear(x,z);if(r&&r.d<40)continue;const hh=20+W.rng()*(Math.hypot(x-900,z-900)<500?130:60);list.push({x,y:hh/2,z,w:14+W.rng()*20,h:hh,d:14+W.rng()*20,c:[0x2a1f58,0x1f2f5a,0x401a52][(W.rng()*3)|0]})}
  boxes(W,list,new T.MeshStandardMaterial({roughness:.3,metalness:.7,emissive:0x2a1a60,emissiveIntensity:.8,envMapIntensity:1.4}));
  const gl=[];list.forEach(o=>{for(let k=0;k<5;k++)gl.push([o.x+W.rand(-o.w/2,o.w/2),W.rand(4,o.h),o.z+(W.rng()<.5?-1:1)*(o.d/2+.3),1])});W.glowPts(gl,0x7fd8ff,6,.8);
  W.roads.forEach(r=>lamps(W,r,3,0xff9ad0,8));
  W.addRamp(900,300,0,60,24,0,9,'ramp',{col:0xff3da8});W.addRamp(900,1500,Math.PI,60,24,0,9,'ramp',{col:0x35e6ff});W.addRamp(400,900,Math.PI/2,50,20,0,8,'ramp');
  // traffic
  const tm=new T.MeshStandardMaterial({color:0xcccccc,metalness:.6,roughness:.4});const tr=[];for(let k=0;k<40;k++){tr.push({x:900+(W.rng()<.5?-8:8)+W.rand(-3,3),y:1,z:W.rand(80,1700),w:2.4,h:1.8,d:5,c:[0xff3da8,0x35e6ff,0xffc83d,0xffffff][(W.rng()*4)|0]})}
  boxes(W,tr,tm);return{}}};

MAPS['trucks:mud']={nm:'Mud Yard',size:1500,pal:'sunset',cell:7,water:null,sun:true,dirt:true,dust:true,spawn:[750,750,0],rough:1,
 H:(x,z,n)=>n(x*.012,z*.012,4)*9+n(x*.05,z*.05)*2-Math.max(0,1-Math.hypot(x-750,z-750)/200)*3,
 roads:[{pts:[[100,750],[400,600],[750,750],[1100,900],[1400,750]],w:22,dirt:true},{pts:[[750,100],[800,450],[750,750],[700,1100],[750,1400]],w:22,dirt:true}],
 col:(x,z,h,sl,n,r)=>mix(hex(0x5a3f2a),hex(0x7a5636),n(x*.08,z*.08)),
 props:(W)=>{const T=W.T;
  for(let k=0;k<24;k++){const x=W.rand(150,1350),z=W.rand(150,1350),y=W.ground(x,z);W.addRamp(x,z,W.rng()*6.28,36,16,y,y+W.rand(5,10),'ramp',{col:0xffa13d})}
  const list=[];for(let k=0;k<30;k++){const x=W.rand(100,1400),z=W.rand(100,1400);list.push({x,y:W.ground(x,z)+1.5,z,w:5,h:3,d:12,c:0xff9a2a,yaw:W.rng()*6})}boxes(W,list,new T.MeshStandardMaterial({color:0xff9a2a,metalness:.3,roughness:.6,emissive:0x331a00}));
  const pile=[];for(let k=0;k<40;k++){const x=W.rand(100,1400),z=W.rand(100,1400);pile.push({x,y:W.ground(x,z)+2,z,s:W.rand(4,9)})}
  W.inst(new T.DodecahedronGeometry(1),new T.MeshStandardMaterial({color:0x6a4a30,roughness:1,flatShading:true}),pile);pile.forEach(p=>W.addCol({x:p.x,z:p.z,r:p.s*.8,top:p.y+p.s}));
  return{}}};

/* switchback road for Mountain Haul (generated) */
(()=>{const pts=[];const cx=850,cz=850;let a=0;for(let i=0;i<60;i++){const t=i/59;const r=760-t*620;a=t*Math.PI*5.5+.8;const wob=Math.sin(i*1.3)*40;pts.push([cx+Math.cos(a)*(r+wob),cz+Math.sin(a)*(r+wob)])}
 MAPS['trucks:mountain'].roads=[{pts:pts.map((p,i)=>{const t=i/(pts.length-1);return [p[0],p[1],0]}),w:16,glow:[0xffa13d,0xffa13d],auto:true}];const q=MAPS['trucks:mountain'].roads[0].pts;MAPS['trucks:mountain'].spawn=[q[0][0],q[0][1],Math.atan2(q[1][0]-q[0][0],q[1][1]-q[0][1])];})();
