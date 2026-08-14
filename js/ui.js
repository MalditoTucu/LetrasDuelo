import { puntaje, record } from './game.js';

const DURACION_FEEDBACK_MS = 1200;

const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-message');
const gameEl = document.getElementById('game');
const scoreEl = document.getElementById('score');
const recordEl = document.getElementById('record');
const lyricEl = document.getElementById('lyric');
const choiceA = document.getElementById('choice-a');
const choiceB = document.getElementById('choice-b');
const feedbackEl = document.getElementById('feedback');

const gameOverEl = document.getElementById('game-over');
const gameOverTitleEl = document.getElementById('game-over-title');
const gameOverAnswerEl = document.getElementById('game-over-answer');
const gameOverScoreEl = document.getElementById('game-over-score');
const gameOverRecordEl = document.getElementById('game-over-record');
const restartBtn = document.getElementById('restart-btn');

let botonElegido = null;

function actualizarMarcador() {
  scoreEl.textContent = String(puntaje());
  recordEl.textContent = String(record());
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
}

export function pintarFeedback(resultado) {
  choiceA.disabled = true;
  choiceB.disabled = true;

  feedbackEl.classList.remove('correcto', 'incorrecto');
  feedbackEl.textContent = resultado.acierto ? '¡Correcto!' : 'Incorrecto';
  feedbackEl.classList.add(resultado.acierto ? 'correcto' : 'incorrecto');

  if (botonElegido) {
    botonElegido.classList.add(resultado.acierto ? 'correcto' : 'incorrecto');
  }

  actualizarMarcador();

  return new Promise((resolve) => setTimeout(resolve, DURACION_FEEDBACK_MS));
}

export function pintarFin(resultado) {
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
  gameOverRecordEl.textContent = `Récord: ${record()}`;

  gameOverEl.hidden = false;
}

export function onElegir(callback) {
  function manejarClick(boton) {
    choiceA.disabled = true;
    choiceB.disabled = true;
    botonElegido = boton;
    callback(boton.textContent);
  }

  choiceA.addEventListener('click', () => manejarClick(choiceA));
  choiceB.addEventListener('click', () => manejarClick(choiceB));
}

export function onReiniciar(callback) {
  restartBtn.addEventListener('click', () => callback());
}
