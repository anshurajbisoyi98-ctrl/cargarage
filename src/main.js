const $ = (selector) => document.querySelector(selector);
const experience = $('#experience');
const scene = $('.scene');
const layers = { covered: $('#covered'), billow: $('#billow'), detail: $('#detail') };
const slider = $('#reveal-range');
const output = $('#reveal-value');
const hotspots = $('#hotspots');
const menu = $('#menu-dialog');
const story = $('#story-dialog');
const menuButton = $('.menu-button');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer: fine)');
const titles = [
  ['MUSTANG', 'FASTBACK'],
  ['REDISCOVER', 'THE CLASSIC'],
  ['EVERY ANGLE.', 'AN ICON.'],
];
const descriptions = [
  ['Looks fast. Standing still.', 'An unmistakable silhouette. An untamed spirit.\nAn American original, still moving us.', 'STUDIO 01 — THE ORIGINAL'],
  ['A little mystery. A lasting impression.', 'Drag to pull back the years.\nRediscover what made you look twice.', 'STUDIO 02 — THE REVEAL'],
  ['A signature that stays with you.', 'Sculpted lines. Chrome accents. That unmistakable glow.\nCharacter, from the first glance to the last.', 'STUDIO 03 — THE DETAILS'],
];
let chapter = 0;
let progress = 1;
let target = 1;
let detailProgress = 0;
let detailTarget = 0;
let frameId = 0;
let previousTime = 0;
let playback = null;
let pointer = { x: 0, y: 0, tx: 0, ty: 0 };
let assetReady = { covered: false, billow: false, detail: false };
let ready = false;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value) => value * value * (3 - 2 * value);
const easeInOut = (value) => value < .5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

function paint() {
  // Only adjacent reveal states overlap; all layers share the same camera transform.
  const p = clamp(progress);
  layers.covered.style.opacity = String(p < .5 ? 1 : 0);
  layers.billow.style.opacity = String(p < .5 ? smooth(p * 2) : 1 - smooth((p - .5) * 2));
  layers.detail.style.opacity = String(detailProgress);
  experience.style.setProperty('--reveal', `${p * 100}%`);
  experience.style.setProperty('--progress', String(p));
  output.value = `${Math.round(p * 100)}%`;
  slider.value = String(Math.round(p * 100));
  const hideHotspots = chapter !== 0 || p < .98;
  hotspots.style.opacity = hideHotspots ? '0' : '1';
  hotspots.inert = hideHotspots;
  scene.style.transform = `translate3d(${pointer.x.toFixed(2)}px,${pointer.y.toFixed(2)}px,0)`;
}

function requestFrame() {
  if (!frameId && !document.hidden) frameId = requestAnimationFrame(tick);
}
function tick(now) {
  frameId = 0;
  const dt = previousTime ? Math.min(now - previousTime, 50) : 16.67;
  previousTime = now;
  const alpha = reducedMotion.matches ? 1 : 1 - Math.exp(-dt / 95);
  if (playback) {
    const t = clamp((now - playback.started) / playback.duration);
    target = playback.from + (playback.to - playback.from) * easeInOut(t);
    progress = target;
    if (t >= 1) {
      const next = playback.next;
      playback = null;
      next?.();
    }
  } else {
    progress += (target - progress) * alpha;
  }
  detailProgress += (detailTarget - detailProgress) * (reducedMotion.matches ? 1 : 1 - Math.exp(-dt / 220));
  pointer.x += (pointer.tx - pointer.x) * alpha;
  pointer.y += (pointer.ty - pointer.y) * alpha;
  if (Math.abs(progress - target) < .0001) progress = target;
  if (Math.abs(detailProgress - detailTarget) < .0001) detailProgress = detailTarget;
  paint();
  if (playback || Math.abs(progress - target) > .0001 || Math.abs(detailProgress - detailTarget) > .0001 || Math.abs(pointer.x - pointer.tx) > .01 || Math.abs(pointer.y - pointer.ty) > .01) requestFrame();
  else previousTime = 0;
}

function animateProgress(to, duration, next) {
  if (reducedMotion.matches) {
    target = progress = to;
    paint();
    next?.();
    return;
  }
  playback = { from: progress, to, duration, started: performance.now(), next };
  requestFrame();
}

