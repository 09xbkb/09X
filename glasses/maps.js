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

 if(W.cat==='planes'||W.cat==='helis')list.forEach(o=>{if(!o.yaw)W.ramps.push({x:o.x,z:o.z-o.d/2,yaw:0,len:o.d,wid:o.w,h0:0,h1:o.y+o.h/2,kind:'box',rad:Math.hypot(o.w,o.d)+2})});
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

/* ===== BOATS ===== */
const bump=(x,z,cx,cz,r,h)=>{const d=Math.hypot(x-cx,z-cz)/r;return d<1?h*(1-d*d)*(1-d*d):0};
function palms(W,list){const T=W.T;const tm=new T.MeshStandardMaterial({color:0x5a3a20,roughness:1}),lm=new T.MeshStandardMaterial({color:0x1f8a4a,roughness:.8,emissive:0x052010,side:T.DoubleSide});
 W.inst(new T.CylinderGeometry(.25,.4,1,5),tm,list.map(o=>({x:o.x,y:o.y+o.h/2,z:o.z,sy:o.h,rz:Math.sin(o.x)*.12})));
 W.inst(new T.ConeGeometry(1,1,7,1,true),lm,list.map(o=>({x:o.x,y:o.y+o.h,z:o.z,sx:o.h*.7,sy:o.h*.35,sz:o.h*.7,ry:o.z})));}
const waterMap=(o)=>Object.assign({size:1800,cell:9,water:0,mmLand:true,mmR:300,dust:false,rough:.95,roadBlend:6},o);
MAPS['boats:harbor']=waterMap({nm:'Neon Harbor',pal:'night',waveAmp:.6,waterDeep:0x04102e,waterShallow:0x0d4a80,waterGlint:0xff4fb8,spawn:[700,900,Math.PI/2],
 H:(x,z,n)=>{let h=-9;if(x>1500)h=1.2+n(x*.02,z*.02)*.8;h=Math.max(h,-9+bump(x,z,1100,500,160,11),-9+bump(x,z,1000,1300,190,11),-9+bump(x,z,500,300,110,10.5));if(x>1450&&x<=1500)h=-9+(x-1450)/50*10.2;return h},
 roads:[],col:(x,z,h)=>h<-1?hex(0x0b1030):h<.4?hex(0x3a3050):mix(hex(0x2a2a3c),hex(0x3c3a52),(x*.07%1+1)%1),
 props:(W)=>{const T=W.T;const list=[];for(let k=0;k<60;k++){const z=40+k*29,hh=20+W.rng()*90;list.push({x:1560+W.rng()*180,y:hh/2,z,w:24,h:hh,d:22,c:0})}
  boxes(W,list,new T.MeshStandardMaterial({color:0x2a2060,roughness:.3,metalness:.7,emissive:0x2a1a60,emissiveIntensity:.9,envMapIntensity:1.4}));
  const gl=[];list.forEach(o=>{for(let k=0;k<6;k++)gl.push([o.x-o.w/2-.3,W.rand(4,o.h),o.z+W.rand(-9,9),1])});W.glowPts(gl,0xff8ad0,7,.9);
  const bu=[];for(let k=0;k<50;k++){const x=W.rand(100,1400),z=W.rand(100,1700);if(W.ground(x,z)<-4)bu.push([x,.8,z,1.4])}W.glowPts(bu,0xff3da8,9,.95);
  for(let k=0;k<10;k++){const x=200+k*110,z=W.rand(300,1500);if(W.ground(x,z)<-4){const l=[{x,y:.1,z:z,s:3}];W.glowPts([[x,1,z,1.5]],0x35e6ff,14,.9)}}
  return{coinSpot:()=>{for(;;){const x=W.rand(60,1450),z=W.rand(60,1740);if(W.ground(x,z)<-3)return[x,z,1.6]}}}}});
