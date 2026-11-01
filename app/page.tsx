'use client';
import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from 'react';
import { ArrowUpRight, ArrowRight, Volume2, VolumeX, Sparkles, Flower2, Sun, Music2, Check, X, Mail, Gift, Wind, Droplets, Send, RotateCcw, ChevronRight } from 'lucide-react';
import Scene, { type Phase, type SceneState } from './Scene';

const discoveries = [
  { key: 'box', title: 'A little keepsake', subtitle: 'Lift the lid. Find a little joy.', icon: Gift, flower: 'Rose', color: '#b6766e' },
  { key: 'chimes', title: 'A moment of harmony', subtitle: 'A little music, just for you.', icon: Wind, flower: 'Ivory bloom', color: '#dac8a1' },
  { key: 'letter', title: 'Words to keep', subtitle: 'Some things deserve a letter.', icon: Mail, flower: 'Golden bloom', color: '#cba755' },
];
const ribbons = [{ color: '#a36057', name: 'Dusty rose' }, { color: '#8b9971', name: 'Sage green' }, { color: '#c49b58', name: 'Champagne gold' }];
const chapters = ['The invitation', 'Little discoveries', 'The balcony garden', 'A wish takes flight'];

function Bloom({ color = '#b6766e', className = '' }: { color?: string; className?: string }) {
  return <svg className={className} viewBox="0 0 100 110" fill="none" aria-hidden="true"><path d="M51 106V46M51 82Q25 82 26 62Q46 60 51 82M51 70Q77 69 77 50Q56 49 51 70" stroke="#879170" strokeWidth="2" fill="#a3ad8d"/>{[0,60,120,180,240,300].map(a=><ellipse key={a} cx="50" cy="29" rx="12" ry="20" fill={color} transform={`rotate(${a} 50 44)`}/>)}<circle cx="50" cy="44" r="9" fill="#d9bb78"/><circle cx="48" cy="41" r="2" fill="#f8eac6"/></svg>;
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>('invitation');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [curtains, setCurtains] = useState(false);
  const [lights, setLights] = useState(false);
  const [found, setFound] = useState<number[]>([]);
  const [watered, setWatered] = useState<number[]>([]);
  const [gathered, setGathered] = useState<number[]>([]);
  const [ribbon, setRibbon] = useState(ribbons[0].color);
  const [tied, setTied] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [sound, setSound] = useState(false);
  const [track, setTrack] = useState<'dreamy'|'cheerful'>('dreamy');
  const [wish, setWish] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [reduced, setReduced] = useState(false);
  const [notice, setNotice] = useState('');
  const invitationDrag = useRef(0);
  const audio = useRef<AudioContext | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const mainTitle = useRef<HTMLHeadingElement>(null);
  const chapter = phase === 'invitation' ? 0 : phase === 'room' ? 1 : ['garden','bouquet'].includes(phase) ? 2 : 3;
  const state: SceneState = { phase, curtains, lights, found, watered, gathered, ribbon, tied, music: sound, reduced };

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');setReduced(media.matches);
    const change = () => setReduced(media.matches);media.addEventListener('change',change);
    return () => media.removeEventListener('change',change);
  }, []);
  useEffect(() => { if (phase !== 'invitation') mainTitle.current?.focus({ preventScroll: true }); }, [phase]);
  useEffect(() => {
    if (phase === 'transform') { const timer=setTimeout(()=>setPhase('lantern'),reduced?900:3800);return()=>clearTimeout(timer); }
    if (phase === 'release') { const timer=setTimeout(()=>setPhase('finale'),reduced?1800:9500);return()=>clearTimeout(timer); }
  }, [phase,reduced]);
  useEffect(() => { if(!notice)return;const t=setTimeout(()=>setNotice(''),4500);return()=>clearTimeout(t); },[notice]);
  useEffect(() => {
    if (!sound) { audio.current?.close();audio.current=null;return; }
    const context = new AudioContext();audio.current=context;
    const notes=track==='dreamy'?[261.63,329.63,392,493.88,440,392,329.63,293.66]:[293.66,369.99,440,587.33,493.88,440,369.99,440];
    const melody=()=>{if(context.state==='closed')return;const base=context.currentTime;notes.forEach((f,i)=>{const o=context.createOscillator(),g=context.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,base+i*.8);g.gain.linearRampToValueAtTime(.025,base+i*.8+.04);g.gain.exponentialRampToValueAtTime(.0001,base+i*.8+2.7);o.connect(g);g.connect(context.destination);o.start(base+i*.8);o.stop(base+i*.8+2.8);});};
    context.resume();melody();const timer=setInterval(melody,8500);
    return()=>{clearInterval(timer);if(context.state!=='closed')context.close();audio.current=null;};
  },[sound,track]);
  useEffect(()=>{
    if(!modal&&!inviteOpen){previousFocus.current?.focus({preventScroll:true});return;}
    previousFocus.current=document.activeElement as HTMLElement;
    const box=modalRef.current;box?.focus();
    const listener=(e:KeyboardEvent)=>{if(e.key==='Escape')setModal(null);if(e.key==='Tab'&&box){const items=box.querySelectorAll<HTMLElement>('button,input,a,textarea');const first=items[0],last=items[items.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===box)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
    document.addEventListener('keydown',listener);return()=>document.removeEventListener('keydown',listener);
  },[modal,inviteOpen]);
  function chime(){const c=audio.current;if(!c||!sound)return;[523.25,659.25,783.99].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=f;const t=c.currentTime+i*.15;g.gain.setValueAtTime(.04,t);g.gain.exponentialRampToValueAtTime(.0001,t+1.8);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+1.9);});}
  function discover(i:number){setFound(old=>old.includes(i)?old:[...old,i]);chime();}
  function select(action:string){
    if(phase==='room'){
      if(action==='curtains'){setCurtains(true);setNotice('A little light changes everything.');return;}
      if(!curtains)return;
      if(action==='lights'){setLights(v=>!v);return;}
      if(action==='record'){setModal('record');return;}
      if(action==='balcony'&&found.length===3){setLights(true);setPhase('garden');return;}
      if(['box','chimes','letter'].includes(action)){setModal(action);if(action==='box'||action==='letter')discover(action==='box'?0:2);}
    }
    if((phase==='garden'||phase==='bouquet')&&action.startsWith('plant-')){
      const i=Number(action.slice(-1));
      if(phase==='garden'){setWatered(old=>old.includes(i)?old:[...old,i]);chime();}
      else {setGathered(old=>old.includes(i)?old:[...old,i]);chime();}
    }
  }
  async function shareWish(e:FormEvent){
    e.preventDefault();if(!wish.trim()||saving||saved)return;
    setSaving(true);setError('');const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
    try {
      const r=await fetch('https://formspree.io/f/mbggzvzd',{signal:controller.signal,method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({name:'Shubhm',message:wish.trim(),_subject:'A birthday wish from Shubhm'})});
      if(!r.ok)throw new Error('Your wish wasn’t sent. Please try again.');
      setSaved(true);setPhase('transform');
    } catch(e){setError(e instanceof Error&&e.name!=='AbortError'?e.message:'Could not connect. Your wish wasn’t sent. Please try again.');}
    finally{clearTimeout(timeout);setSaving(false);}
  }
  function enter(withSound:boolean){setInviteOpen(false);setSound(withSound);setPhase('room');}
  function restart(){setPhase('room');setCurtains(false);setFound([]);setWatered([]);setGathered([]);setTied(false);setSaved(false);setWish('');setError('');}
  const titles:Record<Phase,React.ReactNode>={
    invitation:<>Some evenings<br/>are made<br/><em>just for you.</em></>,
    room:!curtains?<>Let a little<br/><em>light in.</em></>:found.length<3?<>A room full of<br/><em>little wonders.</em></>:<>The best part<br/>is <em>just outside.</em></>,
    garden:<>Good things<br/><em>take a little love.</em></>,
    bouquet:<>A little beauty,<br/><em>gathered for you.</em></>,
    wish:<>What does your<br/><em>heart wish for?</em></>,
    transform:<>Some wishes<br/>are ready<br/><em>to find their wings.</em></>,
    lantern:<>Let your wish<br/><em>find its sky.</em></>,
    release:<>Your little light.<br/><em>An endless sky.</em></>,
    finale:<>Happy birthday,<br/><em>Shubhm.</em></>,
  };
  return <main className={`experience phase-${phase}`}>
    <header className="site-header"><a className="brand" href="./" aria-label="Shubhm’s birthday home">S<span>✧</span></a><span className="header-title">AN EVENING FOR SHUBHM</span><button className="sound-toggle" onClick={()=>setSound(!sound)} aria-label={sound?'Turn sound off':'Turn sound on'} aria-pressed={sound}>{sound?<Volume2 size={15}/>:<VolumeX size={15}/>}<span>{sound?'Sound on':'Sound off'}</span></button></header>
    <div className="experience-grid">
      <section className="story-panel" aria-label="Birthday journey">
        <div className="chapter-label"><span className="chapter-line"/><span>{phase==='invitation'?'A LITTLE BIRTHDAY ESCAPE':`${String(chapter).padStart(2,'0')} / ${chapters[chapter].toUpperCase()}`}</span></div>
        <div className="story-text" key={phase+(phase==='room'?(curtains?'open':'closed'):'')}><h1 tabIndex={-1} ref={mainTitle}>{titles[phase]}</h1>
          {phase==='invitation'&&<><p className="story-description">Shubhm, this one is yours.<br/>A few small surprises. A little magic.<br/>An evening with nowhere else to be.</p><div className="intro-actions"><button className="primary" onClick={()=>setInviteOpen(true)}>Open your invitation <ArrowUpRight size={17}/></button><span className="handwritten">take your time. it’s your day.</span></div><div className="intro-meta"><span><Sun size={15}/> GOLDEN HOUR, JUST FOR YOU</span><span><Sparkles size={14}/> A FEW MINUTES OF MAGIC</span></div></>}
          {phase==='room'&&<><p className="story-description">{!curtains?'Pull back the curtains. Let the evening unfold.':found.length<3?'A keepsake, a melody, a few words to keep. Explore the room in any order.':"Three little discoveries. Three seeds of something lovely. Let’s see what they become."}</p>
            {!curtains?<button className="primary" onClick={()=>select('curtains')}>Open the curtains <Sun size={16}/></button>:<><div className="discovery-list">{discoveries.map((d,i)=><button key={d.key} onClick={()=>select(d.key)} className={found.includes(i)?'discovered':''}><span className="discovery-icon"><d.icon size={19}/></span><span><strong>{d.title}</strong><small>{found.includes(i)?`${d.flower} discovered`:d.subtitle}</small></span><span className="discovery-status">{found.includes(i)?<Check size={15}/>:<ArrowUpRight size={15}/>}</span></button>)}</div><div className="room-extras"><button onClick={()=>select('lights')} aria-pressed={lights}><Sparkles size={14}/>{lights?'Lights glowing':'Switch on the lights'}</button><button onClick={()=>select('record')}><Music2 size={14}/>Choose a record</button></div>{found.length===3&&<button className="primary balcony-cta" onClick={()=>select('balcony')}>Step onto the balcony <ArrowRight size={17}/></button>}</>}
          </>}
          {phase==='garden'&&<><p className="story-description">Your discoveries became seeds.<br/>Give each planter a little water, and watch something beautiful begin.</p><div className="garden-controls">{discoveries.map((d,i)=><button key={d.key} className={'plant-button '+(watered.includes(i)?'grown':'')} onClick={()=>select(`plant-${i}`)}><Bloom color={d.color}/><span>{watered.includes(i)?'In bloom':`Water ${d.flower.toLowerCase()}`}</span>{watered.includes(i)?<Check size={15}/>:<Droplets size={16}/>}</button>)}</div><p className="small-note">{watered.length} of 3 planters blooming · tap a planter to water it</p>{watered.length===3&&<button className="primary" onClick={()=>setPhase('bouquet')}>Gather your flowers <Flower2 size={17}/></button>}</>}
          {phase==='bouquet'&&<><p className="story-description">Pick a bloom from each planter.<br/>Something lovely to carry into your next chapter.</p><div className="bloom-collection">{discoveries.map((d,i)=><button aria-label={`Gather ${d.flower}`} aria-pressed={gathered.includes(i)} className={gathered.includes(i)?'picked':''} key={d.key} onClick={()=>select(`plant-${i}`)}><Bloom color={d.color}/><span>{gathered.includes(i)?<Check size={14}/>:<span>+</span>}</span></button>)}</div>{gathered.length<3?<p className="small-note">{gathered.length} of 3 blooms gathered</p>:<div className="ribbon-picker"><p className="mini-label">CHOOSE YOUR FINISHING TOUCH</p><div>{ribbons.map(r=><button key={r.name} title={r.name} aria-label={r.name} aria-pressed={ribbon===r.color} onClick={()=>setRibbon(r.color)} style={{background:r.color}}>{ribbon===r.color&&<Check size={15}/>}</button>)}<span>{ribbons.find(r=>r.color===ribbon)?.name}</span></div><button className="primary" onClick={()=>{setTied(true);setPhase('wish')}}>Tie your bouquet <ArrowRight size={17}/></button></div>}</>}
          {phase==='wish'&&<><p className="story-description">Before the evening ends, leave a little hope for the year ahead.</p><form className="wish-form" onSubmit={shareWish}><label htmlFor="birthday-wish">Your birthday wish</label><textarea id="birthday-wish" required maxLength={1000} rows={3} placeholder="This year, I wish for…" value={wish} onChange={e=>setWish(e.target.value)} disabled={saving}/><div className="wish-disclosure"><Send size={14}/><p>Your wish is sent to me, and <strong>I’ll read it.</strong> It won’t be shown to anyone else.</p></div><button className="primary" type="submit" disabled={!wish.trim()||saving}>{saving?'Sending your wish…':'Send my wish & light the lantern'}<ArrowUpRight size={17}/></button><p role="alert" className="form-error">{error}</p></form>{error&&<button className="text-button private-wish" disabled={saving} onClick={()=>setPhase('transform')}>Continue without sending <ArrowRight size={14}/></button>}</>}
          {phase==='transform'&&<><p className="story-description">Every petal, every little discovery.<br/>Becoming a light of your own.</p><div className="transform-indicator"><span/><span/><span/></div>{saved&&<p className="save-note"><Check size={14}/>Your wish has been sent.</p>}</>}
          {phase==='lantern'&&<><p className="story-description">A bouquet of little moments.<br/>Now a lantern full of possibility.</p><button className="primary" onClick={()=>setPhase('release')}>Release your lantern <ArrowUpRight size={17}/></button><p className="small-note">Or swipe up over the lantern.</p></>}
          {phase==='release'&&<><p className="story-description">Let it rise.<br/>There’s a whole beautiful year waiting for you.</p><span className="handwritten">a little hope goes a long way.</span><button className="text-button" onClick={()=>setPhase('finale')}>See your birthday message <ArrowRight size={14}/></button></>}
          {phase==='finale'&&<><p className="story-description finale-description">May this next chapter bring you joy,<br/>beautiful surprises, and room to bloom.</p><p className="handwritten">this little evening was made for you.</p><div className="finale-actions"><button className="primary" onClick={()=>setPhase('release')}>Watch your lantern again <Sparkles size={16}/></button><button className="text-button" onClick={restart}><RotateCcw size={14}/>Explore the room again</button></div>{saved&&<p className="save-note"><Check size={14}/>Your wish has been sent.</p>}</>}
        </div>
        <div className="chapter-progress" aria-label={`Chapter ${chapter+1} of 4: ${chapters[chapter]}`}>{chapters.map((c,i)=><div key={c} className={i<=chapter?'reached':''}><span/><small>{String(i+1).padStart(2,'0')}</small></div>)}</div>
      </section>
      <section className="visual-panel" aria-label="Your birthday scene"><div className="scene-topline"><span><span className="live-dot"/>{chapter<2?'THE LITTLE BIRTHDAY ROOM':chapter===2?'A GARDEN, JUST FOR YOU':'WHERE WISHES FIND THEIR SKY'}</span><span>{chapter<2?'01 — INSIDE':chapter===2?'02 — OUTSIDE':'03 — UP ABOVE'}</span></div><div className="scene-shell" onPointerDown={e=>{invitationDrag.current=e.clientY}} onPointerUp={e=>{if(phase==='lantern'&&invitationDrag.current-e.clientY>60)setPhase('release')}}><Scene state={state} onSelect={select}/><div className="scene-caption"><span>{phase==='invitation'?'A room waiting to be discovered.':phase==='room'?'Tap an object, or use the discovery list.':phase==='garden'?'A little water. A little patience. A little magic.':phase==='bouquet'?'Every bloom has a little story.':'From a little garden to an endless sky.'}</span>{phase==='room'&&<span className="collection-pill"><Flower2 size={14}/>{found.length} / 3</span>}</div>{phase==='invitation'&&<div className={'invitation-preview '+(inviteOpen?'is-open':'')} aria-hidden="true"><div className="invitation-corner"/><span className="invite-mini">A LITTLE SOMETHING FOR</span><span className="invite-name">Shubhm</span><span className="wax-seal">S</span><span className="invite-script">with a little love & a little magic</span></div>}{phase==='bouquet'&&gathered.length===3&&<div className="bouquet-tag"><span>FOR YOU, ALWAYS</span><strong>Happy birthday,<br/><em>Shubhm.</em></strong></div>}{phase==='finale'&&<div className="sky-signature"><span>✧</span><p>Here’s to you.</p></div>}</div><div className="visual-bottom"><span>HANDPICKED LITTLE MOMENTS</span><span>✧</span><span>MADE FOR ONE, NOT EVERYONE</span></div></section>
    </div>
    <footer className="site-footer"><span>A LITTLE WEBSITE. A WHOLE LOT OF LOVE.</span><span>{chapter===0?'YOUR EVENING IS ABOUT TO BEGIN':chapter===3?'THE SKY IS ONLY THE BEGINNING':'THERE’S NO NEED TO RUSH'}</span><span>SHUBHM <span className="footer-star">✧</span></span></footer>
    <div className="notice" role="status">{notice}</div>
    {inviteOpen&&phase==='invitation'&&<div className="modal-scrim" onClick={()=>setInviteOpen(false)}><div className="modal invitation-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title" ref={modalRef} tabIndex={-1} onClick={e=>e.stopPropagation()} onPointerDown={(e:PointerEvent)=>{invitationDrag.current=e.clientX}} onPointerUp={(e:PointerEvent)=>{if(e.clientX-invitationDrag.current>80)enter(false)}}><button className="close-modal" aria-label="Close invitation" onClick={()=>setInviteOpen(false)}><X size={20}/></button><span className="ornament">✧</span><p className="eyebrow">YOU’RE INVITED TO A MOMENT OF YOUR OWN</p><h2 id="invite-title">Dear Shubhm,</h2><p>No plans to make. No place to be.<br/>Just a little evening made to celebrate you.</p><p>Open the curtains. Follow your curiosity.<br/>Something beautiful is waiting at the end.</p><span className="handwritten">shall we begin?</span><button className="primary" onClick={()=>enter(true)}>Enter with sound <Volume2 size={16}/></button><button className="text-button" onClick={()=>enter(false)}>Enter quietly <ArrowRight size={15}/></button></div></div>}
    {modal&&<div className="modal-scrim" onClick={()=>setModal(null)}><div className={'modal discovery-modal '+modal} role="dialog" aria-modal="true" aria-labelledby="discovery-title" ref={modalRef} tabIndex={-1} onClick={e=>e.stopPropagation()}><button className="close-modal" aria-label="Close discovery" onClick={()=>setModal(null)}><X size={20}/></button>
      {modal==='box'&&<><p className="eyebrow">YOUR FIRST LITTLE KEEPSAKE</p><div className="paper-bloom"><Bloom/></div><h2 id="discovery-title">For the little joys.</h2><p>The unexpected laugh. The perfect song.<br/>The ordinary day that turns into a lovely memory.</p><p>May your year be full of them.</p><div className="flower-earned"><Flower2 size={17}/>A rose for your balcony garden</div><button className="primary" onClick={()=>setModal(null)}>Keep this little joy <ArrowRight size={16}/></button></>}
      {modal==='chimes'&&<><p className="eyebrow">A MOMENT TO PLAY</p><h2 id="discovery-title">Find your own harmony.</h2><p>Tap each chime. Let the room sing a little.</p><Chimes sound={sound} audio={audio} onComplete={()=>{discover(1);setNotice('A little harmony. An ivory bloom for your garden.')}} completed={found.includes(1)}/>{!sound&&<button className="text-button" onClick={()=>setSound(true)}><Volume2 size={15}/>Enable sound to hear the chimes</button>}<div className="flower-earned">{found.includes(1)?<><Check size={16}/>An ivory bloom for your balcony</>:<>Touch all five chimes to discover a bloom</>}</div><button className="primary" onClick={()=>{if(!found.includes(1))discover(1);setModal(null)}}>{found.includes(1)?'Carry the melody with you':'Continue & collect your bloom'}<ArrowRight size={16}/></button></>}
      {modal==='letter'&&<><p className="eyebrow">A LETTER, JUST FOR YOU</p><h2 id="discovery-title">Dear Shubhm,</h2><div className="letter-copy"><p>Happy birthday.</p><p>I hope the year ahead is kind to you. That it brings you people who make you laugh, places that make you feel alive, and little moments you’ll want to keep.</p><p>May you find time for the things you love, courage for the things you want, and a little more faith in yourself along the way.</p><p>Today, let yourself be celebrated. You don’t need to do anything to deserve a lovely day.</p><p className="handwritten">Here’s to a beautiful chapter ahead.</p></div><div className="flower-earned"><Flower2 size={17}/>A golden bloom for your balcony</div><button className="primary" onClick={()=>setModal(null)}>Keep these words <ArrowRight size={16}/></button></>}
      {modal==='record'&&<><p className="eyebrow">THE SOUNDTRACK TO YOUR EVENING</p><div className={'vinyl '+(sound?'spinning':'')}><span>S</span></div><h2 id="discovery-title">Choose your mood.</h2><p>A little background music.<br/>Nothing else to do but enjoy.</p><div className="track-choices">{(['dreamy','cheerful'] as const).map(t=><button className={track===t&&sound?'selected':''} key={t} onClick={()=>{setTrack(t);setSound(true)}}><Music2 size={17}/><span>{t==='dreamy'?'Soft & dreamy':'Warm & cheerful'}<small>{t==='dreamy'?'Slow, floating piano-like notes':'A brighter little melody'}</small></span>{track===t&&sound?<Check size={16}/>:<ChevronRight size={16}/>}</button>)}</div><button className="text-button" onClick={()=>setModal(null)}>Back to the room <ArrowRight size={15}/></button></>}
    </div></div>}
  </main>;
}

function Chimes({sound,audio,onComplete,completed}:{sound:boolean;audio:React.RefObject<AudioContext|null>;onComplete:()=>void;completed:boolean}){
  const [played,setPlayed]=useState<number[]>(completed?[0,1,2,3,4]:[]);
  function play(i:number){const next=played.includes(i)?played:[...played,i];setPlayed(next);if(next.length===5&&played.length<5)onComplete();const c=audio.current;if(!sound||!c)return;const o=c.createOscillator(),g=c.createGain();o.frequency.value=[523.25,587.33,659.25,783.99,880][i];g.gain.setValueAtTime(.055,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+2);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+2.1);}
  return <div className="interactive-chimes">{[0,1,2,3,4].map(i=><button key={i} aria-label={`Play chime ${i+1}`} className={played.includes(i)?'played':''} onClick={()=>play(i)} style={{'--chime-height':`${100+i*13}px`} as React.CSSProperties}><span className="chime-thread"/><span className="chime-tube"/><small>{played.includes(i)?'✧':i+1}</small></button>)}</div>;
}
