import { puntaje, record } from './game.js';
import { reproducirClick, reproducirCorrecto, reproducirError, reproducirRecord } from './sound.js';

const DURACION_FEEDBACK_MS = 1200;
const DURACION_RONDA_MAX_S = 200;
const SEGUNDOS_URGENCIA = 3;

let duracionRondaMs = 12000;

const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-message');
const gameEl = document.getElementById('game');
const scoreEl = document.getElementById('score');
const recordEl = document.getElementById('record');
const lyricEl = document.getElementById('lyric');
const choiceA = document.getElementById('choice-a');
const choiceB = document.getElementById('choice-b');
const feedbackEl = document.getElementById('feedback');
const continuarBtnEl = document.getElementById('continuar-btn');
const timerBarEl = document.getElementById('timer-bar');
const timerCountEl = document.getElementById('timer-count');
const timerDuracionInputEl = document.getElementById('timer-duracion');

const chatGanadorBannerEl = document.getElementById('chat-ganador-banner');
const chatGanadorToggleEl = document.getElementById('chat-ganador-toggle');

const welcomeModalEl = document.getElementById('welcome-modal');
const welcomeStep1El = document.getElementById('welcome-step-1');
const welcomeStep2El = document.getElementById('welcome-step-2');
const welcomeNextBtn = document.getElementById('welcome-next-btn');
const welcomeCloseBtn = document.getElementById('welcome-close-btn');
const welcomeSkipBtn = document.getElementById('welcome-skip-btn');

welcomeNextBtn.addEventListener('click', () => {
  reproducirClick();
  welcomeStep1El.hidden = true;
  welcomeStep2El.hidden = false;
});

const gameOverEl = document.getElementById('game-over');
const gameOverTitleEl = document.getElementById('game-over-title');
const gameOverAnswerEl = document.getElementById('game-over-answer');
const gameOverScoreEl = document.getElementById('game-over-score');
const gameOverRecordEl = document.getElementById('game-over-record');
const restartBtn = document.getElementById('restart-btn');

let botonElegido = null;
let elegirCallback = null;
let temporizadorIntervalId = null;
let temporizadorTimeoutId = null;

function actualizarMarcador() {
  scoreEl.textContent = String(puntaje());
  recordEl.textContent = String(record());
}

function detenerTemporizador() {
  clearInterval(temporizadorIntervalId);
  clearTimeout(temporizadorTimeoutId);
  temporizadorIntervalId = null;
  temporizadorTimeoutId = null;
}

function iniciarTemporizador() {
  detenerTemporizador();

  timerCountEl.classList.remove('urgente');
  timerBarEl.classList.remove('urgente');

  if (duracionRondaMs <= 0) {
    timerCountEl.textContent = '∞';
    timerBarEl.style.transition = 'none';
    timerBarEl.style.width = '100%';
    return;
  }

  let restante = Math.round(duracionRondaMs / 1000);
  timerCountEl.textContent = String(restante);

  timerBarEl.style.transition = 'none';
  timerBarEl.style.width = '100%';
  void timerBarEl.offsetWidth;
  timerBarEl.style.transition = `width linear ${duracionRondaMs}ms`;
  timerBarEl.style.width = '0%';

  temporizadorIntervalId = setInterval(() => {
    restante = Math.max(restante - 1, 0);
    timerCountEl.textContent = String(restante);
    if (restante <= SEGUNDOS_URGENCIA) {
      timerCountEl.classList.add('urgente');
      timerBarEl.classList.add('urgente');
    }
  }, 1000);

  temporizadorTimeoutId = setTimeout(() => {
    manejarEleccion(null);
  }, duracionRondaMs);
}

function manejarEleccion(boton) {
  detenerTemporizador();
  choiceA.disabled = true;
  choiceB.disabled = true;
  botonElegido = boton;

  if (boton) {
    reproducirClick();
  }

  if (elegirCallback) {
    elegirCallback(boton ? boton.textContent : null);
  }
}

export function mostrarCargando() {
  loadingEl.hidden = false;
  errorEl.hidden = true;
  gameEl.hidden = true;
  gameOverEl.hidden = true;
}

export function ocultarCargando() {
  loadingEl.hidden = true;
}

export function mostrarError(mensaje) {
  detenerTemporizador();
  loadingEl.hidden = true;
  gameEl.hidden = true;
  gameOverEl.hidden = true;
  errorEl.textContent = mensaje;
  errorEl.hidden = false;
}

export function pintarRonda(ronda) {
  choiceA.classList.remove('correcto', 'incorrecto');
  choiceB.classList.remove('correcto', 'incorrecto');
  feedbackEl.classList.remove('correcto', 'incorrecto');
  feedbackEl.textContent = '';
  botonElegido = null;
  continuarBtnEl.hidden = true;

  lyricEl.textContent = ronda.letra;
  choiceA.textContent = ronda.opciones[0];
  choiceB.textContent = ronda.opciones[1];
  choiceA.disabled = false;
  choiceB.disabled = false;

  actualizarMarcador();

  loadingEl.hidden = true;
  errorEl.hidden = true;
  gameOverEl.hidden = true;
  gameEl.hidden = false;

  iniciarTemporizador();
}

