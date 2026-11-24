/* Neon City Drive: high-end renderer (PBR, wet reflective road, real car model, post FX) */
const GLB='https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/models/gltf/ferrari.glb';
const DRACO='https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/';

export async function createNeon(THREE,host,mode0,FX,ctx){
 const {cfg,store,$,P,KEYS,toast,tilt,recalTilt,isOri}=ctx;const X=ctx.X||{};
 const N=20,CELL=64,ROAD=18,W=N*CELL,OUT=4,WG=(N+OUT*2)*CELL,HEI=[20,30,44,62,86,118];
 let seed=20241120;const rng=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const disposables=[];const track=o=>{disposables.push(o);return o};
 const STATIC=/static/.test(location.search);
 const low=!!cfg.low;
 const R=new THREE.WebGLRenderer({antialias:!FX,powerPreference:'high-performance',stencil:false});
 const prMax=Math.min(window.devicePixelRatio||1,low?1:2);let pr=prMax;
 R.setPixelRatio(pr);R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;R.setSize(host.clientWidth,host.clientHeight);host.appendChild(R.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x0a0618);
 const FOGC=new THREE.Color(0x1a0d3a),FOGD=.0038;scene.fog=new THREE.FogExp2(FOGC,FOGD);
 const cam=new THREE.PerspectiveCamera(62,host.clientWidth/host.clientHeight,.3,900);
 const rand=(a,b)=>a+rng()*(b-a);
 const mk=(c)=>{const e=document.createElement('canvas');e.width=c[0];e.height=c[1];return e};
 const ctex=(cv,srgb=true)=>{const t=new THREE.CanvasTexture(cv);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,R.capabilities.getMaxAnisotropy());t.wrapS=t.wrapT=THREE.RepeatWrapping;track(t);return t};
 const glowTex=(()=>{const c=mk([128,128]),x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.18,'rgba(255,255,255,.55)');g.addColorStop(.5,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return track(t)})();

 /* ---------- sky ---------- */
 const sky=(()=>{const c=mk([2048,1024]),x=c.getContext('2d');
  const gr=x.createLinearGradient(0,0,0,1024);gr.addColorStop(0,'#02010a');gr.addColorStop(.3,'#0b0730');gr.addColorStop(.42,'#2a0f5c');gr.addColorStop(.48,'#9d2b86');gr.addColorStop(.505,'#ff6fb0');gr.addColorStop(.52,'#2a0e45');gr.addColorStop(1,'#07030f');
  x.fillStyle=gr;x.fillRect(0,0,2048,1024);
  for(let n=0;n<1300;n++){const px=rng()*2048,py=rng()*470,r=rng()*1.5+.3;x.globalAlpha=.2+rng()*.8;x.fillStyle=rng()<.2?'#ffd6f5':'#dbe8ff';x.beginPath();x.arc(px,py,r,0,7);x.fill()}
  x.globalAlpha=1;
  // soft clouds
  for(let n=0;n<26;n++){const px=rng()*2048,py=300+rng()*140,w=160+rng()*320,g2=x.createRadialGradient(px,py,0,px,py,w);g2.addColorStop(0,'rgba(200,90,190,.16)');g2.addColorStop(1,'rgba(200,90,190,0)');x.fillStyle=g2;x.fillRect(px-w,py-w*.35,w*2,w*.7)}
  for(const [px,py,pr2,c1,c2] of [[560,330,96,'#d6f0ff','#3b5fe0'],[1500,250,52,'#ffd3ec','#a53a9a']]){
   const gl=x.createRadialGradient(px,py,pr2*.8,px,py,pr2*3.2);gl.addColorStop(0,'rgba(110,170,255,.5)');gl.addColorStop(1,'rgba(110,170,255,0)');x.fillStyle=gl;x.fillRect(px-pr2*3.3,py-pr2*3.3,pr2*6.6,pr2*6.6);
   const pg=x.createRadialGradient(px-pr2*.4,py-pr2*.4,pr2*.1,px,py,pr2);pg.addColorStop(0,c1);pg.addColorStop(.55,c2);pg.addColorStop(1,'#060a24');x.fillStyle=pg;x.beginPath();x.arc(px,py,pr2,0,7);x.fill()}
  x.strokeStyle='rgba(190,215,255,.5)';x.lineWidth=5;x.beginPath();x.ellipse(560,330,165,28,-.35,0,7);x.stroke();
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;track(t);
  const m=new THREE.Mesh(new THREE.SphereGeometry(700,48,24),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,fog:false,depthWrite:false,toneMapped:false}));m.renderOrder=-10;m.frustumCulled=false;return m})();
 scene.add(sky);

 /* ---------- environment (neon studio for reflections) ---------- */
 {const pm=new THREE.PMREMGenerator(R);const es=new THREE.Scene();es.add(sky.clone());
  const lit=(col,k)=>new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(k),side:THREE.DoubleSide,fog:false});
  const panel=(col,k,w,h,px,py,pz)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),lit(col,k));m.position.set(px,py,pz);m.lookAt(0,0,0);es.add(m)};
  panel(0xff3da8,9,260,90,-300,60,120);panel(0x2de2ff,9,260,90,300,50,-90);panel(0xffa13d,6,200,60,60,40,300);panel(0x8a5cff,7,220,80,-80,50,-300);
  panel(0xffffff,2.2,300,300,0,320,0);
  for(let n=0;n<40;n++){const a=n/40*Math.PI*2,r=300+rng()*60,cols=[0x2de2ff,0xff3da8,0x8a5cff,0xffa13d,0x4dff9a,0xffffff];panel(cols[(rng()*6)|0],3+rng()*5,6+rng()*14,20+rng()*70,Math.cos(a)*r,10+rng()*40,Math.sin(a)*r)}
  const gd=new THREE.Mesh(new THREE.CircleGeometry(900,32),new THREE.MeshBasicMaterial({color:0x07040f}));gd.rotation.x=-Math.PI/2;gd.position.y=-8;es.add(gd);
  scene.environment=pm.fromScene(es,.02).texture;pm.dispose()}

 /* ---------- lights ---------- */
 scene.add(new THREE.HemisphereLight(0x7f8fff,0x1b0b30,.55));
 const dlA=new THREE.DirectionalLight(0xff4fb0,2.4);dlA.position.set(-60,50,-80);scene.add(dlA);
 const dlB=new THREE.DirectionalLight(0x35e6ff,2.2);dlB.position.set(70,40,-60);scene.add(dlB);
 const dlC=new THREE.DirectionalLight(0xffe0b0,.7);dlC.position.set(0,80,90);scene.add(dlC);

 /* ---------- noise texture ---------- */
 const noiseT=(()=>{const S=256,c=mk([S,S]),x=c.getContext('2d'),id=x.createImageData(S,S);
  const g=[];for(let ch=0;ch<2;ch++){const o=[];for(let k=0;k<5;k++){const n=(8<<k);const gr=new Float32Array((n+1)*(n+1));for(let i=0;i<gr.length;i++)gr[i]=rng();o.push([n,gr])}g.push(o)}
  const val=(o,u,v)=>{let s=0,a=.5,tot=0;for(const [n,gr] of o){const fx=u*n,fy=v*n,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);const i0=(ix%n),j0=(iy%n),i1=(ix+1)%n,j1=(iy+1)%n;
    const a0=gr[j0*(n+1)+i0],b0=gr[j0*(n+1)+i1],a1=gr[j1*(n+1)+i0],b1=gr[j1*(n+1)+i1];s+=a*((a0+(b0-a0)*sx)+((a1+(b1-a1)*sx)-(a0+(b0-a0)*sx))*sy);tot+=a;a*=.5}return s/tot};
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const p=(j*S+i)*4;id.data[p]=val(g[0],i/S,j/S)*255;id.data[p+1]=val(g[1],i/S,j/S)*255;id.data[p+2]=128;id.data[p+3]=255}
  x.putImageData(id,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return track(t)})();

 /* ---------- asphalt tile ---------- */
 const asphT=(()=>{const S=1024,c=mk([S,S]),g=c.getContext('2d'),ins=ROAD/2/CELL*S;
  g.fillStyle='#1b1c22';g.fillRect(0,0,S,S);
  for(let n=0;n<40;n++){const px=rng()*S,py=rng()*S,r=40+rng()*120,gg=g.createRadialGradient(px,py,0,px,py,r),v=rng()<.5?'0,0,0':'60,60,76';gg.addColorStop(0,'rgba('+v+','+(.12+rng()*.12)+')');gg.addColorStop(1,'rgba('+v+',0)');g.fillStyle=gg;g.fillRect(px-r,py-r,r*2,r*2)}
  for(let n=0;n<26000;n++){const v=20+rng()*60|0;g.fillStyle='rgba('+v+','+v+','+(v+8)+','+(.15+rng()*.35)+')';g.fillRect(rng()*S,rng()*S,1+rng()*1.6,1+rng()*1.6)}
  // tire polish bands along each lane (roads at tile edges)
  for(const o of [ins*.28,ins*.72]){g.fillStyle='rgba(8,8,12,.28)';g.fillRect(o-10,0,20,S);g.fillRect(S-o-10,0,20,S);g.fillRect(0,o-10,S,20);g.fillRect(0,S-o-10,S,20)}
  // cracks
  g.strokeStyle='rgba(6,6,9,.55)';g.lineWidth=1.3;for(let n=0;n<22;n++){let px=rng()*S,py=rng()*S;g.beginPath();g.moveTo(px,py);for(let k=0;k<9;k++){px+=rand(-22,22);py+=rand(-22,22);g.lineTo(px,py)}g.stroke()}
  // sidewalk block
  const sw=g.createLinearGradient(0,0,S,S);sw.addColorStop(0,'#3b3d4a');sw.addColorStop(1,'#2e303c');g.fillStyle=sw;g.fillRect(ins,ins,S-2*ins,S-2*ins);
  for(let n=0;n<14000;n++){const v=40+rng()*50|0;g.fillStyle='rgba('+v+','+v+','+(v+10)+','+(.1+rng()*.25)+')';g.fillRect(ins+rng()*(S-2*ins),ins+rng()*(S-2*ins),1+rng()*2,1+rng()*2)}
  g.strokeStyle='rgba(10,10,18,.55)';g.lineWidth=2;for(let q=ins;q<=S-ins;q+=48){g.beginPath();g.moveTo(q,ins);g.lineTo(q,S-ins);g.moveTo(ins,q);g.lineTo(S-ins,q);g.stroke()}
  // curb: gutter shadow + bright edge
  g.fillStyle='rgba(0,0,0,.55)';g.fillRect(ins-9,ins-9,S-2*ins+18,9);g.fillRect(ins-9,S-ins,S-2*ins+18,9);g.fillRect(ins-9,ins-9,9,S-2*ins+18);g.fillRect(S-ins,ins-9,9,S-2*ins+18);
  g.strokeStyle='#8a8d9c';g.lineWidth=5;g.strokeRect(ins+2.5,ins+2.5,S-2*ins-5,S-2*ins-5);
  // road paint
  const Y='#d9a521',Wt='#d7dae3';
  const dash=(x0,y0,x1,y1,col,w,d,gp)=>{g.strokeStyle=col;g.lineWidth=w;g.setLineDash([d,gp]);g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();g.setLineDash([])};
  g.globalAlpha=.9;
  for(const e of [0,S]){const o=e===0?1:-1;
   dash(e+o*6,ins+52,e+o*6,S-ins-52,Y,5,S,0);dash(e-o*6,ins+52,e-o*6,S-ins-52,Y,5,S,0);
   dash(e,ins+52,e,S-ins-52,Wt,0,0,0);
   for(const l of [ins*.5]){dash(e+o*l,ins+52,e+o*l,S-ins-52,Wt,5,46,46)}
   dash(e+o*(ins-18),ins+52,e+o*(ins-18),S-ins-52,Wt,5,S,0);
   dash(ins+52,e+o*6,S-ins-52,e+o*6,Y,5,S,0);dash(ins+52,e-o*6,S-ins-52,e-o*6,Y,5,S,0);
   dash(ins+52,e+o*(ins*.5),S-ins-52,e+o*(ins*.5),Wt,5,46,46);dash(ins+52,e+o*(ins-18),S-ins-52,e+o*(ins-18),Wt,5,S,0)}
  // zebra crossings + stop bars
  g.fillStyle=Wt;
  for(const e of [0,S])for(const z0 of [ins+6,S-ins-46]){for(let q=-ins+14;q<ins-10;q+=30){g.fillRect(e+q,z0,16,40);g.fillRect(z0,e+q,40,16)}}
  g.globalAlpha=1;
  const t=ctex(c);t.anisotropy=Math.min(16,R.capabilities.getMaxAnisotropy());return t})();

 /* ---------- wet road (planar reflection) ---------- */
 const roadShader={
  uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null}},
  vertexShader:`uniform mat4 textureMatrix;varying vec4 vUv;varying vec3 vW;
   void main(){vUv=textureMatrix*vec4(position,1.0);vW=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform vec3 color;uniform sampler2D tDiffuse;uniform sampler2D tAsph;uniform sampler2D tNoise;
   uniform float time;uniform vec3 carPos;uniform vec2 carDir;uniform vec3 fogCol;uniform float fogD;uniform float blurK;uniform float brake;
   varying vec4 vUv;varying vec3 vW;
   void main(){
    vec2 wp=vW.xz;
    vec3 asph=texture2D(tAsph,wp/${CELL}.0).rgb;
    vec2 t=mod(wp,${CELL}.0);
    float side=step(9.0,t.x)*step(t.x,55.0)*step(9.0,t.y)*step(t.y,55.0);
    float n1=texture2D(tNoise,wp*.0105).r,n2=texture2D(tNoise,wp*.034+vec2(.3,.7)).g,n3=texture2D(tNoise,wp*.11).r;
    float pud=smoothstep(.40,.60,n1*.55+n2*.30+n3*.15);
    float wet=clamp(.58+pud*.42,0.,1.)*mix(1.0,.55,side);
    vec2 rp=(texture2D(tNoise,wp*.9+vec2(time*.05,time*.13)).rg-.5)+(texture2D(tNoise,wp*1.9-vec2(time*.09,time*.04)).rg-.5);
    vec2 dist=rp*(.0025+.006*pud);
    vec4 uv=vUv;uv.xy+=dist*uv.w;
    vec2 b=uv.xy/uv.w;
    float rad=mix(.0075,.0009,wet*wet)*blurK;
    vec3 refl=vec3(0.);float wsum=0.;
    for(int i=0;i<8;i++){float a=float(i)*.785398;vec2 o=vec2(cos(a),sin(a))*rad*(.55+.45*fract(float(i)*.618));refl+=texture2D(tDiffuse,b+o).rgb;wsum+=1.;}
    refl+=texture2D(tDiffuse,b).rgb*2.;wsum+=2.;refl/=wsum;
    vec3 V=normalize(cameraPosition-vW);
    float fr=pow(1.-clamp(V.y,0.,1.),3.5);
    float rs=(.08+.80*fr)*wet;
    // lights
    vec2 d=wp-carPos.xz;float dl=length(d);vec2 dir=d/max(dl,1e-3);float fw=dot(dir,carDir);
    float cone=smoothstep(.86,.985,fw)*smoothstep(52.,5.,dl)*step(0.,fw);
    float cone2=smoothstep(.55,.95,fw)*smoothstep(20.,3.,dl)*step(0.,fw)*.5;
    vec3 L=vec3(.045,.05,.09)+vec3(1.,.88,.68)*(cone*3.2+cone2*.7);
    L+=vec3(1.,.12,.5)*exp(-dl*dl/(2.*2.8*2.8))*.9;
    float bk=smoothstep(.88,1.,-fw)*smoothstep(12.,1.5,dl);L+=vec3(1.,.04,.08)*bk*(.5+brake*1.6);
    vec2 rel=wp-8.6;vec2 ci=floor(rel/${CELL}.0+.5);vec2 dd=rel-ci*${CELL}.0;
    float lamp=exp(-dot(dd,dd)/(2.*12.*12.));float par=mod(ci.x+ci.y,2.);
    L+=mix(vec3(1.,.70,.38),vec3(.40,.72,1.),par)*lamp*1.5;
    vec3 diff=asph*L*mix(1.,.5,wet);
    vec3 col=diff+refl*rs*(1.+cone*.4);
    col+=vec3(1.,.9,.7)*cone*fr*wet*.6;
    float dc=length(cameraPosition-vW);float ff=1.-exp(-fogD*fogD*dc*dc);
    col=mix(col,fogCol,clamp(ff,0.,1.));
    gl_FragColor=vec4(col,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`};
 const roadGeo=track(new THREE.PlaneGeometry(WG,WG));
 let road;const refW=Math.round(Math.min(1280,Math.max(256,host.clientWidth*pr*(low?.3:.5)))),refH=Math.round(Math.min(720,Math.max(144,host.clientHeight*pr*(low?.3:.5))));
 if(X.Reflector){road=new X.Reflector(roadGeo,{shader:roadShader,textureWidth:refW,textureHeight:refH,clipBias:.003,color:0xffffff})}
 else{road=new THREE.Mesh(roadGeo,new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.clone(roadShader.uniforms),vertexShader:roadShader.vertexShader,fragmentShader:roadShader.fragmentShader}));
  const bt=new THREE.DataTexture(new Uint8Array([8,6,16,255]),1,1);bt.needsUpdate=true;road.material.uniforms.tDiffuse.value=bt;road.material.uniforms.textureMatrix.value=new THREE.Matrix4();road.material.uniforms.color.value=new THREE.Color(1,1,1)}
 const RU=road.material.uniforms;
 Object.assign(RU,{tAsph:{value:asphT},tNoise:{value:noiseT},time:{value:0},carPos:{value:new THREE.Vector3()},carDir:{value:new THREE.Vector2(0,1)},fogCol:{value:FOGC},fogD:{value:FOGD},blurK:{value:1},brake:{value:0}});
 road.material.fog=false;
 road.rotation.x=-Math.PI/2;road.position.set(W/2,0,W/2);scene.add(road);

 /* ---------- building textures ---------- */
 const facade=(variant)=>{const S=1024,cols=variant===2?2:4,rows=8,cw=S/cols,rh=S/rows;
  const cA=mk([S,S]),cE=mk([S,S]),cO=mk([S,S]),a=cA.getContext('2d'),e=cE.getContext('2d'),o=cO.getContext('2d');
  const wallBase=['#1b1e2e','#222536','#171a28'][variant];
  a.fillStyle=wallBase;a.fillRect(0,0,S,S);e.fillStyle='#000';e.fillRect(0,0,S,S);o.fillStyle='rgb(255,215,40)';o.fillRect(0,0,S,S);
  for(let n=0;n<9000;n++){const v=18+rng()*36|0;a.fillStyle='rgba('+v+','+v+','+(v+14)+','+(.1+rng()*.2)+')';a.fillRect(rng()*S,rng()*S,1+rng()*2,1+rng()*2)}
  const warm=['#ffd9a0','#ffc880','#ffe9c4'],cool=['#b9e6ff','#9ad0ff','#d4c8ff'],odd=['#ff9ad0','#8cffd2','#ffb070'];
  for(let r=0;r<rows;r++)for(let q=0;q<cols;q++){
   const x0=q*cw+(variant===2?10:cw*.14),y0=r*rh+rh*.16,w=variant===2?cw-20:cw*.72,h=rh*.66;
   const litP=rng();const lit=litP<.36;
   // glass
   const gg=a.createLinearGradient(0,y0,0,y0+h);gg.addColorStop(0,'#0a1126');gg.addColorStop(1,'#050816');a.fillStyle=gg;a.fillRect(x0,y0,w,h);
   o.fillStyle='rgb(255,14,235)';o.fillRect(x0,y0,w,h);
   if(lit){const pal=rng()<.7?warm:rng()<.7?cool:odd,col=pal[(rng()*pal.length)|0];
    const g2=e.createLinearGradient(0,y0,0,y0+h);g2.addColorStop(0,col);g2.addColorStop(1,'rgba(255,255,255,.35)');e.fillStyle=g2;e.globalAlpha=.55+rng()*.45;e.fillRect(x0+3,y0+3,w-6,h-6);e.globalAlpha=1;
    // furniture / people silhouettes
    e.fillStyle='rgba(0,0,0,.55)';for(let k=0;k<2;k++){const fw=rand(.1,.3)*w;e.fillRect(x0+rng()*(w-fw),y0+h*rand(.55,.8),fw,h*.25)}
    if(rng()<.35){e.fillStyle='rgba(0,0,0,.6)';e.fillRect(x0+w*rand(.2,.7),y0+h*.3,w*.06,h*.5)}
    a.fillStyle='rgba(255,230,190,.10)';a.fillRect(x0,y0,w,h)}
   // frame
   a.strokeStyle='#080a14';a.lineWidth=4;a.strokeRect(x0,y0,w,h);if(variant!==2){a.beginPath();a.moveTo(x0+w/2,y0);a.lineTo(x0+w/2,y0+h);a.stroke()}
   // ledge
   a.fillStyle='rgba(120,125,160,.22)';a.fillRect(q*cw,y0+h+3,cw,3);o.fillStyle='rgb(255,120,10)';o.fillRect(q*cw,y0+h+3,cw,3)}
  // pillars
  a.fillStyle='rgba(0,0,0,.28)';for(let q=0;q<=cols;q++)a.fillRect(q*cw-3,0,6,S);
  return[ctex(cA),ctex(cE),ctex(cO,false)]};
 const shopF=(()=>{const W2=512,H2=128,cA=mk([W2,H2]),cE=mk([W2,H2]),cO=mk([W2,H2]),a=cA.getContext('2d'),e=cE.getContext('2d'),o=cO.getContext('2d');
  a.fillStyle='#14151f';a.fillRect(0,0,W2,H2);e.fillStyle='#000';e.fillRect(0,0,W2,H2);o.fillStyle='rgb(255,200,30)';o.fillRect(0,0,W2,H2);
  const pal=['#ffb36b','#7fe6ff','#ff7ad0','#ffe27a','#a98bff'];
  for(let q=0;q<4;q++){const x0=q*128+8,col=pal[(rng()*5)|0];
   a.fillStyle='#070912';a.fillRect(x0,34,112,84);const g=e.createLinearGradient(0,34,0,118);g.addColorStop(0,col);g.addColorStop(1,'rgba(255,255,255,.2)');e.fillStyle=g;e.globalAlpha=.8;e.fillRect(x0+4,38,104,76);e.globalAlpha=1;
   e.fillStyle='rgba(0,0,0,.45)';for(let k=0;k<3;k++)e.fillRect(x0+10+k*32,60+rng()*22,18,50);
   o.fillStyle='rgb(255,20,235)';o.fillRect(x0,34,112,84);
   e.fillStyle=col;e.fillRect(x0,10,112,12);}
  a.fillStyle='#1c1e2a';a.fillRect(0,0,W2,8);
  return[ctex(cA),ctex(cE),ctex(cO,false)]})();
 const FAC=[0,1,2].map(facade);
 const pbr=(t,ei,env)=>track(new THREE.MeshStandardMaterial({map:t[0],emissiveMap:t[1],emissive:0xffffff,emissiveIntensity:ei,roughnessMap:t[2],metalnessMap:t[2],roughness:1,metalness:1,aoMap:null,envMapIntensity:env}));
 const FMAT=FAC.map(t=>pbr(t,1.25,1.1)),SHOPMAT=pbr(shopF,1.6,.9);
 const roofMat=track(new THREE.MeshStandardMaterial({color:0x14151f,roughness:.6,metalness:.5,envMapIntensity:.6}));

 // geometry helpers
 const boxG=(w,h,d,x,y,z,uv)=>{const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);if(uv){const u=g.attributes.uv;for(let n=0;n<u.count;n++)u.setXY(n,u.getX(n)*uv[0],u.getY(n)*uv[1])}return g};
 const merge=(list)=>{let vc=0,ic=0;list.forEach(g=>{vc+=g.attributes.position.count;ic+=g.index.count});
  const p=new Float32Array(vc*3),n=new Float32Array(vc*3),u=new Float32Array(vc*2),ix=new Uint32Array(ic);let vo=0,io=0;
  list.forEach(g=>{p.set(g.attributes.position.array,vo*3);n.set(g.attributes.normal.array,vo*3);u.set(g.attributes.uv.array,vo*2);for(let i=0;i<g.index.count;i++)ix[io+i]=g.index.array[i]+vo;vo+=g.attributes.position.count;io+=g.index.count});
  const m=new THREE.BufferGeometry();m.setAttribute('position',new THREE.BufferAttribute(p,3));m.setAttribute('normal',new THREE.BufferAttribute(n,3));m.setAttribute('uv',new THREE.BufferAttribute(u,2));m.setIndex(new THREE.BufferAttribute(ix,1));return track(m)};
 const FH=3.6; // metres per floor
 const towerGeo=(h,vi)=>{const cols=vi===2?2:4,tw=cols*3.6,list=[];
  const main=h>=60?h*.78:h;list.push(boxG(17,main,17,0,5+main/2,0,[17/tw,main/(FH*8)]));
  if(h>=60){const up=h*.22;list.push(boxG(11.5,up,11.5,0,5+main+up/2,0,[11.5/tw,up/(FH*8)]));
   list.push(boxG(7.6,5,7.6,0,5+main+up+2.5,0,[.5,.2]))}
  return merge(list)};
 const shopGeo=track(boxG(19,5,19,0,2.5,0,[19/9.6,1]));
 const roofGeo=(h,tall)=>{const l=[boxG(17.6,.7,17.6,0,0,0),boxG(3.4,1.8,2.6,-4.5,1.2,3.5),boxG(2.6,1.2,3.4,3,.9,-4),boxG(1.6,1.4,1.6,5.5,1.1,5)];if(tall)l.push(boxG(.35,12,.35,0,6,0));return merge(l)};

 /* ---------- city ---------- */
 const lots={};const neonC=[0x2de2ff,0xff3da8,0x8a5cff,0xffa13d,0x4dff9a,0xff5470];
 const buckets={};const lampsPts=[],redPts=[];const allLots=[];
 for(let i=-OUT;i<N+OUT;i++)for(let j=-OUT;j<N+OUT;j++){
  const inside=i>=0&&j>=0&&i<N&&j<N;const arr=[];const x0=i*CELL+ROAD/2,z0=j*CELL+ROAD/2,d=Math.hypot(x0+23-W/2,z0+23-W/2)/(W*.7);
  for(let a=0;a<2;a++)for(let b=0;b<2;b++){
   const x=x0+a*27,z=z0+b*27;if(rng()<(inside?.1:.04))continue;
   let k=inside?Math.min(5,Math.floor(rng()*3+Math.max(0,1-d)*3.4)):Math.min(5,2+Math.floor(rng()*4));
   const vi=(rng()*3)|0;const key=k*3+vi;
   const L={x0:x,x1:x+19,z0:z,z1:z+19,h:HEI[k],k,vi,cx:x+9.5,cz:z+9.5,tint:.75+rng()*.5};
   (buckets[key]=buckets[key]||[]).push(L);arr.push(L);allLots.push(L)}
  if(inside)lots[i+','+j]=arr}
 {const dummy=new THREE.Object3D(),col=new THREE.Color();
  const shopL=allLots;const shop=new THREE.InstancedMesh(shopGeo,SHOPMAT,shopL.length);
  shopL.forEach((L,n)=>{dummy.position.set(L.cx,0,L.cz);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();shop.setMatrixAt(n,dummy.matrix)});scene.add(shop);
  for(const key in buckets){const arr=buckets[key],k=(key/3)|0,vi=key%3,h=HEI[k];
   const im=new THREE.InstancedMesh(towerGeo(h,vi),FMAT[vi],arr.length);
   const roofs=new THREE.InstancedMesh(roofGeo(h,h>=86),roofMat,arr.length);
   arr.forEach((L,n)=>{dummy.position.set(L.cx,0,L.cz);dummy.rotation.set(0,0,0);dummy.updateMatrix();im.setMatrixAt(n,dummy.matrix);col.setScalar(L.tint);im.setColorAt(n,col);
    const top=h>=60?5+h*.78+h*.22+5:5+h;dummy.position.set(L.cx,top+.35,L.cz);dummy.updateMatrix();roofs.setMatrixAt(n,dummy.matrix);
    if(h>=86)redPts.push(L.cx,top+12,L.cz)});
   scene.add(im,roofs)}}
 // neon signs
 const SIGNS=[['NEON','#ff3da8'],['RAMEN','#ffb13d'],['HOTEL','#2de2ff'],['09X','#a77cff'],['ARCADE','#4dff9a'],['BAR','#ff5470'],['CLUB','#35e6ff'],['MOTEL','#ff3da8'],['SUSHI','#ffe14d'],['DRIVE','#4d9bff']];
 const signMats=SIGNS.map(([txt,col],si)=>{const vert=si%3===0,c=vert?mk([192,640]):mk([640,200]),x=c.getContext('2d');
  x.clearRect(0,0,c.width,c.height);x.textAlign='center';x.textBaseline='middle';
  const draw=(fn)=>{fn()};
  const paint=(blur,col2,lw)=>{x.shadowColor=col;x.shadowBlur=blur;x.strokeStyle=col2;x.fillStyle=col2;x.lineWidth=lw};
  // frame tube
  paint(26,col,6);x.strokeRect(10,10,c.width-20,c.height-20);paint(0,'#fff',2);x.strokeRect(10,10,c.width-20,c.height-20);
  if(vert){const fs=Math.min(120,(c.height-60)/txt.length*.95);x.font='900 '+fs+'px "Arial Black",Impact,sans-serif';
   for(let r=0;r<2;r++){paint(r?0:34,r?'#fff':col,r?3:10);[...txt].forEach((ch,k)=>{const y=40+(k+.5)*(c.height-80)/txt.length;if(r)x.fillText(ch,c.width/2,y);else{x.strokeText(ch,c.width/2,y);x.fillText(ch,c.width/2,y)}})}}
  else{const fs=Math.min(150,(c.width-60)/txt.length*1.35);x.font='900 italic '+fs+'px "Arial Black",Impact,sans-serif';
   for(let r=0;r<3;r++){paint(r===2?0:r===1?16:40,r===2?'#fff':col,r===2?3:10);if(r===2)x.fillText(txt,c.width/2,c.height/2+4);else{x.strokeText(txt,c.width/2,c.height/2+4);x.fillText(txt,c.width/2,c.height/2+4)}}}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;track(t);
  const m=track(new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));m.color.setScalar(2.2);return{m,vert,col:new THREE.Color(col)}});
 {const sg=track(new THREE.PlaneGeometry(1,1)),per=signMats.map(()=>[]),halo=[],hc=[];
  allLots.forEach(L=>{if(rng()<.62&&L.h>=30){const f=(rng()*4)|0,si=(rng()*SIGNS.length)|0,S=signMats[si],hgt=S.vert?Math.min(L.h*.6,18+rng()*10):6+rng()*3,wid=S.vert?hgt*.3:hgt*3.2;
    const y=2+hgt/2+rng()*Math.max(0,L.h*.55-hgt),cx=L.cx,cz=L.cz,off=8.7;const P=[[cx-off-.1,y,cz,-Math.PI/2],[cx+off+.1,y,cz,Math.PI/2],[cx,y,cz-off-.1,Math.PI],[cx,y,cz+off+.1,0]][f];
    if(f<2&&false){}
    per[si].push([P[0],P[1],P[2],P[3],wid,hgt]);halo.push(P[0]+(f===0?-.8:f===1?.8:0),P[1],P[2]+(f===2?-.8:f===3?.8:0));hc.push(S.col.r,S.col.g,S.col.b)}});
  const d3=new THREE.Object3D();
  per.forEach((arr,si)=>{if(!arr.length)return;const im=new THREE.InstancedMesh(sg,signMats[si].m,arr.length);arr.forEach((a,n)=>{d3.position.set(a[0],a[1],a[2]);d3.rotation.set(0,a[3],0);d3.scale.set(a[4],a[5],1);d3.updateMatrix();im.setMatrixAt(n,d3.matrix)});im.frustumCulled=false;scene.add(im)});
  const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(halo,3));hg.setAttribute('color',new THREE.Float32BufferAttribute(hc,3));
  const hp=new THREE.Points(track(hg),track(new THREE.PointsMaterial({map:glowTex,size:26,vertexColors:true,transparent:true,opacity:.42,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true})));hp.frustumCulled=false;scene.add(hp)}
 // street lamps
 {const NP=(N+1)*(N+1);const dummy=new THREE.Object3D(),cc=new THREE.Color();
  const poleG=track(new THREE.CylinderGeometry(.11,.17,9,8)),armG=track(boxG(1.9,.12,.12,-.9,0,0)),headG=track(boxG(.9,.2,.38,0,0,0));
  const poleM=track(new THREE.MeshStandardMaterial({color:0x20222e,roughness:.45,metalness:.8,envMapIntensity:1}));
  const lampM=track(new THREE.MeshBasicMaterial({color:0xffffff}));
  const pole=new THREE.InstancedMesh(poleG,poleM,NP),arm=new THREE.InstancedMesh(armG,poleM,NP),head=new THREE.InstancedMesh(headG,lampM,NP);let pn=0;const lp=[],lc=[];
  for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const px=i*CELL+8.6,pz=j*CELL+8.6,warm=(i+j)%2===0;
   dummy.rotation.set(0,0,0);dummy.position.set(px,4.5,pz);dummy.updateMatrix();pole.setMatrixAt(pn,dummy.matrix);
   dummy.position.set(px,9,pz);dummy.updateMatrix();arm.setMatrixAt(pn,dummy.matrix);
   dummy.position.set(px-1.8,8.9,pz);dummy.updateMatrix();head.setMatrixAt(pn,dummy.matrix);
   if(warm)cc.setRGB(5,3.2,1.5);else cc.setRGB(1.6,3.4,5);head.setColorAt(pn,cc);
   lp.push(px-1.8,8.8,pz);lc.push(warm?1:.45,warm?.72:.78,warm?.4:1);pn++}
  scene.add(pole,arm,head);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));g.setAttribute('color',new THREE.Float32BufferAttribute(lc,3));
  const p=new THREE.Points(track(g),track(new THREE.PointsMaterial({map:glowTex,size:16,vertexColors:true,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending})));p.frustumCulled=false;scene.add(p)}
 // aircraft warning lights
 {const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(redPts,3));
  const m=track(new THREE.PointsMaterial({map:glowTex,size:14,color:0xff2030,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending}));const p=new THREE.Points(track(g),m);p.frustumCulled=false;scene.add(p);scene.userData.red=m}

 // rain
 const rainU={time:{value:0},cam:{value:new THREE.Vector3()},vel:{value:new THREE.Vector3()}};
 {const NR=low?900:2200,pos=new Float32Array(NR*6),fl=new Float32Array(NR*2);
  for(let n=0;n<NR;n++){const x=rand(0,60),y=rand(0,40),z=rand(0,60);for(let k=0;k<2;k++){pos.set([x,y,z],(n*2+k)*3);fl[n*2+k]=k}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('end',new THREE.BufferAttribute(fl,1));
  const m=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:rainU,
   vertexShader:`attribute float end;uniform float time;uniform vec3 cam;uniform vec3 vel;varying float vA;
    void main(){vec3 p=position;p.y-=time*26.;vec3 q=mod(p-cam+vec3(30.,20.,30.),vec3(60.,40.,60.))-vec3(30.,20.,30.)+cam;
     q.y+=0.;vec3 tail=vec3(0.,1.,0.)*1.1+vel*.035;q+=tail*end;vec4 mv=viewMatrix*vec4(q,1.);gl_Position=projectionMatrix*mv;vA=(1.-end)*.5+.1;vA*=smoothstep(40.,5.,length(q-cam))*step(.1,q.y);}`,
   fragmentShader:`varying float vA;void main(){gl_FragColor=vec4(vec3(.62,.72,1.)*1.2,vA*.55);}`}));
  const l=new THREE.LineSegments(track(g),m);l.frustumCulled=false;scene.add(l)}

 // coins and gems
 const NC=240,NG=36,dummy=new THREE.Object3D();
 const cg=track(new THREE.CylinderGeometry(1.15,1.15,.3,28));cg.rotateX(Math.PI/2);
 const coinMat=track(new THREE.MeshStandardMaterial({color:0xffc83d,metalness:1,roughness:.2,emissive:0xff9a1a,emissiveIntensity:.55,envMapIntensity:2}));
 const gemMat=track(new THREE.MeshPhysicalMaterial({color:0x35f0ff,metalness:.1,roughness:.05,emissive:0x12b8ff,emissiveIntensity:1.2,clearcoat:1,envMapIntensity:2.5,flatShading:true}));
 const coinM=new THREE.InstancedMesh(cg,coinMat,NC),gemM=new THREE.InstancedMesh(track(new THREE.OctahedronGeometry(1.4)),gemMat,NG);
 coinM.frustumCulled=false;gemM.frustumCulled=false;scene.add(coinM,gemM);
 const rp=()=>{const k=1+Math.floor(rng()*(N-1)),t=40+rng()*(W-80),off=(rng()-.5)*11;return rng()<.5?[k*CELL+off,t]:[t,k*CELL+off]};
 const coins=Array.from({length:NC},rp),gems=Array.from({length:NG},rp);
 const pickPos=new Float32Array((NC+NG)*3),pickCol=new Float32Array((NC+NG)*3);for(let n=0;n<NC+NG;n++){const c=n<NC?[1,.72,.2]:[.2,.9,1];pickCol.set(c,n*3)}
 {const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pickPos,3));g.setAttribute('color',new THREE.BufferAttribute(pickCol,3));
  const p=new THREE.Points(track(g),track(new THREE.PointsMaterial({map:glowTex,size:7,vertexColors:true,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending})));p.frustumCulled=false;scene.add(p);scene.userData.pick=g}

 /* ---------- player car ---------- */
 const car=new THREE.Group();scene.add(car);
 const carBody=new THREE.Group();car.add(carBody);
 const paintCol=new THREE.Color(0xd4104f);
 const wheels=[],fronts=[];let glbOK=false,bodyMat=null;
 const mkPaint=(c)=>new THREE.MeshPhysicalMaterial({color:c,metalness:.9,roughness:.32,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:2.0});
 try{
  if(!X.GLTFLoader||!X.DRACOLoader)throw new Error('no loader');
  const dl=new X.DRACOLoader();dl.setDecoderPath(DRACO);const gl=new X.GLTFLoader();gl.setDRACOLoader(dl);
  const gltf=await Promise.race([gl.loadAsync(GLB),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),30000))]);
  const m=gltf.scene;
  bodyMat=mkPaint(paintCol);
  const glass=new THREE.MeshPhysicalMaterial({color:0x03060e,metalness:.2,roughness:.02,transparent:true,opacity:.62,envMapIntensity:3,clearcoat:1});
  const tailM=new THREE.MeshStandardMaterial({color:0x300000,emissive:0xff1020,emissiveIntensity:2.6,roughness:.2});
  const projM=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff1d0,emissiveIntensity:5,roughness:.1});
  const ledM=new THREE.MeshStandardMaterial({color:0x331100,emissive:0xff8a20,emissiveIntensity:2,roughness:.3});
  const tire=new THREE.MeshStandardMaterial({color:0x0b0b0d,roughness:.85,metalness:0,envMapIntensity:.4});
  const rimM=new THREE.MeshStandardMaterial({color:0xdadde8,metalness:1,roughness:.16,envMapIntensity:2.2});
  const hide=new Set(['interior_light','carpet']);
  m.traverse(o=>{if(!o.isMesh)return;const n=o.name;
   if(hide.has(n)){o.visible=false;return}
   if(n==='body')o.material=bodyMat;else if(n==='glass'){o.material=glass;o.renderOrder=2}
   else if(n==='lights_red')o.material=tailM;else if(n==='lights')o.material=projM;else if(n==='leds')o.material=ledM;
   else if(n==='tire')o.material=tire;else if(/^rim_|^wheel$/.test(n)||n==='chrome')o.material=rimM;
   else if(o.material){o.material=o.material.clone();o.material.envMapIntensity=1.4}
   o.castShadow=false});
  ['wheel_fl','wheel_fr','wheel_rl','wheel_rr'].forEach(nm=>{const w=m.getObjectByName(nm);if(!w)return;
   if(nm.startsWith('wheel_f')){const pv=new THREE.Group();pv.position.copy(w.position);w.position.set(0,0,0);w.parent.add(pv);pv.add(w);fronts.push(pv)}
   wheels.push(w)});
  m.rotation.y=Math.PI;
  const wrap=new THREE.Group();wrap.add(m);
  const bb=new THREE.Box3().setFromObject(wrap),sz=new THREE.Vector3();bb.getSize(sz);const sc=4.55/Math.max(sz.x,sz.z);wrap.scale.setScalar(sc);
  wrap.updateMatrixWorld(true);const b2=new THREE.Box3().setFromObject(wrap);wrap.position.y=-b2.min.y;
  carBody.add(wrap);glbOK=true;
 }catch(err){console.warn('car model fallback',err);
  bodyMat=mkPaint(paintCol);const dark=new THREE.MeshStandardMaterial({color:0x090912,metalness:.7,roughness:.4});
  const add=(g,mt,x,y,z)=>{const mm=new THREE.Mesh(track(g),mt);mm.position.set(x,y,z);carBody.add(mm)};
  add(new THREE.BoxGeometry(2,.6,4.5),bodyMat,0,.6,0);add(new THREE.BoxGeometry(1.6,.5,2.2),dark,0,1.1,-.2);
  [[-1,1.4],[1,1.4],[-1,-1.4],[1,-1.4]].forEach(p=>{const g=new THREE.CylinderGeometry(.42,.42,.35,20);g.rotateZ(Math.PI/2);add(g,dark,p[0],.42,p[1])})}
 // light spill and glows
 const glowSpr=(c,k,w,h)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:new THREE.Color(c).multiplyScalar(k),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));s.scale.set(w,h,1);return s};
 const tailG=[-.75,.75].map(x=>{const s=glowSpr(0xff1030,2.2,1.6,.9);s.position.set(x,.95,-2.28);carBody.add(s);return s});
 [-.7,.7].forEach(x=>{const s=glowSpr(0xfff0d0,2.4,1.5,.9);s.position.set(x,.72,2.2);carBody.add(s)});
 const under=new THREE.Mesh(track(new THREE.PlaneGeometry(5.4,8)),track(new THREE.MeshBasicMaterial({map:glowTex,color:new THREE.Color(0xff2d8a).multiplyScalar(1.8),transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending})));under.rotation.x=-Math.PI/2;under.position.y=.06;car.add(under);
 const shadow=new THREE.Mesh(track(new THREE.PlaneGeometry(3.4,6.2)),track(new THREE.MeshBasicMaterial({map:(()=>{const c=mk([128,256]),x=c.getContext('2d'),g=x.createRadialGradient(64,128,8,64,128,120);g.addColorStop(0,'rgba(0,0,0,.95)');g.addColorStop(.6,'rgba(0,0,0,.45)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.save();x.translate(64,128);x.scale(.8,1.05);x.translate(-64,-128);x.fillRect(-60,-80,260,420);x.restore();return track(new THREE.CanvasTexture(c))})(),transparent:true,depthWrite:false})));shadow.rotation.x=-Math.PI/2;shadow.position.y=.045;car.add(shadow);
 const hl=[-.7,.7].map(x=>{const s=new THREE.SpotLight(0xfff0d8,260,80,.45,.8,1.6);s.position.set(x,.8,2);const tg=new THREE.Object3D();tg.position.set(x*.5,.2,22);car.add(tg);s.target=tg;car.add(s);return s});

 /* ---------- traffic cars (procedural, lit) ---------- */
 const NT=14,trafficG=new THREE.Group(),tc=[],tpos=[];scene.add(trafficG);
 {const prof=new THREE.Shape();[[-2.3,.38],[-2.32,.8],[-1.75,.98],[-.95,1.42],[.5,1.44],[1.1,1.0],[2.15,.84],[2.32,.62],[2.3,.38]].forEach((p,i)=>i?prof.lineTo(p[0],p[1]):prof.moveTo(p[0],p[1]));
  const bg=new THREE.ExtrudeGeometry(prof,{depth:1.7,bevelEnabled:true,bevelSize:.1,bevelThickness:.12,bevelSegments:3,curveSegments:8});bg.rotateY(-Math.PI/2);bg.translate(.85,0,0);track(bg);
  const gs=new THREE.Shape();[[-.98,1.0],[1.08,1.0],[.52,1.43],[-.9,1.43]].forEach((p,i)=>i?gs.lineTo(p[0],p[1]):gs.moveTo(p[0],p[1]));
  const gg=new THREE.ExtrudeGeometry(gs,{depth:1.74,bevelEnabled:false});gg.rotateY(-Math.PI/2);gg.translate(.87,0,0);track(gg);
  const wg=track(new THREE.CylinderGeometry(.38,.38,.28,18));wg.rotateZ(Math.PI/2);
  const glM=track(new THREE.MeshPhysicalMaterial({color:0x04070e,metalness:.2,roughness:.04,envMapIntensity:3,clearcoat:1}));
  const wM=track(new THREE.MeshStandardMaterial({color:0x0d0d10,roughness:.8}));
  const tailM=track(new THREE.MeshBasicMaterial({color:new THREE.Color(0xff1030).multiplyScalar(3)})),headM=track(new THREE.MeshBasicMaterial({color:new THREE.Color(0xfff0d0).multiplyScalar(3)}));
  const tg=track(new THREE.BoxGeometry(.5,.12,.08)),cols=[0xe8e8ee,0x0f3d99,0xf2b01a,0x1a1a20,0x23a05a,0xb01e2e,0x6a3bd6,0x9aa1b0];
  const paints=cols.map(c=>track(mkPaint(c)));
  for(let n=0;n<NT;n++){const grp=new THREE.Group(),body=new THREE.Mesh(bg,paints[n%paints.length]),gl=new THREE.Mesh(gg,glM);grp.add(body,gl);
   [[-.9,1.3],[.9,1.3],[-.9,-1.4],[.9,-1.4]].forEach(p=>{const w=new THREE.Mesh(wg,wM);w.position.set(p[0],.38,p[1]);grp.add(w)});
   [-.62,.62].forEach(x=>{const t=new THREE.Mesh(tg,tailM);t.position.set(x,.8,-2.36);grp.add(t);const h=new THREE.Mesh(tg,headM);h.position.set(x,.66,2.35);grp.add(h)});
   const g2=glowSpr(0xff1030,2,3,1.4);g2.position.set(0,.8,-2.5);grp.add(g2);const g3=glowSpr(0xfff0d0,2,3.4,1.6);g3.position.set(0,.7,2.6);grp.add(g3);
   trafficG.add(grp);const lane=rng()<.5?1:-1;tc.push({ax:rng()<.5?'x':'z',k:1+Math.floor(rng()*(N-1)),lane,t:rng()*W,s:14+rng()*12,grp});tpos.push([0,0])}}

 /* ---------- drift smoke ---------- */
 const NS=140,smokeP=new Float32Array(NS*3),smokeA=new Float32Array(NS),smokeV=[];for(let n=0;n<NS;n++){smokeA[n]=1;smokeV.push([0,0,0])}
 let smokeI=0;
 {const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(smokeP,3));g.setAttribute('age',new THREE.BufferAttribute(smokeA,1));
  const m=track(new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{map:{value:glowTex},scale:{value:host.clientHeight*pr/2}},
   vertexShader:`attribute float age;uniform float scale;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(4.+age*16.)*scale/-mv.z*.35;vA=(1.-age)*step(age,.999);}`,
   fragmentShader:`uniform sampler2D map;varying float vA;void main(){float a=texture2D(map,gl_PointCoord).a;gl_FragColor=vec4(.55,.55,.62,a*vA*.42);}`}));
  const p=new THREE.Points(track(g),m);p.frustumCulled=false;scene.add(p);scene.userData.smoke=g;scene.userData.smokeM=m}

 /* ---------- state ---------- */
 const S={x:W/2,z:W/2-30,th:0,vx:0,vz:0,sp:0,camYaw:0,coins:0,gems:0,hit:0,t:0,roll:0,pitch:0,wr:0,steer:0};
 const g={mode:mode0,started:false,paused:false,dead:false};
 let holdL=new Set(),holdR=new Set(),raf=0,last=performance.now(),mmT=0,fcoin=store.get('coins',0),fgem=store.get('gems',0);
 const el={c:$('#hCoins'),g:$('#hGems'),s:$('#hSpd'),mm:$('#mm'),tip:$('#tip'),fl:$('#flash'),mode:$('#hMode')};
 let sc=-1,sg=-1,ss=-1;
 const hudCoins=()=>{if(sc!==fcoin||sg!==fgem){sc=fcoin;sg=fgem;el.c.textContent=fcoin;el.g.textContent=fgem}};
 const setMode=m=>{g.mode=m;trafficG.visible=m==='traffic';el.mode.textContent=m==='traffic'?'TRAFFIC':'CHILL ROAM'};
 g.setMode=setMode;setMode(mode0);
 const place=()=>{for(let n=0;n<NC;n++){dummy.position.set(coins[n][0],1.9+Math.sin(S.t*2+n)*.2,coins[n][1]);dummy.rotation.set(0,S.t*3+n,0);dummy.scale.setScalar(1);dummy.updateMatrix();coinM.setMatrixAt(n,dummy.matrix);pickPos[n*3]=coins[n][0];pickPos[n*3+1]=1.9;pickPos[n*3+2]=coins[n][1]}
  for(let n=0;n<NG;n++){dummy.position.set(gems[n][0],2.2+Math.sin(S.t*1.6+n)*.3,gems[n][1]);dummy.rotation.set(S.t*.8,S.t*2+n,0);dummy.scale.setScalar(1);dummy.updateMatrix();gemM.setMatrixAt(n,dummy.matrix);pickPos[(NC+n)*3]=gems[n][0];pickPos[(NC+n)*3+1]=2.2;pickPos[(NC+n)*3+2]=gems[n][1]}
  coinM.instanceMatrix.needsUpdate=true;gemM.instanceMatrix.needsUpdate=true;scene.userData.pick.attributes.position.needsUpdate=true};
 const hold=e=>{if(e.target.closest&&e.target.closest('[data-nohold]'))return;const set=e.clientX<innerWidth/2?holdL:holdR;set.add(e.pointerId);e.preventDefault()};
 const rel=e=>{holdL.delete(e.pointerId);holdR.delete(e.pointerId)};
 host.addEventListener('pointerdown',hold);addEventListener('pointerup',rel);addEventListener('pointercancel',rel);
 const prevent=e=>e.preventDefault();host.addEventListener('touchmove',prevent,{passive:false});

 /* ---------- post processing ---------- */
 let comp=null,post=null;
 const postShader={uniforms:{tDiffuse:{value:null},time:{value:0},speed:{value:0},amt:{value:0}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform sampler2D tDiffuse;uniform float time;uniform float speed;uniform float amt;varying vec2 vUv;
   float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+time)*43758.5453);}
   void main(){vec2 c=vUv-.5;float r=length(c*vec2(1.6,1.));
    float bl=speed*.045*smoothstep(.12,.9,r);
    vec3 col=vec3(0.);float ws=0.;
    for(int i=0;i<7;i++){float k=float(i)/6.;float w=1.-k*.5;vec2 o=c*bl*k;
     col+=vec3(texture2D(tDiffuse,vUv-o*(1.+amt*.5)).r,texture2D(tDiffuse,vUv-o).g,texture2D(tDiffuse,vUv-o*(1.-amt*.5)).b)*w;ws+=w;}
    col/=ws;
    col*=1.-smoothstep(.45,1.15,r)*.55;
    col+=(h(vUv*vec2(1920.,1080.))-.5)*.012;
    gl_FragColor=vec4(col,1.);}`};
 if(FX){try{const w=host.clientWidth,h=host.clientHeight;
  const rt=new THREE.WebGLRenderTarget(w*pr,h*pr,{type:THREE.HalfFloatType,samples:4});
  comp=new FX.EffectComposer(R,rt);comp.setPixelRatio(pr);comp.setSize(w,h);
  comp.addPass(new FX.RenderPass(scene,cam));
  const bloom=new FX.UnrealBloomPass(new THREE.Vector2(w,h),.42,.65,1.0);comp.addPass(bloom);g.bloom=bloom;
  if(X.ShaderPass){post=new X.ShaderPass(postShader);comp.addPass(post)}
  comp.addPass(new FX.OutputPass());
 }catch(e){console.warn('post off',e);comp=null}}
 const resize=()=>{R.setSize(host.clientWidth,host.clientHeight);if(comp)comp.setSize(host.clientWidth,host.clientHeight);cam.aspect=host.clientWidth/host.clientHeight;cam.updateProjectionMatrix();scene.userData.smokeM.uniforms.scale.value=host.clientHeight*pr/2};
 addEventListener('resize',resize);addEventListener('orientationchange',resize);
 g.recal=()=>{recalTilt();toast('Steering re-centered')};
 g.begin=()=>{if(g.started)return;g.started=true;$('#startov').classList.add('hidden');recalTilt();el.tip.style.opacity=1;
  el.tip.textContent='Rotate to steer  |  hold left side = brake  |  hold right side = drift  |  OPTIONS = pause';setTimeout(()=>el.tip.style.opacity=0,7000)};
 g.setPaused=p=>{g.paused=p};
 const flash=()=>{el.fl.style.opacity=1;setTimeout(()=>el.fl.style.opacity=0,250)};
 const gp=()=>P.pad;
 function inputs(){
  let st=0;const p=gp();
  if(p){const ax=P.ax[0]||0;if(Math.abs(ax)>.14)st=ax}
  if(!st&&cfg.tilt&&isOri()&&tilt.cur)st=tilt.steer;
  if(KEYS.ArrowLeft)st=-1;if(KEYS.ArrowRight)st=1;
  const v=P.val||[];
  const brake=holdL.size>0||(p&&((v[6]||0)>.3||P.b[4]||P.b[2]))||KEYS.ArrowDown||KEYS[' '];
  const drift=holdR.size>0||(p&&((v[7]||0)>.3||P.b[5]||P.b[0]))||KEYS.Shift;
  if(p&&P.b[3]&&!g.tri){g.recal();g.tri=true}if(p&&!P.b[3])g.tri=false;
  return{st:Math.max(-1,Math.min(1,st)),brake:!!brake,drift:!!drift};
 }
 function collide(){
  const bi=Math.floor(S.x/CELL),bj=Math.floor(S.z/CELL),r=1.9;
  for(let i=bi-1;i<=bi+1;i++)for(let j=bj-1;j<=bj+1;j++){const a=lots[i+','+j];if(!a)continue;
   for(const L of a){const cx=Math.max(L.x0,Math.min(S.x,L.x1)),cz=Math.max(L.z0,Math.min(S.z,L.z1)),dx=S.x-cx,dz=S.z-cz,d2=dx*dx+dz*dz;
    if(d2<r*r){let d=Math.sqrt(d2),nx,nz;if(d<1e-4){nx=0;nz=1;d=0}else{nx=dx/d;nz=dz/d}
     S.x+=nx*(r-d);S.z+=nz*(r-d);const vn=S.vx*nx+S.vz*nz;
     if(vn<0){S.vx-=1.5*vn*nx;S.vz-=1.5*vn*nz;if(S.sp>18){S.hit=.5;flash();S.pitch=-.05}S.sp*=.55}}}}
  const m=6;if(S.x<m){S.x=m;S.vx=Math.abs(S.vx)*.5}if(S.x>W-m){S.x=W-m;S.vx=-Math.abs(S.vx)*.5}
  if(S.z<m){S.z=m;S.vz=Math.abs(S.vz)*.5}if(S.z>W-m){S.z=W-m;S.vz=-Math.abs(S.vz)*.5}
 }
 let lastI={st:0,brake:false,drift:false},shake=0;
 function emitSmoke(x,z,vx,vz){const n=smokeI++%NS;smokeP[n*3]=x;smokeP[n*3+1]=.35;smokeP[n*3+2]=z;smokeA[n]=0;smokeV[n]=[vx*.2+rand(-.6,.6),rand(.4,1.2),vz*.2+rand(-.6,.6)]}
 function step(dt){
  S.t+=dt;const I=inputs();lastI=I;
  if(g.started){
   const vmax=I.drift?58:66;
   if(I.brake)S.sp=Math.max(0,S.sp-75*dt);else if(S.sp<vmax)S.sp=Math.min(vmax,S.sp+26*dt);else S.sp=Math.max(vmax,S.sp-20*dt);
   if(I.drift)S.sp=Math.max(0,S.sp-5*dt);
   const rate=1.9*(.35+.65*Math.min(1,S.sp/22))/(1+S.sp/95)*(I.drift?1.75:1);
   if(S.sp>.8)S.th-=I.st*rate*dt;
  }else S.sp=0;
  const nfx=Math.sin(S.th),nfz=Math.cos(S.th),grip=I.drift?1.3:7.5;
  const k=Math.min(1,grip*dt);S.vx+=(nfx*S.sp-S.vx)*k;S.vz+=(nfz*S.sp-S.vz)*k;
  S.x+=S.vx*dt;S.z+=S.vz*dt;collide();
  const real=Math.hypot(S.vx,S.vz);if(real<S.sp)S.sp=Math.max(real,S.sp*.97);
  if(g.mode==='traffic'){
   tc.forEach((c,n)=>{c.t+=c.s*dt*c.lane*-1;if(c.t>W)c.t-=W;if(c.t<0)c.t+=W;
    const off=c.lane*4.6,x=c.ax==='z'?c.k*CELL+off:c.t,z=c.ax==='z'?c.t:c.k*CELL+off;tpos[n][0]=x;tpos[n][1]=z;
    const dir=-c.lane;c.grp.position.set(x,0,z);c.grp.rotation.y=c.ax==='z'?(dir>0?0:Math.PI):(dir>0?Math.PI/2:-Math.PI/2);
    if(S.hit<=0){const dx=S.x-x,dz=S.z-z;if(dx*dx+dz*dz<12){const d=Math.hypot(dx,dz)||1;S.x+=dx/d*2.5;S.z+=dz/d*2.5;S.sp*=.25;S.vx*=.3;S.vz*=.3;S.hit=1;flash();shake=1;fcoin=Math.max(0,fcoin-3);store.set('coins',fcoin)}}})}
  S.hit=Math.max(0,S.hit-dt);
  for(let n=0;n<NC;n++){const dx=S.x-coins[n][0],dz=S.z-coins[n][1];if(dx*dx+dz*dz<9){fcoin++;coins[n]=rp();store.set('coins',fcoin)}}
  for(let n=0;n<NG;n++){const dx=S.x-gems[n][0],dz=S.z-gems[n][1];if(dx*dx+dz*dz<12){fgem++;fcoin+=5;gems[n]=rp();store.set('gems',fgem);store.set('coins',fcoin)}}
  place();
  // car visuals
  const slip=I.drift&&S.sp>20?-I.st*.28:0;
  car.position.set(S.x,0,S.z);car.rotation.y=S.th+slip;
  const rollT=I.st*Math.min(1,S.sp/50)*.045*(I.drift?1.6:1),pitT=(I.brake&&S.sp>5?.035:0);
  S.roll+=(rollT-S.roll)*Math.min(1,dt*6);S.pitch+=(pitT-S.pitch)*Math.min(1,dt*6);
  carBody.rotation.z=S.roll;carBody.rotation.x=-S.pitch;carBody.position.y=Math.sin(S.t*38)*.004*Math.min(1,S.sp/40);
  S.wr-=S.sp*dt/.36;wheels.forEach(w=>w.rotation.x=S.wr);
  S.steer+=(-I.st*.5-S.steer)*Math.min(1,dt*10);fronts.forEach(f=>f.rotation.y=S.steer);
  tailG.forEach(t=>t.material.color.setRGB(2.2+(I.brake?3:0),.1+(I.brake?.1:0),.2));
  if((I.drift&&S.sp>22)||(I.brake&&S.sp>30)){for(let q=0;q<2;q++){const sd=q?1:-1,cs=Math.cos(car.rotation.y),sn=Math.sin(car.rotation.y);emitSmoke(S.x+(-sn*1.35)+cs*sd*.9,S.z+(-cs*1.35)-sn*sd*.9,S.vx,S.vz)}}
  for(let n=0;n<NS;n++){if(smokeA[n]<1){smokeA[n]+=dt*.7;smokeP[n*3]+=smokeV[n][0]*dt;smokeP[n*3+1]+=smokeV[n][1]*dt;smokeP[n*3+2]+=smokeV[n][2]*dt}}
  scene.userData.smoke.attributes.position.needsUpdate=true;scene.userData.smoke.attributes.age.needsUpdate=true;
  // camera
  let d=S.th-S.camYaw;d=Math.atan2(Math.sin(d),Math.cos(d));S.camYaw+=d*Math.min(1,dt*4.2);
  const cx=Math.sin(S.camYaw),cz=Math.cos(S.camYaw),sp1=Math.min(1,S.sp/66);
  shake=Math.max(0,shake-dt*2);const sh=(sp1*.02+shake*.25);
  cam.position.set(S.x-cx*(8.4+sp1*1.6)+rand(-sh,sh),3.3+sp1*.5+rand(-sh,sh),S.z-cz*(8.4+sp1*1.6)+rand(-sh,sh));cam.lookAt(S.x+cx*10,1.5,S.z+cz*10);
  const fov=60+sp1*20+(I.drift?3:0);if(Math.abs(cam.fov-fov)>.2){cam.fov+=(fov-cam.fov)*Math.min(1,dt*3);cam.updateProjectionMatrix()}
  hudCoins();const sp=Math.round(S.sp*2.4);if(sp!==ss){ss=sp;el.s.textContent=sp}
  // shader state
  RU.time.value=S.t;RU.carPos.value.set(S.x,0,S.z);RU.carDir.value.set(Math.sin(car.rotation.y),Math.cos(car.rotation.y));RU.brake.value+=((I.brake?1:0)-RU.brake.value)*Math.min(1,dt*10);
  rainU.time.value=S.t;rainU.cam.value.copy(cam.position);rainU.vel.value.set(-S.vx,0,-S.vz);
  if(post){post.uniforms.time.value=S.t%10;post.uniforms.speed.value=sp1*(I.drift?1.25:1);post.uniforms.amt.value=sp1*.6}
  if(scene.userData.red)scene.userData.red.opacity=.35+.65*(Math.sin(S.t*3)>.2?1:0);
 }
 const vmaxNow=()=>66;
 function minimap(){
  const c=el.mm,x=c.getContext('2d'),w=c.width,s=w/2/220;x.clearRect(0,0,w,w);x.save();x.beginPath();x.arc(w/2,w/2,w/2-2,0,7);x.clip();
  x.fillStyle='rgba(5,3,12,.85)';x.fillRect(0,0,w,w);x.translate(w/2,w/2);x.rotate(S.th-Math.PI);
  x.fillStyle='#2a2150';const bi=Math.floor(S.x/CELL),bj=Math.floor(S.z/CELL);
  for(let i=bi-5;i<=bi+5;i++)for(let j=bj-5;j<=bj+5;j++){if(i<0||j<0||i>=N||j>=N)continue;x.fillRect((i*CELL+ROAD/2-S.x)*s,(j*CELL+ROAD/2-S.z)*s,(CELL-ROAD)*s,(CELL-ROAD)*s)}
  x.fillStyle='#ffc83d';coins.forEach(p=>{const dx=(p[0]-S.x)*s,dz=(p[1]-S.z)*s;if(dx*dx+dz*dz<w*w/4)x.fillRect(dx-2,dz-2,4,4)});
  x.fillStyle='#35f0ff';gems.forEach(p=>{const dx=(p[0]-S.x)*s,dz=(p[1]-S.z)*s;if(dx*dx+dz*dz<w*w/4)x.fillRect(dx-4,dz-4,8,8)});
  if(g.mode==='traffic'){x.fillStyle='#ff4060';tpos.forEach(p=>{const dx=(p[0]-S.x)*s,dz=(p[1]-S.z)*s;if(dx*dx+dz*dz<w*w/4)x.fillRect(dx-3,dz-3,6,6)})}
  x.restore();x.fillStyle='#fff';x.beginPath();x.moveTo(w/2,w/2-14);x.lineTo(w/2+9,w/2+10);x.lineTo(w/2-9,w/2+10);x.closePath();x.fill();
 }
 let ema=1/60,adaptT=0;
 function setPR(p){pr=p;R.setPixelRatio(pr);if(comp)comp.setPixelRatio(pr);scene.userData.smokeM.uniforms.scale.value=host.clientHeight*pr/2}
 function frame(now){
  raf=requestAnimationFrame(frame);
  let dt=(now-last)/1000;last=now;if(dt>.1)dt=.1;
  ema+=(dt-ema)*.05;adaptT+=dt;
  if(!g.paused){step(dt);mmT+=dt;if(mmT>.066){mmT=0;minimap()}}
  sky.position.copy(cam.position);
  if(adaptT>2&&!STATIC&&g.started){adaptT=0;if(ema>1/45&&pr>1.01)setPR(Math.max(1,pr-.25));else if(ema<1/58&&pr<prMax-.01)setPR(Math.min(prMax,pr+.25))}
  if(comp)comp.render(dt);else R.render(scene,cam);
 }
 place();step(0);hudCoins();last=performance.now();raf=requestAnimationFrame(frame);
 g.dispose=()=>{cancelAnimationFrame(raf);host.removeEventListener('pointerdown',hold);removeEventListener('pointerup',rel);removeEventListener('pointercancel',rel);host.removeEventListener('touchmove',prevent);removeEventListener('resize',resize);removeEventListener('orientationchange',resize);
  scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.material.dispose&&!o.material.map)try{o.material.dispose()}catch(e){}});disposables.forEach(d=>{try{d.dispose()}catch(e){}});
  try{road.getRenderTarget&&road.getRenderTarget().dispose()}catch(e){}
  try{if(comp){comp.dispose&&comp.dispose();comp.renderTarget1&&comp.renderTarget1.dispose();comp.renderTarget2&&comp.renderTarget2.dispose()}}catch(e){}R.dispose();try{R.forceContextLoss()}catch(e){}R.domElement.remove()};
 g.glb=glbOK;
 return g;
   }
