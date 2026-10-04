/* ======= SOZLAMALAR — shu yerni o'zgartiring ======= */
const CONFIG = {
  gameDay: 2,               // 2 = seshanba (0 yakshanba ... 6 shanba)
  gameTime: "19:00",        // o'yin boshlanish vaqti
  gameLength: 3,            // o'yin necha soat davom etadi
  venueShort: "Samarqand",  // qisqa joy nomi (restoran nomi)
  venueFull: "Manzil ro‘yxatdan o‘tgach yuboriladi", // to'liq manzil
  capacity: "15–18 jamoa",
  price: "50 000",
  // Galereya: src — fayl, cap — izoh, cls — o'lcham (tall | big | wide | bo'sh), video: true — video
  gallery: [
    { src: "/assets/media/reel.mp4", poster: "/assets/media/reel-poster.webp", cap: "Jonli lavha", cls: "tall", video: true },
    { src: "/assets/media/champions.webp", cap: "Grand final g‘oliblari", cls: "big" },
    { src: "/assets/media/highfive.webp", cap: "Javob topildi!" },
    { src: "/assets/media/prize.webp", cap: "Sovrin egasi" },
    { src: "/assets/media/tension.webp", cap: "Javob e’lon qilinganda", cls: "wide" },
    { src: "/assets/media/laugh.webp", cap: "Kulgi kafolatlangan", cls: "wide" },
    { src: "/assets/media/team.webp", cap: "Bir jamoa — bir maqsad" },
    { src: "/assets/media/council.webp", cap: "Jamoa kengashi" },
    { src: "/assets/media/cheers.webp", cap: "Zo‘r javob!", cls: "wide" },
    { src: "/assets/media/thinking.webp", cap: "O‘ylash vaqti" },
    { src: "/assets/media/friends.webp", cap: "Raqiblar ham do‘st", cls: "wide" },
    { src: "/assets/media/host.webp", cap: "Boshlovchi sahnada" }
  ]
};
/* =================================================== */

const MONTHS=["yanvar","fevral","mart","aprel","may","iyun","iyul","avgust","sentabr","oktabr","noyabr","dekabr"];
const DAYS=["yakshanba","dushanba","seshanba","chorshanba","payshanba","juma","shanba"];
const TZ=5*3600e3; // Toshkent/Samarqand UTC+5
const $=id=>document.getElementById(id);

function nextGames(n){
  const [hh,mm]=CONFIG.gameTime.split(":").map(Number);
  const local=new Date(Date.now()+TZ);
  const diff=(CONFIG.gameDay-local.getUTCDay()+7)%7;
  let t=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate()+diff,hh,mm)-TZ;
  if(t+CONFIG.gameLength*3600e3<Date.now()) t+=7*864e5;
  return Array.from({length:n},(_,i)=>t+i*7*864e5);
}
function fmt(t){const d=new Date(t+TZ);return `${d.getUTCDate()}-${MONTHS[d.getUTCMonth()]}, ${DAYS[d.getUTCDay()]}`}

const games=nextGames(3);
$("nextDate").textContent=fmt(games[0]);
$("nextTime").textContent=`soat ${CONFIG.gameTime} da`;
$("venueShort").textContent=CONFIG.venueShort;
$("capacity").textContent=CONFIG.capacity;
$("capText").textContent=CONFIG.capacity.replace(" jamoa","");
$("timeText").textContent=`soat ${CONFIG.gameTime}`;
$("venueText").textContent=CONFIG.venueFull;
$("priceText").textContent=CONFIG.price;
$("stPrice").textContent=CONFIG.price;
$("faqPrice").textContent=`Kishi boshiga ${CONFIG.price} so‘m.`;
$("faqWhere").textContent=`Har seshanba soat ${CONFIG.gameTime} da. ${CONFIG.venueFull}.`;
$("yr").textContent=new Date().getFullYear();
$("finalDate").textContent=`${fmt(games[0])}, soat ${CONFIG.gameTime}`;

