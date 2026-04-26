/* shared.js — included on every page */

// ── Cursor ──
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => {
  mx=e.clientX; my=e.clientY;
  cursor.style.left=mx+'px'; cursor.style.top=my+'px';
});
(function animRing(){
  rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12;
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  requestAnimationFrame(animRing);
})();
document.querySelectorAll('a,button').forEach(el=>{
  el.addEventListener('mouseenter',()=>cursor.classList.add('hover'));
  el.addEventListener('mouseleave',()=>cursor.classList.remove('hover'));
});

// ── Nav scroll ──
const nav = document.getElementById('mainNav');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>60));

// ── Mobile nav ──
document.getElementById('navToggle').addEventListener('click',()=>
  document.getElementById('mobileNav').classList.add('open'));
document.getElementById('mobileClose').addEventListener('click', closeMobile);
function closeMobile(){ document.getElementById('mobileNav').classList.remove('open'); }

// ── Scroll reveal ──
const ro = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));

// ── Photo protection ──
document.addEventListener('contextmenu',e=>{ if(e.target.tagName==='IMG') e.preventDefault(); });
document.addEventListener('dragstart',e=>{ if(e.target.tagName==='IMG') e.preventDefault(); });
document.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&e.key==='s') e.preventDefault(); });