export function pintarFeedback(resultado) {
  detenerTemporizador();
  choiceA.disabled = true;
  choiceB.disabled = true;

  const botonCorrecto = [choiceA, choiceB].find((boton) => boton.textContent === resultado.correcta);

  let texto;
  if (resultado.acierto) {
    texto = '¡Correcto!';
  } else if (!botonElegido) {
    texto = '¡Se acabó el tiempo!';
  } else {
    texto = 'Incorrecto';
  }

  feedbackEl.classList.remove('correcto', 'incorrecto');
  feedbackEl.textContent = texto;
  feedbackEl.classList.add(resultado.acierto ? 'correcto' : 'incorrecto');

  if (resultado.acierto) {
    reproducirCorrecto();
  } else {
    reproducirError();
  }

  if (botonCorrecto) {
    botonCorrecto.classList.add('correcto');
  }
  if (!resultado.acierto && botonElegido && botonElegido !== botonCorrecto) {
    botonElegido.classList.add('incorrecto');
  }

  actualizarMarcador();

  return new Promise((resolve) => setTimeout(resolve, DURACION_FEEDBACK_MS));
}

export function pintarFin(resultado) {
  detenerTemporizador();
  choiceA.disabled = true;
  choiceB.disabled = true;

  loadingEl.hidden = true;
  errorEl.hidden = true;
  gameEl.hidden = true;

  gameOverTitleEl.textContent = resultado.victoria
    ? '¡Completaste todas las letras!'
    : 'Fin de la partida';

  gameOverAnswerEl.textContent = `La respuesta correcta era ${resultado.correcta} — "${resultado.cancion}"`;
  gameOverScoreEl.textContent = `Puntaje final: ${resultado.puntaje}`;
  gameOverRecordEl.textContent = resultado.nuevoRecord
    ? `Récord: ${record()} — ¡nuevo récord!`
    : `Récord: ${record()}`;

  if (resultado.nuevoRecord) {
    reproducirRecord();
  }

  gameOverEl.hidden = false;
}

export function onElegir(callback) {
  elegirCallback = callback;
  choiceA.addEventListener('click', () => manejarEleccion(choiceA));
  choiceB.addEventListener('click', () => manejarEleccion(choiceB));
}

export function pausarPorChat(artista) {
  detenerTemporizador();
  choiceA.disabled = true;
  choiceB.disabled = true;
  botonElegido = [choiceA, choiceB].find((b) => b.textContent === artista) || null;
}

export function mostrarBotonContinuar(callback) {
  continuarBtnEl.hidden = false;
  continuarBtnEl.onclick = () => {
    reproducirClick();
    continuarBtnEl.hidden = true;
    callback();
  };
}

export function ocultarBotonContinuar() {
  continuarBtnEl.hidden = true;
  continuarBtnEl.onclick = null;
}

export function onReiniciar(callback) {
  restartBtn.addEventListener('click', () => {
    reproducirClick();
    callback();
  });
}

export function mostrarBienvenida() {
  welcomeStep1El.hidden = false;
  welcomeStep2El.hidden = true;
  welcomeModalEl.hidden = false;
}

export function onCerrarBienvenida(callback) {
  const cerrar = () => {
    reproducirClick();
    welcomeModalEl.hidden = true;
    callback();
  };
  welcomeCloseBtn.addEventListener('click', cerrar);
  welcomeSkipBtn.addEventListener('click', cerrar);
}

export function mostrarGanadorChat({ usuario, texto }) {
  chatGanadorBannerEl.textContent = `Usuario ${usuario} dijo "${texto}" primero — ¡Ganador!`;
  chatGanadorBannerEl.hidden = false;
}

export function ocultarGanadorChat() {
  chatGanadorBannerEl.hidden = true;
  chatGanadorBannerEl.textContent = '';
}

export function establecerEstadoToggleChat(activado) {
  chatGanadorToggleEl.checked = activado;
}

export function onToggleChatGanador(callback) {
  chatGanadorToggleEl.addEventListener('change', () => {
    callback(chatGanadorToggleEl.checked);
  });
}

function clampDuracionS(segundos) {
  return Math.min(DURACION_RONDA_MAX_S, Math.max(0, Math.round(Number(segundos)) || 0));
}

export function establecerDuracionRonda(segundos) {
  duracionRondaMs = clampDuracionS(segundos) * 1000;
}

export function establecerValorInputDuracion(segundos) {
  timerDuracionInputEl.value = String(clampDuracionS(segundos));
}

export function onCambiarDuracionRonda(callback) {
  timerDuracionInputEl.addEventListener('change', () => {
    const segundos = clampDuracionS(timerDuracionInputEl.value);
    timerDuracionInputEl.value = String(segundos);
    callback(segundos);
  });
}
