// ══════════════════════════════════════════════
//  DON'T LAUGH CHALLENGE — app.js
// ══════════════════════════════════════════════

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
const GIPHY_KEY = 'i3CFDiIRjUjTABkJ3O44yx3sEHD8iD4o';

// ── 로케일 감지 ──
const userLang = navigator.language || 'en-US';
const isKorean = userLang.startsWith('ko');
const locale = isKorean ? 'ko' : 'en';

// ── 로케일별 검색어 ──
const MEME_QUERIES = isKorean
  ? ['웃긴', '개웃김', '빵터짐', 'ㅋㅋㅋ', '레전드 웃긴', '코미디', '웃참']
  : ['meme funny', 'dank meme', 'try not to laugh', 'funny fail', 'comedy', 'lol meme'];

// ── 한국어 텍스트 밈 ──
const KO_TEXT_MEMES = [
  { label: '😭', bg: '#0a0015', color: '#ff44ff',
    content: ['카톡 읽씹 당했을 때', '', '나: 괜찮아 바쁜가보지 뭐', '내 뇌: 너 뭔가 잘못한 거 있지?', '너 걔한테 3년 전에 뭐라했지?'] },
  { label: '💀', bg: '#001500', color: '#44ff44',
    content: ['엄마: 밥 먹었어?', 'me: 응', '', '실제로 먹은 것:', '물 한 모금', '과자 두 개', '후회'] },
  { label: '🔥', bg: '#150500', color: '#ff8844',
    content: ['시험 전날 나:', '"이번엔 진짜 공부한다"', '', '시험 전날 밤 12시:', '*유튜브 알고리즘에 납치됨*', '"조선시대 왕들 MBTI 분석"'] },
  { label: '😤', bg: '#000015', color: '#88aaff',
    content: ['치킨 시킬 때:', '"혼자 먹기엔 많은데"', '', '30분 후:', '뼈만 남음', '후회 없음'] },
  { label: '🥲', bg: '#150010', color: '#ff88cc',
    content: ['취준생 일상:', '월 - 자소서', '화 - 자소서', '수 - 멘탈 붕괴', '목 - 자소서', '금 - 유튜브로 현실도피'] },
  { label: '😱', bg: '#0f0f00', color: '#ffee00',
    content: ['단톡방에서', '실수로 잘못 보냈을 때', '', '"어 잘못 보냄 ㅎ"', '', '실제 심리상태:', '*지구 탈출 희망*'] },
  { label: '🤡', bg: '#150000', color: '#ff3333',
    content: ['다이어트 Day 1:', '"탄수화물 끊는다"', '', 'Day 1 저녁 6시:', '치킨+피자 콤보', '"내일부터 진짜로"'] },
  { label: '😶', bg: '#001510', color: '#33ffaa',
    content: ['알바 중 진상 손님:', '"여기 사장 불러봐요"', '', '나: (사장 부름)', '', '사장: "죄송합니다"', '나: (속으로 욕 100번)'] },
  { label: '🫠', bg: '#100015', color: '#aa44ff',
    content: ['카페에서 노트북 펴고', '"오늘 다 끝낸다"', '', '3시간 후:', '유튜브 보다가', '커피만 4잔 마심', '노트북은 장식품'] },
  { label: '💸', bg: '#051500', color: '#88ff44',
    content: ['월급날:', '"이번 달엔 저축한다"', '', '월급날+3일:', '잔액: 3,200원', '"어디 갔지...?"'] },
  { label: '🧠', bg: '#050015', color: '#88aaff',
    content: ['자려고 누웠을 때', '뇌가 재생하는 것:', '', '초등학교 때 발표 실수', '중학교 때 넘어진 것', '고등학교 때 고백 거절', '대학교 때 술자리 흑역사'] },
  { label: '😔', bg: '#100005', color: '#ffaa33',
    content: ['친구한테 고민 털어놓기:', '"나 요즘 좀 힘들어"', '', '친구: "나도ㅋㅋ 그나저나"', '친구: (자기 얘기 30분)'] },
];

