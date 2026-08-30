// src/utils/audio.ts

let audioCtx: AudioContext | null = null;
let geigerTimer: number | null = null;
let currentProgress = 0;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playGeigerClick = () => {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.01; // 10ms click
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000;
  
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime); // subtle volume
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.01);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  
  noise.start();
};

const geigerLoop = () => {
  if (currentProgress >= 100 || currentProgress <= 0) {
    if (geigerTimer) window.clearTimeout(geigerTimer);
    return;
  }
  
  playGeigerClick();
  
  // Speed up as progress increases
  const maxInterval = 800; // ms between clicks at 0%
  const minInterval = 40;  // ms between clicks at ~99%
  
  // Exponential curve for intensity
  const normalizedProgress = currentProgress / 100;
  const interval = maxInterval * Math.pow(minInterval / maxInterval, normalizedProgress);
  
  // Add randomness to make it sound like a real geiger counter
  const randomJitter = (Math.random() * 0.4 - 0.2) * interval;
  const nextTick = Math.max(20, interval + randomJitter);
  
  geigerTimer = window.setTimeout(geigerLoop, nextTick);
};

export const updateGeigerProgress = (progress: number) => {
  const wasIdle = currentProgress === 0;
  currentProgress = progress;
  
  // If we just started tracking progress, kick off the loop
  if (wasIdle && progress > 0 && progress < 100) {
     geigerLoop();
  }
};

export const stopGeiger = () => {
  currentProgress = 0;
  if (geigerTimer) {
    window.clearTimeout(geigerTimer);
    geigerTimer = null;
  }
};

export const playStaticDischarge = () => {
  if (!audioCtx) return;
  const duration = 0.8;
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(400, audioCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(8000, audioCtx.currentTime + 0.1);
  filter.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + duration);
  
  // Add distortion
  const waveShaper = audioCtx.createWaveShaper();
  const curve = new Float32Array(400);
  for (let i = 0; i < 400; ++i) {
    const x = i * 2 / 400 - 1;
    curve[i] = (3 + 20) * x * 20 * (Math.PI / 180) / (Math.PI + 20 * Math.abs(x));
  }
  waveShaper.curve = curve;
  waveShaper.oversample = '4x';
  
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 0.05); // sharp attack
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration); // decay
  
  noise.connect(filter);
  filter.connect(waveShaper);
  waveShaper.connect(gain);
  gain.connect(audioCtx.destination);
  
  noise.start();
};