const dateSel=$("date");
games.forEach((t,i)=>{const o=document.createElement("option");o.value=`${fmt(t)}, ${CONFIG.gameTime}`;o.textContent=fmt(t)+(i===0?" (eng yaqin)":"");dateSel.appendChild(o)});
const pSel=$("players");
for(let i=2;i<=8;i++){const o=document.createElement("option");o.value=i;o.textContent=`${i} kishi`;if(i===5)o.selected=true;pSel.appendChild(o)}

function tick(){
  const now=Date.now(); let t=games[0]; let ms=t-now;
  if(ms<=0){ $("countdown").innerHTML='<div style="grid-column:1/-1;font:700 20px var(--head);color:var(--gold);padding:14px">O‘yin hozir davom etmoqda!</div>'; return; }
  const d=Math.floor(ms/864e5),h=Math.floor(ms/36e5)%24,m=Math.floor(ms/6e4)%60,s=Math.floor(ms/1e3)%60;
  $("cd-d").textContent=d;const fl=$("finalLeft");if(fl)fl.textContent=`${d} kun ${h} soat ${m} daqiqa qoldi`;$("cd-h").textContent=String(h).padStart(2,"0");$("cd-m").textContent=String(m).padStart(2,"0");$("cd-s").textContent=String(s).padStart(2,"0");
}
tick(); const cdTimer=setInterval(()=>{ if(!$("cd-s")) return clearInterval(cdTimer); tick(); },1000);

/* gallery */
const PH=[["big","G‘alaba lahzasi"],["","Javob e’lon qilinganda"],["","Musiqa raundi"],["wide","“Zato shohsupadami” taqdirlanishi"],["","Baraban aylanmoqda"],["","Jamoa kengashi"],["wide","Shohsupadagi g‘oliblar"]];
const gal=$("gallery");
const items=CONFIG.gallery.length?CONFIG.gallery.map(g=>({cls:g.cls||"",cap:g.cap||"",src:g.src,video:g.video,poster:g.poster})):PH.map(([cls,cap])=>({cls,cap}));
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
items.forEach(it=>{
  const el=document.createElement(it.src&&!it.video?"button":"div"); el.className="gal reveal "+it.cls;
  if(it.video){el.innerHTML=`<video muted loop playsinline preload="none" poster="${it.poster||""}" data-src="${it.src}" aria-label="${esc(it.cap)}"></video><span class="live">● Jonli</span>`}
  else if(it.src){el.type="button";el.setAttribute("aria-label",`Kattalashtirish: ${it.cap}`);el.innerHTML=`<img src="${it.src}" alt="${esc(it.cap)}" loading="lazy" decoding="async">`;el.addEventListener("click",()=>openLb(it.src,it.cap))}
  else el.innerHTML=`<div class="ph" aria-hidden="true">?</div>`;
  if(it.cap){const c=document.createElement("span");c.className="cap";c.textContent=it.cap;el.appendChild(c)}
  gal.appendChild(el);
});
/* video faqat ko'ringanda yuklanadi va o'ynaydi */
gal.querySelectorAll("video").forEach(v=>{new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){if(!v.src)v.src=v.dataset.src;v.play().catch(()=>{})}else v.pause()}),{threshold:.35}).observe(v)});
/* rasmni kattalashtirish */
const lb=$("lb"),lbImg=$("lbImg");let lastFocus=null;
function openLb(src,cap){lastFocus=document.activeElement;lbImg.src=src;lbImg.alt=cap;$("lbCap").textContent=cap;lb.hidden=false;document.body.style.overflow="hidden";$("lbX").focus()}
function closeLb(){lb.hidden=true;document.body.style.overflow="";lbImg.src="";lastFocus&&lastFocus.focus()}
$("lbX").onclick=closeLb;lb.addEventListener("click",e=>{if(e.target===lb)closeLb()});addEventListener("keydown",e=>{if(e.key==="Escape"&&!lb.hidden)closeLb()});

