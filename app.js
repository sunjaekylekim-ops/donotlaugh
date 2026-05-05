// ══════════════════════════════════════════════
//  DON'T LAUGH CHALLENGE — app.js
// ══════════════════════════════════════════════

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

// ── State ──
const state = {
  modelsLoaded: false,
  cameraReady: false,
  isRunning: false,
  currentMemeIndex: 0,
  laughThreshold: 0.70,
  challengeDuration: 10 * 60 * 1000, // 10 minutes to WIN
  challengeTimer: null,
  challengeStart: null,
  failed: 0,
  bestTime: 0,
  peakLaugh: 0,
  roundActive: false,
  fpsCounter: { frames: 0, last: Date.now() },
  userImages: [],
  redditMemes: [],
  memeRotateTimer: null,
};

// ── Fallback text memes (much funnier) ──
const FALLBACK_MEMES = [
  {
    label: '💀', bg: '#0a0010', color: '#ff44ff',
    content: ['me: i should go to sleep', 'my brain at 3am:', '"remember when you tripped', 'in front of everyone', 'in 7th grade?"'],
  },
  {
    label: '😭', bg: '#001500', color: '#44ff44',
    content: ['interviewer: whats ur', 'greatest weakness', 'me: im too honest', 'interviewer: i dont think', "thats a weakness", 'me: i dont care what', 'you think'],
  },
  {
    label: '🔥', bg: '#150500', color: '#ff8844',
    content: ['"how are you?"', '', 'me: im fine', '', '*internal screaming*', '*crying in 4 languages*', '*currently on fire*'],
  },
  {
    label: '😤', bg: '#000015', color: '#4488ff',
    content: ['doctor: you have 5 minutes', 'me: to live??', 'doctor: to decide', 'me: oh thank god', 'doctor: you owe $47,000'],
  },
  {
    label: '🥲', bg: '#150010', color: '#ff88cc',
    content: ['me: finally fixing', 'my sleep schedule', 'youtube at 2am:', '"ranking every cheese', 'by how betrayed they feel"'],
  },
  {
    label: '😱', bg: '#0f0f00', color: '#ffee00',
    content: ['boss: why are you late', 'me: traffic', 'boss: you work from home', 'me:', 'me: emotional traffic'],
  },
  {
    label: '🤡', bg: '#150000', color: '#ff3333',
    content: ['anxiety: what if—', 'me: no', 'anxiety: but—', 'me: NO', 'anxiety: ok but what if', 'everything goes wrong', 'forever though'],
  },
  {
    label: '😶', bg: '#001510', color: '#33ffaa',
    content: ['my dog: *exists*', 'me: oh my GOD', 'you are SO good', 'you are the BEST boy', 'my coworker: good morning', 'me: hey'],
  },
  {
    label: '🫠', bg: '#100015', color: '#aa44ff',
    content: ['5yo me breaking', 'something:', '"nobody saw that"', '', '25yo me breaking', 'something:', '"nobody saw that"'],
  },
  {
    label: '💸', bg: '#051500', color: '#88ff44',
    content: ['bank account: $4.27', 'doordash: free delivery', 'on orders over $15!', 'me: *orders $47 of food*', 'me: i am saving money'],
  },
  {
    label: '🧠', bg: '#050015', color: '#88aaff',
    content: ['my brain during a test:', 'blank', '', 'my brain at 3am:', '"the square root of', 'every embarrassing thing', 'you did since 2006"'],
  },
  {
    label: '😔', bg: '#100005', color: '#ffaa33',
    content: ['friend: you ok?', 'me: im fine lol', '', 'also me internally:', '*titanic sinking music*', '*404 error*', '*windows shutdown sound*'],
  },
];

const EXPRESSIONS = ['happy', 'surprised', 'neutral', 'sad', 'angry', 'fearful', 'disgusted'];

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════

async function init() {
  setStatus('loading', 'Loading AI face detection models...');
  renderExprBars();
  await loadRedditMemes();
  showCurrentMeme();

  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    setStatus('ready', 'Models loaded — Click Start Challenge!');
    log('✓ Models loaded. <span>10 minutes. No laughing. Good luck.</span>');
    document.getElementById('btn-start').disabled = false;
    state.modelsLoaded = true;
  } catch (err) {
    setStatus('error', 'Failed to load models — check internet connection');
    log(`Error: ${err.message}`);
  }
}

// ══════════════════════════════════════════════
//  REDDIT MEME LOADER
// ══════════════════════════════════════════════

