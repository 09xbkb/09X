/* 09X Glass round 2 catalog: 5 categories x 4 vehicles x 4 maps. stats feed both the garage bars and the physics. */
const V=(id,nm,cls,price,stats,phys)=>({id,nm,cls,price,stats,phys});
export const CATS={
 cars:{label:'CARS',unit:'km/h',vehicles:[
  V('starter','STARTER','Compact coupe',0,[['SPEED',5.0],['GRIP',6.5],['DRIFT',5.0]],{vmax:58,vd:48,acc:24,brk:75,grip:7.5,dgrip:1.3}),
  V('m4','M4','Performance coupe',400,[['SPEED',7.0],['GRIP',7.5],['DRIFT',6.0]],{vmax:64,vd:54,acc:27,brk:78,grip:8,dgrip:1.35}),
  V('lambo','LAMBO','Supercar',800,[['SPEED',9.0],['GRIP',7.0],['DRIFT',8.0]],{vmax:72,vd:60,acc:30,brk:82,grip:7.5,dgrip:1.45}),
  V('pagani','PAGANI','Hypercar',2500,[['SPEED',10],['GRIP',8.5],['DRIFT',8.5]],{vmax:80,vd:66,acc:33,brk:86,grip:8.5,dgrip:1.5})],
  maps:[{id:'neon',nm:'NEON CITY',cls:'Free roam, night',price:0},{id:'desert',nm:'DESERT DUSK XL',cls:'Mesa highway and giant ramp',price:600},{id:'skyline',nm:'SKYLINE RING',cls:'Above the clouds',price:1500},{id:'stunt',nm:'TURBO STUNT PARK',cls:'Loops, ramps, halfpipes',price:2200}]},
 trucks:{label:'TRUCKS',unit:'km/h',vehicles:[
  V('pickup','PICKUP','Starter truck',0,[['SPEED',4.5],['GRIP',7.0],['POWER',4.0]],{vmax:50,vd:42,acc:20,brk:62,grip:7,dgrip:1.2,mass:1}),
  V('box','BOX TRUCK','Delivery truck',500,[['SPEED',5.5],['GRIP',7.0],['POWER',5.5]],{vmax:54,vd:44,acc:22,brk:66,grip:6.8,dgrip:1.15,mass:1.2}),
  V('semi','SEMI','18-wheeler',1400,[['SPEED',7.0],['GRIP',7.5],['POWER',8.0]],{vmax:62,vd:50,acc:25,brk:72,grip:6.5,dgrip:1.1,mass:1.6}),
  V('armor','HAULER X','Armored rig',3200,[['SPEED',8.5],['GRIP',8.5],['POWER',10]],{vmax:72,vd:56,acc:30,brk:82,grip:7.5,dgrip:1.2,mass:2})],
  maps:[{id:'port',nm:'NEON PORT',cls:'Containers and cranes',price:0},{id:'mountain',nm:'MOUNTAIN HAUL',cls:'Switchbacks at dusk',price:700},{id:'freeway',nm:'NIGHT FREEWAY',cls:'Long convoy run',price:1600},{id:'mud',nm:'MUD YARD',cls:'Off-road dirt ramps',price:2300}]},
 boats:{label:'BOATS',unit:'km/h',vehicles:[
  V('ski','JET SKI','Starter',0,[['SPEED',5.0],['TURN',8.0],['WAVES',4.0]],{vmax:46,acc:18,turn:1.9,drag:.55}),
  V('speed','SPEEDBOAT','Runabout',450,[['SPEED',6.5],['TURN',6.5],['WAVES',6.0]],{vmax:56,acc:21,turn:1.55,drag:.5}),
  V('offshore','OFFSHORE','Racing powerboat',1300,[['SPEED',8.5],['TURN',5.5],['WAVES',8.0]],{vmax:68,acc:25,turn:1.3,drag:.45}),
  V('hydro','HYDROPLANE','Neon racer',3000,[['SPEED',10],['TURN',6.5],['WAVES',9.0]],{vmax:82,acc:30,turn:1.45,drag:.4})],
  maps:[{id:'harbor',nm:'NEON HARBOR',cls:'City docks at night',price:0},{id:'lagoon',nm:'LAGOON ISLANDS',cls:'Sunset islands',price:700},{id:'storm',nm:'STORM COAST',cls:'Lighthouse and big waves',price:1600},{id:'canyon',nm:'CANYON RAPIDS',cls:'River through the arches',price:2300}]},
 planes:{label:'PLANES',unit:'km/h',vehicles:[
  V('prop','PROP PLANE','Starter',0,[['SPEED',4.0],['AGILITY',6.0],['CLIMB',4.0]],{vmin:22,vmax:62,acc:14,turn:1.0,roll:2.0,climb:1}),
  V('biplane','STUNT BIPLANE','Aerobatic',600,[['SPEED',5.0],['AGILITY',9.0],['CLIMB',5.5]],{vmin:20,vmax:70,acc:16,turn:1.3,roll:3.2,climb:1.1}),
  V('jet','PRIVATE JET','Fast and smooth',1600,[['SPEED',8.0],['AGILITY',6.0],['CLIMB',7.5]],{vmin:34,vmax:104,acc:22,turn:1.0,roll:2.0,climb:1.3}),
  V('fighter','NEON FIGHTER','Fighter jet',3600,[['SPEED',10],['AGILITY',9.5],['CLIMB',10]],{vmin:36,vmax:135,acc:30,turn:1.5,roll:3.6,climb:1.6})],
  maps:[{id:'skyline',nm:'NEON SKYLINE',cls:'City flythrough at night',price:0},{id:'canyonrun',nm:'CANYON RUN',cls:'Rings through the canyon',price:800},{id:'clouds',nm:'CLOUD RINGS',cls:'Golden gates above the clouds',price:1700},{id:'storm',nm:'STORM FRONT',cls:'Lightning and mountains',price:2400}]},
 helis:{label:'HELIS',unit:'km/h',vehicles:[
  V('mini','COMPACT','Starter heli',0,[['SPEED',4.0],['LIFT',5.0],['AGILITY',7.0]],{vmax:36,lift:15,turn:1.8,tilt:.4}),
  V('news','NEWS HELI','Utility heli',600,[['SPEED',5.5],['LIFT',6.0],['AGILITY',6.0]],{vmax:44,lift:17,turn:1.6,tilt:.42}),
  V('attack','ATTACK HELI','Gunship',1700,[['SPEED',7.5],['LIFT',8.0],['AGILITY',8.0]],{vmax:56,lift:20,turn:2.0,tilt:.5}),
  V('tilt','TILT-ROTOR','Neon gunship',3800,[['SPEED',10],['LIFT',10],['AGILITY',8.5]],{vmax:72,lift:24,turn:2.1,tilt:.55})],
  maps:[{id:'rooftop',nm:'ROOFTOP HOPS',cls:'Helipads on towers',price:0},{id:'rigs',nm:'OFFSHORE RIGS',cls:'Oil platforms at sea',price:800},{id:'alpine',nm:'ALPINE PEAKS',cls:'Snow and cable lifts',price:1700},{id:'caves',nm:'CANYON CAVES',cls:'Rope bridges and caves',price:2400}]}
};
export const CAT_ORDER=['cars','trucks','boats','planes','helis'];
