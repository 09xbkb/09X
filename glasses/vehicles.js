/* 09X Glass: procedural vehicle models (trucks, boats, planes, helis) + shared car loader. Forward = +Z, up = +Y */
const GLB='https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/models/gltf/ferrari.glb';
const DRACO='https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/';

export function mats(T){
 const paint=(c,r=.32)=>new T.MeshPhysicalMaterial({color:c,metalness:.85,roughness:r,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1.9});
 const neon=(c,k=3)=>new T.MeshStandardMaterial({color:new T.Color(c).multiplyScalar(.25),emissive:c,emissiveIntensity:k,roughness:.3,metalness:.2});
 return{
  paint,neon,
  glass:new T.MeshPhysicalMaterial({color:0x14304e,metalness:.7,roughness:.04,clearcoat:1,envMapIntensity:3.2,emissive:0x0a2a44,emissiveIntensity:.6}),
  chrome:new T.MeshStandardMaterial({color:0xdfe4ef,metalness:1,roughness:.14,envMapIntensity:2.2}),
  dark:new T.MeshStandardMaterial({color:0x0c0d14,metalness:.7,roughness:.42,envMapIntensity:1}),
  metal:new T.MeshStandardMaterial({color:0x5b6070,metalness:.9,roughness:.35,envMapIntensity:1.6}),
  rubber:new T.MeshStandardMaterial({color:0x0b0b0e,roughness:.9,metalness:0,envMapIntensity:.3}),
  white:paint(0xf2f4f8,.28),
  head:new T.MeshStandardMaterial({color:0xffffff,emissive:0xfff2d6,emissiveIntensity:5,roughness:.1}),
  tail:new T.MeshStandardMaterial({color:0x300000,emissive:0xff1428,emissiveIntensity:3,roughness:.2}),
  amber:new T.MeshStandardMaterial({color:0x331100,emissive:0xff9a20,emissiveIntensity:3,roughness:.3})};
}

export function createKit(T){
 const M=mats(T);
 const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t})();
 const glow=(col,k,w,h)=>{const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:new T.Color(col).multiplyScalar(k),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));s.scale.set(w,h,1);return s};
 const mesh=(g,m,x=0,y=0,z=0,p)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);if(p)p.add(o);return o};
 const box=(w,h,d,m,x,y,z,p)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,p);
 /* rounded box (soft edges) via extrude of rounded rect, depth along z */
 const rbox=(w,h,d,r,m,x,y,z,p)=>{const s=new T.Shape(),a=w/2,b=h/2;r=Math.min(r,a*.9,b*.9);
  s.moveTo(-a+r,-b);s.lineTo(a-r,-b);s.quadraticCurveTo(a,-b,a,-b+r);s.lineTo(a,b-r);s.quadraticCurveTo(a,b,a-r,b);s.lineTo(-a+r,b);s.quadraticCurveTo(-a,b,-a,b-r);s.lineTo(-a,-b+r);s.quadraticCurveTo(-a,-b,-a+r,-b);
  const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:Math.min(.05,r*.4),bevelThickness:Math.min(.05,r*.4),bevelSegments:2,curveSegments:6});g.translate(0,0,-d/2);return mesh(g,m,x,y,z,p)};
 /* side profile [z,y] points extruded across width (x) */
 const prof=(pts,wid,m,x,y,z,p,bev=.06)=>{const s=new T.Shape();pts.forEach((q,i)=>i?s.lineTo(q[0],q[1]):s.moveTo(q[0],q[1]));
  const g=new T.ExtrudeGeometry(s,{depth:wid,bevelEnabled:true,bevelSize:bev,bevelThickness:bev,bevelSegments:2,curveSegments:8});g.rotateY(-Math.PI/2);g.translate(wid/2,0,0);return mesh(g,m,x,y,z,p)};
 /* top-down outline [x,z] extruded vertically */
 const plan=(pts,h,m,x,y,z,p,bev=.04)=>{const s=new T.Shape();pts.forEach((q,i)=>i?s.lineTo(q[0],q[1]):s.moveTo(q[0],q[1]));
  const g=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:bev>0,bevelSize:bev,bevelThickness:bev,bevelSegments:2,curveSegments:8});g.rotateX(Math.PI/2);g.translate(0,h,0);return mesh(g,m,x,y,z,p)};
 /* lathe body along z: pts [radius, z] */
 const lathe=(pts,m,x,y,z,p,seg=24)=>{const g=new T.LatheGeometry(pts.map(q=>new T.Vector2(q[0],q[1])),seg);g.rotateX(Math.PI/2);return mesh(g,m,x,y,z,p)};
 const cyl=(r1,r2,h,m,x,y,z,p,axis='y',seg=18)=>{const g=new T.CylinderGeometry(r1,r2,h,seg);if(axis==='x')g.rotateZ(Math.PI/2);if(axis==='z')g.rotateX(Math.PI/2);return mesh(g,m,x,y,z,p)};
 const sph=(r,sx,sy,sz,m,x,y,z,p)=>{const o=mesh(new T.SphereGeometry(r,24,16),m,x,y,z,p);o.scale.set(sx,sy,sz);return o};
 const neonStrip=(w,h,d,col,x,y,z,p,k=3.2)=>box(w,h,d,M.neon(col,k),x,y,z,p);
 /* wheel with tire, rim, spokes; axis along x */
 const wheel=(r,w,rim=0xdfe4ef,opts={})=>{const g=new T.Group();
  const tg=new T.TorusGeometry(r*.78,r*.24,12,28);const tire=new T.Mesh(tg,M.rubber);tire.rotation.y=Math.PI/2;tire.scale.set(1,1,Math.max(.8,w/(r*.5)));g.add(tire);
  const tread=cyl(r*.99,r*.99,w*.92,M.rubber,0,0,0,g,'x',28);
  const rm=cyl(r*.62,r*.62,w*.96,new T.MeshStandardMaterial({color:rim,metalness:1,roughness:.18,envMapIntensity:2}),0,0,0,g,'x',24);
  const hub=cyl(r*.2,r*.2,w*1.02,M.dark,0,0,0,g,'x',12);
  for(let i=0;i<(opts.spokes||6);i++){const sp=box(w*1.04,r*.12,r*.52,M.dark,0,0,0,g);sp.rotation.x=i/(opts.spokes||6)*Math.PI;sp.position.set(0,0,0)}
  if(opts.glow)cyl(r*.66,r*.66,w*.2,M.neon(opts.glow,3),w*.5,0,0,g,'x',24);
  g.userData.r=r;return g};
 const arch=(r,x,y,z,p,w=.14)=>{const o=cyl(r*1.18,r*1.18,w,M.dark,x,y,z,p,'x',24);return o};
 const mirror=(x,y,z,p,m)=>{const g=rbox(.16,.34,.3,.05,m||M.dark,x,y,z,p);return g};
 const door=(z0,z1,y0,y1,x,p)=>{const t=.03;box(t,y1-y0,.03,M.dark,x,(y0+y1)/2,z0,p);box(t,y1-y0,.03,M.dark,x,(y0+y1)/2,z1,p);box(t,.03,z1-z0,M.dark,x,y1,(z0+z1)/2,p);box(t,.03,z1-z0,M.dark,x,y0,(z0+z1)/2,p);box(.05,.06,.3,M.chrome,x,y1-.15,z0+.25,p)};
 return{T,M,glow,mesh,box,rbox,prof,plan,lathe,cyl,sph,neonStrip,wheel,glowTex,arch,mirror,door};
}