/* mini quiz */
const QS=[
  {q:"Samarqanddagi Registon maydonidagi ansambl nechta madrasadan iborat?",o:["2 ta","3 ta","4 ta","5 ta"],a:1,e:"Ulug‘bek, Sherdor va Tillakori madrasalari."},
  {q:"Quyosh tizimidagi eng katta sayyora qaysi?",o:["Saturn","Yer","Yupiter","Neptun"],a:2,e:"Yupiter qolgan barcha sayyoralardan kattaroq."},
  {q:"Amir Temur qaysi shahar yaqinida tug‘ilgan?",o:["Buxoro","Xiva","Shahrisabz","Toshkent"],a:2,e:"Kesh (hozirgi Shahrisabz) yaqinidagi Xo‘ja Ilg‘or qishlog‘ida."}
];
let qi=0,score=0;
function renderQ(){
  const q=QS[qi]; $("qcount").textContent=`Savol ${qi+1} / ${QS.length}`; $("qtext").textContent=q.q; $("qfb").textContent=""; $("qnext").hidden=true;
  const box=$("opts"); box.innerHTML="";
  q.o.forEach((t,i)=>{const b=document.createElement("button");b.className="opt";b.textContent=t;b.onclick=()=>answer(i,b);box.appendChild(b)});
}
function answer(i,btn){
  const q=QS[qi]; const all=[...$("opts").children]; all.forEach(b=>b.disabled=true);
  all[q.a].classList.add("ok");
  if(i===q.a){score++;$("qfb").textContent="To‘g‘ri! "+q.e}else{btn.classList.add("no");$("qfb").textContent="Afsus. "+q.e}
  const nb=$("qnext"); nb.hidden=false;
  if(qi===QS.length-1){nb.textContent="Natijani ko‘rish"}
}
$("qnext").onclick=()=>{
  if(qi<QS.length-1){qi++;renderQ();return}
  $("qcount").textContent="Natija"; $("opts").innerHTML="";
  $("qtext").textContent=score===QS.length?`${score}/${QS.length} — siz tayyorsiz! Seshanba kuni jamoangiz bilan keling.`:`${score}/${QS.length} — yomon emas! Jamoada esa bundan ham kuchliroq bo‘lasiz.`;
  $("qfb").innerHTML=""; const nb=$("qnext"); nb.textContent="Ro‘yxatdan o‘tish"; nb.onclick=()=>location.hash="#royxat";
};
renderQ();

/* wheel */
const wheel=$("wheel"); let rot=0, spinning=false;
for(let i=0;i<10;i++){const s=document.createElement("span");s.innerHTML=`<b>${i+1}</b>`;wheel.appendChild(s)}
function placeNums(){const r=wheel.clientWidth*0.36;wheel.querySelectorAll("span").forEach((s,i)=>{const a=(i*36+18)*Math.PI/180;s.style.transform=`translate(${Math.sin(a)*r}px,${-Math.cos(a)*r}px)`;s.firstChild.style.transform="translate(-50%,-50%)"})}
placeNums(); addEventListener("resize",placeNums);
$("spin").onclick=()=>{
  if(spinning)return; spinning=true; $("wheelRes").textContent="";
  const n=Math.floor(Math.random()*10);
  const target=360-(n*36+18);
  rot+= 360*5 + ((target-rot%360)+360)%360;
  wheel.style.transform=`rotate(${rot}deg)`;
  setTimeout(()=>{spinning=false;$("wheelRes").textContent=`№${n+1} — shirinlik sizga! O‘yinda ham shunday omad tilaymiz.`},4300);
};

