/* 09X Glass: open-world engine for round 2 (terrain, roads, water, ramps, props, vehicles of every category) */
import {buildVehicle,loadCar,createKit} from './vehicles.js?v=13';
import {MAPS,makeNoise} from './maps.js?v=13';
import {CATS} from './catalog.js?v=13';
import {boatKind,planeKind,heliKind} from './kinds.js?v=13';

const PALS={
night:{stops:['#02010a','#0b0730','#2a0f5c','#9d2b86','#ff6fb0','#2a0e45','#07030f'],stars:1300,starY:470,fog:0x1a0d3a,fogD:.0034,hemi:[0x7f8fff,0x1b0b30,.7],dla:[0xff4fb0,2.4],dlb:[0x35e6ff,2.2],dlc:[0xffe0b0,.7],moon:1},
dusk:{stops:['#120b24','#3a1554','#7a2b63','#ff8a3d','#ffcf7a','#40204a','#14081c'],stars:420,starY:420,fog:0x2a1330,fogD:.0028,hemi:[0xffb27a,0x241030,1.1],dla:[0xff8a50,1.8],dlb:[0xff6fb0,1.2],dlc:[0xffd2a0,1.0]},
sunset:{stops:['#1a1024','#3d1740','#8a2f52','#e8622d','#ffc46b','#5a2a40','#180c18'],stars:120,starY:300,fog:0x35202a,fogD:.0024,hemi:[0xffb27a,0x301624,1.2],dla:[0xff9a50,1.9],dlb:[0xff5a70,1.0],dlc:[0xffcf9a,1.0]},
dawn:{stops:['#0d1224','#25304e','#6a5a86','#e89a8a','#ffd9b0','#3a3a5a','#101428'],stars:180,starY:420,fog:0x3a3450,fogD:.0022,hemi:[0xffd0b0,0x202436,1.3],dla:[0xffc090,1.6],dlb:[0x8fb0ff,.9],dlc:[0xffe2c0,1.1]},
day:{stops:['#2f6fb2','#5f9fd4','#9ccbe8','#cfe8f2','#f4e8c8','#9fc4d8','#6d9dbb'],stars:0,starY:470,fog:0x9db8c8,fogD:.0018,hemi:[0xcfe8ff,0x4a5a6a,1.6],dla:[0xfff2d8,1.5],dlb:[0xbfd8ff,.8],dlc:[0xfff2d8,1.1]},
storm:{stops:['#05060c','#10131f','#1c2233','#2a3248','#3c4660','#1a2030','#07080e'],stars:0,starY:470,fog:0x141a28,fogD:.0042,hemi:[0x7a8aa8,0x10141e,.9],dla:[0x8aa0d0,1.2],dlb:[0x6a7ab0,.9],dlc:[0xaab8d8,.5]},
alpine:{stops:['#1b1236','#4a2160','#a0386c','#ff8a6a','#ffd0a0','#5a3a60','#1a1230'],stars:300,starY:360,fog:0x4a3a68,fogD:.0016,hemi:[0xffc0b0,0x2a2048,1.3],dla:[0xffa070,1.8],dlb:[0x9fb0ff,1.0],dlc:[0xffe0c0,1.0]}
};
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};

