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
  laughThreshold: 0.70,        // 0–1: above this = FAIL
  challengeDuration: 10000,    // ms per round
  challengeTimer: null,
  challengeStart: null,
  survived: 0,
  failed: 0,
  streak: 0,
  bestStreak: 0,
  peakLaugh: 0,
  roundActive: false,
  fpsCounter: { frames: 0, last: Date.now() },
  detectionLoop: null,
  userImages: [],
};

// ── Sample memes (using public domain / placeholder images) ──
// These are funny meme-style images from picsum or emoji-heavy text memes
const SAMPLE_MEMES = [
  {
    label: '😂',
    url: null,
    text: true,
    content: [
      'WHEN YOU TRY TO OPEN',
      'A BAG OF CHIPS QUIETLY',
      'AT 2AM',
      '💥🎺🎸🥁🎻🎷💥',
    ],
    bg: '#1a1a00',
    color: '#ffdd00',
  },
  {
    label: '😤',
    url: null,
    text: true,
    content: [
      '"JUST 5 MORE MINUTES"',
      '',
      '— Me, 47 minutes ago',
    ],
    bg: '#0a001a',
    color: '#cc88ff',
  },
  {
    label: '🐶',
    url: null,
    text: true,
    content: [
      'This is fine.',
      '🔥🐶☕🔥',
      '(Everything is on fire)',
    ],
    bg: '#1a0800',
    color: '#ff8844',
  },
  {
    label: '🥲',
    url: null,
    text: true,
    content: [
      'Brain at 3am:',
      '"Remember that embarrassing',
      'thing you did in 2009?"',
      '',
      'Me: PLEASE.',
    ],
    bg: '#001a0a',
    color: '#44ff88',
  },
  {
    label: '💀',
    url: null,
    text: true,
    content: [
      'Me: I should sleep',
      '',
      'My brain: What if we',
      'watched one more video',
      'about medieval siege weapons?',
    ],
    bg: '#001020',
    color: '#88ddff',
  },
  {
    label: '😅',
    url: null,
    text: true,
    content: [
      'DIET DAY 1:',
      'I am strong. I am powerful.',
      '',
      'DIET DAY 2:',
      '🍕🍔🌮🍜🍩🍪🎂',
    ],
    bg: '#1a0010',
    color: '#ff44aa',
  },
];

// ── Expressions to track ──
const EXPRESSIONS = ['happy', 'surprised', 'neutral', 'sad', 'angry', 'fearful', 'disgusted'];

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════

async function init() {
  setStatus('loading', 'Loading AI face detection models...');
  renderSampleMemes();
  renderExprBars();
  renderTextMeme(SAMPLE_MEMES[0]);

  try {
    // Load models from CDN
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

    setStatus('ready', 'Models loaded — Click Start Challenge!');
    log('✓ face-api.js models loaded. <span>Camera permission needed.</span>');
    document.getElementById('btn-start').disabled = false;
    state.modelsLoaded = true;
  } catch (err) {
    setStatus('error', 'Failed to load models — check internet connection');
    log(`Error: ${err.message}`);
    console.error(err);
  }
}

// ══════════════════════════════════════════════
//  SAMPLE MEMES RENDER
// ══════════════════════════════════════════════

function renderSampleMemes() {
  const grid = document.getElementById('samples-grid');
  grid.innerHTML = '';
  SAMPLE_MEMES.forEach((meme, i) => {
    const el = document.createElement('div');
    el.className = 'sample-thumb' + (i === 0 ? ' active' : '');
    el.textContent = meme.label;
    el.title = Array.isArray(meme.content) ? meme.content[0] : '';
    el.onclick = () => {
      document.querySelectorAll('.sample-thumb').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      state.currentMemeIndex = i;
      renderTextMeme(SAMPLE_MEMES[i]);
    };
    grid.appendChild(el);
  });

  // Add user image slots
  state.userImages.forEach((src, i) => {
    const el = document.createElement('div');
    el.className = 'sample-thumb';
    el.style.backgroundImage = `url(${src})`;
    el.style.backgroundSize = 'cover';
    el.textContent = '';
    el.onclick = () => {
      document.querySelectorAll('.sample-thumb').forEach(t => t.classList.remove('active'));
      el.classList.add('active');
      loadImageMeme(src);
    };
    grid.appendChild(el);
  });
}