async function loadRedditMemes() {
  const subs = ['memes', 'dankmemes', 'funny', 'me_irl', 'AdviceAnimals'];
  const sub = subs[Math.floor(Math.random() * subs.length)];
  try {
    log(`Loading memes from r/${sub}...`);
    const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=50`, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();
    const posts = data.data.children
      .map(p => p.data)
      .filter(p =>
        !p.is_video && !p.stickied && p.url &&
        /\.(jpg|jpeg|png|gif|webp)$/i.test(p.url) &&
        p.score > 500
      )
      .map(p => ({ url: p.url, title: p.title, score: p.score, sub: p.subreddit_name_prefixed }));

    if (posts.length > 0) {
      state.redditMemes = posts;
      log(`✓ Loaded <span>${posts.length} memes</span> from r/${sub}`);
    } else {
      log('Using built-in memes (Reddit CORS blocked)');
    }
  } catch (e) {
    log('Using built-in memes');
  }
  renderSampleThumbs();
}

// ══════════════════════════════════════════════
//  MEME DISPLAY
// ══════════════════════════════════════════════

function getAllMemes() {
  return [...state.redditMemes, ...FALLBACK_MEMES];
}

function showCurrentMeme() {
  const all = getAllMemes();
  if (all.length === 0) return;
  const meme = all[state.currentMemeIndex % all.length];
  if (meme.url) {
    showImageMeme(meme.url, meme.title);
  } else {
    renderTextMeme(meme);
  }
  updateMemeInfo(meme);
}

function showImageMeme(url, title) {
  const img = document.getElementById('meme-img');
  const placeholder = document.getElementById('meme-placeholder');
  img.style.display = 'none';
  placeholder.style.display = 'none';
  const testImg = new Image();
  testImg.crossOrigin = 'anonymous';
  testImg.onload = () => { img.src = url; img.style.display = 'block'; };
  testImg.onerror = () => { state.currentMemeIndex++; showCurrentMeme(); };
  testImg.src = url;
}

function renderTextMeme(meme) {
  const img = document.getElementById('meme-img');
  document.getElementById('meme-placeholder').style.display = 'none';
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 420;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = meme.bg || '#111';
  ctx.fillRect(0, 0, 640, 420);
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.015})`;
    ctx.fillRect(Math.random() * 640, Math.random() * 420, 1, 1);
  }
  ctx.strokeStyle = meme.color || '#fff';
  ctx.globalAlpha = 0.15; ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, 624, 404);
  ctx.globalAlpha = 1;

  ctx.fillStyle = meme.color || '#ffdd00';
  ctx.textAlign = 'center';
  const lines = meme.content;
  const lineH = lines.length > 5 ? 42 : lines.length > 3 ? 50 : 60;
  const startY = (420 - lines.length * lineH) / 2 + lineH * 0.75;
  lines.forEach((line, i) => {
    if (!line) return;
    const fs = line.length > 35 ? 18 : line.length > 25 ? 22 : line.length > 15 ? 28 : 34;
    ctx.font = `900 ${fs}px 'Space Mono', monospace`;
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 10;
    ctx.fillText(line, 320, startY + i * lineH);
  });
  ctx.shadowBlur = 0;
  img.src = canvas.toDataURL('image/png');
  img.style.display = 'block';
}

function updateMemeInfo(meme) {
  const info = document.getElementById('meme-info');
  if (!info) return;
  info.textContent = meme.sub
    ? `${meme.sub} · ↑${meme.score?.toLocaleString() || ''}`
    : 'built-in meme';
}

function nextMeme() {
  state.currentMemeIndex = (state.currentMemeIndex + 1) % Math.max(getAllMemes().length, 1);
  showCurrentMeme();
  renderSampleThumbs();
}

function renderSampleThumbs() {
  const grid = document.getElementById('samples-grid');
  if (!grid) return;
  grid.innerHTML = '';
  getAllMemes().slice(0, 12).forEach((meme, i) => {
    const el = document.createElement('div');
    el.className = 'sample-thumb' + (i === state.currentMemeIndex % 12 ? ' active' : '');
    if (meme.url) {
      el.style.cssText = `background:url(${meme.url}) center/cover; font-size:0`;
    } else {
      el.textContent = meme.label || '😂';
    }
    el.onclick = () => {
      state.currentMemeIndex = i;
      showCurrentMeme();
      document.querySelectorAll('.sample-thumb').forEach((t, j) => t.classList.toggle('active', j === i));
    };
    grid.appendChild(el);
  });
}

function loadUserImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    state.redditMemes.unshift({ url: e.target.result, title: file.name, score: 9999 });
    state.currentMemeIndex = 0;
    showCurrentMeme();
    renderSampleThumbs();
    log(`Loaded: <span>${file.name}</span>`);
  };
  reader.readAsDataURL(file);
}