/* ---------- loft hull for boats: stations along z ---------- */
function hullGeo(T,L,Wd,Hd,keel,bowK,sternK){
 const NS=26,NP=7,pos=[],idx=[];
 for(let i=0;i<=NS;i++){const t=i/NS,z=(t-.5)*L;
  const bow=t>.55?Math.pow(1-(t-.55)/.45,bowK):1,st=t<.12?(.55+.45*t/.12):1;
  const w=Wd/2*bow*st*(t<.08?(.8+.2*t/.08):1),dk=Hd*(1+Math.max(0,t-.6)*.55+(t<.1?-.06:0)),kl=keel*(t>.5?Math.pow(1-(t-.5)/.5,.7):1)*(t<.15?.5+.5*t/.15:1);
  // section: left gunwale, left chine, keel, right chine, right gunwale
  const sec=[[-w*1.02,dk],[-w,dk*.45],[-w*.78,0],[0,-kl],[w*.78,0],[w,dk*.45],[w*1.02,dk]];
  sec.forEach(p=>pos.push(p[0],p[1],z))}
 for(let i=0;i<NS;i++)for(let j=0;j<NP-1;j++){const a=i*NP+j,b=a+1,c=a+NP,d=c+1;idx.push(a,c,b,b,c,d)}
 // deck
 const dOff=pos.length/3;for(let i=0;i<=NS;i++){const o=i*NP;pos.push(pos[(o)*3],pos[(o)*3+1],pos[(o)*3+2]);pos.push(pos[(o+NP-1)*3],pos[(o+NP-1)*3+1],pos[(o+NP-1)*3+2])}
 for(let i=0;i<NS;i++){const a=dOff+i*2,b=a+1,c=a+2,d=a+3;idx.push(a,b,c,b,d,c)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g}

function stripeTex(T,cols,w=256,h=256,diag=true){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
 x.fillStyle=cols[0];x.fillRect(0,0,w,h);for(let i=1;i<cols.length;i++){x.fillStyle=cols[i];for(let k=-2;k<10;k++){x.save();x.translate(k*w/5+i*w/9,0);x.transform(1,0,diag?-.6:0,1,0,0);x.fillRect(0,0,w/14,h);x.restore()}}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;return t}
function checkTex(T,a,b,n=8){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const s=128/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){x.fillStyle=(i+j)%2?a:b;x.fillRect(i*s,j*s,s,s)}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;return t}