function renderTextMeme(meme) {
  const img = document.getElementById('meme-img');
  const placeholder = document.getElementById('meme-placeholder');
  img.style.display = 'none';

  // Create canvas-based text meme
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = meme.bg || '#1a1a1a';
  ctx.fillRect(0, 0, 600, 400);

  // Noise texture effect
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.02})`;
    ctx.fillRect(Math.random() * 600, Math.random() * 400, 1, 1);
  }

  ctx.fillStyle = meme.color || '#ffdd00';
  ctx.textAlign = 'center';

  const lines = meme.content;
  const lineH = lines.length > 3 ? 48 : 56;
  const totalH = lines.length * lineH;
  const startY = (400 - totalH) / 2 + lineH * 0.8;

  lines.forEach((line, i) => {
    if (!line) return;
    // Adaptive font size
    const fontSize = line.length > 30 ? 22 : line.length > 20 ? 26 : 32;
    ctx.font = `900 ${fontSize}px 'Space Mono', monospace`;
    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText(line, 300, startY + i * lineH);
  });

  ctx.shadowBlur = 0;

  // Convert to image
  const dataUrl = canvas.toDataURL('image/png');
  img.src = dataUrl;
  img.style.display = 'block';
  placeholder.style.display = 'none';
}

function loadImageMeme(src) {
  const img = document.getElementById('meme-img');
  const placeholder = document.getElementById('meme-placeholder');
  img.src = src;
  img.style.display = 'block';
  placeholder.style.display = 'none';
}

function nextMeme() {
  state.currentMemeIndex = (state.currentMemeIndex + 1) % SAMPLE_MEMES.length;
  renderTextMeme(SAMPLE_MEMES[state.currentMemeIndex]);
  document.querySelectorAll('.sample-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === state.currentMemeIndex);
  });
}

function loadUserImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    state.userImages.push(e.target.result);
    loadImageMeme(e.target.result);
    renderSampleMemes();
    log(`Loaded user image: <span>${file.name}</span>`);
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
      const detections = await faceapi
        .detectAllFaces(video, options)
        .withFaceExpressions();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // FPS
      state.fpsCounter.frames++;
      const now = Date.now();
      if (now - state.fpsCounter.last > 1000) {
        document.getElementById('fps-tag').textContent =
          `${state.fpsCounter.frames} FPS`;
        state.fpsCounter.frames = 0;
        state.fpsCounter.last = now;
      }

      if (detections.length > 0) {
        const det = detections[0];
        const expr = det.expressions;

        // Draw face box
        const box = det.detection.box;
        const scaleX = canvas.width / video.videoWidth;
        const scaleY = canvas.height / video.videoHeight;

        // Flip for mirror
        const flippedX = canvas.width - (box.x + box.width) * scaleX;
        const w = box.width * scaleX;
        const y = box.y * scaleY;
        const h = box.height * scaleY;

        const happyScore = expr.happy || 0;
        const boxColor = happyScore > state.laughThreshold ? '#ff3c3c' :
                         happyScore > 0.4 ? '#ffdd00' : '#00ff88';

        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(flippedX, y, w, h);

        // Label
        ctx.fillStyle = boxColor;
        ctx.font = '600 10px Space Mono, monospace';
        ctx.fillText(
          `😊 ${Math.round(happyScore * 100)}%`,
          flippedX, y > 14 ? y - 4 : y + h + 12
        );

        // Update meter
        updateLaughMeter(happyScore);
        updateExprBars(expr);

        if (state.roundActive && happyScore > state.laughThreshold) {
          triggerLaugh();
        }
      } else {
        updateLaughMeter(0);
        updateExprBars(null);
        ctx.fillStyle = 'rgba(255,220,0,0.6)';
        ctx.font = '10px Space Mono';
        ctx.fillText('No face detected', 8, 16);
      }

    } catch (e) {
      // skip frame
    }

    await sleep(80); // ~12fps detection
  }
}

// ══════════════════════════════════════════════
//  CHALLENGE LOGIC
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

  // Countdown
  await countdown(3);

  // Start round
  state.roundActive = true;
  state.challengeStart = Date.now();
  document.getElementById('round-tag').textContent =
    `Round ${state.survived + state.failed + 1}`;
  log(`Round started — <span>hold that face for ${state.challengeDuration / 1000}s!</span>`);

  // Timer bar animation
  animateTimerBar(state.challengeDuration);

  // Auto-end timer
  state.challengeTimer = setTimeout(() => {
    if (state.roundActive) survivedRound();
  }, state.challengeDuration);
}

function triggerLaugh() {
  if (!state.roundActive) return;
  state.roundActive = false;
  clearTimeout(state.challengeTimer);

  document.getElementById('laugh-overlay').style.display = 'flex';
  state.failed++;
  state.streak = 0;
  updateScores();

  const held = ((Date.now() - state.challengeStart) / 1000).toFixed(1);
  log(`FAILED! You laughed after <span>${held}s</span> 😂`);

  setTimeout(() => {
    hideLaughOverlay();
    showResult(false, held);
  }, 1500);
}

function survivedRound() {
  state.roundActive = false;
  state.survived++;
  state.streak++;
  if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  updateScores();

  const held = (state.challengeDuration / 1000).toFixed(0);
  log(`SURVIVED! <span>Streak: ${state.streak} 🔥</span>`);
  showResult(true, held);
}

async function countdown(n) {
  const el = document.getElementById('countdown-display');
  el.style.display = 'block';
  for (let i = n; i > 0; i--) {
    el.textContent = i;
    await sleep(800);
  }
  el.textContent = 'GO!';
  await sleep(400);
  el.style.display = 'none';
}

function animateTimerBar(duration) {
  const bar = document.getElementById('timer-bar');
  bar.style.transition = 'none';
  bar.style.width = '100%';
  setTimeout(() => {
    bar.style.transition = `width ${duration}ms linear`;
    bar.style.width = '0%';
  }, 50);
}

function showResult(win, timeHeld) {
  const screen = document.getElementById('result-screen');
  screen.className = win ? 'win' : 'lose';
  screen.style.display = 'flex';

  document.getElementById('result-emoji').textContent = win ? '😐' : '😂';
  document.getElementById('result-title').textContent = win ? 'YOU SURVIVED!' : 'YOU LAUGHED!';
  document.getElementById('result-sub').textContent = win
    ? `Streak: ${state.streak} 🔥 — Keep it up!`
    : `So close! You held it for ${timeHeld}s`;

  document.getElementById('r-time').textContent = `${timeHeld}s`;
  document.getElementById('r-peak').textContent = `${Math.round(state.peakLaugh * 100)}%`;
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
  container.innerHTML = '';
  EXPRESSIONS.forEach(expr => {
    const row = document.createElement('div');
    row.className = 'expr-row';
    row.innerHTML = `
      <span class="expr-name">${expr}</span>
      <div class="expr-bar-track">
        <div class="expr-bar ${expr}" id="bar-${expr}" style="width:0%"></div>
      </div>
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
  document.getElementById('sc-survived').textContent = state.survived;
  document.getElementById('sc-failed').textContent = state.failed;
  document.getElementById('sc-streak').textContent = state.streak;
  document.getElementById('sc-best').textContent = state.bestStreak;
}

function hideLaughOverlay() {
  document.getElementById('laugh-overlay').style.display = 'none';
}

function setStatus(type, msg) {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  dot.className = type;
  text.textContent = msg;
}

function log(msg) {
  document.getElementById('event-log').innerHTML = `› ${msg}`;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ══════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════

window.addEventListener('load', init);
