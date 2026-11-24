/* vehicle behaviours for water / air kinds */
export function boatKind(A){
 const {T,S,W,PH:PH0,model,body,car,emit,flash,VLEN,cat,Hn,ground,DEF}=A;const WL=DEF.water||0;const PH=Object.assign({vd:PH0.vmax*.85,brk:45,grip:2.4,dgrip:1.1,mass:1},PH0);
 const hullLen=VLEN;
 return{step(dt,I){
  const wh=(x,z)=>W.waveH(x,z,S.t);
  if(A.S.started||true){
   const vmax=(I.drift?PH.vd:PH.vmax)*(I.pad?Math.max(.2,I.thr):1);
   if(!A.S.started)S.sp=Math.max(0,S.sp-10*dt);
   else if(I.brake){if(S.sp>.6)S.sp=Math.max(0,S.sp-PH.brk*dt);else if(I.pad)S.sp=Math.max(-14,S.sp-PH.acc*.6*dt);else S.sp=0}
   else if(S.sp<0)S.sp=Math.min(0,S.sp+25*dt);
   else if(I.pad&&I.thr===0)S.sp=Math.max(0,S.sp-8*dt);
   else if(S.sp<vmax)S.sp=Math.min(vmax,S.sp+PH.acc*dt);else S.sp=Math.max(vmax,S.sp-14*dt);
   const as=Math.abs(S.sp);const rate=1.35*(.3+.7*Math.min(1,as/16))/(1+as/(110*(PH.mass||1)))*(I.drift?1.6:1);
   if(as>.5&&A.S.started)S.th-=I.st*rate*dt*(S.sp<0?-1:1);
  }
  const fx=Math.sin(S.th),fz=Math.cos(S.th);
  const k=Math.min(1,(I.drift?PH.dgrip:PH.grip)*dt);S.vx+=(fx*S.sp-S.vx)*k;S.vz+=(fz*S.sp-S.vz)*k;
  const px=S.x,pz=S.z;S.x+=S.vx*dt;S.z+=S.vz*dt;
  if(ground(S.x,S.z)>WL-.5){S.x=px;S.z=pz;if(Math.abs(S.sp)>12){flash();A.shake=.6;S.hit=.4}S.vx*=-.35;S.vz*=-.35;S.sp*=-.3}
  A.collide(hullLen*.3);
  const m=10;S.x=Math.max(m,Math.min(W.SIZE-m,S.x));S.z=Math.max(m,Math.min(W.SIZE-m,S.z));
  const L=hullLen*.4,s=Math.sin(S.th),c=Math.cos(S.th);
  const hf=wh(S.x+s*L,S.z+c*L),hb=wh(S.x-s*L,S.z-c*L),hl=wh(S.x+c*1.4,S.z-s*1.4),hr=wh(S.x-c*1.4,S.z+s*1.4),hm=wh(S.x,S.z);
  const plane=Math.min(1,Math.abs(S.sp)/(PH.vmax*.7));
  S.y+=(hm-S.y)*Math.min(1,dt*9);
  const tp=Math.atan2(hf-hb,L*2)+plane*.1,tr=Math.atan2(hl-hr,2.8);S.pitch+=(tp-S.pitch)*Math.min(1,dt*5);S.roll+=(tr-S.roll)*Math.min(1,dt*5);
  const lean=I.st*Math.min(1,Math.abs(S.sp)/30)*.28*(I.drift?1.4:1);S.rl2=(S.rl2||0)+(lean-(S.rl2||0))*Math.min(1,dt*4);
  car.position.set(S.x,S.y+.05,S.z);car.rotation.set(-S.pitch,S.th,S.roll);body.rotation.set(0,0,S.rl2);body.position.y=Math.sin(S.t*3)*.05;
  (model.userData.props||[]).forEach(p=>{p.rotation.z+=Math.abs(S.sp)*dt*1.5});
  if(Math.abs(S.sp)>4){for(let q=0;q<(Math.abs(S.sp)>20?3:1);q++){const sd=(q%2?1:-1);emit(S.x-s*hullLen*.45+c*sd*.9*(q?1:.4),S.y+.2,S.z-c*hullLen*.45-s*sd*.9*(q?1:.4),S.vx*.1,1.6,S.vz*.1)}}
  const big=PH.vmax;
  return{spd:Math.abs(S.sp)*2.4,vmax:PH.vmax,fovK:Math.min(1,Math.abs(S.sp)/PH.vmax),camD:hullLen*1.5+4,camH:hullLen*.22+2.4,camY:S.y,fov:62}
 }}}
