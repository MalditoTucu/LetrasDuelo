import { traerLetras } from './data.js';
import { iniciarPartida, rondaActual, responder, terminada, esVictoria } from './game.js';
import {
  mostrarCargando,
  ocultarCargando,
  mostrarError,
  pintarRonda,
  pintarFeedback,
  pintarFin,
  onElegir,
  onReiniciar,
} from './ui.js';

let letrasCargadas = [];

async function iniciar() {
  mostrarCargando();

  try {
    letrasCargadas = await traerLetras();
  } catch (error) {
    mostrarError(error.message);
    return;
  }

  empezarPartida();
}

function empezarPartida() {
  try {
    iniciarPartida(letrasCargadas);
  } catch (error) {
    mostrarError(error.message);
    return;
  }

  ocultarCargando();
  pintarRonda(rondaActual());
}

async function manejarEleccion(artista) {
  const resultado = responder(artista);
  await pintarFeedback(resultado);

  if (terminada()) {
    pintarFin({ ...resultado, victoria: esVictoria() });
  } else {
    pintarRonda(rondaActual());
  }
}

onElegir(manejarEleccion);
onReiniciar(empezarPartida);

iniciar();