/* ====================== TRUCKS ====================== */
const truckBuilders=[
/* 0 pickup */(K)=>{const{T,M,prof,box,rbox,mesh,wheel,neonStrip,glow,arch,mirror,door}=K;const g=new T.Group(),b=new T.Group();g.add(b);
 const pt=M.paint(0x4a63a0,.3);
 prof([[-3.2,.55],[-3.2,1.45],[-.9,1.45],[-.9,1.0],[.2,1.02],[.7,1.78],[1.6,1.85],[2.15,1.18],[3.05,1.0],[3.2,.7],[3.1,.5]],2.0,pt,0,0,0,b,.1);
 // bed liner and tailgate
 box(1.7,.12,2.5,M.dark,0,1.42,-2.0,b);
 prof([[.3,1.12],[.75,1.7],[1.5,1.76],[1.95,1.15]],2.02,M.glass,0,0,0,b,.02);
 rbox(1.6,.5,.2,.06,M.chrome,0,.62,3.2,b);rbox(1.4,.3,.12,.05,M.dark,0,.95,3.12,b);
 [-.7,.7].forEach(x=>{box(.4,.2,.1,M.head,x,1.1,3.12,b);box(.3,.16,.1,M.tail,x,1.2,-3.2,b)});
 [[-1.18,1.95],[1.18,1.95],[-1.18,-1.75],[1.18,-1.75]].forEach(([x,z])=>{const w=wheel(.58,.46,0xcfd6e4);w.position.set(x,.58,z);b.add(w);(w.userData.front=z>0);g.userData.wheels=(g.userData.wheels||[]);g.userData.wheels.push(w);
  box(.12,.62,1.4,pt,x*1.0,.8,z,b)});
 [-1,1].forEach(s=>{[[1.95],[-1.75]].forEach(([z])=>arch(.58,s*1.0,.58,z,b));mirror(s*1.1,1.55,.75,b);door(.05,.95,.75,1.75,s*1.01,b);door(-.9,.05,.75,1.75,s*1.01,b);rbox(.1,.4,2.2,.05,M.dark,s*1.0,.35,0,b)});
 rbox(1.5,.28,.12,.04,M.neon(0x35e6ff,4),0,1.28,3.12,b);box(1.4,.08,.3,M.dark,0,1.5,-3.2,b);
 neonStrip(.06,.06,5.0,0x35e6ff,-1.02,.55,0,b);neonStrip(.06,.06,5.0,0x35e6ff,1.02,.55,0,b);
 g.userData.len=6.4;g.userData.rideY=0;g.userData.tailZ=-3.3;return g},
/* 1 box truck */(K)=>{const{T,M,prof,box,rbox,mesh,wheel,neonStrip}=K;const g=new T.Group(),b=new T.Group();g.add(b);
 const pt=M.paint(0xdfe3ee,.35);
 prof([[1.4,.65],[1.4,2.5],[2.45,2.5],[3.1,1.7],[3.3,1.1],[3.3,.65]],2.3,pt,0,0,0,b,.1);
 prof([[2.0,1.7],[2.45,2.38],[3.05,1.72]],2.34,M.glass,0,0,0,b,.02);
 rbox(2.5,2.9,5.8,.18,pt,0,2.2,-1.45,b);
 box(2.55,.12,5.8,M.metal,0,.78,-1.45,b);rbox(2.3,.34,.3,.06,M.chrome,0,.62,3.4,b);
 for(let i=0;i<7;i++)box(2.56,.05,.12,M.metal,0,1.1+i*.4,-4.38,b);
 neonStrip(.06,.08,5.6,0xff3da8,-1.27,1.0,-1.45,b);neonStrip(.06,.08,5.6,0xff3da8,1.27,1.0,-1.45,b);
 [-.85,.85].forEach(x=>{box(.5,.22,.1,M.head,x,1.0,3.32,b);box(.3,.2,.1,M.tail,x,1.0,-4.4,b)});
 [[-1.3,2.4],[1.3,2.4],[-1.3,-2.8],[1.3,-2.8],[-1.3,-4.0],[1.3,-4.0]].forEach(([x,z])=>{const w=wheel(.62,.5);w.position.set(x,.62,z);b.add(w);w.userData.front=z>0;g.userData.wheels=g.userData.wheels||[];g.userData.wheels.push(w)});
 g.userData.len=8.6;g.userData.tailZ=-4.5;return g},
/* 2 semi */(K)=>{const{T,M,prof,box,rbox,mesh,wheel,neonStrip,cyl,glow}=K;const g=new T.Group(),b=new T.Group();g.add(b);
 const pt=M.paint(0x30344a,.22);
 prof([[-.7,.9],[-.7,3.3],[.9,3.3],[1.0,2.2],[2.7,2.1],[2.8,1.1],[3.4,1.0],[3.5,.7],[2.8,.6]],2.5,pt,0,0,0,b,.12);
 prof([[-.6,2.1],[-.6,3.15],[.8,3.15],[.9,2.15]],2.54,M.dark,0,0,0,b,.02);
 prof([[1.05,2.25],[1.0,3.0],[.45,3.15],[.5,2.3]],2.55,M.glass,0,0,0,b,.02);
 // grille
 rbox(1.5,1.0,.2,.1,M.chrome,0,1.7,3.5,b);for(let i=0;i<9;i++)box(1.4,.04,.1,M.dark,0,1.3+i*.1,3.58,b);
 rbox(2.7,.5,.4,.12,M.chrome,0,.78,3.45,b);
 [-1,1].forEach(s=>{cyl(.1,.1,3.2,M.chrome,s*1.15,3.2,.3,b);box(.5,.4,.3,M.chrome,s*1.2,.95,2.4,b);box(.5,.3,.12,M.head,s*1.05,1.2,3.58,b);const a=box(.14,.14,.14,M.amber,s*.8,3.35,1.5,b)});
 for(let i=0;i<5;i++)box(.18,.12,.14,M.amber,-.8+i*.4,3.36,.9,b);
 neonStrip(.06,.06,4.2,0x35e6ff,-1.27,.95,1.0,b);neonStrip(.06,.06,4.2,0x35e6ff,1.27,.95,1.0,b);neonStrip(1.5,.05,.06,0x35e6ff,0,2.05,3.52,b);
 // trailer
 rbox(2.6,3.4,9.2,.12,M.paint(0xb9bfd0,.35),0,2.55,-6.4,b);box(2.64,.14,9.2,M.metal,0,.88,-6.4,b);
 for(let i=0;i<10;i++)box(2.66,3.3,.07,M.metal,0,2.55,-2.2-i*.92,b);
 neonStrip(.06,.1,9,0xff3da8,-1.32,1.25,-6.4,b);neonStrip(.06,.1,9,0xff3da8,1.32,1.25,-6.4,b);
 box(.3,.3,.3,M.tail,-.9,1.0,-11.0,b);box(.3,.3,.3,M.tail,.9,1.0,-11.0,b);
 box(2.2,.3,1.2,M.dark,0,.9,-1.7,b);
 const wl=[[2.35],[-.4],[-1.7],[-8.8],[-10.1]];
 wl.forEach(([z])=>[-1.3,1.3].forEach(x=>{[-.18,.18].forEach(dx=>{const w=wheel(.66,.42,0xd9dde8);w.position.set(x+dx*(x>0?1:-1)*(z<-3?1:0),.66,z);b.add(w);w.userData.front=z>2;g.userData.wheels=g.userData.wheels||[];g.userData.wheels.push(w)})}));
 g.userData.len=15;g.userData.tailZ=-11.2;return g},
/* 3 armored hauler */(K)=>{const{T,M,prof,plan,box,rbox,mesh,wheel,neonStrip,cyl,glow}=K;const g=new T.Group(),b=new T.Group();g.add(b);
 const arm=M.paint(0x2a2d42,.3),arm2=M.paint(0x3c4262,.35);
 prof([[-1.0,1.0],[-1.0,3.6],[1.2,3.6],[1.4,3.0],[3.0,2.5],[3.7,1.8],[3.9,1.0]],3.0,arm,0,0,0,b,.14);
 prof([[1.5,3.0],[2.9,2.5],[2.6,2.1],[1.4,2.6]],3.04,M.glass,0,0,0,b,.02);
 // faceted armour plates
 [-1,1].forEach(s=>{prof([[.2,1.1],[.2,3.5],[2.8,2.4],[3.5,1.2]],.2,arm2,s*1.55,0,0,b,.06);
  prof([[-3.2,1.2],[-3.2,3.3],[-1,3.5],[-1,1.2]],.22,arm2,s*1.65,0,0,b,.06);
  neonStrip(.06,.06,4.2,0x35e6ff,s*1.68,2.4,-1.5,b);neonStrip(.06,.14,.14,0xff3da8,s*1.5,1.2,3.95,b)});
 rbox(2.6,.9,.3,.1,arm2,0,1.2,3.9,b);for(let i=0;i<6;i++)box(2.2,.06,.1,M.neon(0x35e6ff,2.5),0,.95+i*.12,4.05,b);
 [-1,1].forEach(s=>{box(.6,.28,.14,M.neon(0x35e6ff,4),s*1.15,1.9,3.2,b);box(.3,1.3,.34,arm2,s*1.55,1.0,3.9,b);box(.12,.9,.1,M.neon(0xff3da8,4),s*1.5,1.0,4.08,b)});
 box(2.4,.18,.6,M.neon(0xff3da8,3.5),0,3.72,1.1,b);box(2.0,.2,.4,M.dark,0,3.65,.4,b);
 // cargo module
 prof([[-11.2,1.1],[-11.2,3.8],[-9.5,4.3],[-2.0,4.3],[-1.2,3.7],[-1.2,1.1]],3.3,arm,0,0,0,b,.16);
 for(let i=0;i<6;i++){neonStrip(.07,.06,1.6,0x35e6ff,1.7,3.6,-3.3-i*1.3,b);neonStrip(.07,.06,1.6,0x35e6ff,-1.7,3.6,-3.3-i*1.3,b);neonStrip(1.6,.06,.07,0xff3da8,0,4.34,-3.3-i*1.3,b)}
 box(.5,.3,.2,M.tail,-1.0,1.5,-11.25,b);box(.5,.3,.2,M.tail,1.0,1.5,-11.25,b);
 const zs=[2.3,.5,-5.0,-6.5,-8.0,-9.5];
 zs.forEach(z=>[-1,1].forEach(s=>{const w=wheel(.88,.7,0x35e6ff,{glow:0x35e6ff,spokes:8});w.position.set(s*1.75,.88,z);b.add(w);w.userData.front=z>0;g.userData.wheels=g.userData.wheels||[];g.userData.wheels.push(w)}));
 g.userData.len=16;g.userData.tailZ=-11.4;return g}
];