// ── 영어 텍스트 밈 ──
const EN_TEXT_MEMES = [
  { label: '💀', bg: '#0a0010', color: '#ff44ff',
    content: ['me: i should sleep', 'my brain at 3am:', '"remember when you tripped', 'in front of everyone', 'in 7th grade?"'] },
  { label: '😭', bg: '#001500', color: '#44ff44',
    content: ['interviewer: greatest weakness?', 'me: im too honest', 'interviewer: i dont think', "that's a weakness", 'me: i dont care what you think'] },
  { label: '🔥', bg: '#150500', color: '#ff8844',
    content: ['"how are you?"', '', 'me: im fine', '', '*internal screaming*', '*crying in 4 languages*', '*currently on fire*'] },
  { label: '😤', bg: '#000015', color: '#4488ff',
    content: ['doctor: you have 5 minutes', 'me: to live??', 'doctor: to decide', 'me: oh thank god', 'doctor: you owe $47,000'] },
  { label: '🥲', bg: '#150010', color: '#ff88cc',
    content: ['me: finally fixing', 'my sleep schedule', 'youtube at 2am:', '"ranking every cheese', 'by how betrayed they feel"'] },
  { label: '😱', bg: '#0f0f00', color: '#ffee00',
    content: ['boss: why are you late', 'me: traffic', 'boss: you work from home', 'me:', 'me: emotional traffic'] },
  { label: '🤡', bg: '#150000', color: '#ff3333',
    content: ['anxiety: what if—', 'me: no', 'anxiety: but—', 'me: NO', 'anxiety: what if everything', 'goes wrong forever though'] },
  { label: '😶', bg: '#001510', color: '#33ffaa',
    content: ['my dog: *exists*', 'me: oh my GOD', 'you are SO good', 'you are the BEST boy', 'my coworker: good morning', 'me: hey'] },
];

const FALLBACK_MEMES = isKorean ? KO_TEXT_MEMES : EN_TEXT_MEMES;

// ── 유튜브 영상 (한국/영어) ──
const YT_VIDEOS = isKorean ? [
  'S5HcnAFoNT8', // 개그콘서트 레전드
  '3DFbFBfNNjk', // 웃긴 동물
  'XRyFDhvOFB0', // 빵터지는 영상
  'PKtnafFtfEo', // 한국 웃긴 순간
] : [
  'hY7m5jjJ9mM', // try not to laugh
  'XqZsoesa55w', // funny fails
  'KkYoMFUKH6k', // comedy
  'aEFd4QBEhyc', // meme compilation
];

// ── State ──
const state = {
  modelsLoaded: false,
  cameraReady: false,
  isRunning: false,
  currentMemeIndex: 0,
  laughThreshold: 0.70,
  challengeDuration: 10 * 60 * 1000,
  challengeTimer: null,
  challengeStart: null,
  failed: 0,
  bestTime: 0,
  peakLaugh: 0,
  roundActive: false,
  fpsCounter: { frames: 0, last: Date.now() },
  giphyMemes: [],
  memeRotateTimer: null,
  currentType: 'text', // 'text' | 'gif' | 'video'
};

const EXPRESSIONS = ['happy', 'surprised', 'neutral', 'sad', 'angry', 'fearful', 'disgusted'];

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════

async function init() {
  setStatus('loading', 'Loading AI face detection models...');
  renderExprBars();

  // 로케일 표시
  document.getElementById('locale-tag').textContent = isKorean ? '🇰🇷 한국어 모드' : '🇺🇸 English Mode';

  await loadGiphyMemes();
  showCurrentMeme();

  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    setStatus('ready', isKorean ? '준비 완료 — 시작 버튼을 눌러봐!' : 'Models loaded — Click Start!');
    log(isKorean
      ? '✓ AI 로드 완료. <span>10분 동안 웃지 마세요. 화이팅!</span>'
      : '✓ Models loaded. <span>10 minutes. No laughing. Good luck.</span>');
    document.getElementById('btn-start').disabled = false;
    state.modelsLoaded = true;
  } catch (err) {
    setStatus('error', 'Failed to load models');
    log(`Error: ${err.message}`);
  }
}

