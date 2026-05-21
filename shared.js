/* shared.js — PJ's Universe v3 */

// ── Racecar Cursor ──
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
if (cursor) {
  // Inject racecar SVG
  cursor.innerHTML = `<svg viewBox="0 0 64 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Body -->
    <path d="M4 18 L8 10 L18 7 L38 6 L52 9 L60 14 L60 18 L4 18Z" fill="#c0392b"/>
    <!-- Cockpit -->
    <path d="M20 10 L24 7 L36 7 L40 10Z" fill="#1a1a1a" opacity="0.8"/>
    <!-- Windscreen -->
    <path d="M22 10 L25 7.5 L35 7.5 L38 10Z" fill="#4a9edd" opacity="0.6"/>
    <!-- Front wing -->
    <path d="M52 17 L62 17 L62 20 L52 20Z" fill="#c0392b"/>
    <!-- Rear wing -->
    <path d="M2 13 L2 16 L8 16 L8 13Z" fill="#c0392b"/>
    <path d="M2 13 L14 13 L14 15 L2 15Z" fill="#888"/>
    <!-- Side pod detail -->
    <rect x="30" y="8" width="16" height="3" rx="1" fill="#8e1b10" opacity="0.6"/>
    <!-- Front wheel -->
    <circle cx="50" cy="20" r="5" fill="#111"/>
    <circle cx="50" cy="20" r="3" fill="#333"/>
    <circle cx="50" cy="20" r="1.2" fill="#555"/>
    <!-- Rear wheel -->
    <circle cx="14" cy="20" r="6" fill="#111"/>
    <circle cx="14" cy="20" r="3.5" fill="#333"/>
    <circle cx="14" cy="20" r="1.4" fill="#555"/>
    <!-- Racing number -->
    <text x="26" y="16" font-size="7" fill="white" font-family="Arial" font-weight="bold" opacity="0.9">PJ</text>
    <!-- Red stripe -->
    <rect x="8" y="14" width="44" height="2" fill="#e8b422" opacity="0.7"/>
  </svg>`;
}
if (cursor && ring) {
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    cursor.style.left=mx+'px'; cursor.style.top=my+'px';
  });
  (function animRing(){
    rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
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