/* phone mask */
const phone=$("phone");
phone.addEventListener("input",()=>{
  const v=phone.value.trim(); let d; if(v.startsWith("+998")){d=v.slice(4).replace(/\D/g,"")}else{d=v.replace(/\D/g,""); if(d.length>9&&d.startsWith("998"))d=d.slice(3)} d=d.slice(0,9);
  let out="+998"; if(d.length)out+=" "+d.slice(0,2); if(d.length>2)out+=" "+d.slice(2,5); if(d.length>5)out+=" "+d.slice(5,7); if(d.length>7)out+=" "+d.slice(7,9);
  phone.value=d.length?out:""; clearErr("f-phone");
});
phone.addEventListener("focus",()=>{if(!phone.value)phone.value="+998 "});
phone.addEventListener("blur",()=>{if(phone.value.trim()==="+998")phone.value=""});

/* form */
const form=$("regForm");
function setErr(id,msg){const f=$(id);f.classList.add("err");f.querySelector(".emsg").textContent=msg}
function clearErr(id){const f=$(id);f.classList.remove("err");f.querySelector(".emsg").textContent=""}
["team","captain"].forEach(k=>$(k).addEventListener("input",()=>clearErr("f-"+k)));
form.addEventListener("submit",async e=>{
  e.preventDefault(); $("formErr").hidden=true;
  const fd=Object.fromEntries(new FormData(form)); let bad=false;
  if(!fd.team.trim()){setErr("f-team","Jamoa nomini kiriting");bad=true}
  if(!fd.captain.trim()){setErr("f-captain","Ismingizni kiriting");bad=true}
  if(fd.phone.replace(/\D/g,"").length!==12){setErr("f-phone","Raqamni to‘liq kiriting: +998 XX XXX XX XX");bad=true}
  if(bad){form.querySelector(".err input, .err select")?.focus();return}
  const btn=$("submitBtn"); btn.disabled=true; btn.textContent="Yuborilmoqda…";
  try{
    const r=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(fd)});
    const j=await r.json().catch(()=>({}));
    if(r.ok&&j.ok){
      form.innerHTML=`<div class="done"><div class="big">Ariza qabul qilindi!</div><p><b style="color:var(--navy)">${fd.team.replace(/</g,"&lt;")}</b> jamoasi ${fd.date.replace(/</g,"&lt;")} o‘yiniga yozildi. Tez orada siz bilan bog‘lanamiz.<br>E’lonlarni o‘tkazib yubormaslik uchun kanalimizga qo‘shiling.</p><a class="btn btn-gold" href="https://t.me/maroqAndquiz" target="_blank" rel="noopener">Telegram kanalga o‘tish</a></div>`;
      form.scrollIntoView({block:"center"});
      return;
    }
    throw new Error(j.error||"err");
  }catch(err){
    const msg=err.message&&err.message.length>20?err.message:"Ariza yuborilmadi. Iltimos, qayta urinib ko‘ring yoki bizga to‘g‘ridan-to‘g‘ri yozing:";
    $("formErr").innerHTML=`${msg} <a href="https://t.me/maroqAndquiz" target="_blank" rel="noopener">Telegram</a> · <a href="https://ig.me/m/maroqandquiz" target="_blank" rel="noopener">Instagram Direct</a>`;
    $("formErr").hidden=false; btn.disabled=false; btn.textContent="Joyni band qilish";
  }
});

/* reveal + mobile cta */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
const cta=$("mobileCta"), regSec=$("royxat"), hero=document.querySelector(".hero");
const finSec=document.querySelector(".final");
function ctaState(){const vis=el=>{const r=el.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0},h=hero.getBoundingClientRect();cta.classList.toggle("hide",vis(regSec)||vis(finSec)||h.bottom>innerHeight*0.4)}
ctaState(); addEventListener("scroll",ctaState,{passive:true});

