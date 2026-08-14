const RECORD_KEY = 'letrasduelo_record';

let todasLasLetras = [];
let mazo = [];
let indice = 0;
let puntajeActual = 0;
let estaTerminada = false;
let esGanada = false;
let ronda = null;
let recordAlIniciar = 0;

function mezclar(array) {
  const copia = array.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function artistasDistintos(letras) {
  return [...new Set(letras.map((l) => l.artista))];
}

function leerRecord() {
  const valor = Number(localStorage.getItem(RECORD_KEY));
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
}

function guardarRecordSiCorresponde() {
  if (puntajeActual > leerRecord()) {
    localStorage.setItem(RECORD_KEY, String(puntajeActual));
  }
}

function generarRonda() {
  const correctaLetra = mazo[indice];
  const candidatos = artistasDistintos(todasLasLetras).filter((a) => a !== correctaLetra.artista);
  const artistaIncorrecto = candidatos[Math.floor(Math.random() * candidatos.length)];

  ronda = {
    letra: correctaLetra.letra,
    cancion: correctaLetra.cancion,
    opciones: mezclar([correctaLetra.artista, artistaIncorrecto]),
    correcta: correctaLetra.artista,
  };
}

export function iniciarPartida(letras) {
  if (!Array.isArray(letras) || letras.length === 0) {
    throw new Error('No hay letras cargadas para jugar.');
  }

  if (artistasDistintos(letras).length < 2) {
    throw new Error('Hace falta que haya al menos dos artistas distintos en la base para poder jugar.');
  }

  todasLasLetras = letras.slice();
  mazo = mezclar(letras);
  indice = 0;
  puntajeActual = 0;
  estaTerminada = false;
  esGanada = false;
  recordAlIniciar = leerRecord();

  generarRonda();
  return ronda;
}

export function rondaActual() {
  return ronda;
}

export function responder(artistaElegido) {
  const correcta = ronda.correcta;
  const cancion = ronda.cancion;
  const acierto = artistaElegido === correcta;

  if (acierto) {
    puntajeActual += 1;
    indice += 1;

    if (indice >= mazo.length) {
      estaTerminada = true;
      esGanada = true;
      guardarRecordSiCorresponde();
    } else {
      generarRonda();
    }
  } else {
    estaTerminada = true;
    esGanada = false;
    guardarRecordSiCorresponde();
  }

  return { acierto, correcta, cancion, puntaje: puntajeActual };
}

export function terminada() {
  return estaTerminada;
}

export function esVictoria() {
  return esGanada;
}

export function esRecordNuevo() {
  return estaTerminada && puntajeActual > recordAlIniciar;
}

export function puntaje() {
  return puntajeActual;
}

export function record() {
  return leerRecord();
}