/* ====================== BOATS ====================== */
const boatBuilders=[
/* 0 jet ski */(K)=>{const{T,M,box,rbox,mesh,cyl,sph,neonStrip,glow,prof}=K;const g=new T.Group(),b=new T.Group();g.add(b);
 const hull=mesh(hullGeo(T,3.2,1.3,.8,.35,.9,1),M.paint(0xe7eaf2,.3),0,.15,0,b);hull.material.side=T.DoubleSide;
 mesh(hullGeo(T,3.25,1.34,.12,.2,.9,1),M.dark,0,.6,0,b).material.side=T.DoubleSide;
 prof([[-1.0,.8],[-.9,1.15],[-.3,1.2],[.2,1.0],[.6,.9],[.9,.82]],.8,M.paint(0x1a2236,.3),0,0,0,b,.08);
 prof([[.3,.95],[.75,1.35],[.95,1.0]],.9,M.glass,0,0,.1,b,.02);
 cyl(.04,.04,.9,M.chrome,0,1.15,.55,b,'x');cyl(.03,.03,.4,M.chrome,0,1.0,.5,b,'y');
 neonStrip(.04,.05,2.6,0x35e6ff,-.62,.62,0,b);neonStrip(.04,.05,2.6,0x35e6ff,.62,.62,0,b);
 const jg=glow(0x35e6ff,2.6,1.6,1.1);jg.position.set(0,.4,-1.7);b.add(jg);
 g.userData.len=3.4;g.userData.wake=[[0,-1.7]];g.userData.hullY=.4;return g},
/* 1 speedboat */(K)=>{const{T,M,box,rbox,mesh,cyl,sph,neonStrip,glow,prof}=K;const g=new T.Group(),b=new T.Group();g.add(b);
 const hm=M.paint(0xf1f3f9,.28);const hull=mesh(hullGeo(T,5.6,2.1,.95,.5,.8,1),hm,0,.3,0,b);hull.material.side=T.DoubleSide;
 mesh(hullGeo(T,5.65,2.14,.1,.2,.8,1),M.dark,0,.88,0,b).material.side=T.DoubleSide;
 mesh(hullGeo(T,5.4,1.96,.05,.2,.8,1),new T.MeshStandardMaterial({color:0x8a5a3a,roughness:.5,metalness:.1}),0,1.2,0,b).material.side=T.DoubleSide;
 prof([[.3,1.2],[.9,1.8],[1.15,1.8],[1.3,1.2]],1.9,M.glass,0,0,.2,b,.03);
 box(1.8,.1,.1,M.chrome,0,1.8,.95,b);
 [[-.6,-.9],[.6,-.9],[0,-1.7]].forEach(([x,z])=>{rbox(.6,.5,.6,.1,M.dark,x,1.5,z,b)});
 neonStrip(.05,.06,4.3,0xff3da8,-1.02,.92,.2,b);neonStrip(.05,.06,4.3,0xff3da8,1.02,.92,.2,b);
 box(.9,.5,.5,M.metal,0,.9,-2.9,b);const jg=glow(0xff3da8,2.4,2,1.3);jg.position.set(0,.6,-3.0);b.add(jg);
 g.userData.len=6;g.userData.wake=[[-.5,-2.8],[.5,-2.8]];g.userData.hullY=.55;return g},
/* 2 offshore racer */(K)=>{const{T,M,box,rbox,mesh,cyl,sph,neonStrip,glow,prof}=K;const g=new T.Group(),b=new T.Group();g.add(b);
 const tex=stripeTex(T,['#13121c','#ff3da8','#e9ecf5','#35e6ff']);tex.repeat.set(3,1);
 const hm=new T.MeshPhysicalMaterial({map:tex,metalness:.4,roughness:.3,clearcoat:1,envMapIntensity:1.6,side:T.DoubleSide});
 mesh(hullGeo(T,8.4,2.3,1.0,.6,.7,1),hm,0,.3,0,b);
 mesh(hullGeo(T,8.45,2.34,.1,.2,.7,1),M.dark,0,.95,0,b).material.side=T.DoubleSide;
 mesh(hullGeo(T,8.0,2.1,.05,.2,.7,1),M.paint(0x14151e,.3),0,1.25,0,b).material.side=T.DoubleSide;
 prof([[-.3,1.25],[.3,1.9],[.6,1.9],[.9,1.25]],1.7,M.glass,0,0,0,b,.03);
 [-.5,0,.5].forEach(x=>rbox(.42,.55,.7,.1,M.dark,x,1.55,-1.5,b));
 [-.8,.8].forEach(x=>{rbox(.7,1.1,1.0,.12,M.paint(0x14151e,.3),x,1.3,-4.5,b);box(.62,.1,.9,M.neon(0xff3da8,3),x,1.88,-4.5,b);cyl(.12,.12,1.1,M.metal,x,.7,-4.95,b)});
 neonStrip(.05,.07,6.4,0x35e6ff,-1.1,.98,-.2,b);neonStrip(.05,.07,6.4,0x35e6ff,1.1,.98,-.2,b);
 [-.8,.8].forEach(x=>{const jg=glow(0x35e6ff,2.6,1.7,1.2);jg.position.set(x,.4,-5.3);b.add(jg)});
 g.userData.len=9.4;g.userData.wake=[[-.8,-5.1],[.8,-5.1]];g.userData.hullY=.55;return g},
/* 3 hydroplane */(K)=>{const{T,M,box,rbox,mesh,cyl,sph,neonStrip,glow,prof,plan,lathe}=K;const g=new T.Group(),b=new T.Group();g.add(b);
 const hm=M.paint(0x15131f,.22);
 [-1,1].forEach(s=>{const sp=mesh(hullGeo(T,9.4,1.0,.8,.35,.7,1),hm,s*1.6,.2,0,b);sp.material.side=T.DoubleSide;
  neonStrip(.05,.06,7.4,0x35e6ff,s*1.6+s*.5,.92,-.3,b,3.8);neonStrip(.05,.06,7.4,0xff3da8,s*1.6-s*.5,.92,-.3,b,3.8)});
 // central pod
 lathe([[0,-3.2],[.55,-2.6],[.95,-1.4],[.95,1.2],[.6,3.0],[.12,3.9],[0,4.0]],hm,0,.95,0,b,28).scale.set(1,.75,1);
 prof([[-.9,1.1],[-.4,1.9],[.5,1.9],[1.3,1.25]],1.0,M.glass,0,0,.1,b,.05).scale.set(1,1,1);
 box(3.0,.15,1.8,hm,0,1.0,.5,b);box(3.5,.15,1.6,hm,0,.9,2.2,b);
 // tail wing and fins
 box(4.4,.1,1.1,hm,0,2.55,-3.8,b);neonStrip(4.4,.06,.06,0x35e6ff,0,2.62,-3.25,b,4);
 [-1.6,0,1.6].forEach(x=>{if(x===0)return;box(.12,1.6,1.1,hm,x,1.8,-3.8,b)});
 box(.12,1.2,1.0,hm,0,1.6,-3.8,b);
 [-.5,.5].forEach(x=>{const jg=glow(0x35e6ff,3,2.2,1.7);jg.position.set(x,.75,-4.6);b.add(jg)});
 g.userData.len=10;g.userData.wake=[[-1.6,-4.5],[1.6,-4.5]];g.userData.hullY=.5;return g}
];