MAPS['boats:lagoon']=waterMap({nm:'Lagoon Islands',pal:'sunset',sun:true,waveAmp:.35,waterDeep:0x063a52,waterShallow:0x19a0a8,waterGlint:0xffa060,spawn:[900,650,.3],
 H:(x,z,n)=>{let h=-8;[[500,500,160],[1300,600,190],[1200,1300,170],[400,1250,150],[900,300,110],[900,1550,130]].forEach(i=>{h=Math.max(h,-8+bump(x,z,i[0],i[1],i[2],14))});h=Math.max(h,-8+bump(x,z,880,900,60,26));return h+n(x*.03,z*.03)*.8*(h>-7?1:0)},
 roads:[],col:(x,z,h,sl)=>h<-.5?hex(0x1a6a7a):h<1.5?hex(0xe8d29a):sl>.5?hex(0x6a5a50):mix(hex(0x2e8a4a),hex(0x4aa05a),(x*.05%1+1)%1),
 props:(W)=>{const pl=scatter(W,260,(x,z,y)=>({x,y,z,h:W.rand(5,9)}),(x,z)=>{const h=W.ground(x,z);return h>1&&h<5});palms(W,pl);
  const T=W.T;const rm=new T.MeshStandardMaterial({color:0x7a5a50,roughness:.9,flatShading:true});const ar=[{x:880,y:12,z:858,w:12,h:26,d:14,c:0},{x:880,y:12,z:942,w:12,h:26,d:14,c:0},{x:880,y:25,z:900,w:12,h:8,d:100,c:0}];
  ar[2].y0=21;boxes(W,ar.slice(0,2),rm);boxes(W,[ar[2]],rm,0,false);
  return{coinSpot:()=>{for(;;){const x=W.rand(60,1740),z=W.rand(60,1740);if(W.ground(x,z)<-2)return[x,z,1.6]}}}}});
