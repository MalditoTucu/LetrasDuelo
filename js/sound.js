let audioCtx = null;

function obtenerContexto() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function reproducirTono({ frecuencia, duracion, tipo = 'sine', volumen = 0.15, retraso = 0 }) {
  const ctx = obtenerContexto();
  const inicio = ctx.currentTime + retraso;

  const oscilador = ctx.createOscillator();
  const ganancia = ctx.createGain();

  oscilador.type = tipo;
  oscilador.frequency.setValueAtTime(frecuencia, inicio);

  ganancia.gain.setValueAtTime(0, inicio);
  ganancia.gain.linearRampToValueAtTime(volumen, inicio + 0.01);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);

  oscilador.connect(ganancia);
  ganancia.connect(ctx.destination);

  oscilador.start(inicio);
  oscilador.stop(inicio + duracion + 0.02);
}

export function reproducirClick() {
  reproducirTono({ frecuencia: 720, duracion: 0.08, tipo: 'square', volumen: 0.12 });
}

export function reproducirCorrecto() {
  reproducirTono({ frecuencia: 880, duracion: 0.12, tipo: 'sine', volumen: 0.15 });
  reproducirTono({ frecuencia: 1174.66, duracion: 0.18, tipo: 'sine', volumen: 0.15, retraso: 0.08 });
}

export function reproducirError() {
  reproducirTono({ frecuencia: 220, duracion: 0.18, tipo: 'sawtooth', volumen: 0.13 });
  reproducirTono({ frecuencia: 146.83, duracion: 0.28, tipo: 'sawtooth', volumen: 0.13, retraso: 0.12 });
}

export function reproducirRecord() {
  const notas = [523.25, 659.25, 783.99, 1046.5];
  notas.forEach((frecuencia, i) => {
    reproducirTono({ frecuencia, duracion: 0.22, tipo: 'triangle', volumen: 0.14, retraso: i * 0.09 });
  });
}