export async function createWorld(THREE,host,mode0,FX,ctx){
 const T=THREE;const {cfg,store,$,P,KEYS,toast,tilt,recalTilt,isOri,X}=ctx;const {cat,tier,map}=ctx.opts;
 const CAT=CATS[cat],VEH=CAT.vehicles[tier],PH=VEH.phys;const DEF=MAPS[cat+':'+map];
 const low=!!cfg.low;
 let seed=77777+(cat.charCodeAt(0)*131)+map.length*17;const rng=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const rand=(a,b)=>a+rng()*(b-a);
 const disposables=[];const track=o=>{disposables.push(o);return o};
 const R=new T.WebGLRenderer({antialias:!FX,powerPreference:'high-performance',stencil:false});
 const prMax=Math.min(window.devicePixelRatio||1,low?1:2);let pr=prMax;
 R.setPixelRatio(pr);R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=DEF.exposure||1.05;R.setSize(host.clientWidth,host.clientHeight);host.appendChild(R.domElement);
 const scene=new T.Scene();
 const PAL=Object.assign({},PALS[DEF.pal]||PALS.night,DEF.palO||{});
 const FOGC=new T.Color(PAL.fog);scene.fog=new T.FogExp2(FOGC,DEF.fogD||PAL.fogD);scene.background=FOGC.clone();
 const SIZE=DEF.size,HALF=SIZE/2;
 const cam=new T.PerspectiveCamera(62,host.clientWidth/host.clientHeight,.3,DEF.far||1800);
 const mk=(w,h)=>{const e=document.createElement('canvas');e.width=w;e.height=h;return e};
 const glowTex=(()=>{const c=mk(128,128),x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.18,'rgba(255,255,255,.55)');g.addColorStop(.5,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return track(t)})();
 const noise=makeNoise(9001+tier);

 /* ---------- sky ---------- */
 const sky=(()=>{const c=mk(2048,1024),x=c.getContext('2d');
  const gr=x.createLinearGradient(0,0,0,1024);PAL.stops.forEach((s,i)=>gr.addColorStop([0,.3,.42,.48,.505,.52,1][i],s));x.fillStyle=gr;x.fillRect(0,0,2048,1024);
  for(let n=0;n<PAL.stars;n++){const px=rng()*2048,py=rng()*PAL.starY,r=rng()*1.5+.3;x.globalAlpha=.2+rng()*.8;x.fillStyle=rng()<.2?'#ffd6f5':'#dbe8ff';x.beginPath();x.arc(px,py,r,0,7);x.fill()}
  x.globalAlpha=1;
  const cl=DEF.clouds||[0,0];
  for(let n=0;n<(cl[0]||26);n++){const px=rng()*2048,py=300+rng()*160,w=160+rng()*320,g2=x.createRadialGradient(px,py,0,px,py,w);g2.addColorStop(0,DEF.pal==='storm'?'rgba(10,12,22,.8)':(DEF.pal==='day'?'rgba(255,255,255,.3)':'rgba(220,120,200,.16)'));g2.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g2;x.fillRect(px-w,py-w*.35,w*2,w*.7)}
  if(PAL.moon){const px=1500,py=250,r=60,gl=x.createRadialGradient(px,py,r*.6,px,py,r*3);gl.addColorStop(0,'rgba(255,160,230,.55)');gl.addColorStop(1,'rgba(255,160,230,0)');x.fillStyle=gl;x.fillRect(px-r*3,py-r*3,r*6,r*6);const mg=x.createRadialGradient(px-r*.3,py-r*.3,r*.1,px,py,r);mg.addColorStop(0,'#fff4fb');mg.addColorStop(1,'#d77fc2');x.fillStyle=mg;x.beginPath();x.arc(px,py,r,0,7);x.fill()}
  if(DEF.sun){const px=1100,py=478,r=70,gl=x.createRadialGradient(px,py,r*.4,px,py,r*4);gl.addColorStop(0,'rgba(255,200,120,.9)');gl.addColorStop(1,'rgba(255,120,60,0)');x.fillStyle=gl;x.fillRect(px-r*4,py-r*4,r*8,r*8);x.fillStyle='#fff0c8';x.beginPath();x.arc(px,py,r*.7,0,7);x.fill()}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;track(t);
  const m=new T.Mesh(new T.SphereGeometry(1400,48,24),new T.MeshBasicMaterial({map:t,side:T.BackSide,fog:false,depthWrite:false,toneMapped:false}));m.renderOrder=-10;m.frustumCulled=false;return m})();
 scene.add(sky);
 /* ---------- environment reflections ---------- */
 {const pm=new T.PMREMGenerator(R);const es=new T.Scene();es.add(sky.clone());
  const lit=(col,k)=>new T.MeshBasicMaterial({color:new T.Color(col).multiplyScalar(k),side:T.DoubleSide,fog:false});
  const panel=(col,k,w,h,px,py,pz)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),lit(col,k));m.position.set(px,py,pz);m.lookAt(0,0,0);es.add(m)};
  const E=DEF.envCols||[0xff3da8,0x2de2ff,0xffa13d,0x8a5cff];
  panel(E[0],8,260,90,-300,60,120);panel(E[1],8,260,90,300,50,-90);panel(E[2],5,200,60,60,40,300);panel(E[3],6,220,80,-80,50,-300);panel(0xffffff,2.4,300,300,0,320,0);
  for(let n=0;n<30;n++){const a=n/30*Math.PI*2,r=300+rng()*60,cols=[0x2de2ff,0xff3da8,0x8a5cff,0xffa13d,0xffffff];panel(cols[(rng()*5)|0],3+rng()*4,8+rng()*14,20+rng()*60,Math.cos(a)*r,10+rng()*40,Math.sin(a)*r)}
  const gd=new T.Mesh(new T.CircleGeometry(900,32),new T.MeshBasicMaterial({color:0x07040f}));gd.rotation.x=-Math.PI/2;gd.position.y=-8;es.add(gd);
  scene.environment=pm.fromScene(es,.02).texture;pm.dispose()}
 scene.add(new T.HemisphereLight(PAL.hemi[0],PAL.hemi[1],PAL.hemi[2]));
 const dlA=new T.DirectionalLight(PAL.dla[0],PAL.dla[1]);dlA.position.set(-60,50,-80);scene.add(dlA);
 const dlB=new T.DirectionalLight(PAL.dlb[0],PAL.dlb[1]);dlB.position.set(70,40,-60);scene.add(dlB);
 const dlC=new T.DirectionalLight(PAL.dlc[0],PAL.dlc[1]);dlC.position.set(0,80,90);scene.add(dlC);

 /* ---------- roads (spline samples + spatial hash) ---------- */
 const roads=[];const RH=new Map();const RC=40;
 const catmull=(p,t)=>{const n=p.length,i=Math.floor(t),f=t-i,g=k=>p[(i+k+n*4)%n];const a=g(-1),b=g(0),c=g(1),d=g(2);return[0,1,2].map(k=>.5*((2*b[k])+(-a[k]+c[k])*f+(2*a[k]-5*b[k]+4*c[k]-d[k])*f*f+(-a[k]+3*b[k]-3*c[k]+d[k])*f*f*f))};
 (DEF.roads||[]).forEach(rd=>{const pts=rd.pts.map(p=>[p[0],p[1],rd.auto?DEF.H(p[0],p[1],noise)+.2:(p[2]||0)]),n=pts.length,closed=!!rd.closed;const segs=closed?n:n-1,sm=[];
  const pp=closed?pts:[pts[0],...pts,pts[n-1]];
  for(let s=0;s<segs;s++){const a=pts[s%n],b=pts[(s+1)%n];const len=Math.hypot(b[0]-a[0],b[1]-a[1]);const steps=Math.max(2,Math.ceil(len/5));
   for(let k=0;k<steps;k++){const t=k/steps;sm.push(closed?catmull(pts,s+t):catmull(pp,s+1+t))}}
  if(!closed)sm.push(pts[n-1].slice());
  const r={pts:sm,w:rd.w||14,closed,glow:rd.glow,lane:rd.lane!==false,dirt:rd.dirt};roads.push(r);
  sm.forEach((q,i)=>{const key=Math.floor(q[0]/RC)+','+Math.floor(q[2===undefined?1:1]/RC);let a=RH.get(key);if(!a){a=[];RH.set(key,a)}a.push([q[0],q[1],q[2],r.w,roads.length-1,i])})});
 const roadNear=(x,z)=>{if(!roads.length)return null;const cx=Math.floor(x/RC),cz=Math.floor(z/RC);let best=null,bd=1e9;
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=RH.get((cx+i)+','+(cz+j));if(!a)continue;for(const q of a){const dx=x-q[0],dz=z-q[1],d=dx*dx+dz*dz;if(d<bd){bd=d;best=q}}}
  return best?{d:Math.sqrt(bd),y:best[2],w:best[3],ri:best[4],i:best[5]}:null};
 const Hn=DEF.H;
 const ground=(x,z)=>{let h=Hn(x,z,noise);const r=roadNear(x,z);if(r){const hw=r.w/2;const t=1-smooth(hw+1.5,hw+(DEF.roadBlend||14),r.d);if(t>0)h+=(r.y-h)*t}return h};
 /* ---------- ramps / platforms / pipes ---------- */
 const ramps=[];
 const rampTop=(r,x,z)=>{const dx=x-r.x,dz=z-r.z,c=Math.cos(r.yaw),s=Math.sin(r.yaw);const u=dx*s+dz*c,v=dx*c-dz*s; // u along heading
  if(u<-.01||u>r.len||Math.abs(v)>r.wid/2)return null;
  if(r.kind==='pipe'){const R2=r.wid/2,vv=Math.min(.999,Math.abs(v)/R2);return r.h0+R2*(1-Math.sqrt(1-vv*vv))*(r.depth||1)}
  if(r.kind==='box')return r.h1;
  return r.h0+(r.h1-r.h0)*u/r.len};
 const surf=(x,z,y)=>{let h=ground(x,z);for(let i=0;i<ramps.length;i++){const r=ramps[i];if(Math.abs(x-r.x)>r.rad||Math.abs(z-r.z)>r.rad)continue;const t=rampTop(r,x,z);if(t!==null&&t>h&&t<=y+1.4)h=t}return h};
 /* ---------- colliders ---------- */
 const COLH=new Map(),CC=30;
 const addCol=c=>{const r=c.rad||Math.max(c.r||0,Math.hypot(c.hx||0,c.hz||0));c.rad=r;const x0=Math.floor((c.x-r)/CC),x1=Math.floor((c.x+r)/CC),z0=Math.floor((c.z-r)/CC),z1=Math.floor((c.z+r)/CC);
  for(let i=x0;i<=x1;i++)for(let j=z0;j<=z1;j++){const k=i+','+j;let a=COLH.get(k);if(!a){a=[];COLH.set(k,a)}a.push(c)}};

 /* ---------- world helper object handed to map defs ---------- */
 const upd=[];const W={store,toast,T,scene,rng,rand,noise,mk,glowTex,track,ground,roadNear,roads,ramps,addCol,upd,low,PAL,SIZE,HALF,smooth,cfg,cat,tier,kit:createKit(T),host,R};
 const K=W.kit,M=K.M;
 W.inst=(geo,mat,list,opts={})=>{const im=new T.InstancedMesh(geo,mat,list.length);const d=new T.Object3D(),c=new T.Color();
  list.forEach((o,n)=>{d.position.set(o.x,o.y||0,o.z);d.rotation.set(o.rx||0,o.ry||0,o.rz||0);d.scale.set(o.sx||o.s||1,o.sy||o.s||1,o.sz||o.s||1);d.updateMatrix();im.setMatrixAt(n,d.matrix);if(o.c!==undefined){c.set(o.c);im.setColorAt(n,c)}});
  im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;scene.add(im);track(geo);return im};
 W.glowPts=(pts,col,size,op=.8)=>{const g=new T.BufferGeometry();const p=[],cc=[];const c=new T.Color(col);pts.forEach(q=>{p.push(q[0],q[1],q[2]);const k=q[3]||1;cc.push(c.r*k,c.g*k,c.b*k)});
  g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('color',new T.Float32BufferAttribute(cc,3));
  const m=new T.Points(g,new T.PointsMaterial({map:glowTex,size,vertexColors:true,transparent:true,opacity:op,depthWrite:false,blending:T.AdditiveBlending}));m.frustumCulled=false;scene.add(m);return m};
 const chev=(()=>{const c=mk(128,256),x=c.getContext('2d');x.fillStyle='#1a1630';x.fillRect(0,0,128,256);x.fillStyle='#ff3da8';x.strokeStyle='#ff3da8';x.lineWidth=18;x.lineCap='round';for(let k=0;k<3;k++){x.beginPath();x.moveTo(20,200-k*70);x.lineTo(64,150-k*70);x.lineTo(108,200-k*70);x.stroke()}x.strokeStyle='#35e6ff';x.lineWidth=6;x.strokeRect(3,3,122,250);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return track(t)})();
 W.addRamp=(x,z,yaw,len,wid,h0,h1,kind='ramp',opt={})=>{const r={x,z,yaw,len,wid,h0,h1,kind,rad:Math.hypot(len,wid)+2,depth:opt.depth};ramps.push(r);
  const g=new T.Group();g.position.set(x,0,z);g.rotation.y=yaw;scene.add(g);
  const mat=new T.MeshStandardMaterial({map:opt.tex||chev,roughness:.55,metalness:.4,emissive:0x221030,emissiveIntensity:.6,side:T.DoubleSide,envMapIntensity:1.2});
  if(kind==='ramp'){const geo=new T.BufferGeometry();const hw=wid/2;
   const base=(l)=>ground(x+Math.sin(yaw)*l,z+Math.cos(yaw)*l);
   const A=[[-hw,h0,0],[hw,h0,0],[hw,h1,len],[-hw,h1,len]];const by=Math.min(base(0),base(len))-1.5;
   const pos=[],uv=[],idx=[];const push=(p,u,v)=>{pos.push(p[0],p[1],p[2]);uv.push(u,v)};
   push(A[0],0,0);push(A[1],1,0);push(A[2],1,1);push(A[3],0,1);idx.push(0,2,1,0,3,2);
   // sides
   [[-hw,0],[hw,1]].forEach(([sx])=>{const o=pos.length/3;push([sx,by,0],0,0);push([sx,by,len],1,0);push([sx,h1,len],1,1);push([sx,h0,0],0,1);idx.push(o,o+1,o+2,o,o+2,o+3)});
   const o2=pos.length/3;push([-hw,by,len],0,0);push([hw,by,len],1,0);push([hw,h1,len],1,1);push([-hw,h1,len],0,1);idx.push(o2,o2+1,o2+2,o2,o2+2,o2+3);
   geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();g.add(new T.Mesh(geo,mat));
   K.neonStrip(.25,.25,Math.hypot(len,h1-h0),opt.col||0x35e6ff,-hw,(h0+h1)/2+.1,len/2,g,3.5).rotation.x=-Math.atan2(h1-h0,len);
   K.neonStrip(.25,.25,Math.hypot(len,h1-h0),opt.col||0x35e6ff,hw,(h0+h1)/2+.1,len/2,g,3.5).rotation.x=-Math.atan2(h1-h0,len)}
  else if(kind==='box'){const bx=K.box(wid,h1-Math.min(ground(x,z),h1-1)+.4,len,mat,0,(h1+Math.min(ground(x,z),h1-1)-.4)/2,len/2,g);K.neonStrip(wid,.2,.2,opt.col||0x35e6ff,0,h1,0,g,3.5);K.neonStrip(wid,.2,.2,opt.col||0x35e6ff,0,h1,len,g,3.5)}
  else if(kind==='pipe'){const NS=14,NL=10,pos=[],idx=[],uv=[];const R2=wid/2;for(let i=0;i<=NL;i++)for(let j=0;j<=NS;j++){const v=-R2+2*R2*j/NS,vv=Math.min(.999,Math.abs(v)/R2);pos.push(v,h0+R2*(1-Math.sqrt(1-vv*vv))*(opt.depth||1),len*i/NL);uv.push(j/NS,i/NL*3)}
   for(let i=0;i<NL;i++)for(let j=0;j<NS;j++){const a=i*(NS+1)+j,b=a+1,c=a+NS+1,d=c+1;idx.push(a,c,b,b,c,d)}
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
   mat.map=opt.tex||null;mat.color=new T.Color(0x6a5a8a);g.add(new T.Mesh(geo,mat));K.neonStrip(.3,.3,len,opt.col||0xff3da8,-R2,h0+R2*(opt.depth||1),len/2,g,3.5);K.neonStrip(.3,.3,len,opt.col||0xff3da8,R2,h0+R2*(opt.depth||1),len/2,g,3.5)}
  return r};

 /* ---------- terrain ---------- */
 {const NG=Math.min(low?220:320,Math.round(SIZE/(DEF.cell||8)));const geo=new T.PlaneGeometry(SIZE,SIZE,NG,NG);geo.rotateX(-Math.PI/2);
  const pos=geo.attributes.position,col=new Float32Array(pos.count*3);const colF=DEF.col||(()=>[.3,.3,.3]);
  for(let i=0;i<pos.count;i++){const x=pos.getX(i)+HALF,z=pos.getZ(i)+HALF,h=ground(x,z);pos.setY(i,h);const e=3,sl=Math.min(1,Math.abs(ground(x+e,z)-ground(x-e,z))/(2*e)+Math.abs(ground(x,z+e)-ground(x,z-e))/(2*e));const c=colF(x,z,h,sl,noise,roadNear(x,z));col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2]}
  geo.setAttribute('color',new T.BufferAttribute(col,3));geo.computeVertexNormals();
  const gt=(()=>{const c=mk(256,256),x=c.getContext('2d'),id=x.createImageData(256,256);for(let i=0;i<256*256;i++){const v=170+rng()*85;id.data[i*4]=id.data[i*4+1]=id.data[i*4+2]=v;id.data[i*4+3]=255}x.putImageData(id,0,0);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(SIZE/6,SIZE/6);t.colorSpace=T.SRGBColorSpace;return track(t)})();
  const tm=new T.MeshStandardMaterial({vertexColors:true,map:gt,roughness:DEF.rough||.9,metalness:DEF.metal||0,envMapIntensity:.7});
  const tmesh=new T.Mesh(geo,tm);tmesh.position.set(HALF,0,HALF);scene.add(tmesh);track(geo);W.terrain=tmesh}
 /* ---------- road ribbons ---------- */
 {const asph=(()=>{const c=mk(256,512),x=c.getContext('2d');x.fillStyle='#1c1d26';x.fillRect(0,0,256,512);for(let n=0;n<9000;n++){const v=18+rng()*40|0;x.fillStyle='rgba('+v+','+v+','+(v+8)+',.5)';x.fillRect(rng()*256,rng()*512,1+rng()*2,1+rng()*2)}
   x.fillStyle='#d9a521';x.fillRect(125,0,3,512);x.fillRect(130,0,3,512);x.fillStyle='#d7dae3';for(let k=0;k<8;k++){x.fillRect(60,k*64+8,4,32);x.fillRect(192,k*64+8,4,32)}x.fillRect(8,0,5,512);x.fillRect(243,0,5,512);
   const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return track(t)})();
  const dirtT=(()=>{const c=mk(128,128),x=c.getContext('2d');x.fillStyle='#4a3626';x.fillRect(0,0,128,128);for(let n=0;n<2000;n++){x.fillStyle='rgba(20,10,5,'+rng()*.4+')';x.fillRect(rng()*128,rng()*128,2,2)}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;return track(t)})();
  roads.forEach(r=>{const pts=r.pts,n=pts.length,pos=[],uv=[],idx=[],ep=[],hw=r.w/2;let dist=0;
   for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],pr=pts[(i-1+n)%n];const nxt=r.closed||i<n-1?b:a,prv=r.closed||i>0?pr:a;let tx=nxt[0]-prv[0],tz=nxt[1]-prv[1];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;const nx=-tz,nz=tx;
    const y0=ground(a[0]+nx*hw,a[1]+nz*hw),y1=ground(a[0]-nx*hw,a[1]-nz*hw),ym=a[2];
    pos.push(a[0]+nx*hw,ym+.07,a[1]+nz*hw,a[0]-nx*hw,ym+.07,a[1]-nz*hw);uv.push(0,dist/30,1,dist/30);
    if(r.glow){for(const s of [1,-1]){const e=hw+.15;ep.push(a[0]+nx*e*s,ym+.45,a[1]+nz*e*s)}}
    if(i<n-1||r.closed){const j=(i+1)%n;if(i<n-1||r.closed){const A=i*2,B=A+1,C=j*2,D=j*2+1;idx.push(A,C,B,B,C,D)}}
    dist+=Math.hypot(b[0]-a[0],b[1]-a[1])}
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
   const mat=new T.MeshStandardMaterial({map:r.dirt?dirtT:asph,roughness:r.dirt?.95:.38,metalness:r.dirt?0:.35,envMapIntensity:r.dirt?.3:1.4});if(r.dirt)mat.map.repeat.set(1,1);
   const rm=new T.Mesh(geo,mat);rm.receiveShadow=false;scene.add(rm);track(geo);
   if(r.glow){const sub=new T.BufferGeometry();const L=[],Rr=[];for(let i=0;i<ep.length;i+=6){L.push([ep[i],ep[i+1],ep[i+2]]);Rr.push([ep[i+3],ep[i+4],ep[i+5]])}
    W.glowPts(L.filter((_,k)=>k%3===0).map(p=>[p[0],p[1],p[2],1]),r.glow[0],7,.75);W.glowPts(Rr.filter((_,k)=>k%3===0).map(p=>[p[0],p[1],p[2],1]),r.glow[1]||r.glow[0],7,.75)}})}
 /* ---------- water ---------- */
 let waterM=null;const WL=DEF.water;
 if(WL!==undefined&&WL!==null){const wg=new T.PlaneGeometry(SIZE*1.6,SIZE*1.6,1,1);wg.rotateX(-Math.PI/2);
  const wu={time:{value:0},deep:{value:new T.Color(DEF.waterDeep||0x061230)},shal:{value:new T.Color(DEF.waterShallow||0x0e4a78)},fogCol:{value:FOGC},fogD:{value:scene.fog.density},sunCol:{value:new T.Color(DEF.waterGlint||0xff5fc0)},amp:{value:DEF.waveAmp||0},foam:{value:DEF.foam||.3}};
  waterM=new T.Mesh(wg,new T.ShaderMaterial({uniforms:wu,transparent:true,depthWrite:false,vertexShader:`varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
   fragmentShader:`uniform float time;uniform vec3 deep;uniform vec3 shal;uniform vec3 fogCol;uniform float fogD;uniform vec3 sunCol;uniform float amp;uniform float foam;varying vec3 vW;
    float h(vec2 p){return sin(p.x*.8+time*1.3)*.5+sin(p.y*1.1-time*1.7)*.5+sin((p.x+p.y)*.45+time*.9)*.7+sin((p.x-p.y)*1.9-time*2.3)*.25;}
    void main(){vec2 p=vW.xz*.18;float e=.04;float c=h(p);vec3 n=normalize(vec3(-(h(p+vec2(e,0.))-c)/e*(.22+amp*.05),1.,-(h(p+vec2(0.,e))-c)/e*(.22+amp*.05)));
     vec3 V=normalize(cameraPosition-vW);float fr=pow(1.-clamp(dot(n,V),0.,1.),3.);vec3 R=reflect(-V,n);
     vec3 col=mix(deep,shal,.35+.25*c);col+=sunCol*pow(max(dot(R,normalize(vec3(.2,.3,-.9))),0.),24.)*1.4;col+=sunCol*fr*.55;
     float fm=smoothstep(1.35,1.9,c+amp*.15)*foam;col=mix(col,vec3(.9,.95,1.),fm*.55);
     float dc=length(cameraPosition-vW);float ff=1.-exp(-fogD*fogD*dc*dc);col=mix(col,fogCol,clamp(ff,0.,1.));
     gl_FragColor=vec4(col,.93);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>}`}));
  waterM.position.set(HALF,WL,HALF);scene.add(waterM);W.water=waterM;W.waterU=wu}
 W.waveH=(x,z,t)=>{if(WL===undefined||WL===null)return -999;const p0=x*.18,p1=z*.18;const hh=(a,b)=>Math.sin(a*.8+t*1.3)*.5+Math.sin(b*1.1-t*1.7)*.5+Math.sin((a+b)*.45+t*.9)*.7+Math.sin((a-b)*1.9-t*2.3)*.25;return WL+hh(p0,p1)*(DEF.waveAmp||0)*.35};

 /* ---------- map props ---------- */
 const mapOut=DEF.props?DEF.props(W)||{}:{};

 /* ---------- vehicle ---------- */
 const car=new T.Group();car.rotation.order='YXZ';scene.add(car);const body=new T.Group();body.rotation.order='YXZ';car.add(body);
 let model,wheels=[],fronts=[],pivots=[];
 if(cat==='cars'){model=await loadCar(T,X,tier);wheels=model.userData.wheels;fronts=model.userData.fronts}
 else{model=buildVehicle(T,cat,tier);
  (model.userData.wheels||[]).forEach(w=>{if(w.userData.front){const pv=new T.Group();pv.position.copy(w.position);w.position.set(0,0,0);w.parent.add(pv);pv.add(w);fronts.push(pv)}wheels.push(w)})}
 body.add(model);
 const VK=model.userData.K||K;
 const VLEN=model.userData.len||5;
 const glowSpr=(c,k,w,h)=>{const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:new T.Color(c).multiplyScalar(k),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));s.scale.set(w,h,1);return s};
 const KIND=({cars:'ground',trucks:'ground',boats:'boat',planes:'plane',helis:'heli'})[cat];
 let under=null,shadow=null;
 if(KIND==='ground'||KIND==='boat'){under=new T.Mesh(track(new T.PlaneGeometry(Math.max(5.4,VLEN*.75),VLEN*1.5)),track(new T.MeshBasicMaterial({map:glowTex,color:new T.Color(KIND==='boat'?0x35e6ff:0xff2d8a).multiplyScalar(1.6),transparent:true,opacity:.65,depthWrite:false,blending:T.AdditiveBlending})));under.rotation.x=-Math.PI/2;body.add(under);under.position.y=.12}
 shadow=new T.Mesh(track(new T.PlaneGeometry(VLEN*.8,VLEN*1.3)),track(new T.MeshBasicMaterial({map:(()=>{const c=mk(128,256),x=c.getContext('2d'),g=x.createRadialGradient(64,128,8,64,128,120);g.addColorStop(0,'rgba(0,0,0,.95)');g.addColorStop(.6,'rgba(0,0,0,.45)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,256);return track(new T.CanvasTexture(c))})(),transparent:true,depthWrite:false})));shadow.rotation.x=-Math.PI/2;scene.add(shadow);
 const hls=[];if(KIND==='ground'&&!(DEF.pal==='day')){[-.7,.7].forEach(x=>{const s=new T.SpotLight(0xfff0d8,320,90,.5,.8,1.6);s.position.set(x,.9,VLEN*.4);const tg=new T.Object3D();tg.position.set(x*.5,.2,VLEN*.4+24);body.add(tg);s.target=tg;body.add(s);hls.push(s)})}
 /* smoke / spray */
 const NS=160,smP=new Float32Array(NS*3),smA=new Float32Array(NS).fill(1),smV=[];for(let n=0;n<NS;n++)smV.push([0,0,0]);let smI=0;
 const smCol=KIND==='boat'?[.85,.95,1.]:(DEF.dirt?[.45,.33,.22]:[.55,.55,.62]);
 {const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(smP,3));g.setAttribute('age',new T.BufferAttribute(smA,1));
  const m=track(new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{map:{value:glowTex},scale:{value:host.clientHeight*pr/2},col:{value:new T.Vector3(...smCol)}},
   vertexShader:`attribute float age;uniform float scale;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(5.+age*20.)*scale/-mv.z*.4;vA=(1.-age)*step(age,.999);}`,
   fragmentShader:`uniform sampler2D map;uniform vec3 col;varying float vA;void main(){float a=texture2D(map,gl_PointCoord).a;gl_FragColor=vec4(col,a*vA*.5);}`}));
  const p=new T.Points(track(g),m);p.frustumCulled=false;scene.add(p);W.smokeG=g;W.smokeM=m}
 const emit=(x,y,z,vx,vy,vz)=>{const n=smI++%NS;smP[n*3]=x;smP[n*3+1]=y;smP[n*3+2]=z;smA[n]=0;smV[n]=[vx+rand(-.8,.8),vy+rand(.2,1.2),vz+rand(-.8,.8)]};

 /* ---------- coins / gems ---------- */
 const NC=low?120:200,NG=24,CM=DEF.cm||3;const dummy=new T.Object3D();
 const cg=track(new T.CylinderGeometry(1.15,1.15,.3,28));cg.rotateX(Math.PI/2);
 const coinM=new T.InstancedMesh(cg,track(new T.MeshStandardMaterial({color:0xffc83d,metalness:1,roughness:.2,emissive:0xff9a1a,emissiveIntensity:.6,envMapIntensity:2})),NC);
 const gemM=new T.InstancedMesh(track(new T.OctahedronGeometry(1.4)),track(new T.MeshPhysicalMaterial({color:0x35f0ff,metalness:.1,roughness:.05,emissive:0x12b8ff,emissiveIntensity:1.2,clearcoat:1,flatShading:true})),NG);
 coinM.frustumCulled=false;gemM.frustumCulled=false;scene.add(coinM,gemM);
 const spots=mapOut.coinSpot||(()=>{ // default: along roads, else random over land
  if(roads.length){const r=roads[(rng()*roads.length)|0],q=r.pts[(rng()*r.pts.length)|0];const off=(rng()-.5)*r.w*.6;return[q[0]+off,q[1],q[2]+1.9]}
  for(let k=0;k<30;k++){const x=rand(80,SIZE-80),z=rand(80,SIZE-80),h=ground(x,z);if(WL!==undefined&&WL!==null&&h<WL+1)continue;return[x,z,h+1.9]}return[SIZE/2,SIZE/2,2]});
 const coins=Array.from({length:NC},()=>spots()),gems=Array.from({length:NG},()=>spots());
 const pickPos=new Float32Array((NC+NG)*3),pickCol=new Float32Array((NC+NG)*3);for(let n=0;n<NC+NG;n++)pickCol.set(n<NC?[1,.72,.2]:[.2,.9,1],n*3);
 {const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pickPos,3));g.setAttribute('color',new T.BufferAttribute(pickCol,3));
  const p=new T.Points(track(g),track(new T.PointsMaterial({map:glowTex,size:7,vertexColors:true,transparent:true,opacity:.7,depthWrite:false,blending:T.AdditiveBlending})));p.frustumCulled=false;scene.add(p);W.pickG=g}

 /* ---------- state + input ---------- */
 const sp0=DEF.spawn||[SIZE/2,SIZE/2,0];
 const S={x:sp0[0],z:sp0[1],y:0,th:sp0[2]||0,sp:0,vx:0,vz:0,vy:0,air:false,t:0,pitch:0,roll:0,camYaw:sp0[2]||0,lookYaw:0,lookP:0,lookIdle:0,wr:0,steer:0,hit:0,pitchV:0,thr:0,
  yaw:sp0[2]||0,rollA:0,pitchA:0,alt:0,fuel:0,rotor:0};
 S.y=surf(S.x,S.z,50)+(KIND==='plane'||KIND==='heli'?0:0);
 const g={mode:mode0,started:false,paused:false};
 let holdL=new Set(),holdR=new Set(),raf=0,last=performance.now(),mmT=0,fcoin=store.get('coins',0),fgem=store.get('gems',0);
 const el={c:$('#hCoins'),g:$('#hGems'),s:$('#hSpd'),mm:$('#mm'),tip:$('#tip'),fl:$('#flash'),mode:$('#hMode')};
 let sc=-1,sg=-1,ss=-1;const hudCoins=()=>{if(sc!==fcoin||sg!==fgem){sc=fcoin;sg=fgem;el.c.textContent=fcoin;el.g.textContent=fgem}};
 g.setMode=m=>{g.mode=m;el.mode.textContent=(DEF.nm||'').toUpperCase()};g.setMode(mode0);
 const hold=e=>{if(e.target.closest&&e.target.closest('[data-nohold]'))return;const set=e.clientX<innerWidth/2?holdL:holdR;set.add(e.pointerId);e.preventDefault()};
 const rel=e=>{holdL.delete(e.pointerId);holdR.delete(e.pointerId)};
 host.addEventListener('pointerdown',hold);addEventListener('pointerup',rel);addEventListener('pointercancel',rel);
 const prevent=e=>e.preventDefault();host.addEventListener('touchmove',prevent,{passive:false});
 const gp=()=>P.pad;
 function inputs(){
  const p=gp();let st=0,py=0;const v=P.val||[];
  if(p){const ax=P.ax[0]||0,ay=P.ax[1]||0;if(Math.abs(ax)>.14)st=ax;if(Math.abs(ay)>.14)py=ay}
  if(!st&&cfg.tilt&&isOri()&&tilt.cur)st=tilt.steer;
  if(KEYS.ArrowLeft||KEYS.a)st=-1;if(KEYS.ArrowRight||KEYS.d)st=1;if(KEYS.ArrowUp||KEYS.w)py=-1;if(KEYS.ArrowDown||KEYS.s)py=1;
  const rt=p?(v[7]||0):((KEYS.e||KEYS.ArrowUp)?1:0),lt=p?(v[6]||0):(KEYS.q?1:0);
  const brake=holdL.size>0||lt>.1||KEYS[' '],drift=holdR.size>0||(p&&P.b[2])||KEYS.Shift;
  let lx=0,ly=0;if(p){const rx=P.ax[2]||0,ry=P.ax[3]||0;if(Math.abs(rx)>.16)lx=rx;if(Math.abs(ry)>.16)ly=ry}
  if(p&&P.b[3]&&!g.tri){g.recal();g.tri=true}if(p&&!P.b[3])g.tri=false;
  const yawIn=(p&&(P.b[5]?1:0)-(P.b[4]?1:0))||((KEYS.e?0:0));
  return{st:Math.max(-1,Math.min(1,st)),py,brake:!!brake,drift:!!drift,rt,lt,thr:p?rt:1,pad:!!p,lx,ly,yawIn,touchUp:holdR.size>0,touchDown:holdL.size>0};
 }
 const flash=()=>{el.fl.style.opacity=1;setTimeout(()=>el.fl.style.opacity=0,250)};
 let shake=0;
 /* collisions (ground) */
 function collide(r){
  const cx=Math.floor(S.x/CC),cz=Math.floor(S.z/CC);const seen=new Set();
  for(let i=cx-1;i<=cx+1;i++)for(let j=cz-1;j<=cz+1;j++){const a=COLH.get(i+','+j);if(!a)continue;for(const c of a){if(seen.has(c))continue;seen.add(c);
   if(S.y>=(c.top!==undefined?c.top:99)-.3)continue;if(c.y0!==undefined&&S.y<c.y0-1)continue;
   let nx,nz,pen;
   if(c.hx!==undefined){const dx=S.x-c.x,dz=S.z-c.z,cs=Math.cos(c.yaw||0),sn=Math.sin(c.yaw||0);const lx=dx*cs-dz*sn,lz=dx*sn+dz*cs;const qx=Math.max(-c.hx,Math.min(c.hx,lx)),qz=Math.max(-c.hz,Math.min(c.hz,lz));let ddx=lx-qx,ddz=lz-qz;let d=Math.hypot(ddx,ddz);
    if(d>=r)continue;if(d<1e-4){ddx=lx>0?1:-1;ddz=0;d=0}else{ddx/=d;ddz/=d}pen=r-d;nx=ddx*cs+ddz*sn;nz=-ddx*sn+ddz*cs}
   else{const dx=S.x-c.x,dz=S.z-c.z,d=Math.hypot(dx,dz),rr=r+c.r;if(d>=rr)continue;nx=d<1e-4?1:dx/d;nz=d<1e-4?0:dz/d;pen=rr-d}
   S.x+=nx*pen;S.z+=nz*pen;const vn=S.vx*nx+S.vz*nz;if(vn<0){S.vx-=1.5*vn*nx;S.vz-=1.5*vn*nz;if(Math.abs(S.sp)>16){S.hit=.5;flash();shake=.6}S.sp*=.6}}}
  const m=8;if(S.x<m){S.x=m;S.vx=Math.abs(S.vx)*.5}if(S.x>SIZE-m){S.x=SIZE-m;S.vx=-Math.abs(S.vx)*.5}if(S.z<m){S.z=m;S.vz=Math.abs(S.vz)*.5}if(S.z>SIZE-m){S.z=SIZE-m;S.vz=-Math.abs(S.vz)*.5}
 }
 const KINDS={};
 /* ===== ground vehicles (cars, trucks) ===== */
 KINDS.ground={
  step(dt,I){
   const wl=VLEN*.42,ww=1.1;
   const onG=!S.air;
   if(g.started){
    if(onG){
     const vmax=(I.drift?PH.vd:PH.vmax)*(I.pad?Math.max(.18,I.thr):1);
     if(I.brake){if(S.sp>.6)S.sp=Math.max(0,S.sp-PH.brk*dt);else if(I.pad)S.sp=Math.max(-16,S.sp-PH.acc*.7*dt);else S.sp=0}
     else if(S.sp<0)S.sp=Math.min(0,S.sp+40*dt);
     else if(I.pad&&I.thr===0)S.sp=Math.max(0,S.sp-11*dt);
     else if(S.sp<vmax)S.sp=Math.min(vmax,S.sp+PH.acc*(I.pad?Math.max(.35,I.thr):1)*dt);else S.sp=Math.max(vmax,S.sp-20*dt);
     if(I.drift&&S.sp>0)S.sp=Math.max(0,S.sp-5*dt);
     const as=Math.abs(S.sp),mass=PH.mass||1,rate=(cat==='trucks'?1.5:1.9)*(.35+.65*Math.min(1,as/22))/(1+as/(95*mass))*(I.drift?1.75:1);
     if(as>.8)S.th-=I.st*rate*dt*(S.sp<0?-1:1);
     S.sp-=9.8*Math.sin(S.pitch)*.5*dt; // uphill slows
    }
   }else S.sp=0;
   const nfx=Math.sin(S.th),nfz=Math.cos(S.th);
   if(onG){const grip=I.drift?PH.dgrip:PH.grip;const k=Math.min(1,grip*dt);S.vx+=(nfx*S.sp-S.vx)*k;S.vz+=(nfz*S.sp-S.vz)*k}
   const px=S.x,pz=S.z,py0=S.y;
   S.x+=S.vx*dt;S.z+=S.vz*dt;collide(VLEN*.32+.8);
   const hv=Math.hypot(S.vx,S.vz);
   if(onG&&S.sp>0){const real=hv;if(real<S.sp)S.sp=Math.max(real,S.sp*.97)}
   // vertical
   const gy=surf(S.x,S.z,S.y+.9);
   if(!S.air){const dy=gy-S.y;if(dy<-Math.max(.28,hv*dt*.75)){S.air=true;S.vy=Math.max(-3,Math.min(24,(S.y-S.py)/Math.max(dt,.001)))}else{S.vy=(gy-S.y)/Math.max(dt,.001);S.y=gy}}
   if(S.air){S.vy-=34*dt;S.y+=S.vy*dt;if(S.y<=gy){const imp=-S.vy;S.y=gy;S.air=false;S.vy=0;if(imp>16){S.sp*=.82;S.hit=.3;shake=Math.min(1,imp/40);flash()}else if(imp>6)shake=.25}}
   S.py=py0;
   // attitude from surface
   if(!S.air){const c=Math.cos(S.th),s=Math.sin(S.th),y0=S.y+.9;
    const hf=surf(S.x+s*wl,S.z+c*wl,y0),hb=surf(S.x-s*wl,S.z-c*wl,y0),hl=surf(S.x+c*ww*1.2,S.z-s*ww*1.2,y0),hr=surf(S.x-c*ww*1.2,S.z+s*ww*1.2,y0);
    const tp=Math.atan2(hf-hb,wl*2),tr=Math.atan2(hl-hr,ww*2.4);S.pitch+=(tp-S.pitch)*Math.min(1,dt*10);S.roll+=(tr-S.roll)*Math.min(1,dt*10)}
   else{const ta=Math.atan2(S.vy,Math.max(8,hv));S.pitch+=(ta-S.pitch)*Math.min(1,dt*1.6);S.roll*=1-Math.min(1,dt*2)}
   const rollT=I.st*Math.min(1,Math.abs(S.sp)/50)*.045*(I.drift?1.6:1),pitT=(I.brake&&S.sp>5?.03:0);
   S.rl2=(S.rl2||0)+(rollT-(S.rl2||0))*Math.min(1,dt*6);S.pt2=(S.pt2||0)+(pitT-(S.pt2||0))*Math.min(1,dt*6);
   const slip=I.drift&&S.sp>20?-I.st*.28:0;
   car.position.set(S.x,S.y,S.z);car.rotation.set(-S.pitch,S.th+slip,S.roll);body.rotation.set(-S.pt2,0,S.rl2);body.position.y=Math.sin(S.t*38)*.004*Math.min(1,Math.abs(S.sp)/40)*(S.air?0:1);
   const rr=wheels.length&&wheels[0].userData.r?wheels[0].userData.r:.4;S.wr-=S.sp*dt/rr;wheels.forEach(w=>w.rotation.x=S.wr);
   S.steer+=(-I.st*.5-S.steer)*Math.min(1,dt*10);fronts.forEach(f=>f.rotation.y=S.steer);
   if(!S.air&&Math.abs(S.sp)>14&&(DEF.dust||(I.drift&&S.sp>22)||(I.brake&&S.sp>30))){for(let q=0;q<2;q++){const sd=q?1:-1,cs=Math.cos(car.rotation.y),sn=Math.sin(car.rotation.y);emit(S.x-sn*VLEN*.42+cs*sd*.9,S.y+.3,S.z-cs*VLEN*.42-sn*sd*.9,S.vx*.2,.4,S.vz*.2)}}
   return{spd:Math.abs(S.sp)*2.4,vmax:PH.vmax,fovK:Math.min(1,Math.abs(S.sp)/PH.vmax),camD:VLEN*1.55+2.6,camH:VLEN*.28+1.8,ground:true,brake:I.brake}
  }};
 const kind=KINDS[KIND]||KINDS.ground;
 if(ctx.extraKinds)Object.assign(KINDS,ctx.extraKinds);
 const API={T,S,W,DEF,PH,VEH,model,body,car,wheels,fronts,surf,ground,emit,flash,glowSpr,K,M,VLEN,scene,cam,rand,rng,low,cat,tier,KIND,store,toast,get shake(){return shake},set shake(v){shake=v},collide,addCol,Hn};
 const impl=(WORLD_KINDS[KIND]?WORLD_KINDS[KIND](API):KINDS[KIND]);
 const kinds2=impl||KINDS.ground;

 /* ---------- post fx ---------- */
 let comp=null;
 if(FX){try{const w=host.clientWidth,h=host.clientHeight;const rt=new T.WebGLRenderTarget(w*pr,h*pr,{type:T.HalfFloatType,samples:4});
  comp=new FX.EffectComposer(R,rt);comp.setPixelRatio(pr);comp.setSize(w,h);comp.addPass(new FX.RenderPass(scene,cam));
  const bloom=new FX.UnrealBloomPass(new T.Vector2(w,h),DEF.bloom||.42,.65,1.0);comp.addPass(bloom);comp.addPass(new FX.OutputPass())}catch(e){console.warn('post off',e);comp=null}}
 const resize=()=>{R.setSize(host.clientWidth,host.clientHeight);if(comp)comp.setSize(host.clientWidth,host.clientHeight);cam.aspect=host.clientWidth/host.clientHeight;cam.updateProjectionMatrix();W.smokeM.uniforms.scale.value=host.clientHeight*pr/2};
 addEventListener('resize',resize);addEventListener('orientationchange',resize);
 g.recal=()=>{recalTilt();toast('Steering re-centered')};
 g.begin=()=>{if(g.started)return;g.started=true;S.started=true;$('#startov').classList.add('hidden');recalTilt();el.tip.style.opacity=1;el.tip.textContent=(CAT.hint&&CAT.hint(!!gp()))||'';setTimeout(()=>el.tip.style.opacity=0,8000)};
 g.setPaused=p=>{g.paused=p};g.cat=cat;g.hintText=()=>'';
 let lastI={};
 function step(dt){
  S.t+=dt;const I=inputs();lastI=I;
  const out=kinds2.step(dt,I);
  S.hit=Math.max(0,S.hit-dt);
  const px=S.x,pz=S.z,py=S.y;
  for(let n=0;n<NC;n++){const dx=S.x-coins[n][0],dz=S.z-coins[n][1],dy=S.y-(coins[n][2]||S.y);if(dx*dx+dz*dz<(KIND==='plane'?60:12)&&Math.abs(dy)<(KIND==='plane'||KIND==='heli'?14:6)){fcoin+=CM;coins[n]=spots();store.set('coins',fcoin)}}
  for(let n=0;n<NG;n++){const dx=S.x-gems[n][0],dz=S.z-gems[n][1],dy=S.y-(gems[n][2]||S.y);if(dx*dx+dz*dz<(KIND==='plane'?80:16)&&Math.abs(dy)<(KIND==='plane'||KIND==='heli'?14:6)){fgem++;fcoin+=Math.round(5*CM);gems[n]=spots();store.set('gems',fgem);store.set('coins',fcoin)}}
  for(let n=0;n<NC;n++){const c=coins[n],y=(c[2]||ground(c[0],c[1])+1.9)+Math.sin(S.t*2+n)*.2;dummy.position.set(c[0],y,c[1]);dummy.rotation.set(0,S.t*3+n,0);dummy.scale.setScalar(1);dummy.updateMatrix();coinM.setMatrixAt(n,dummy.matrix);pickPos[n*3]=c[0];pickPos[n*3+1]=y;pickPos[n*3+2]=c[1]}
  for(let n=0;n<NG;n++){const c=gems[n],y=(c[2]||ground(c[0],c[1])+2.2)+Math.sin(S.t*1.6+n)*.3;dummy.position.set(c[0],y,c[1]);dummy.rotation.set(S.t*.8,S.t*2+n,0);dummy.scale.setScalar(1);dummy.updateMatrix();gemM.setMatrixAt(n,dummy.matrix);pickPos[(NC+n)*3]=c[0];pickPos[(NC+n)*3+1]=y;pickPos[(NC+n)*3+2]=c[1]}
  coinM.instanceMatrix.needsUpdate=true;gemM.instanceMatrix.needsUpdate=true;W.pickG.attributes.position.needsUpdate=true;
  upd.forEach(f=>f(dt,S,W));
  // smoke
  for(let n=0;n<NS;n++){if(smA[n]<1){smA[n]+=dt*.7;smP[n*3]+=smV[n][0]*dt;smP[n*3+1]+=smV[n][1]*dt;smP[n*3+2]+=smV[n][2]*dt}}
  W.smokeG.attributes.position.needsUpdate=true;W.smokeG.attributes.age.needsUpdate=true;
  // shadow
  const gy=(KIND==='boat')?S.y:surf(S.x,S.z,S.y);shadow.position.set(S.x,gy+.06,S.z);shadow.rotation.z=-(S.th||0);const hh=Math.max(0,S.y-gy);shadow.material.opacity=Math.max(.1,1-hh/40);shadow.visible=KIND!=='boat';
  // camera
  let d=(out.camYawTarget!==undefined?out.camYawTarget:S.th)-S.camYaw;d=Math.atan2(Math.sin(d),Math.cos(d));S.camYaw+=d*Math.min(1,dt*(out.camRate||4.2));
  if(I.lx||I.ly){S.lookIdle=0;S.lookYaw=Math.max(-3.1,Math.min(3.1,S.lookYaw+I.lx*dt*2.8));S.lookP=Math.max(-.35,Math.min(1,S.lookP+I.ly*dt*1.6))}
  else{S.lookIdle+=dt;if(S.lookIdle>.7){const k=Math.min(1,dt*2.6);S.lookYaw*=1-k;S.lookP*=1-k}}
  const ey=S.camYaw+S.lookYaw,cx=Math.sin(ey),cz=Math.cos(ey),sp1=out.fovK||0;shake=Math.max(0,shake-dt*2);const sh=(sp1*.02+shake*.25);
  const cd=out.camD||9,ch=(out.camH||3.3)+sp1*.5+S.lookP*cd*.7;
  let camy=(out.camY!==undefined?out.camY:S.y)+ch;
  const camx=S.x-cx*(cd+sp1*1.6),camz=S.z-cz*(cd+sp1*1.6);
  const gC=surf(camx,camz,S.y+20);if(camy<gC+1.6)camy=gC+1.6;
  if(WL!==undefined&&WL!==null&&camy<WL+1.2)camy=WL+1.2;
  cam.position.set(camx+rand(-sh,sh),camy+rand(-sh,sh),camz+rand(-sh,sh));
  const k2=1-Math.abs(S.lookYaw)/3.2;
  cam.lookAt(S.x+Math.sin(S.camYaw)*10*k2+cx*2,(out.lookY!==undefined?out.lookY:S.y+1.5)+(out.lookDy||0),S.z+Math.cos(S.camYaw)*10*k2+cz*2);
  if(out.camRoll)cam.rotateZ(out.camRoll);
  const fov=(out.fov||60)+sp1*20+(lastI.drift?3:0);if(Math.abs(cam.fov-fov)>.2){cam.fov+=(fov-cam.fov)*Math.min(1,dt*3);cam.updateProjectionMatrix()}
  hudCoins();const spd=Math.round(out.spd||0);if(spd!==ss){ss=spd;el.s.textContent=spd}
  if(waterM){W.waterU.time.value=S.t;waterM.position.x=S.x;waterM.position.z=S.z}
  if(W.sunDir)0;
  S.spf=out;
 }
 function minimap(){
  const c=el.mm,x=c.getContext('2d'),w=c.width,rad=DEF.mmR||240,s=w/2/rad;x.clearRect(0,0,w,w);x.save();x.beginPath();x.arc(w/2,w/2,w/2-2,0,7);x.clip();
  x.fillStyle=WL!==undefined&&WL!==null?'rgba(6,30,70,.9)':'rgba(5,3,12,.88)';x.fillRect(0,0,w,w);x.translate(w/2,w/2);x.rotate(S.camYaw-Math.PI);
  if(DEF.mmLand&&WL!==undefined&&WL!==null){x.fillStyle='rgba(50,40,70,.9)';const stp=rad/10;for(let a=-rad;a<=rad;a+=stp)for(let b=-rad;b<=rad;b+=stp){const gx=S.x+a,gz=S.z+b;if(ground(gx,gz)>WL+.4){x.fillRect(a*s-1,b*s-1,stp*s+2,stp*s+2)}}}
  x.strokeStyle='#5a5f8c';x.lineWidth=Math.max(2,5*s*2);roads.forEach(r=>{x.beginPath();let on=false;r.pts.forEach(q=>{const dx=(q[0]-S.x)*s,dz=(q[1]-S.z)*s;if(dx*dx+dz*dz<w*w){if(!on){x.moveTo(dx,dz);on=true}else x.lineTo(dx,dz)}else on=false});x.stroke()});
  x.fillStyle='#ffc83d';coins.forEach(p=>{const dx=(p[0]-S.x)*s,dz=(p[1]-S.z)*s;if(dx*dx+dz*dz<w*w/4)x.fillRect(dx-2,dz-2,4,4)});
  x.fillStyle='#35f0ff';gems.forEach(p=>{const dx=(p[0]-S.x)*s,dz=(p[1]-S.z)*s;if(dx*dx+dz*dz<w*w/4)x.fillRect(dx-4,dz-4,8,8)});
  if(mapOut.mmDraw)mapOut.mmDraw(x,s,S,w);
  x.restore();x.fillStyle='#fff';x.beginPath();x.moveTo(w/2,w/2-14);x.lineTo(w/2+9,w/2+10);x.lineTo(w/2-9,w/2+10);x.closePath();x.fill();
 }
 let ema=1/60,adaptT=0;
 function setPR(p){pr=p;R.setPixelRatio(pr);if(comp)comp.setPixelRatio(pr);W.smokeM.uniforms.scale.value=host.clientHeight*pr/2}
 function frame(now){raf=requestAnimationFrame(frame);let dt=(now-last)/1000;last=now;if(dt>.1)dt=.1;ema+=(dt-ema)*.05;adaptT+=dt;
  if(!g.paused){step(dt);mmT+=dt;if(mmT>.08){mmT=0;minimap()}}
  sky.position.copy(cam.position);
  if(adaptT>2&&g.started){adaptT=0;if(ema>1/45&&pr>1.01)setPR(Math.max(1,pr-.25));else if(ema<1/58&&pr<prMax-.01)setPR(Math.min(prMax,pr+.25))}
  if(comp)comp.render(dt);else R.render(scene,cam)}
 step(0);last=performance.now();raf=requestAnimationFrame(frame);
 g.dispose=()=>{cancelAnimationFrame(raf);host.removeEventListener('pointerdown',hold);removeEventListener('pointerup',rel);removeEventListener('pointercancel',rel);host.removeEventListener('touchmove',prevent);removeEventListener('resize',resize);removeEventListener('orientationchange',resize);
  scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.material.dispose&&!o.material.map)try{o.material.dispose()}catch(e){}});disposables.forEach(d=>{try{d.dispose()}catch(e){}});
  try{if(comp){comp.dispose&&comp.dispose();comp.renderTarget1&&comp.renderTarget1.dispose();comp.renderTarget2&&comp.renderTarget2.dispose()}}catch(e){}R.dispose();try{R.forceContextLoss()}catch(e){}R.domElement.remove()};
 g.glb=!!model.userData.glb;g.debug={S,W,API,car,cam,ground,surf};
 return g;
}
const WORLD_KINDS={boat:boatKind,plane:planeKind,heli:heliKind};
export{WORLD_KINDS};