MAPS['boats:storm']=waterMap({nm:'Storm Coast',pal:'storm',waveAmp:3.2,foam:.8,waterDeep:0x050c18,waterShallow:0x16324a,waterGlint:0x8aa8e0,spawn:[700,900,Math.PI/2],fogD:.0042,exposure:1.2,
 H:(x,z,n)=>{let h=-10;if(x>1450)h=3+n(x*.02,z*.02)*6;h=Math.max(h,-10+bump(x,z,1100,900,150,24),-10+bump(x,z,700,300,90,14),-10+bump(x,z,600,1450,100,14));if(x>1380&&x<=1450)h=-10+(x-1380)/70*13;return h},
 roads:[],col:(x,z,h,sl)=>h<0?hex(0x0a1018):sl>.5?hex(0x3a3a46):hex(0x24323a),
 props:(W)=>{const T=W.T;const g=new T.Group();g.position.set(1100,W.ground(1100,900),900);
  const m=new T.MeshStandardMaterial({color:0xe8e8f0,roughness:.5});const rd=new T.MeshStandardMaterial({color:0xcc2a2a,roughness:.5});
  [[0,6,1],[1,16,1],[2,26,1],[3,36,1]].forEach(([i,y])=>{const c=new T.Mesh(new T.CylinderGeometry(4-i*.5,4.6-i*.5,10,16),i%2?rd:m);c.position.y=y;g.add(c)});
  const lamp=new T.Mesh(new T.SphereGeometry(3,12,12),new T.MeshBasicMaterial({color:0xfff2b0}));lamp.position.y=46;g.add(lamp);W.scene.add(g);W.addCol({x:1100,z:900,r:6,top:80});
  const beam=new T.Sprite(new T.SpriteMaterial({map:W.glowTex,color:0xfff2b0,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));beam.scale.set(160,30,1);W.scene.add(beam);
  W.upd.push((dt,S)=>{const a=S.t*.8;beam.position.set(1100+Math.cos(a)*70,W.ground(1100,900)+46,900+Math.sin(a)*70)});
  const bu=[];for(let k=0;k<40;k++){const x=W.rand(100,1380),z=W.rand(100,1700);if(W.ground(x,z)<-6)bu.push([x,1.5,z,1.6])}W.glowPts(bu,0xff5a3a,10,.95);
  const rocks=scatter(W,40,(x,z,y)=>({x,y:y+1,z,s:W.rand(4,10)}),(x,z)=>{const h=W.ground(x,z);return h>-3&&h<2});
  W.inst(new T.DodecahedronGeometry(1),new T.MeshStandardMaterial({color:0x4a4a55,flatShading:true}),rocks);rocks.forEach(p=>W.addCol({x:p.x,z:p.z,r:p.s*.8,top:p.y+p.s}));
  return{coinSpot:()=>{for(;;){const x=W.rand(60,1350),z=W.rand(60,1740);if(W.ground(x,z)<-5)return[x,z,1.8]}}}}});
MAPS['boats:canyon']=waterMap({nm:'Canyon Rapids',pal:'dusk',sun:true,waveAmp:.25,foam:.6,waterDeep:0x2a1a2a,waterShallow:0x7a4a40,waterGlint:0xffa060,spawn:[160,1150,Math.PI/2],exposure:1.1,
 H:(x,z,n)=>{const cz=900+Math.sin(x*.0045)*300+Math.sin(x*.012)*60,d=Math.abs(z-cz),w=75+Math.sin(x*.009)*20;const wall=sm(w,w+25,d)*(55+n(x*.02,z*.02)*50);return -7+wall+n(x*.05,z*.05)*2*sm(w,w+25,d)},
 roads:[],col:(x,z,h,sl,n)=>h<-.6?hex(0x4a2a2a):mix(hex(0xb84a2a),hex(0x7a2a22),Math.min(1,sl*1.5+n(x*.08,z*.08)*.4)),
 props:(W)=>{const T=W.T;const rm=new T.MeshStandardMaterial({color:0xa8442a,roughness:.9,flatShading:true});
  const cz=x=>900+Math.sin(x*.0045)*300+Math.sin(x*.012)*60;const x0=900,z0=cz(x0);boxes(W,[{x:x0,y:20,z:z0-70,w:20,h:56,d:20,c:0},{x:x0,y:20,z:z0+70,w:20,h:56,d:20,c:0}].map(o=>o),rm);
  boxes(W,[{x:x0,y:48,z:z0,w:20,h:12,d:160,c:0,y0:36}],rm,0,false);
  const bu=[];for(let k=0;k<60;k++){const x=W.rand(100,1700);bu.push([x,1,cz(x)+W.rand(-50,50),1.4])}W.glowPts(bu,0xffc83d,9,.9);
  return{coinSpot:()=>{for(;;){const x=W.rand(100,1700),z=cz(x)+W.rand(-60,60);if(W.ground(x,z)<-4)return[x,z,1.6]}}}}});

/* ===== PLANES ===== */
function rings(W,list,col){const T=W.T;const geo=new T.TorusGeometry(1,.06,10,40);const items=list.map(p=>{const m=new T.Mesh(geo,new T.MeshBasicMaterial({color:col,toneMapped:false}));m.position.set(p[0],p[1],p[2]);m.rotation.y=p[3]||0;m.scale.setScalar(p[4]||14);W.scene.add(m);return{m,p,got:false}});
 W.glowPts(list.map(p=>[p[0],p[1],p[2],1.4]),col,70,.5);
 W.upd.push((dt,S)=>{items.forEach(r=>{r.m.rotation.z+=dt;if(r.got)return;const d=Math.hypot(S.x-r.p[0],S.y-r.p[1],S.z-r.p[2]);if(d<(r.p[4]||14)){r.got=true;r.m.visible=false;W.store.set('coins',W.store.get('coins',0)+25);W.toast('Ring! +25 coins')}})})}
const airMap=(o)=>Object.assign({size:2600,cell:14,water:null,mmR:500,startAlt:130,far:2400,dust:false,cm:2,roadBlend:6},o);
const skyPts=(W,n,f)=>{const a=[];for(let i=0;i<n;i++)a.push(f(i));return a};
MAPS['planes:skyline']=airMap({nm:'Neon Skyline',pal:'night',spawn:[1300,300,0],fogD:.0016,
 H:(x,z,n)=>n(x*.004,z*.004)*10,roads:[{pts:[[100,1300],[1300,1300],[2500,1300]],w:60,glow:[0xff3da8,0x35e6ff]},{pts:[[1300,100],[1300,1300],[1300,2500]],w:60,glow:[0x35e6ff,0xff3da8]}],
 col:(x,z)=>hex(0x15122a),
 props:(W)=>{const T=W.T;const list=[];for(let k=0;k<260;k++){const x=W.rand(80,2500),z=W.rand(80,2500);if(Math.abs(x-1300)<70||Math.abs(z-1300)<70)continue;const hh=40+W.rng()*(Math.hypot(x-1300,z-1300)<700?340:130);list.push({x,y:hh/2,z,w:28+W.rng()*30,h:hh,d:28+W.rng()*30,c:0})}
  boxes(W,list,new T.MeshStandardMaterial({color:0x241a58,roughness:.3,metalness:.7,emissive:0x2a1a70,emissiveIntensity:.9,envMapIntensity:1.4}));
  const gl=[];list.forEach(o=>{for(let k=0;k<8;k++)gl.push([o.x+W.rand(-o.w/2,o.w/2),W.rand(6,o.h),o.z+(W.rng()<.5?-1:1)*(o.d/2+.3),1]);gl.push([o.x,o.h+3,o.z,2])});W.glowPts(gl,0x7fd8ff,10,.85);
  const rl=skyPts(W,12,i=>[1300+Math.sin(i*.7)*350,160+Math.sin(i*.9)*40,300+i*180,Math.sin(i*.7)*.3,18]);rings(W,rl,0xffc83d);
  return{coinSpot:()=>[W.rand(100,2500),W.rand(100,2500),W.rand(60,320)]}}});
MAPS['planes:canyonrun']=airMap({nm:'Canyon Run',pal:'dusk',sun:true,spawn:[150,1100,Math.PI/2],startAlt:60,
 H:(x,z,n)=>{const cz=1300+Math.sin(x*.003)*450,d=Math.abs(z-cz),w=130;return sm(w,w+60,d)*(130+n(x*.01,z*.01)*120)+n(x*.03,z*.03)*6},roads:[],
 col:(x,z,h,sl,n)=>mix(hex(0xb84a2a),hex(0x6a2a22),Math.min(1,sl*1.4+n(x*.06,z*.06)*.5)),
 props:(W)=>{const cz=x=>1300+Math.sin(x*.003)*450;const rl=skyPts(W,16,i=>{const x=250+i*140;return[x,70+Math.sin(i)*20,cz(x),Math.PI/2,16]});rings(W,rl,0xffc83d);
  return{coinSpot:()=>{const x=W.rand(100,2500);return[x,cz(x)+W.rand(-80,80),W.rand(40,110)]}}}});
MAPS['planes:clouds']=airMap({nm:'Cloud Rings',pal:'sunset',sun:true,spawn:[1300,300,0],startAlt:260,
 H:(x,z,n)=>-30+n(x*.003,z*.003)*10,roads:[],col:()=>[.95,.78,.8],rough:1,
 props:(W)=>{const T=W.T;const puffs=[];for(let k=0;k<160;k++)puffs.push({x:W.rand(0,2600),y:W.rand(0,60),z:W.rand(0,2600),sx:W.rand(80,200),sy:W.rand(18,34),sz:W.rand(80,180)});
  W.inst(new T.SphereGeometry(1,10,8),new T.MeshBasicMaterial({color:0xffd9c8,transparent:true,opacity:.55,depthWrite:false}),puffs);
  const rl=skyPts(W,18,i=>[1300+Math.sin(i*.6)*500,240+Math.sin(i*.8)*90,250+i*125,Math.sin(i*.6)*.4,22]);rings(W,rl,0xffc83d);
  return{coinSpot:()=>[W.rand(100,2500),W.rand(100,2500),W.rand(120,360)]}}});
MAPS['planes:storm']=airMap({nm:'Storm Front',pal:'storm',spawn:[1300,300,0],startAlt:200,fogD:.0034,exposure:1.2,
 H:(x,z,n)=>n(x*.004,z*.004,4)*90-10,roads:[],col:(x,z,h,sl)=>sl>.4?hex(0x2a2a34):hex(0x1a2630),
 props:(W)=>{const T=W.T;const rl=skyPts(W,14,i=>[1300+Math.sin(i*.8)*420,240+Math.sin(i)*70,250+i*150,Math.sin(i*.8)*.3,22]);rings(W,rl,0x9fd0ff);
  let nt=3;W.upd.push((dt,S)=>{nt-=dt;if(nt<0){nt=2+Math.random()*5;const f=document.querySelector('#flash');if(f){f.style.background='#cfe0ff';f.style.opacity=.7;setTimeout(()=>{f.style.opacity=0;f.style.background=''},120)}}});
  return{coinSpot:()=>[W.rand(100,2500),W.rand(100,2500),W.rand(120,360)]}}});

/* ===== HELIS ===== */
function pad(W,x,y,z,r,col){const T=W.T;const m=new T.Mesh(new T.CylinderGeometry(r,r,.4,32),new T.MeshStandardMaterial({color:0x22223a,emissive:col,emissiveIntensity:.25,metalness:.5,roughness:.4}));m.position.set(x,y,z);W.scene.add(m);
 const ring=new T.Mesh(new T.TorusGeometry(r*.8,.25,8,40),new T.MeshBasicMaterial({color:col,toneMapped:false}));ring.rotation.x=Math.PI/2;ring.position.set(x,y+.3,z);W.scene.add(ring);W.glowPts([[x,y+1,z,2]],col,r*4,.5)}
MAPS['helis:rooftop']=airMap({nm:'Rooftop Hops',pal:'night',spawn:[1300,1300,0],startAlt:0,cm:3,far:2000,
 H:(x,z,n)=>n(x*.004,z*.004)*6,roads:[{pts:[[100,1300],[2500,1300]],w:40,glow:[0xff3da8,0x35e6ff]},{pts:[[1300,100],[1300,2500]],w:40,glow:[0x35e6ff,0xff3da8]}],col:()=>hex(0x15122a),
 props:(W)=>{const T=W.T;const list=[];const pads=[];for(let k=0;k<200;k++){const x=W.rand(80,2500),z=W.rand(80,2500);if(Math.abs(x-1300)<60&&Math.abs(z-1300)<60)continue;if(Math.abs(x-1300)<45||Math.abs(z-1300)<45)continue;const hh=30+W.rng()*(Math.hypot(x-1300,z-1300)<700?200:90);list.push({x,y:hh/2,z,w:30+W.rng()*20,h:hh,d:30+W.rng()*20,c:0});if(W.rng()<.3)pads.push([x,hh+.3,z])}
  list.push({x:1300,y:2,z:1300,w:50,h:4,d:50,c:0});
  boxes(W,list,new T.MeshStandardMaterial({color:0x241a58,roughness:.3,metalness:.7,emissive:0x2a1a70,emissiveIntensity:.9,envMapIntensity:1.4}));
  const gl=[];list.forEach(o=>{for(let k=0;k<6;k++)gl.push([o.x+W.rand(-o.w/2,o.w/2),W.rand(4,o.h),o.z+(W.rng()<.5?-1:1)*(o.d/2+.3),1])});W.glowPts(gl,0x7fd8ff,9,.85);
  pad(W,1300,4.2,1300,18,0x35e6ff);const pc=[];pads.forEach(p=>{pad(W,p[0],p[1],p[2],9,0xff3da8);pc.push([p[0],p[1]+4,p[2]])});
  return{coinSpot:()=>pc.length&&W.rng()<.6?(()=>{const p=pc[(W.rng()*pc.length)|0];return[p[0],p[2],p[1]]})():[W.rand(100,2500),W.rand(100,2500),W.rand(30,140)]}}});
MAPS['helis:rigs']=airMap({spawnY:29.6,nm:'Offshore Rigs',pal:'dusk',sun:true,water:0,waveAmp:1.2,waterDeep:0x061a30,waterShallow:0x174a70,waterGlint:0xffa060,spawn:[1300,1300,0],startAlt:0,cm:3,mmLand:true,
 H:(x,z,n)=>-12,roads:[],col:()=>hex(0x0a1a2a),
 props:(W)=>{const T=W.T;const sites=[[1300,1300],[700,500],[1900,700],[600,1900],[1800,1800],[1300,300],[300,1200]];const lm=new T.MeshStandardMaterial({color:0x8a8f9a,metalness:.6,roughness:.5});const list=[];const pc=[];
  sites.forEach(([x,z])=>{[[-14,-14],[14,-14],[-14,14],[14,14]].forEach(c=>list.push({x:x+c[0],y:10,z:z+c[1],w:3,h:30,d:3,c:0}));list.push({x,y:26,z,w:46,h:3,d:46,c:0});W.ramps.push({x,z:z-23,yaw:0,len:46,wid:46,h0:0,h1:27.6,kind:'box',rad:70});pad(W,x,28.2,z,12,0xffa13d);pc.push([x,z,34]);W.glowPts([[x+20,30,z+20,2]],0xff2d2d,14,.9)});
  boxes(W,list.filter(o=>o.h!==3),lm);boxes(W,list.filter(o=>o.h===3),lm,0,false);
  return{coinSpot:()=>{const p=pc[(W.rng()*pc.length)|0];return W.rng()<.5?[p[0]+W.rand(-60,60),p[1]+W.rand(-60,60),W.rand(15,60)]:[W.rand(100,2500),W.rand(100,2500),W.rand(10,60)]}}}});
MAPS['helis:alpine']=airMap({nm:'Alpine Peaks',pal:'alpine',sun:true,spawn:[1300,300,0],startAlt:0,cm:3,
 H:(x,z,n)=>{const r=n(x*.003,z*.003,5);const v=Math.pow(r,1.7)*420+n(x*.02,z*.02)*8;const t=sm(40,160,Math.hypot(x-1300,z-300));return v*t+25*(1-t)},roads:[],
 col:(x,z,h,sl,n)=>h>200?mix(hex(0xe8eef8),hex(0xc8d4e8),sl):sl>.55?hex(0x5a5460):mix(hex(0x2a5a40),hex(0x3a7050),n(x*.05,z*.05)),
 props:(W)=>{const pl=scatter(W,500,(x,z,y)=>({x,y,z,h:W.rand(10,20)}),(x,z)=>{const y=W.ground(x,z);return y>10&&y<110});pines(W,pl);pad(W,1300,W.ground(1300,300)+.5,300,14,0x35e6ff);
  return{coinSpot:()=>{const x=W.rand(100,2500),z=W.rand(100,2500);return[x,z,W.ground(x,z)+W.rand(12,50)]}}}});
MAPS['helis:caves']=airMap({nm:'Canyon Caves',pal:'sunset',sun:true,spawn:[200,1300,Math.PI/2],startAlt:0,cm:3,
 H:(x,z,n)=>{const cz=1300+Math.sin(x*.0035)*380,d=Math.abs(z-cz),w=110+Math.sin(x*.01)*25;return sm(w,w+40,d)*(150+n(x*.01,z*.01)*110)+n(x*.04,z*.04)*5},roads:[],
 col:(x,z,h,sl,n)=>mix(hex(0xb04a2a),hex(0x6a2a22),Math.min(1,sl*1.4+n(x*.06,z*.06)*.5)),
 props:(W)=>{const T=W.T;const cz=x=>1300+Math.sin(x*.0035)*380;pad(W,200,W.ground(200,cz(200))+.5,cz(200),14,0xffc83d);
  const bm=new T.MeshStandardMaterial({color:0x6a4a2a,roughness:1});const pcs=[];
  for(let k=0;k<5;k++){const x=500+k*450,z=cz(x),y=W.ground(x,z)+30;const b=new T.Mesh(new T.BoxGeometry(3,.4,260),bm);b.position.set(x,y,z);W.scene.add(b);W.glowPts([[x,y+2,z-120,1],[x,y+2,z+120,1],[x,y+2,z,1]],0xffc83d,16,.9);
   W.addCol({x:x,z:z-100,r:1.5,top:y+3});W.addCol({x:x,z:z+100,r:1.5,top:y+3})}
  return{coinSpot:()=>{const x=W.rand(100,2500);return[x,cz(x)+W.rand(-90,90),W.ground(x,cz(x))+W.rand(12,45)]}}}});