function setChapter(nextChapter, { preserveProgress = false } = {}) {
  if (!ready) return;
  if (nextChapter === 1 && (!assetReady.covered || !assetReady.billow)) return notify('Reveal images are unavailable. Please reload to try again.');
  if (nextChapter === 2 && !assetReady.detail) return notify('The detail image is unavailable. Please reload to try again.');
  chapter = nextChapter;
  playback = null;
  experience.dataset.chapter = String(chapter);
  $('.headline-small').textContent = titles[chapter][0];
  $('.headline-large').replaceChildren(document.createTextNode(titles[chapter][1]));
  if (chapter === 0) {
    const mark = document.createElement('span');
    mark.className = 'title-dot';
    mark.textContent = '®';
    $('.headline-large').append(mark);
  }
  $('#bottom-title').textContent = descriptions[chapter][0];
  $('#bottom-description').textContent = descriptions[chapter][1];
  $('#view-label').textContent = descriptions[chapter][2];
  $('#section-index').innerHTML = `0${chapter + 1} <span>/ 03</span>`;
  document.querySelectorAll('.chapter').forEach((button, index) => {
    button.classList.toggle('active', index === chapter);
    if (index === chapter) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
  detailTarget = chapter === 2 ? 1 : 0;
  if (!preserveProgress) target = chapter === 1 ? 0 : 1;
  requestFrame();
}

function replay() {
  if (!ready || !assetReady.covered || !assetReady.billow) return;
  $('#replay').disabled = true;
  setChapter(1, { preserveProgress: true });
  const reveal = () => {
    animateProgress(1, 4300, () => {
      setTimeout(() => {
        setChapter(2);
        $('#replay').disabled = false;
      }, 900);
    });
  };
  if (progress > .01) animateProgress(0, 700, reveal);
  else reveal();
}

slider.addEventListener('input', (event) => {
  const value = Number(event.target.value) / 100;
  if (chapter !== 1) setChapter(1, { preserveProgress: true });
  playback = null;
  target = value;
  requestFrame();
});
$('#replay').addEventListener('click', replay);
document.querySelectorAll('[data-chapter]').forEach(button => button.addEventListener('click', () => setChapter(Number(button.dataset.chapter))));
document.querySelectorAll('[data-menu-chapter]').forEach(button => button.addEventListener('click', () => {
  menu.close();
  setChapter(Number(button.dataset.menuChapter));
}));
$('.wordmark').addEventListener('click', (event) => { event.preventDefault(); setChapter(0); });
menuButton.addEventListener('click', () => { menu.showModal(); menuButton.setAttribute('aria-expanded', 'true'); });
menu.addEventListener('close', () => menuButton.setAttribute('aria-expanded', 'false'));
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.view === 'story') story.showModal();
  else setChapter(2);
}));
$('#story-explore').addEventListener('click', () => { story.close(); setChapter(2); });
document.querySelectorAll('[data-feature]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.feature === 'detail') setChapter(2);
  else story.showModal();
}));
document.querySelectorAll('dialog:not(.service-dialog)').forEach(dialog => {
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});

let toastTimeout;
function notify(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => $('#toast').classList.remove('show'), 4000);
}
$('#share').addEventListener('click', async () => {
  try {
    if (navigator.share) await navigator.share({ title: document.title, text: 'An icon, uncovered. The 1968 Mustang Fastback.', url: location.href });
    else {
      await navigator.clipboard.writeText(location.href);
      notify('Link copied. This preview is accessible on this computer.');
    }
  } catch (error) {
    if (error.name !== 'AbortError') notify('Could not share. Copy the address from your browser.');
  }
});

experience.addEventListener('pointermove', (event) => {
  if (!finePointer.matches || reducedMotion.matches || !ready) return;
  const rect = experience.getBoundingClientRect();
  pointer.tx = ((event.clientX - rect.left) / rect.width - .5) * -8;
  pointer.ty = ((event.clientY - rect.top) / rect.height - .5) * -5;
  requestFrame();
});
experience.addEventListener('pointerleave', () => { pointer.tx = pointer.ty = 0; requestFrame(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    previousTime = 0;
    if (playback) playback.pausedAt = performance.now();
  } else {
    if (playback?.pausedAt) {
      playback.started += performance.now() - playback.pausedAt;
      delete playback.pausedAt;
    }
    requestFrame();
  }
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    playback = null;
    progress = target;
    pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  }
  requestFrame();
});