// ══════════════════════════════════════════════
//  GIPHY LOADER
// ══════════════════════════════════════════════

async function loadGiphyMemes() {
  const query = MEME_QUERIES[Math.floor(Math.random() * MEME_QUERIES.length)];
  try {
    log(isKorean ? `Giphy에서 "${query}" 로딩 중...` : `Loading "${query}" from Giphy...`);
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=30&rating=pg-13&lang=${locale}`
    );
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      state.giphyMemes = data.data.map(g => ({
        type: 'gif',
        url: g.images.original.url,
        mp4: g.images.original.mp4,
        preview: g.images.fixed_height.url,
        title: g.title,
      }));
      log(isKorean
        ? `✓ Giphy에서 <span>${state.giphyMemes.length}개</span> GIF 로드 완료`
        : `✓ Loaded <span>${state.giphyMemes.length} GIFs</span> from Giphy`);
    }
  } catch (e) {
    log(isKorean ? '기본 밈 사용 중' : 'Using built-in memes');
  }
  renderSampleThumbs();
}

// ══════════════════════════════════════════════
//  MEME DISPLAY
// ══════════════════════════════════════════════

function getAllMemes() {
  // 순서: GIF → 텍스트 → 유튜브 섞기
  const mixed = [];
  const gifs = [...state.giphyMemes];
  const texts = [...FALLBACK_MEMES];
  const maxLen = Math.max(gifs.length, texts.length);
  for (let i = 0; i < maxLen; i++) {
    if (gifs[i]) mixed.push(gifs[i]);
    if (texts[i]) mixed.push({ type: 'text', ...texts[i] });
    // 5개마다 유튜브 영상 삽입
    if (i % 5 === 4) {
      const yt = YT_VIDEOS[Math.floor(i / 5) % YT_VIDEOS.length];
      mixed.push({ type: 'video', videoId: yt });
    }
  }
  return mixed;
}

function showCurrentMeme() {
  const all = getAllMemes();
  if (all.length === 0) return;
  const meme = all[state.currentMemeIndex % all.length];

  // 이전 컨텐츠 숨기기
  document.getElementById('meme-img').style.display = 'none';
  document.getElementById('meme-placeholder').style.display = 'none';
  document.getElementById('meme-video-container').innerHTML = '';

  if (meme.type === 'gif') {
    showGifMeme(meme);
  } else if (meme.type === 'video') {
    showVideoMeme(meme.videoId);
  } else {
    renderTextMeme(meme);
  }
  updateMemeInfo(meme);
}

function showGifMeme(meme) {
  // MP4 자동재생 (GIF보다 훨씬 빠름)
  if (meme.mp4) {
    const container = document.getElementById('meme-video-container');
    container.innerHTML = `
      <video autoplay loop muted playsinline
        style="max-width:100%;max-height:400px;display:block;margin:auto;">
        <source src="${meme.mp4}" type="video/mp4">
      </video>`;
    state.currentType = 'gif';
  } else {
    const img = document.getElementById('meme-img');
    img.src = meme.url;
    img.style.display = 'block';
  }
}

function showVideoMeme(videoId) {
  const container = document.getElementById('meme-video-container');
  container.innerHTML = `
    <iframe
      width="100%" height="380"
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen
      style="display:block;">
    </iframe>`;
  state.currentType = 'video';
}

function renderTextMeme(meme) {
  const img = document.getElementById('meme-img');
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
    const fs = line.length > 35 ? 16 : line.length > 25 ? 20 : line.length > 15 ? 26 : 32;
    ctx.font = `900 ${fs}px 'Space Mono', monospace`;
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 10;
    ctx.fillText(line, 320, startY + i * lineH);
  });
  ctx.shadowBlur = 0;
  img.src = canvas.toDataURL('image/png');
  img.style.display = 'block';
  state.currentType = 'text';
}

function updateMemeInfo(meme) {
  const info = document.getElementById('meme-info');
  if (!info) return;
  if (meme.type === 'gif') info.textContent = `Giphy · ${meme.title || 'GIF'}`;
  else if (meme.type === 'video') info.textContent = `YouTube · ${isKorean ? '자동재생 영상' : 'Auto-play video'}`;
  else info.textContent = isKorean ? '텍스트 밈' : 'Text meme';
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
    if (meme.type === 'gif' && meme.preview) {
      el.style.cssText = `background:url(${meme.preview}) center/cover;font-size:0`;
    } else if (meme.type === 'video') {
      el.style.cssText = `background:url(https://img.youtube.com/vi/${meme.videoId}/default.jpg) center/cover;font-size:0`;
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
    state.giphyMemes.unshift({ type: 'gif', url: e.target.result, mp4: null, preview: e.target.result, title: file.name });
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
//  CHALLENGE LOGIC
// ══════════════════════════════════════════════

async function startChallenge() {
  if (!state.modelsLoaded) return;

  if (!state.cameraReady) {
    log(isKorean ? '카메라 권한 요청 중...' : 'Requesting camera access...');
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
  log(isKorean
    ? `챌린지 시작! <span>10분 동안 웃지 마세요!</span>`
    : `Challenge started — <span>survive 10 minutes!</span>`);

  state.memeRotateTimer = setInterval(() => {
    if (state.roundActive) nextMeme();
  }, 20000);

  const timerInterval = setInterval(() => {
    if (!state.roundActive) { clearInterval(timerInterval); return; }
    const elapsed = Date.now() - state.challengeStart;
    const remaining = Math.max(0, state.challengeDuration - elapsed);
    updateLiveTimer(remaining);
    updateTimerBar(remaining);
  }, 500);

  state.challengeTimer = setTimeout(() => {
    if (state.roundActive) winChallenge();
  }, state.challengeDuration);

  document.getElementById('btn-start').textContent = isKorean ? '⏳ 진행 중...' : '⏳ Running...';
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
  log(isKorean
    ? `실패! <span>${heldSec}초</span> 만에 웃었어요 😂`
    : `FAILED! You laughed after <span>${heldSec}s</span> 😂`);
  document.getElementById('btn-start').textContent = isKorean ? '▶ 다시 시도' : '▶ Try Again';
  document.getElementById('btn-start').disabled = false;

  setTimeout(() => { hideLaughOverlay(); showResult(false, held); }, 1500);
}

function winChallenge() {
  state.roundActive = false;
  clearInterval(state.memeRotateTimer);
  state.bestTime = state.challengeDuration;
  updateScores();
  log(isKorean ? `🏆 전설! 10분 완주!` : `🏆 LEGENDARY! 10 minutes survived!`);
  document.getElementById('btn-start').textContent = isKorean ? '▶ 시작' : '▶ Start Challenge';
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
  document.getElementById('result-title').textContent = win
    ? (isKorean ? '10분 완주!' : '10 MIN SURVIVED!')
    : (isKorean ? '웃었잖아요!' : 'YOU LAUGHED!');
  const heldSec = (timeHeld / 1000).toFixed(1);
  document.getElementById('result-sub').textContent = win
    ? (isKorean ? '진정한 무표정의 달인! 😐' : 'Absolute legend. Stone cold face. 😐')
    : (isKorean ? `${heldSec}초 버텼어요 — 다시 도전!` : `Held it for ${heldSec}s — keep trying!`);
  document.getElementById('r-time').textContent = `${heldSec}s`;
  document.getElementById('r-peak').textContent = `${Math.round(state.peakLaugh * 100)}%`;
  const bestEl = document.getElementById('r-best');
  if (bestEl) bestEl.textContent = `${(state.bestTime / 1000).toFixed(0)}s`;
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
      <span class="expr-val" id="val-${expr}">0%</span>`;
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
