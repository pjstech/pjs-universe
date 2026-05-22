#!/usr/bin/env node
/**
 * PJ's Universe — Auto Photo Scanner
 * Runs during Cloudflare Pages build.
 * Scans all photo folders and generates photos.json automatically.
 * Just drop photos in the right folder — this does the rest.
 */

const fs   = require('fs');
const path = require('path');

const PHOTO_EXTENSIONS = ['.jpg','.jpeg','.png','.webp'];

// ── Folder structure ──
const STRUCTURE = {
  track: {
    'wec-gt':               { label:'WEC GT',              description:'FIA World Endurance Championship — GT category' },
    'wec-hypercar':         { label:'WEC Hypercar',         description:'FIA World Endurance Championship — Hypercar category' },
    'porsche-carrera-cup':  { label:'Porsche Carrera Cup',  description:'Porsche Carrera Cup Benelux' },
    'legends-le-mans':      { label:'Legends of Le Mans',   description:'Historic racing at its finest' },
  },
  builds: {
    '3d-printed': { label:'3D Printed Parts',  description:'Custom 3D printed scale model components' },
    'aluminium':  { label:'Aluminium Parts',   description:'Hand-finished aluminium scale model parts' },
    'stickers':   { label:'Custom Stickers',   description:'Precision-cut custom decal sets' },
  },
  parts: {
    '3d-printed': { label:'3D Printed Parts',  description:'High-detail resin and FDM printed components' },
    'aluminium':  { label:'Aluminium Parts',   description:'CNC-machined and hand-finished aluminium components' },
    'stickers':   { label:'Custom Stickers & Decals', description:'Precision-cut custom decal sets' },
  }
};

// ── Helpers ──
function isPhoto(filename) {
  return PHOTO_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

function fileToCaption(filename) {
  return filename
    .replace(/^\d+[-_]/, '')          // remove leading order number
    .replace(/\.[^.]+$/, '')          // remove extension
    .replace(/[-_]/g, ' ')            // hyphens/underscores to spaces
    .replace(/\b\w/g, c => c.toUpperCase()); // Title Case
}

function scanFolder(folderPath) {
  if (!fs.existsSync(folderPath)) return [];
  return fs.readdirSync(folderPath)
    .filter(isPhoto)
    .sort() // sort by filename (01- prefix controls order)
    .map(filename => ({
      file:    filename,
      src:     folderPath.replace(/^\.?\/?/, '') + '/' + filename,
      caption: fileToCaption(filename)
    }));
}

function findHero() {
  // Look for a file named hero.* in photos/ folder
  const photosDir = 'photos';
  if (!fs.existsSync(photosDir)) return '';
  const hero = fs.readdirSync(photosDir).find(f =>
    f.startsWith('hero') && isPhoto(f)
  );
  return hero ? `photos/${hero}` : '';
}

// ── Build output ──
const output = {
  _generated: new Date().toISOString(),
  site: {
    hero: findHero()
  },
  track:  {},
  builds: {},
  parts:  {}
};

// Scan track series
for (const [key, meta] of Object.entries(STRUCTURE.track)) {
  const folderPath = `photos/track/${key}`;
  const photos = scanFolder(folderPath);
  output.track[key] = {
    label:       meta.label,
    description: meta.description,
    cover:       photos.length > 0 ? photos[0].src : '',
    photos:      photos
  };
}

// Scan builds categories
for (const [key, meta] of Object.entries(STRUCTURE.builds)) {
  const folderPath = `photos/builds/${key}`;
  const photos = scanFolder(folderPath);
  output.builds[key] = {
    label:       meta.label,
    description: meta.description,
    cover:       photos.length > 0 ? photos[0].src : '',
    photos:      photos
  };
}

// Scan parts categories
for (const [key, meta] of Object.entries(STRUCTURE.parts)) {
  const folderPath = `photos/parts/${key}`;
  const photos = scanFolder(folderPath);
  output.parts[key] = {
    label:       meta.label,
    description: meta.description,
    photos:      photos
  };
}

// Write photos.json
fs.writeFileSync('photos.json', JSON.stringify(output, null, 2));

// Summary
const trackTotal  = Object.values(output.track).reduce((a,s) => a + s.photos.length, 0);
const buildsTotal = Object.values(output.builds).reduce((a,s) => a + s.photos.length, 0);
const partsTotal  = Object.values(output.parts).reduce((a,s) => a + s.photos.length, 0);

console.log('✅ photos.json generated');
console.log(`   Hero:   ${output.site.hero || 'none'}`);
console.log(`   Track:  ${trackTotal} photos across ${Object.keys(output.track).length} series`);
console.log(`   Builds: ${buildsTotal} photos across ${Object.keys(output.builds).length} categories`);
console.log(`   Parts:  ${partsTotal} photos across ${Object.keys(output.parts).length} categories`);
console.log('');

// List series with photos
for (const [key, data] of Object.entries(output.track)) {
  if (data.photos.length > 0) {
    console.log(`   📷 ${data.label}: ${data.photos.length} photos`);
  }
}
for (const [key, data] of Object.entries(output.builds)) {
  if (data.photos.length > 0) {
    console.log(`   🔧 ${data.label}: ${data.photos.length} photos`);
  }
}
