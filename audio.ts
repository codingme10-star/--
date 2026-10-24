// Web Audio API synthesizers for notifications and ambient focus
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play pleasant chime / bell for timer completion
export function playChimeSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic bell frequencies
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.25 / freqs.length, now + idx * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 2.6);
    });
  } catch (err) {
    console.warn('Audio play error:', err);
  }
}

// Gentle tap for tasbeeh counter / button clicks
export function playTapSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (err) {
    // ignore
  }
}

// Ambient sound generator for focus (Rain / White noise)
let ambientSource: AudioNode | null = null;
let ambientGain: GainNode | null = null;

export function startAmbientNoise(type: 'rain' | 'waves' | 'ticking') {
  stopAmbientNoise();
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      if (type === 'rain') {
        // Pink noise approximation
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      } else if (type === 'waves') {
        const white = Math.random() * 2 - 1;
        data[i] = white * 0.5;
      } else {
        // Ticking clicks
        data[i] = i % Math.floor(ctx.sampleRate) < 50 ? (Math.random() * 2 - 1) * 0.8 : 0;
      }
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to make it warm
    const filter = ctx.createBiquadFilter();
    filter.type = type === 'rain' ? 'lowpass' : type === 'waves' ? 'bandpass' : 'highpass';
    filter.frequency.setValueAtTime(type === 'rain' ? 850 : 400, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
    ambientSource = noise;
    ambientGain = gainNode;
  } catch (err) {
    console.warn('Ambient noise error:', err);
  }
}

export function stopAmbientNoise() {
  if (ambientSource) {
    try {
      (ambientSource as AudioBufferSourceNode).stop();
      ambientSource.disconnect();
    } catch (e) {
      // ignore
    }
    ambientSource = null;
  }
  if (ambientGain) {
    try {
      ambientGain.disconnect();
    } catch (e) {
      // ignore
    }
    ambientGain = null;
  }
}