// ══════════════════════════════════════════════
//  CAMERA
// ══════════════════════════════════════════════

async function startCamera() {
  const video = document.getElementById('webcam');
  const placeholder = document.getElementById('cam-placeholder');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: 'user' }
    });
    video.srcObject = stream;
    await new Promise(resolve => video.onloadedmetadata = resolve);
    video.play();
    const canvas = document.getElementById('overlay-canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    placeholder.style.display = 'none';
    state.cameraReady = true;
    return true;
  } catch (err) {
    setStatus('error', 'Camera access denied');
    log(`Camera error: <span>${err.message}</span>`);
    return false;
  }
}

// ══════════════════════════════════════════════
//  DETECTION LOOP
// ══════════════════════════════════════════════

async function detectionLoop() {
  const video = document.getElementById('webcam');
  const canvas = document.getElementById('overlay-canvas');
  const ctx = canvas.getContext('2d');
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });

  while (state.isRunning) {
    try {
      const detections = await faceapi.detectAllFaces(video, options).withFaceExpressions();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      state.fpsCounter.frames++;
      const now = Date.now();
      if (now - state.fpsCounter.last > 1000) {
        document.getElementById('fps-tag').textContent = `${state.fpsCounter.frames} FPS`;
        state.fpsCounter.frames = 0;
        state.fpsCounter.last = now;
      }

      if (detections.length > 0) {
        const det = detections[0];
        const expr = det.expressions;
        const box = det.detection.box;
        const scaleX = canvas.width / video.videoWidth;
        const scaleY = canvas.height / video.videoHeight;
        const flippedX = canvas.width - (box.x + box.width) * scaleX;
        const w = box.width * scaleX;
        const y = box.y * scaleY;
        const h = box.height * scaleY;
        const happyScore = expr.happy || 0;
        const boxColor = happyScore > state.laughThreshold ? '#ff3c3c' :
                         happyScore > 0.4 ? '#ffdd00' : '#00ff88';
        ctx.strokeStyle = boxColor; ctx.lineWidth = 2;
        ctx.strokeRect(flippedX, y, w, h);
        ctx.fillStyle = boxColor;
        ctx.font = '600 10px Space Mono, monospace';
        ctx.fillText(`😊 ${Math.round(happyScore * 100)}%`, flippedX, y > 14 ? y - 4 : y + h + 12);
        updateLaughMeter(happyScore);
        updateExprBars(expr);
        if (state.roundActive && happyScore > state.laughThreshold) triggerLaugh();
      } else {
        updateLaughMeter(0);
        updateExprBars(null);
        ctx.fillStyle = 'rgba(255,220,0,0.6)';
        ctx.font = '10px Space Mono';
        ctx.fillText('No face detected', 8, 16);
      }
    } catch (e) { /* skip frame */ }
    await sleep(80);
  }
}

// ══════════════════════════════════════════════
//  CHALLENGE LOGIC — SURVIVE 10 MINUTES
// ══════════════════════════════════════════════

async function startChallenge() {
  if (!state.modelsLoaded) return;

  if (!state.cameraReady) {
    log('Requesting camera access...');
    const ok = await startCamera();
    if (!ok) return;
    state.isRunning = true;
    detectionLoop();
  }

  state.roundActive = false;
  state.peakLaugh = 0;
  hideLaughOverlay();
  await countdown(3);

  state.roundActive = true;
  state.challengeStart = Date.now();
  log(`Challenge started — <span>survive 10 minutes without laughing!</span>`);

  // Rotate meme every 20s
  state.memeRotateTimer = setInterval(() => {
    if (state.roundActive) nextMeme();
  }, 20000);

  // Live timer tick
  const timerInterval = setInterval(() => {
    if (!state.roundActive) { clearInterval(timerInterval); return; }
    const elapsed = Date.now() - state.challengeStart;
    const remaining = Math.max(0, state.challengeDuration - elapsed);
    updateLiveTimer(remaining);
    updateTimerBar(remaining);
  }, 500);

  // WIN after 10 minutes
  state.challengeTimer = setTimeout(() => {
    if (state.roundActive) winChallenge();
  }, state.challengeDuration);

  document.getElementById('btn-start').textContent = '⏳ Running...';
  document.getElementById('btn-start').disabled = true;
}

