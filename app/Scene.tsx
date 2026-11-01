'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import IllustratedScene from './IllustratedScene';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export type Phase = 'invitation' | 'room' | 'garden' | 'bouquet' | 'wish' | 'transform' | 'lantern' | 'release' | 'finale';
export type SceneState = { phase: Phase; curtains: boolean; lights: boolean; found: number[]; watered: number[]; gathered: number[]; ribbon: string; tied: boolean; music: boolean; reduced: boolean };
type Pin = { key: string; label: string; point: THREE.Vector3; element?: HTMLButtonElement | null };
const palette = { cream: '#eee3d0', rose: '#b66e61', rust: '#a96046', sage: '#8b9971', wood: '#a77a57', gold: '#c49b58' };

export default function Scene({ state, onSelect }: { state: SceneState; onSelect: (action: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef({ state, onSelect }); latest.current = { state, onSelect };
  const pins = useRef<Pin[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const entries = [
    ['curtains', 'Open the curtains', 0, 2.6, -2.8], ['lights', 'Fairy lights', -3.5, 3, -.5],
    ['record', 'Choose a record', 2.55, 1.3, 1.7], ['box', 'Keepsake box', -2.35, 1.2, -.9],
    ['chimes', 'Play the chimes', 2.55, 2.9, -2.6], ['letter', 'A letter for you', .2, .9, .7],
    ['balcony', 'Step onto the balcony', .25, 1.9, -4.6],
    ['plant-0', 'Grow a rose', -1.5, 1.5, -5.7], ['plant-1', 'Grow a daisy', 0, 1.5, -5.7],
    ['plant-2', 'Grow a golden bloom', 1.5, 1.5, -5.7],
  ] as const;
  if (!pins.current.length) pins.current = entries.map(([key, label, x, y, z]) => ({ key, label, point: new THREE.Vector3(x,y,z) }));
  useEffect(() => {
    if (!host.current) return;
    const container = host.current;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.style.touchAction='none';container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#efe5d6', 28, 75);
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 120);
    camera.position.set(11, 8, 13);
    const look = new THREE.Vector3(0,1,-1);
    const ambient = new THREE.HemisphereLight('#fff4df', '#b6a185', 2.6); scene.add(ambient);
    const sun = new THREE.DirectionalLight('#ffe3b0', 4); sun.position.set(-5,10,-6); sun.castShadow = true;
    sun.shadow.mapSize.set(1024,1024); Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9}); sun.shadow.bias = -.001; scene.add(sun);
    const fill = new THREE.DirectionalLight('#f8e4d8', 1.5);fill.position.set(5,4,8);scene.add(fill);
    const room = new THREE.Group();scene.add(room);
    const materials: THREE.Material[] = [];
    const mat = (color: string, roughness = .85) => { const m = new THREE.MeshStandardMaterial({color, roughness}); materials.push(m); return m; };
    const cream=mat(palette.cream), wood=mat(palette.wood), gold=mat(palette.gold,.35), rose=mat(palette.rose), sage=mat(palette.sage), ivory=mat('#fff4df');
    const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, x:number,y:number,z:number,parent:THREE.Object3D=room) => {
      const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
    };
    const box = (w:number,h:number,d:number,m:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=room,round=.04) => mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(round,w/4,h/4,d/4)),m,x,y,z,parent);
    const cylinder = (rt:number,rb:number,h:number,m:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=room) => mesh(new THREE.CylinderGeometry(rt,rb,h,32),m,x,y,z,parent);
    const sphere = (r:number,m:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=room) => mesh(new THREE.SphereGeometry(r,16,12),m,x,y,z,parent);
    const line = (points:THREE.Vector3[],color:string,parent:THREE.Object3D=room) => {const m=new THREE.LineBasicMaterial({color});materials.push(m);const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),m);parent.add(l);return l};
    const action=(group:THREE.Object3D,key:string)=>{group.userData.action=key;return group};
    // An open-sided architectural miniature: all furniture and flowers are geometry.
    box(8.7,.25,7.1,wood,0,-.18,0);
    box(8.5,.08,7,mat('#e4ccb0'),0,-.025,0);
    for(let i=0;i<16;i++) box(.017,.008,6.9,mat('#b99b7b'),-4+i*.52,.02,0);
    box(.16,3.9,7,cream,-4.22,1.85,0);
    box(2.5,3.9,.16,cream,-3,1.85,-3.45);box(2.5,3.9,.16,cream,3,1.85,-3.45);
    box(3.5,.42,.18,cream,0,3.59,-3.45);
    box(.15,.14,7,ivory,-4.08,.1,0);box(8.4,.14,.12,ivory,0,.1,-3.32);
    for(const x of [-1.85,1.85]){box(.09,3.5,.12,wood,x,1.7,-3.35);box(.14,3.55,.1,ivory,x,1.72,-3.23);}
    box(3.8,.09,.15,wood,0,3.46,-3.3);
    const doors:THREE.Group[]=[];
    for(const side of [-1,1]){const door=new THREE.Group();door.position.set(side*1.78,0,-3.32);room.add(door);action(door,'balcony');const cx=-side*.87;
      for(const x of [0,-side*1.73])box(.065,3.38,.06,ivory,x,1.69,0,door);
      for(const y of [.04,1.45,3.35])box(1.8,.065,.06,ivory,cx,y,0,door);
      const glassMat=new THREE.MeshStandardMaterial({color:'#e5d7bd',transparent:true,opacity:.12,roughness:.2});materials.push(glassMat);
      const glass=box(1.66,3.2,.015,glassMat,cx,1.68,0,door);glass.castShadow=false;
      box(.04,.18,.09,gold,-side*1.55,1.4,.07,door);doors.push(door);
    }
    // Balcony and a miniature skyline.
    const balcony=new THREE.Group();room.add(balcony);
    box(5.5,.2,3.6,mat('#cfb79b'),0,-.12,-5.1,balcony);
    for(let i=-5;i<=5;i++)box(.035,1.05,.035,wood,i*.5,.51,-6.8,balcony);
    box(5.4,.08,.09,wood,0,1.05,-6.8,balcony);
    for(const x of [-2.7,2.7]){box(.06,1.05,3.45,wood,x,1.05,-5.1,balcony);for(let z=-6.7;z<-3.5;z+=.5)box(.035,1.05,.035,wood,x,.51,z,balcony);}
    const distant=new THREE.Group();scene.add(distant);
    const skyline=['#ddc7ad','#ccb49e','#e8d3b9','#d4b4a0'];
    for(let i=0;i<21;i++){const h=1.1+(Math.sin(i*14.4)+1)*1.1;box(1.2,h,1.2,mat(skyline[i%4]),(i-10)*1.45,-.4+h/2,-16-(i%3)*2,distant);}
    const sunDisk=mesh(new THREE.CircleGeometry(2.1,64),new THREE.MeshBasicMaterial({color:'#efc988'}),-6,6.6,-23,scene);materials.push(sunDisk.material);
    // Soft rug, curved sofa, cushions.
    const rug= cylinder(2,2,.018,mat('#d1a18a'),-.5,.035,1);rug.scale.set(1.25,1,.8);
    line(Array.from({length:97},(_,i)=>new THREE.Vector3(-.5+2.35*Math.cos(i/96*Math.PI*2),.052,1+1.47*Math.sin(i/96*Math.PI*2))),'#e5c3ab');
    const sofa=new THREE.Group();sofa.position.set(-2.8,0,1.1);room.add(sofa);
    box(1.5,.45,3,mat('#d7c7a4'),0,.53,0,sofa,.18);box(.35,1.1,3.1,mat('#d7c7a4'),-.65,.92,0,sofa,.16);
    for(const z of [-1.4,1.4])box(1.5,.8,.28,mat('#d7c7a4'),0,.8,z,sofa,.12);
    for(const z of [-.7,.7])box(1.2,.2,1.15,ivory,.1,.83,z,sofa,.1);
    const cushion=box(.28,.65,.7,rose,-.28,1.2,.7,sofa,.12);cushion.rotation.z=-.2;
    const cushion2=box(.28,.6,.65,sage,-.25,1.18,-.7,sofa,.12);cushion2.rotation.z=-.25;
    for(const z of [-1.1,1.1]) for(const x of [-.5,.5])cylinder(.045,.04,.28,wood,x,.18,z,sofa);
    // Coffee table and the letter.
    cylinder(.88,.88,.1,wood,.15,.73,.6);for(const x of [-.4,.65])for(const z of [.15,1.05])cylinder(.035,.04,.7,wood,x,.36,z);
    const envelope=new THREE.Group();envelope.position.set(.1,.81,.65);envelope.rotation.y=-.15;action(envelope,'letter');room.add(envelope);
    box(.7,.025,.43,ivory,0,0,0,envelope);line([new THREE.Vector3(-.35,.016,-.21),new THREE.Vector3(0,.016,.06),new THREE.Vector3(.35,.016,-.21)],'#c4a88b',envelope);
    cylinder(.07,.07,.025,rose,0,.025,.03,envelope);
    cylinder(.12,.1,.16,mat('#a36b51'),.62,.86,.5);cylinder(.11,.11,.01,mat('#553b29'),.62,.95,.5);
    // Console, keepsake box, wall art.
    box(1.45,.12,.7,wood,-2.6,.91,-1.25);for(const x of [-3.15,-2.05])for(const z of [-1.5,-1])cylinder(.035,.035,.85,wood,x,.43,z);
    const keepsake=new THREE.Group();keepsake.position.set(-2.6,1.05,-1.25);action(keepsake,'box');room.add(keepsake);
    box(.55,.22,.42,rose,0,.05,0,keepsake);const lid=box(.58,.055,.45,mat('#c88574'),0,.19,0,keepsake);box(.06,.04,.04,gold,0,.05,.225,keepsake);
    box(.045,1.15,.88,wood,-4.1,2.5,-.5);box(.05,1,.73,ivory,-4.07,2.5,-.5);
    const art=sphere(.22,mat('#d7ac79'),-4.025,2.62,-.5);art.scale.set(.06,1,1);
    // Record player with moving vinyl.
    const record=new THREE.Group();record.position.set(2.4,.95,1.2);action(record,'record');room.add(record);
    box(1.55,.85,.9,wood,2.4,.44,1.2);for(const x of [1.8,3])for(const z of [.9,1.5])cylinder(.035,.035,.22,wood,x,.1,z);
    box(1.17,.14,.75,mat('#a56648'),0,0,0,record);
    const vinyl=cylinder(.3,.3,.035,mat('#37342c'),-.15,.1,0,record);
    cylinder(.075,.075,.038,mat('#d6a16e'),-.15,.12,0,record);
    for(const r of [.13,.18,.24,.28]){const ring=mesh(new THREE.TorusGeometry(r,.002,4,48),mat('#666155'),-.15,.12,0,record);ring.rotation.x=Math.PI/2;}
    const arm=box(.025,.025,.47,gold,.31,.17,.03,record);arm.rotation.y=-.55;
    // Chimes, curtains and lights.
    const chimes=new THREE.Group();chimes.position.set(2.7,2.7,-3);action(chimes,'chimes');room.add(chimes);
    box(.8,.045,.15,wood,0,.5,0,chimes);
    for(let i=0;i<5;i++){const h=.35+i*.07;line([new THREE.Vector3((i-2)*.14,.48,0),new THREE.Vector3((i-2)*.14,.21,0)],'#b09e80',chimes);cylinder(.025,.025,h,gold,(i-2)*.14,.06-h/2,0,chimes);}
    const curtainMat=mat('#d7b39a');curtainMat.side=THREE.DoubleSide;
    const curtains:THREE.Mesh[]=[];
    for(const side of [-1,1]){
      const geo=new THREE.PlaneGeometry(1.9,3.25,30,1);const pos=geo.attributes.position;
      for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(pos.getX(i)*27)*.065);
      geo.computeVertexNormals();const curtain=mesh(geo,curtainMat,side*.95,1.75,-3.05);action(curtain,'curtains');curtains.push(curtain);
    }
    cylinder(.025,.025,.2,gold,-1.95,3.45,-3.05);box(4.1,.035,.035,gold,0,3.44,-3.04);
    const bulbMat=new THREE.MeshStandardMaterial({color:'#ecd8ac',emissive:'#ffd17b',emissiveIntensity:.15});materials.push(bulbMat);
    const wirePoints:THREE.Vector3[]=[];for(let i=0;i<=32;i++){const x=-4+i*.25;wirePoints.push(new THREE.Vector3(x,3.38-.26*Math.sin(i/32*Math.PI),-3.05));if(i%2===0)sphere(.036,bulbMat,x,3.31-.26*Math.sin(i/32*Math.PI),-3.05);}line(wirePoints,'#99836b');
    const fairyLight=new THREE.PointLight('#ffd891',0,10);fairyLight.position.set(0,2.8,-2.5);scene.add(fairyLight);
    const switchGroup=new THREE.Group();switchGroup.position.set(-4.09,2.1,.5);room.add(switchGroup);action(switchGroup,'lights');box(.05,.2,.15,ivory,0,0,0,switchGroup);box(.04,.08,.06,gold,.04,0,0,switchGroup);
    function plantPot(x:number,z:number,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);room.add(g);cylinder(.24,.16,.45,mat('#bb7c60'),0,.23,0,g);cylinder(.25,.25,.055,mat('#cb9073'),0,.44,0,g);cylinder(.205,.205,.02,mat('#65543b'),0,.45,0,g);return g;}
    for(const [x,z,sc] of [[3.5,-2.8,1.4],[-3.5,-2.7,1.15],[3.4,2.5,.8]]){const p=plantPot(x,z,sc);for(let i=0;i<7;i++){const a=i*2.4;const leaf=sphere(.22,sage,Math.cos(a)*.23,.7+i*.12,Math.sin(a)*.23,p);leaf.scale.set(.45,1.7,1);leaf.rotation.z=Math.sin(a)*.6;}}
    const garden:THREE.Group[]=[];
    const flower=(color:string,index:number)=>{const g=new THREE.Group();cylinder(.016,.02,.9,sage,0,.45,0,g);for(let i=0;i<2;i++){const leaf=sphere(.14,sage,i?-.1:.1,.25+i*.25,0,g);leaf.scale.set(1.4,.32,.7);leaf.rotation.z=i?.6:-.6;}const bloom=new THREE.Group();bloom.position.y=.95;g.add(bloom);const petalMat=mat(color);for(let j=0;j<8;j++){const a=j/8*Math.PI*2;const p=sphere(.14,petalMat,Math.cos(a)*.13,Math.sin(a)*.13,0,bloom);p.scale.set(.7,1.2,.4);p.rotation.z=a-Math.PI/2;}sphere(.075,gold,0,0,.06,bloom);bloom.rotation.x=-.3;bloom.rotation.y=index*.3;return g;};
    const flowerColors=['#bb766d','#fff2d5','#dfb35d'];
    for(let i=0;i<3;i++){const pot=plantPot((i-1)*1.5,-5.6,1.1);action(pot,`plant-${i}`);const growth=new THREE.Group();growth.position.set(0,.46,0);pot.add(growth);for(let j=0;j<3;j++){const f=flower(flowerColors[i],j);f.position.set((j-1)*.14,0,Math.sin(j)*.1);f.rotation.z=(j-1)*.22;f.scale.setScalar(.75+j*.12);growth.add(f);}growth.scale.setScalar(.001);garden.push(growth);}
    // A bouquet that physically scatters into the lantern's paper body.
    const bouquet=new THREE.Group();bouquet.position.set(0,1.35,-4.4);room.add(bouquet);
    const bouquetFlowers:THREE.Group[]=[];
    for(let i=0;i<9;i++){const f=flower(flowerColors[i%3],i);const a=i*2.4;f.position.set(Math.cos(a)*.2,-.4+Math.sin(i)*.06,Math.sin(a)*.16);f.rotation.z=Math.cos(a)*.25;f.rotation.x=Math.sin(a)*.15;bouquet.add(f);bouquetFlowers.push(f);}
    cylinder(.38,.1,.65,mat('#e7ccac'),0,-.25,0,bouquet);const ribbonMat=mat('#a36057');
    const ribbon=mesh(new THREE.TorusGeometry(.17,.035,8,48),ribbonMat,0,-.32,0,bouquet);ribbon.rotation.x=Math.PI/2;
    for(const side of [-1,1]){const loop=mesh(new THREE.TorusGeometry(.14,.022,8,32),ribbonMat,side*.12,-.32,.14,bouquet);loop.scale.set(1,.55,1);loop.rotation.z=side*.4;}
    const lantern=new THREE.Group();lantern.position.set(0,1.75,-4.4);room.add(lantern);
    const paperMat=new THREE.MeshStandardMaterial({color:'#f1c48d',emissive:'#efab4d',emissiveIntensity:.55,roughness:1,side:THREE.DoubleSide,transparent:true,opacity:.95});materials.push(paperMat);
    mesh(new THREE.CylinderGeometry(.44,.3,.9,12,1,true),paperMat,0,.2,0,lantern);
    const rimMat=mat('#a47745');for(const y of [-.25,.65]){const r=y>0?.44:.3;const ring=mesh(new THREE.TorusGeometry(r,.018,6,48),rimMat,0,y,0,lantern);ring.rotation.x=Math.PI/2;}
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;line([new THREE.Vector3(Math.cos(a)*.3,-.25,Math.sin(a)*.3),new THREE.Vector3(Math.cos(a)*.44,.65,Math.sin(a)*.44)],'#be965b',lantern);}
    const fire=mesh(new THREE.SphereGeometry(.07,12,8),new THREE.MeshBasicMaterial({color:'#fff0bc'}),0,-.17,0,lantern);fire.scale.y=1.7;materials.push(fire.material);
    const lanternLight=new THREE.PointLight('#ffc05d',2,5);lanternLight.position.y=.15;lantern.add(lanternLight);
    const backgroundLanterns:THREE.Group[]=[];
    for(let i=0;i<10;i++){const l=new THREE.Group();const m=new THREE.MeshBasicMaterial({color:i%2?'#e8b780':'#f4d6a4',transparent:true,opacity:.7});materials.push(m);mesh(new THREE.CylinderGeometry(.12,.09,.28,8),m,0,0,0,l);l.position.set(Math.sin(i*12.3)*9,1+i*.5,-11-i*.5);l.visible=false;scene.add(l);backgroundLanterns.push(l);}
    const sparkleGeo=new THREE.BufferGeometry();const stars=[];for(let i=0;i<100;i++)stars.push(Math.sin(i*76)*20,3+Math.abs(Math.sin(i*37))*20,-10-Math.abs(Math.cos(i*23))*25);sparkleGeo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));const sparkleMat=new THREE.PointsMaterial({color:'#c99d5c',size:.04,transparent:true,opacity:0});materials.push(sparkleMat);scene.add(new THREE.Points(sparkleGeo,sparkleMat));
    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let dragX=0,dragY=0,yawO=0,pitchO=0,startX=0,startY=0,dragging=false,moved=false,outsideNow=false;const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
    const down=(e:PointerEvent)=>{if((e.target as HTMLElement).tagName!=='CANVAS')return;startX=e.clientX;startY=e.clientY;dragging=true;moved=false;};
    const move=(e:PointerEvent)=>{if(!dragging)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)+Math.abs(dy)>5)moved=true;if(outsideNow){yawO=clamp(yawO-dx*.006,-1.3,1.3);pitchO=clamp(pitchO+dy*.004,-.3,.6);}else{dragX=clamp(dragX+dx*.003,-1,1);dragY=clamp(dragY+dy*.002,-.5,.5);}startX=e.clientX;startY=e.clientY;};
    const cancel=()=>{dragging=false;};
    const up=(e:PointerEvent)=>{if(!dragging)return;dragging=false;if(moved)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);for(const hit of ray.intersectObjects(room.children,true)){let o:THREE.Object3D|null=hit.object;while(o&&!o.userData.action)o=o.parent;if(o?.userData.action){latest.current.onSelect(o.userData.action);break;}}};
    container.addEventListener('pointerdown',down);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancel);
    const resize=()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(container);resize();
    let frame=0,last=performance.now(),phaseStarted=last,previousPhase=state.phase,flightStarted=last;const cameraGoal=new THREE.Vector3(),targetGoal=new THREE.Vector3(),projected=new THREE.Vector3();
    function animate(now:number){const dt=Math.min((now-last)/1000,.05);last=now;const s=latest.current.state,t=now/1000;if(s.phase!==previousPhase){previousPhase=s.phase;phaseStarted=now;if(s.phase==='release')flightStarted=now;dragX=0;dragY=0;yawO=0;pitchO=0;}const age=(now-phaseStarted)/1000,flightAge=(now-flightStarted)/1000;const outside=!['invitation','room'].includes(s.phase);outsideNow=outside;const finish=['release','finale'].includes(s.phase);const transform=s.phase==='transform'?Math.min(1,age/3):(finish||s.phase==='lantern')?1:0;
      if(!outside){cameraGoal.set(10.8+dragX*2,7+dragY,12-dragX*2);targetGoal.set(0,1,-.65);}else if(finish){cameraGoal.set(4.2,5+Math.min(flightAge,8)*.3,3.3);targetGoal.set(0,3.3+Math.min(flightAge,10)*.2,-8);}else{const rad=6.2*Math.max(1,1.05/camera.aspect),pit=.5+pitchO,cp=Math.cos(pit);cameraGoal.set(rad*Math.sin(yawO)*cp,1.5+rad*Math.sin(pit),-5.4+rad*Math.cos(yawO)*cp);targetGoal.set(0,1.5,-5.4);}
      if(camera.aspect<.85&&!outside)cameraGoal.multiplyScalar(1.2);const ease=1-Math.exp(-dt*(dragging?9:2.5));camera.position.lerp(cameraGoal,ease);look.lerp(targetGoal,ease);camera.lookAt(look);
      curtains.forEach((c,i)=>{const side=i?1:-1;const target=s.curtains?side*1.9:side*.95;c.position.x=THREE.MathUtils.damp(c.position.x,target,3,dt);c.scale.x=THREE.MathUtils.damp(c.scale.x,s.curtains?.23:1,3,dt);});
      doors.forEach((d,i)=>{d.rotation.y=THREE.MathUtils.damp(d.rotation.y,outside?(i?1:-1)*1.3:0,2,dt);});
      bulbMat.emissiveIntensity=THREE.MathUtils.damp(bulbMat.emissiveIntensity,s.lights?2:.05,3,dt);fairyLight.intensity=THREE.MathUtils.damp(fairyLight.intensity,s.lights?3:0,3,dt);
      if(s.music&&!s.reduced)vinyl.rotation.y+=dt*.7;
      lid.rotation.x=THREE.MathUtils.damp(lid.rotation.x,s.found.includes(0)?-.45:0,4,dt);lid.position.y=THREE.MathUtils.damp(lid.position.y,s.found.includes(0)?.33:.19,4,dt);
      chimes.rotation.z=s.found.includes(1)&&!s.reduced?Math.sin(t*1.8)*.035:0;
      garden.forEach((g,i)=>{const visible=s.watered.includes(i)&&!s.gathered.includes(i);g.scale.setScalar(THREE.MathUtils.damp(g.scale.x,visible?1:.001,s.reduced?30:2,dt));if(!s.reduced)g.rotation.z=Math.sin(t*.8+i)*.025;});
      const showBouquet=['bouquet','wish','transform'].includes(s.phase)||finish;bouquet.visible=showBouquet&&transform<1;bouquet.scale.setScalar(showBouquet?Math.max(.001,1-transform*.8):.001);bouquet.rotation.y=s.reduced?0:Math.sin(t*.35)*.2;bouquet.rotation.z=s.reduced?0:Math.sin(t*.55)*.035;ribbonMat.color.set(s.ribbon);ribbon.visible=s.tied;
      bouquetFlowers.forEach((f,i)=>{f.visible=s.phase!=='bouquet'||s.gathered.includes(i%3);if(s.phase==='transform'){const a=i*2.4+age*2;f.position.x=Math.cos(a)*(.2+transform*.65);f.position.z=Math.sin(a)*(.16+transform*.65);f.position.y=-.4+transform*1.3;f.rotation.z=transform*i;}else{const a=i*2.4;f.position.set(Math.cos(a)*.2,-.4+Math.sin(i)*.06,Math.sin(a)*.16);f.rotation.z=Math.cos(a)*.25;}});
      lantern.visible=s.phase==='transform'||s.phase==='lantern'||finish;lantern.scale.setScalar(Math.max(.001,transform));if(finish){lantern.position.set(Math.sin(flightAge*.4)*.3,1.75+flightAge*.43,-4.4-flightAge*.48);lantern.rotation.z=Math.sin(t*.6)*.06;}else{lantern.position.set(0,1.75,-4.4);lantern.rotation.y=t*.1;}
      backgroundLanterns.forEach((l,i)=>{l.visible=finish;l.position.y=1+i*.5+flightAge*(.1+i*.01);});sparkleMat.opacity=finish?.6:0;
      sun.intensity=THREE.MathUtils.damp(sun.intensity,outside?2.6:4,1,dt);
      pins.current.forEach(p=>{if(!p.element)return;let visible=false;if(s.phase==='room'){visible=p.key==='curtains'?!s.curtains:p.key==='balcony'?s.found.length===3:p.key.startsWith('plant-')?false:s.curtains;}if(s.phase==='garden'&&p.key.startsWith('plant-'))visible=true;
        projected.copy(p.point).project(camera);p.element.style.left=`${(projected.x*.5+.5)*container.clientWidth}px`;p.element.style.top=`${(-projected.y*.5+.5)*container.clientHeight}px`;p.element.style.visibility=visible&&projected.z<1?'visible':'hidden';p.element.style.opacity=visible?'1':'0';p.element.tabIndex=visible?0:-1;});
      renderer.render(scene,camera);frame=requestAnimationFrame(animate);
    }
    frame=requestAnimationFrame(animate);setReady(true);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();container.removeEventListener('pointerdown',down);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line||o instanceof THREE.Points)o.geometry.dispose();});materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();};
  }, []);
  return <div className={'scene-host '+(!ready?'loading':'')} ref={host} aria-label="Interactive 3D birthday room and balcony">
    {!ready&&!failed&&<div className="scene-loading"><span className="loading-orbit"/>Setting the evening…</div>}
    {failed&&<IllustratedScene state={state} onSelect={onSelect}/>}
    {pins.current.map((p,i)=><button key={p.key} ref={e=>{pins.current[i].element=e}} className={'scene-pin '+(p.key==='balcony'?'balcony-pin':'')} style={{visibility:'hidden'}} onClick={()=>onSelect(p.key)} aria-label={p.label}><span className="pin-dot"/><span className="pin-label">{p.label}</span></button>)}
    <div className="scene-vignette"/>
  </div>;
}