/* ====================== PLANES ====================== */
function wingGeo(T,span,rootC,tipC,sweep,thick,dihedral=0){ // wing half in +x, chord along z, built as thin airfoil loft
 const NS=8,NP=12,pos=[],idx=[];
 for(let i=0;i<=NS;i++){const t=i/NS,c=rootC+(tipC-rootC)*t,x=span*t,zo=-sweep*t,y0=dihedral*t,th=thick*(1-t*.55);
  for(let j=0;j<NP;j++){const a=j/NP*Math.PI*2,u=Math.cos(a),upper=Math.sin(a)>=0?1:.45;pos.push(x,y0+Math.sin(a)*th*upper*(1-Math.abs(u)*.15),zo+u*c/2)}}
 for(let i=0;i<NS;i++)for(let j=0;j<NP;j++){const a=i*NP+j,b=i*NP+(j+1)%NP,c=a+NP,d=b+NP;idx.push(a,b,c,b,d,c)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g}
const wing=(K,m,span,rc,tc,sw,th,x,y,z,p,dih=0)=>{const{T,mesh}=K;[1,-1].forEach(s=>{const o=mesh(wingGeo(T,span,rc,tc,sw,th,dih),m,x*s,y,z,p);o.scale.x=s;o.material.side=T.DoubleSide})};
const propeller=(K,r,blades,col,x,y,z,p)=>{const{T,M,box,cyl,sph}=K;const g=new T.Group();g.position.set(x,y,z);p.add(g);
 const hub=new T.Group();g.add(hub);for(let i=0;i<blades;i++){const bl=box(.12,r,.05,M.dark,0,r/2,0,hub);bl.rotation.z=0;bl.parent.remove(bl);const h=new T.Group();h.rotation.z=i/blades*Math.PI*2;h.add(bl);hub.add(h);bl.scale.set(1,1,1)}
 cyl(0,.28,.4,col,0,0,.18,g,'z');hub.userData.spin='z';g.userData.rot=hub;return hub};
const planeBuilders=[
/* 0 prop plane */(K)=>{const{T,M,box,rbox,mesh,cyl,sph,lathe,neonStrip,wheel,prof}=K;const g=new T.Group(),b=new T.Group();g.add(b);const wm=M.paint(0xf4f5f8,.3),red=M.paint(0xd62a2a,.3);
 lathe([[0,-3.9],[.12,-3.7],[.3,-3.0],[.55,-1.6],[.62,0],[.55,1.2],[.46,2.0],[0,2.25]],wm,0,1.2,0,b,28);
 prof([[-.9,1.65],[.1,2.0],[1.0,1.7],[1.1,1.45]],.95,M.glass,0,0,.3,b,.03);
 wing(K,wm,5.2,1.9,1.1,.35,.14,.4,2.0,.5,b);
 box(.04,.06,4.2,red,0,1.4,-.8,b).scale.x=14;
 [-1,1].forEach(s=>{const st=cyl(.04,.04,2.6,M.metal,s*1.3,1.1,.7,b);st.rotation.z=s*.7});
 wing(K,wm,1.6,1.0,.6,.2,.08,.2,1.2,-3.6,b);
 const fin=prof([[-.6,0],[.2,0],[-.1,1.3],[-.5,1.2]],.08,wm,0,1.2,-3.5,b,.02);
 const rudder=box(.04,.8,.5,red,0,2.0,-3.8,b);
 [-1,1].forEach(s=>{const w=wheel(.28,.16);w.position.set(s*.9,.4,.8);b.add(w);const l=cyl(.04,.04,1.0,M.metal,s*.8,.9,.7,b);l.rotation.z=s*.35});
 const tw=wheel(.14,.1);tw.position.set(0,.3,-3.2);b.add(tw);
 const pr=propeller(K,1.45,2,M.chrome,0,1.2,2.28,b);g.userData.props=[pr];
 neonStrip(.05,.05,3,0x35e6ff,-.6,1.55,0,b,2);neonStrip(.05,.05,3,0x35e6ff,.6,1.55,0,b,2);
 g.userData.len=6.4;g.userData.span=10.4;g.userData.gearY=0;return g},
/* 1 stunt biplane */(K)=>{const{T,M,box,rbox,mesh,cyl,sph,lathe,neonStrip,wheel,prof,glow}=K;const g=new T.Group(),b=new T.Group();g.add(b);
 const tex=checkTex(T,'#1b2a8a','#ff3da8',6);tex.repeat.set(2,3);
 const fm=new T.MeshPhysicalMaterial({map:tex,metalness:.3,roughness:.3,clearcoat:1,envMapIntensity:1.5});
 const wm=M.paint(0xff3da8,.25);
 lathe([[0,-3.3],[.1,-3.2],[.28,-2.5],[.5,-1.0],[.62,.6],[.62,1.4],[.48,2.0],[0,2.2]],fm,0,1.2,0,b,28);
 sph(.7,1,.8,1.5,M.paint(0xff3da8,.2),0,1.2,2.3,b);
 prof([[-.4,1.6],[.2,2.1],[.7,1.85],[.8,1.5]],.7,M.glass,0,0,0,b,.03);
 wing(K,wm,4.2,1.5,1.2,.15,.12,.3,2.35,.6,b);wing(K,wm,4.0,1.4,1.1,.15,.12,.3,.65,.6,b);
 [-1,1].forEach(s=>{[1.2,2.8].forEach(x=>{const st=cyl(.04,.04,1.8,M.metal,s*x,1.5,.6,b);st.rotation.x=0});neonStrip(.05,.06,1.5,0x35e6ff,s*4.5,2.35,.5,b,3);neonStrip(.05,.06,1.4,0x35e6ff,s*4.3,.65,.5,b,3)});
 wing(K,wm,1.8,1.0,.6,.2,.08,.2,1.2,-3.0,b);
 prof([[-.6,0],[.3,0],[-.05,1.5],[-.55,1.4]],.08,wm,0,1.2,-3.0,b,.02);
 [-1,1].forEach(s=>{const w=wheel(.36,.2,0x35e6ff);w.position.set(s*.85,.4,1.0);b.add(w);const l=cyl(.04,.04,1.1,M.metal,s*.7,.85,.9,b);l.rotation.z=s*.35});
 const pr=propeller(K,1.6,3,M.chrome,0,1.2,2.9,b);g.userData.props=[pr];
 g.userData.len=6.4;g.userData.span=8.6;return g},
/* 2 private jet */(K)=>{const{T,M,box,rbox,mesh,cyl,sph,lathe,neonStrip,wheel,prof,glow}=K;const g=new T.Group(),b=new T.Group();g.add(b);const wm=M.paint(0xf6f8fc,.22);
 lathe([[0,-6.4],[.14,-6.2],[.4,-5.0],[.78,-2.8],[.95,-.6],[.95,2.6],[.8,4.0],[.45,5.2],[.1,5.9],[0,6.0]],wm,0,1.5,0,b,32);
 prof([[3.5,1.55],[4.8,1.2],[5.3,1.05],[3.3,1.0]],.2,M.glass,0,.62,0,b,.02);
 for(let i=0;i<9;i++)[-1,1].forEach(s=>box(.04,.2,.3,M.dark,s*.93,1.9,-2.3+i*.7,b));
 neonStrip(.05,.05,10,0x35e6ff,-.97,1.62,0,b,2);neonStrip(.05,.05,10,0x35e6ff,.97,1.62,0,b,2);
 wing(K,wm,6.2,3.0,1.0,2.6,.2,.7,1.1,-.4,b,.6);
 wing(K,wm,2.5,1.6,.8,1.0,.1,.2,3.4,-5.6,b);
 prof([[-1.0,0],[.6,0],[0,2.6],[-.8,2.5]],.1,wm,0,1.6,-5.2,b,.03);
 [-1,1].forEach(s=>{const e=cyl(.45,.5,2.2,wm,s*1.2,2.0,-4.0,b,'z');cyl(.33,.33,.1,M.dark,s*1.2,2.0,-2.9,b,'z');const jg=glow(0xffa060,2.2,1.2,1.2);jg.position.set(s*1.2,2.0,-5.2);b.add(jg)});
 [-1,1].forEach(s=>{const w=wheel(.32,.2);w.position.set(s*1.4,.4,-.8);b.add(w);cyl(.05,.05,.9,M.metal,s*1.3,.95,-.8,b)});
 const nw=wheel(.26,.16);nw.position.set(0,.35,3.4);b.add(nw);cyl(.05,.05,.9,M.metal,0,.9,3.4,b);
 g.userData.len=12.4;g.userData.span=12.4;return g},
/* 3 neon fighter */(K)=>{const{T,M,box,rbox,mesh,cyl,sph,lathe,plan,neonStrip,prof,glow}=K;const g=new T.Group(),b=new T.Group();g.add(b);
 const hm=M.paint(0x15162a,.22),hm2=M.paint(0x232648,.3);
 lathe([[0,-5.2],[.3,-5.0],[.6,-3.5],[.78,-1.0],[.8,1.4],[.55,3.4],[.2,5.2],[0,6.3]],hm,0,1.3,0,b,24).scale.set(1.15,.62,1);
 plan([[-3.8,-3.5],[-.8,2.0],[0,2.4],[.8,2.0],[3.8,-3.5],[2.0,-4.3],[-2.0,-4.3]],.18,hm2,0,1.15,0,b,.05);
 [-1,1].forEach(s=>{plan([[0,0],[.0,-.5],[s*4.2,-3.7],[s*4.1,-3.2]],.06,M.neon(s>0?0x35e6ff:0x35e6ff,3.5),0,1.33,0,b,0);
  const f=prof([[-.4,0],[.4,0],[.05,2.0],[-.4,1.9]],.1,hm,s*1.0,1.5,-3.8,b,.02);f.rotation.z=-s*.35;neonStrip(.04,1.8,.05,0xff3da8,s*1.55,2.5,-4.1,b,3.5).rotation.z=-s*.35;
  const e=cyl(.5,.55,2.4,hm,s*.75,1.3,-3.8,b,'z');cyl(.4,.4,.1,M.dark,s*.75,1.3,-2.55,b,'z');
  const j1=glow(0xff3de0,3.2,1.8,1.8);j1.position.set(s*.75,1.3,-5.2);b.add(j1);const j2=glow(0xffffff,3,.8,.8);j2.position.set(s*.75,1.3,-5.0);b.add(j2)});
 sph(.9,.9,.7,1.8,M.glass,0,1.85,1.2,b);
 neonStrip(.05,.05,6,0xff3da8,-.45,1.62,.2,b,3);neonStrip(.05,.05,6,0xff3da8,.45,1.62,.2,b,3);
 g.userData.len=11;g.userData.span=8;g.userData.fighter=true;return g}
];

/* ====================== HELICOPTERS ====================== */
function rotorBlades(K,r,n,col,w=.34){const{T,M,box}=K;const hub=new T.Group();for(let i=0;i<n;i++){const a=new T.Group();a.rotation.y=i/n*Math.PI*2;const bl=new T.Mesh(new T.BoxGeometry(r,.04,w),col);bl.position.x=r/2;bl.scale.set(1,1,1);a.add(bl);const tip=new T.Mesh(new T.BoxGeometry(r*.12,.05,w*1.02),M.neon(0xff3da8,2));tip.position.x=r*.95;a.add(tip);hub.add(a)}return hub}
const heliBuilders=[
/* 0 compact */(K)=>{const{T,M,box,rbox,mesh,cyl,sph,lathe,neonStrip,prof,glow}=K;const g=new T.Group(),b=new T.Group();g.add(b);const wm=M.paint(0xf1f4fa,.25);
 sph(1.25,.95,.95,1.35,wm,0,1.45,.3,b);sph(1.05,.92,.9,1.1,M.glass,0,1.62,.95,b);
 sph(.9,.9,.8,1.5,wm,0,1.45,-1.2,b);
 const boom=cyl(.34,.12,3.8,wm,0,1.65,-3.2,b,'z');
 prof([[-.5,0],[.3,0],[-.05,1.2],[-.5,1.1]],.08,wm,0,1.65,-5.0,b,.02);
 neonStrip(.05,.05,2.6,0x35e6ff,-.4,1.5,-3.0,b,3);neonStrip(.05,.05,2.6,0x35e6ff,.4,1.5,-3.0,b,3);
 [-1,1].forEach(s=>{const sk=cyl(.05,.05,3.0,M.metal,s*1.0,.35,.2,b,'z');box(.06,1.1,.06,M.metal,s*1.0,.9,.9,b).rotation.z=s*.15;box(.06,1.1,.06,M.metal,s*1.0,.9,-.5,b).rotation.z=s*.15});
 cyl(.07,.07,.6,M.metal,0,2.7,.0,b);
 const rot=rotorBlades(K,3.8,2,M.dark);rot.position.set(0,3.05,0);b.add(rot);
 const tr=rotorBlades(K,.7,2,M.dark,.12);tr.rotation.z=Math.PI/2;tr.position.set(.2,1.95,-5.0);b.add(tr);
 g.userData.rotors=[{o:rot,axis:'y',s:1},{o:tr,axis:'x',s:1.4}];g.userData.len=7;g.userData.rotR=3.8;g.userData.skidY=.3;return g},
/* 1 news heli */(K)=>{const{T,M,box,rbox,mesh,cyl,sph,lathe,neonStrip,prof,glow}=K;const g=new T.Group(),b=new T.Group();g.add(b);const wm=M.paint(0xf1f4fa,.25),blue=M.paint(0x1a3a8a,.3);
 sph(1.6,.95,.9,1.5,wm,0,1.8,.3,b);sph(1.3,.92,.85,1.1,M.glass,0,1.95,1.0,b);
 box(2.3,.1,2.4,blue,0,1.15,.2,b);
 const boom=cyl(.42,.14,5.0,wm,0,2.15,-3.7,b,'z');
 prof([[-.6,0],[.4,0],[-.05,1.6],[-.6,1.4]],.1,blue,0,2.15,-6.1,b,.02);
 wing(K,wm,1.6,1.0,.6,.2,.08,.1,2.2,-5.6,b);
 const dish=sph(.5,1,.4,1,M.white,0,3.0,.6,b);dish.rotation.x=-.6;cyl(.06,.06,.5,M.metal,0,2.75,.6,b);
 neonStrip(.05,.05,3.4,0xff3da8,-.52,2.0,-3.0,b,3);neonStrip(.05,.05,3.4,0xff3da8,.52,2.0,-3.0,b,3);
 [-1,1].forEach(s=>{cyl(.06,.06,3.6,M.metal,s*1.25,.4,.3,b,'z');box(.07,1.3,.07,M.metal,s*1.25,1.0,1.2,b).rotation.z=s*.2;box(.07,1.3,.07,M.metal,s*1.25,1.0,-.6,b).rotation.z=s*.2});
 box(.5,.4,.6,M.dark,0,.95,1.5,b);
 cyl(.1,.1,.7,M.metal,0,3.1,-.4,b);
 const rot=rotorBlades(K,4.6,4,M.dark,.3);rot.position.set(0,3.5,-.4);b.add(rot);
 const tr=rotorBlades(K,.9,4,M.dark,.14);tr.rotation.z=Math.PI/2;tr.position.set(.25,2.5,-6.1);b.add(tr);
 g.userData.rotors=[{o:rot,axis:'y',s:1},{o:tr,axis:'x',s:1.4}];g.userData.len=9;g.userData.rotR=4.6;g.userData.skidY=.3;return g},
/* 2 attack */(K)=>{const{T,M,box,rbox,mesh,cyl,sph,lathe,neonStrip,prof,glow,plan}=K;const g=new T.Group(),b=new T.Group();g.add(b);const dm=M.paint(0x2b2f38,.45);
 prof([[-2.2,1.2],[-2.0,2.3],[-.2,2.5],[1.2,2.1],[2.8,1.3],[2.7,.95],[1.0,.9],[-1.6,.95]],1.5,dm,0,0,0,b,.14);
 prof([[1.0,1.95],[1.6,2.4],[2.3,1.55]],1.46,M.glass,0,0,.1,b,.03);prof([[-.5,2.35],[.2,2.75],[.9,2.4]],1.4,M.glass,0,0,.1,b,.03);
 const boom=cyl(.4,.14,5.0,dm,0,1.9,-4.5,b,'z');
 prof([[-.6,0],[.5,0],[-.05,2.1],[-.6,1.9]],.1,dm,0,1.9,-7.0,b,.02);
 wing(K,dm,2.6,1.3,.9,.4,.1,.7,1.55,-.2,b);
 [-1,1].forEach(s=>{[1.5,2.6].forEach(x=>{const pod=cyl(.26,.26,1.3,M.dark,s*x,1.2,-.1,b,'z');cyl(.18,.18,.2,M.neon(0xff3da8,2),s*x,1.2,.6,b,'z')});});
 cyl(.07,.07,.1,M.dark,0,.7,2.5,b);cyl(.08,.08,.9,M.dark,0,.9,2.7,b,'z');
 neonStrip(.05,.05,3,0xff3da8,-.78,1.25,-.8,b,3);neonStrip(.05,.05,3,0xff3da8,.78,1.25,-.8,b,3);
 cyl(.12,.12,.8,M.metal,0,2.85,-.2,b);
 const rot=rotorBlades(K,5.2,4,M.dark,.34);rot.position.set(0,3.3,-.2);b.add(rot);
 const tr=rotorBlades(K,.9,4,M.dark,.14);tr.rotation.z=Math.PI/2;tr.position.set(.3,2.4,-7.0);b.add(tr);
 [-1,1].forEach(s=>{const w=T.Group?null:null});
 const mw=(x,z)=>{const w=new T.Mesh(new T.CylinderGeometry(.2,.2,.12,14),M.rubber);w.rotation.z=Math.PI/2;w.position.set(x,.32,z);b.add(w);box(.07,.7,.07,M.metal,x,.62,z,b)};mw(-.9,1.8);mw(.9,1.8);mw(0,-4.5);
 g.userData.rotors=[{o:rot,axis:'y',s:1},{o:tr,axis:'x',s:1.4}];g.userData.len=10.5;g.userData.rotR=5.2;g.userData.skidY=.15;return g},
/* 3 tilt-rotor gunship */(K)=>{const{T,M,box,rbox,mesh,cyl,sph,lathe,neonStrip,prof,glow,plan}=K;const g=new T.Group(),b=new T.Group();g.add(b);const hm=M.paint(0x232632,.3);
 prof([[-3.6,1.1],[-3.4,2.3],[-.5,2.5],[1.4,2.1],[3.4,1.3],[3.5,.9],[1.4,.8],[-3.0,.85]],2.0,hm,0,0,0,b,.16);
 prof([[1.4,1.85],[2.3,2.3],[3.0,1.4]],1.96,M.glass,0,0,.1,b,.04);
 [[-1,'cy'],[1,'cy']].forEach(([s])=>{neonStrip(.05,.05,3.8,0x35e6ff,s*1.02,1.65,-.4,b,3.2);neonStrip(.05,.05,2.0,0xff3da8,s*1.02,1.2,1.0,b,3.2)});
 box(9.0,.3,1.6,hm,0,2.0,-1.2,b);box(9.1,.04,.06,M.neon(0x35e6ff,3.5),0,2.18,-.4,b);
 const tilt=[];
 [-1,1].forEach(s=>{const n=new T.Group();n.position.set(s*4.8,2.3,-1.2);b.add(n);
  prof([[-1.2,-.5],[-1.2,.7],[1.0,.7],[1.2,-.5]],.9,hm,0,0,0,n,.1).position.x=0;
  const sh=new T.Group();sh.position.set(0,1.3,0);n.add(sh);
  cyl(.2,.28,.5,M.dark,0,-.2,0,sh);
  const rot=rotorBlades(K,3.4,3,M.dark,.3);rot.position.set(0,.2,0);sh.add(rot);
  neonStrip(.05,.9,.05,0x35e6ff,s*.45,.2,.5,n,3.5);
  tilt.push({o:rot,axis:'y',s:1,pivot:sh})});
 const tailw=box(4.2,.12,1.0,hm,0,2.5,-4.2,b);
 [-1,1].forEach(s=>{const f=prof([[-.5,0],[.5,0],[.1,1.8],[-.4,1.7]],.1,hm,s*2.1,2.5,-4.2,b,.02);neonStrip(.04,1.4,.05,0xff3da8,s*2.15,3.2,-4.5,b,3.5)});
 cyl(.5,.2,3.0,hm,0,1.7,-4.4,b,'z');
 [-.5,.5].forEach(s=>{const w=new T.Mesh(new T.CylinderGeometry(.24,.24,.14,14),M.rubber);w.rotation.z=Math.PI/2;w.position.set(s*1.4,.3,1.5);b.add(w);box(.08,.6,.08,M.metal,s*1.4,.6,1.5,b)});
 g.userData.rotors=tilt;g.userData.len=10;g.userData.rotR=3.4;g.userData.skidY=.12;g.userData.tilt=tilt;return g}
];

export function buildVehicle(T,cat,tier){
 const K=createKit(T);
 const list={trucks:truckBuilders,boats:boatBuilders,planes:planeBuilders,helis:heliBuilders}[cat];
 const g=list[tier](K);g.userData.K=K;
 g.traverse(o=>{if(o.isMesh){o.castShadow=false}});
 return g}

/* real car model (cars category): same GLB as Neon City, tier colours */
export async function loadCar(T,X,tier){
 const cols=[0x2f6fd0,0xf2f4f8,0xff7a1a,0x181820],col=cols[tier];
 const K=createKit(T),M=K.M;const wheels=[],fronts=[];const grp=new T.Group();
 try{
  if(!X.GLTFLoader||!X.DRACOLoader)throw 0;
  const dl=new X.DRACOLoader();dl.setDecoderPath(DRACO);const gl=new X.GLTFLoader();gl.setDRACOLoader(dl);
  const gltf=await Promise.race([gl.loadAsync(GLB),new Promise((_,r)=>setTimeout(()=>r(0),30000))]);const m=gltf.scene;
  const bodyMat=M.paint(col,.32);bodyMat.envMapIntensity=2;
  const glass=new T.MeshPhysicalMaterial({color:0x03060e,metalness:.2,roughness:.02,transparent:true,opacity:.62,envMapIntensity:3,clearcoat:1});
  const tailM=new T.MeshStandardMaterial({color:0x300000,emissive:0xff1020,emissiveIntensity:2.6,roughness:.2});
  const projM=new T.MeshStandardMaterial({color:0xffffff,emissive:0xfff1d0,emissiveIntensity:5,roughness:.1});
  const ledM=new T.MeshStandardMaterial({color:0x331100,emissive:0xff8a20,emissiveIntensity:2,roughness:.3});
  const hide=new Set(['interior_light','carpet']);
  m.traverse(o=>{if(!o.isMesh)return;const n=o.name;if(hide.has(n)){o.visible=false;return}
   if(n==='body')o.material=bodyMat;else if(n==='glass'){o.material=glass;o.renderOrder=2}else if(n==='lights_red')o.material=tailM;else if(n==='lights')o.material=projM;else if(n==='leds')o.material=ledM;
   else if(n==='tire')o.material=M.rubber;else if(/^rim_|^wheel$/.test(n)||n==='chrome')o.material=M.chrome;else if(o.material){o.material=o.material.clone();o.material.envMapIntensity=1.4}});
  ['wheel_fl','wheel_fr','wheel_rl','wheel_rr'].forEach(nm=>{const w=m.getObjectByName(nm);if(!w)return;
   if(nm.startsWith('wheel_f')){const pv=new T.Group();pv.position.copy(w.position);w.position.set(0,0,0);w.parent.add(pv);pv.add(w);fronts.push(pv)}wheels.push(w)});
  m.rotation.y=Math.PI;const wrap=new T.Group();wrap.add(m);
  const bb=new T.Box3().setFromObject(wrap),sz=new T.Vector3();bb.getSize(sz);const sc=4.55/Math.max(sz.x,sz.z);wrap.scale.setScalar(sc);
  wrap.updateMatrixWorld(true);const b2=new T.Box3().setFromObject(wrap);wrap.position.y=-b2.min.y;grp.add(wrap);
  grp.userData.glb=true;
 }catch(e){console.warn('car glb fallback',e);
  const{prof,box,wheel}=K;const pt=M.paint(col,.3);prof([[-2.3,.38],[-2.32,.85],[-1.7,1.02],[-.9,1.45],[.6,1.47],[1.2,1.05],[2.2,.88],[2.34,.62],[2.3,.38]],1.78,pt,0,0,0,grp,.1);
  prof([[-.95,1.02],[1.1,1.02],[.55,1.44],[-.85,1.44]],1.8,M.glass,0,0,0,grp,.02);
  [[-1,1.4],[1,1.4],[-1,-1.4],[1,-1.4]].forEach(([x,z])=>{const w=wheel(.42,.3);w.position.set(x*1.0,.42,z);grp.add(w);wheels.push(w);if(z>0)fronts.push(w)})}
 grp.userData.wheels=wheels;grp.userData.fronts=fronts;grp.userData.len=4.6;grp.userData.K=K;return grp}