// ── Cinematic loading & grand-reveal ─────────────────────────────────────────
const loadingEl     = $('#loading');
const loadingBar    = $('#loading-bar');
const loadingPct    = $('#loading-percentage');
const loadingNote   = $('#loading-note');
const introVeil     = $('#intro-veil');

const notes = [
  'ENTERING THE STUDIO',
  'CALIBRATING THE LIGHT',
  'PREPARING THE ICON',
  'ALMOST READY',
];

// Animate the loading percentage from 0 → target over the given duration.
function animateCounter(from, to, duration) {
  const start = performance.now();
  return new Promise(resolve => {
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const value = Math.round(from + (to - from) * eased);
      loadingPct.textContent = value + '%';
      loadingBar.style.transform = `scaleX(${value / 100})`;
      if (value > 50) loadingPct.classList.add('lit');
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

async function prepareImages() {
  slider.disabled = true;
  $('#replay').disabled = true;

  // Phase 1: animate counter to 30% while fonts/initial paint settle
  await animateCounter(0, 30, 600);
  loadingNote.textContent = notes[1];

  const images = [...document.querySelectorAll('.scene-image')];
  const timeout = (promise) =>
    Promise.race([promise, new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Image loading timed out')), 12000))]);

  // Phase 2: animate to 70% as images begin loading
  await animateCounter(30, 70, 500);
  loadingNote.textContent = notes[2];

  const results = await Promise.allSettled(images.map(img => timeout(img.decode())));

  // Phase 3: race to 95%
  await animateCounter(70, 95, 400);
  loadingNote.textContent = notes[3];

  for (let i = 0; i < images.length; i++) {
    assetReady[images[i].id] = results[i].status === 'fulfilled';
  }

  // Phase 4: complete to 100%
  await animateCounter(95, 100, 250);
  ready = true;
  slider.disabled = !assetReady.covered || !assetReady.billow;
  $('#replay').disabled = slider.disabled;

  // Brief pause at 100% for drama
  await new Promise(r => setTimeout(r, 340));

  // ── Prepare the covered-car state BEFORE the loading screen fades ─────────
  // Set everything up so when the loading overlay disappears, the car is
  // already in the "covered" position — ready for the grand reveal sweep.
  if (!reducedMotion.matches && assetReady.covered && assetReady.billow) {
    chapter = 1;
    experience.dataset.chapter = '1';
    $('.headline-small').textContent = titles[1][0];
    $('.headline-large').replaceChildren(document.createTextNode(titles[1][1]));
    $('#bottom-title').textContent = descriptions[1][0];
    $('#bottom-description').textContent = descriptions[1][1];
    $('#view-label').textContent = descriptions[1][2];
    $('#section-index').innerHTML = `02 <span>/ 03</span>`;
    document.querySelectorAll('.chapter').forEach((button, index) => {
      button.classList.toggle('active', index === 1);
      if (index === 1) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    detailTarget = 0;
    target = progress = 0; // fully covered, no animation yet
    paint();
  } else {
    setChapter(0);
  }

  // Now fade out the loading screen — the covered car is already underneath
  loadingEl.classList.add('done');

  // Wait for the loading fade-out (~1.4s), then start the grand reveal
  await new Promise(r => setTimeout(r, 1500));

  if (!reducedMotion.matches && assetReady.covered && assetReady.billow) {
    await grandReveal();
  }

  // Report asset errors
  if (!assetReady.revealed) {
    notify('The main image could not load. Please reload the page.');
  } else if (results.some(r => r.status === 'rejected')) {
    notify('Some studio images could not load. The available scenes are ready.');
  }
}

// Grand reveal: automatically sweeps the slider from covered → uncovered
// like a slow cinematic drag, then transitions to the 3rd image (chapter 2)
// and stays there until reload or replay.
async function grandReveal() {
  $('#replay').disabled = true;
  // State is already set to chapter 1 + progress=0 (covered) from prepareImages.
  // Just confirm we're at the covered position, then sweep.
  target = progress = 0;
  paint();

  // Brief beat so the covered car is visible before the sweep begins
  await new Promise(r => setTimeout(r, 400));

  // Slow, elegant sweep: 0 → 1 over 4.5s
  animateProgress(1, 4500, () => {
    // After the reveal completes, linger for a moment then transition to the 3rd image
    setTimeout(() => {
      setChapter(2);
      $('#replay').disabled = false;
    }, 900);
  });
}

paint();
prepareImages();

import "./service.js";