/* ===== animatsiyalar ===== */
const calm=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* hero bezaklari: suzib yuruvchi belgilar */
[["?","d1","top:6%;right:44%;font-size:110px;color:rgba(255,184,28,.22)","8s","-12deg"],
 ["!","d2","bottom:36%;left:47%;font-size:80px;color:rgba(46,158,63,.18)","6.5s","10deg"],
 ["?","d3","bottom:4%;left:-10px;font-size:150px;color:rgba(11,16,51,.05)","9s","8deg"],
 ["♪","d4","top:10%;left:36%;font-size:56px;color:rgba(255,90,95,.2)","7s","-6deg"]
].forEach(([ch,c,pos,t,r])=>{const d=document.createElement("div");d.className="deco "+c;d.style.cssText=pos;d.setAttribute("aria-hidden","true");d.innerHTML=`<i style="--t:${t};--rot:${r}">${ch}</i>`;hero.prepend(d)});

/* reveal ketma-ketligi: bir guruhdagi elementlar birin-ketin chiqadi */
document.querySelectorAll(".reveal").forEach(el=>{const sib=[...el.parentElement.children].filter(x=>x.classList.contains("reveal"));const i=sib.indexOf(el);if(i>0)el.style.transitionDelay=Math.min(i*80,400)+"ms"});

/* raqamlar sanab chiqadi */
function countUp(el,to,suffix){if(calm){return}const dur=1200,st=performance.now();const f=to>=1000;(function step(n){const p=Math.min((n-st)/dur,1),v=Math.round(to*(1-Math.pow(1-p,3)));el.textContent=(f?v.toLocaleString("ru-RU").replace(/ |,/g," "):v)+suffix;if(p<1)requestAnimationFrame(step)})(st)}
const statEls=document.querySelectorAll(".stat b");
const sio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const b=e.target,txt=b.textContent.trim(),m=txt.match(/^([\d ]+)(\+?)$/);if(m)countUp(b,parseInt(m[1].replace(/ /g,"")),m[2]);sio.unobserve(b)}),{threshold:.6});
statEls.forEach(b=>sio.observe(b));

/* soniyalar "tiq" etadi */
const secEl=$("cd-s");let lastS="";
setInterval(()=>{const s=$("cd-s");if(!s||calm)return;if(s.textContent!==lastS){lastS=s.textContent;s.classList.remove("tick");void s.offsetWidth;s.classList.add("tick")}},250);

/* scroll: progress chizig'i va menyu soyasi */
const bar=document.createElement("div");bar.id="progress";bar.setAttribute("aria-hidden","true");document.body.prepend(bar);
const nav=document.querySelector(".nav");let ticking=false;
addEventListener("scroll",()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const h=document.documentElement;bar.style.transform=`scaleX(${h.scrollTop/(h.scrollHeight-innerHeight||1)})`;nav.classList.toggle("scrolled",h.scrollTop>10);ticking=false})},{passive:true});

/* konfetti */
function confetti(x,y,n=26){if(calm)return;const cols=["#FFB81C","#2E9E3F","#FF5A5F","#0B1033","#FFF6E3"];for(let i=0;i<n;i++){const c=document.createElement("i");c.className="confetti";const a=Math.random()*Math.PI*2,d=80+Math.random()*140;c.style.cssText=`left:${x}px;top:${y}px;background:${cols[i%cols.length]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d+120}px;--r:${Math.random()*720-360}deg`;document.body.appendChild(c);setTimeout(()=>c.remove(),1200)}}
function centerOf(el){const r=el.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]}

/* quiz: to'g'ri javobda konfetti */
$("opts").addEventListener("click",e=>{const b=e.target.closest(".opt");if(b&&b.classList.contains("ok"))confetti(...centerOf(b))});

/* baraban: birinchi aylantirishgacha tugma "chaqiradi", to'xtaganda konfetti */
const spinBtn=$("spin");spinBtn.classList.add("idle");
spinBtn.addEventListener("click",()=>{spinBtn.classList.remove("idle");setTimeout(()=>confetti(...centerOf(wheel),34),4300)});

/* forma yuborilganda konfetti */
new MutationObserver(()=>{const d=form.querySelector(".done");if(d)confetti(...centerOf(d),40)}).observe(form,{childList:true});
