/* shared.js — PJ's Universe v3 */

// ── Cursor ──
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
if (cursor && ring) {
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    cursor.style.left=mx+'px'; cursor.style.top=my+'px';
  });
  (function animRing(){
    rx+=(mx-rx)*.12; ry+=(my-ry)*.12;
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    requestAnimationFrame(animRing);
  })();
  document.querySelectorAll('a,button,.series-card,.gallery-item').forEach(el=>{
    el.addEventListener('mouseenter',()=>cursor.classList.add('hover'));
    el.addEventListener('mouseleave',()=>cursor.classList.remove('hover'));
  });
}

// ── Nav scroll ──
const nav = document.getElementById('mainNav');
if (nav) window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>60));

// ── Mobile nav ──
const navToggle  = document.getElementById('navToggle');
const mobileNav  = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');
if (navToggle)  navToggle.addEventListener('click', ()=>mobileNav.classList.add('open'));
if (mobileClose) mobileClose.addEventListener('click', closeMobile);
function closeMobile(){ if(mobileNav) mobileNav.classList.remove('open'); }

// ── Scroll reveal ──
const ro = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:0.08});
document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));

// ── Photo protection ──
document.addEventListener('contextmenu',e=>{ if(e.target.tagName==='IMG') e.preventDefault(); });
document.addEventListener('dragstart',e=>{ if(e.target.tagName==='IMG') e.preventDefault(); });
document.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&e.key==='s') e.preventDefault(); });

// ── Lightbox ──
let lbPhotos = [];
let lbIndex  = 0;
let lbAutoplay = null;

function openLightbox(photos, index) {
  lbPhotos = photos;
  lbIndex  = index;
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.add('open');
  renderLightbox();
  document.addEventListener('keydown', lbKeyHandler);
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  document.removeEventListener('keydown', lbKeyHandler);
  document.body.style.overflow = '';
  if (lbAutoplay) { clearInterval(lbAutoplay); lbAutoplay = null; }
}

function renderLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb || !lbPhotos.length) return;
  const photo = lbPhotos[lbIndex];
  const img = lb.querySelector('.lightbox-img');
  const cap = lb.querySelector('.lightbox-caption');
  const ctr = lb.querySelector('.lightbox-counter');
  const dots = lb.querySelector('.lightbox-dots');
  if (img) { img.src = ''; img.src = photo.src; }
  if (cap) cap.textContent = photo.caption || '';
  if (ctr) ctr.textContent = (lbIndex+1) + ' / ' + lbPhotos.length;
  if (dots) {
    dots.innerHTML = lbPhotos.map((_,i)=>
      `<div class="lightbox-dot${i===lbIndex?' active':''}" onclick="lbGoTo(${i})"></div>`
    ).join('');
  }
}

function lbNext() { lbIndex = (lbIndex+1)%lbPhotos.length; renderLightbox(); }
function lbPrev() { lbIndex = (lbIndex-1+lbPhotos.length)%lbPhotos.length; renderLightbox(); }
function lbGoTo(i) { lbIndex=i; renderLightbox(); }

function lbKeyHandler(e) {
  if (e.key==='ArrowRight') lbNext();
  if (e.key==='ArrowLeft')  lbPrev();
  if (e.key==='Escape')     closeLightbox();
}

// ── Gallery builder ──
function buildGallery(containerId, photos) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!photos || photos.length === 0) {
    container.innerHTML = `
      <div class="gallery-empty">
        <h3>Coming Soon</h3>
        <p>Photos will appear here shortly.</p>
      </div>`;
    return;
  }
  container.innerHTML = photos.map((p,i) => `
    <div class="gallery-item reveal" onclick="openLightbox(window._galleryPhotos['${containerId}'], ${i})">
      <img src="${p.src}" alt="${p.caption||''}" loading="lazy" draggable="false" oncontextmenu="return false;">
      <div class="gallery-item-overlay">
        <span class="gallery-item-caption">${p.caption||''}</span>
      </div>
    </div>
  `).join('');
  window._galleryPhotos = window._galleryPhotos || {};
  window._galleryPhotos[containerId] = photos;
  container.querySelectorAll('.reveal').forEach(el=>ro.observe(el));
}

// ── Series card builder ──
function buildSeriesCards(containerId, series, baseUrl) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const keys = Object.keys(series);
  if (!keys.length) {
    container.innerHTML = '<p style="color:var(--muted);padding:40px 0;">No series yet.</p>';
    return;
  }
  container.innerHTML = keys.map(key => {
    const s = series[key];
    const count = s.photos ? s.photos.length : 0;
    const cover = s.cover || (s.photos && s.photos[0] ? s.photos[0].src : '');
    return `
      <a href="${baseUrl}?series=${key}" class="series-card reveal">
        ${cover ? `<img class="series-card-img" src="${cover}" alt="${s.label}" draggable="false" oncontextmenu="return false;">` : `<div class="series-card-placeholder">🏎️</div>`}
        <div class="series-card-bg"></div>
        <div class="series-card-content">
          <div class="series-card-label">Series</div>
          <div class="series-card-title">${s.label}</div>
          <div class="series-card-count">${count} photo${count!==1?'s':''}</div>
        </div>
      </a>`;
  }).join('');
  container.querySelectorAll('.reveal').forEach(el=>ro.observe(el));
}

// ── Parse filename to caption ──
// "01-spa-start.jpg" → "Spa Start"
function fileToCaption(filename) {
  return filename
    .replace(/^\d+-/, '')
    .replace(/\.[^.]+$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c=>c.toUpperCase());
}

// ── Build photo objects from photos.json array ──
// Array items can be strings (filenames) or {file, caption} objects
function buildPhotoObjects(folder, items) {
  if (!items) return [];
  return items.map(item => {
    if (typeof item === 'string') {
      return { src: folder + '/' + item, caption: fileToCaption(item) };
    }
    return { src: folder + '/' + item.file, caption: item.caption || fileToCaption(item.file) };
  });
}