function triggerLaugh() {
  if (!state.roundActive) return;
  state.roundActive = false;
  clearTimeout(state.challengeTimer);
  clearInterval(state.memeRotateTimer);

  document.getElementById('laugh-overlay').style.display = 'flex';
  state.failed++;

  const held = Date.now() - state.challengeStart;
  if (held > state.bestTime) state.bestTime = held;
  updateScores();

  const heldSec = (held / 1000).toFixed(1);
  log(`FAILED! You laughed after <span>${heldSec}s</span> 😂`);
  document.getElementById('btn-start').textContent = '▶ Try Again';
  document.getElementById('btn-start').disabled = false;

  setTimeout(() => { hideLaughOverlay(); showResult(false, held); }, 1500);
}

function winChallenge() {
  state.roundActive = false;
  clearInterval(state.memeRotateTimer);
  state.bestTime = state.challengeDuration;
  updateScores();
  log(`🏆 LEGENDARY! 10 minutes survived!`);
  document.getElementById('btn-start').textContent = '▶ Start Challenge';
  document.getElementById('btn-start').disabled = false;
  showResult(true, state.challengeDuration);
}

async function countdown(n) {
  const el = document.getElementById('countdown-display');
  el.style.display = 'block';
  for (let i = n; i > 0; i--) { el.textContent = i; await sleep(800); }
  el.textContent = 'GO!';
  await sleep(400);
  el.style.display = 'none';
}

function updateTimerBar(remaining) {
  const bar = document.getElementById('timer-bar');
  const pct = (remaining / state.challengeDuration) * 100;
  bar.style.transition = 'width 0.5s linear';
  bar.style.width = `${pct}%`;
  const g = Math.round(200 * (pct / 100));
  const r = Math.round(255 * (1 - pct / 100)) + 50;
  bar.style.background = `rgb(${r}, ${g}, 50)`;
}

function updateLiveTimer(remainingMs) {
  const el = document.getElementById('live-timer');
  if (!el) return;
  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);
  el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function showResult(win, timeHeld) {
  const screen = document.getElementById('result-screen');
  screen.className = win ? 'win' : 'lose';
  screen.style.display = 'flex';
  document.getElementById('result-emoji').textContent = win ? '🏆' : '😂';
  document.getElementById('result-title').textContent = win ? '10 MIN SURVIVED!' : 'YOU LAUGHED!';
  const heldSec = (timeHeld / 1000).toFixed(1);
  const bestSec = (state.bestTime / 1000).toFixed(1);
  document.getElementById('result-sub').textContent = win
    ? 'Absolute legend. Stone cold face. 😐'
    : `You held it for ${heldSec}s — keep trying!`;
  document.getElementById('r-time').textContent = `${heldSec}s`;
  document.getElementById('r-peak').textContent = `${Math.round(state.peakLaugh * 100)}%`;
  const bestEl = document.getElementById('r-best');
  if (bestEl) bestEl.textContent = `${bestSec}s`;
}

function closeResult() {
  document.getElementById('result-screen').style.display = 'none';
  nextMeme();
  startChallenge();
}

// ══════════════════════════════════════════════
//  UI HELPERS
// ══════════════════════════════════════════════

function updateLaughMeter(score) {
  if (score > state.peakLaugh) state.peakLaugh = score;
  const pct = Math.round(score * 100);
  document.getElementById('laugh-pct').textContent = `${pct}%`;
  document.getElementById('laugh-fill').style.width = `${pct}%`;
}

function renderExprBars() {
  const container = document.getElementById('expr-bars');
  if (!container) return;
  container.innerHTML = '';
  EXPRESSIONS.forEach(expr => {
    const row = document.createElement('div');
    row.className = 'expr-row';
    row.innerHTML = `
      <span class="expr-name">${expr}</span>
      <div class="expr-bar-track"><div class="expr-bar ${expr}" id="bar-${expr}" style="width:0%"></div></div>
      <span class="expr-val" id="val-${expr}">0%</span>
    `;
    container.appendChild(row);
  });
}

function updateExprBars(expressions) {
  EXPRESSIONS.forEach(expr => {
    const val = expressions ? Math.round((expressions[expr] || 0) * 100) : 0;
    const bar = document.getElementById(`bar-${expr}`);
    const label = document.getElementById(`val-${expr}`);
    if (bar) bar.style.width = `${val}%`;
    if (label) label.textContent = `${val}%`;
  });
}

function updateScores() {
  document.getElementById('sc-failed').textContent = state.failed;
  const bestEl = document.getElementById('sc-best');
  if (bestEl) bestEl.textContent = `${(state.bestTime / 1000).toFixed(0)}s`;
}

function hideLaughOverlay() {
  document.getElementById('laugh-overlay').style.display = 'none';
}

function setStatus(type, msg) {
  document.getElementById('status-dot').className = type;
  document.getElementById('status-text').textContent = msg;
}

function log(msg) {
  document.getElementById('event-log').innerHTML = `› ${msg}`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

window.addEventListener('load', init);
