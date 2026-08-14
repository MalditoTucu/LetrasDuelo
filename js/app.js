import { traerLetras } from './data.js';
import { iniciarPartida, rondaActual, responder, terminada, esVictoria, esRecordNuevo } from './game.js';
import {
  mostrarCargando,
  ocultarCargando,
  mostrarError,
  pintarRonda,
  pintarFeedback,
  pintarFin,
  onElegir,
  onReiniciar,
  pausarPorChat,
  mostrarBotonContinuar,
  ocultarBotonContinuar,
  mostrarGanadorChat,
  ocultarGanadorChat,
  establecerEstadoToggleChat,
  onToggleChatGanador,
  establecerDuracionRonda,
  establecerValorInputDuracion,
  onCambiarDuracionRonda,
  mostrarBienvenida,
  onCerrarBienvenida,
} from './ui.js';
import { conectar as conectarChat, desconectar as desconectarChat, onMensaje } from './kickChat.js';
import { resetearRonda as resetearRondaChat, evaluarMensaje } from './chatGanador.js';

const CHAT_GANADOR_KEY = 'letrasduelo_chat_ganador_activo';
const TIMER_DURACION_KEY = 'letrasduelo_timer_duracion';
const TIMER_DURACION_POR_DEFECTO = 12;

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
  prepararRondaChat();
}

async function manejarEleccion(artista) {
  const resultado = responder(artista);
  await pintarFeedback(resultado);
  avanzarRonda(resultado);
}

function avanzarRonda(resultado) {
  if (terminada()) {
    resetearRondaChat('');
    ocultarGanadorChat();
    pintarFin({ ...resultado, victoria: esVictoria(), nuevoRecord: esRecordNuevo() });
  } else {
    pintarRonda(rondaActual());
    prepararRondaChat();
  }
}

function chatGanadorActivo() {
  return localStorage.getItem(CHAT_GANADOR_KEY) === '1';
}

function prepararRondaChat() {
  ocultarGanadorChat();
  if (chatGanadorActivo()) {
    const ronda = rondaActual();
    if (ronda) {
      resetearRondaChat(ronda.correcta);
    }
  }
}

async function manejarGanadorChat(ganador) {
  pausarPorChat(ganador.respuesta);
  const resultado = responder(ganador.respuesta);
  mostrarGanadorChat(ganador);
  await pintarFeedback(resultado);
  mostrarBotonContinuar(() => {
    ocultarBotonContinuar();
    avanzarRonda(resultado);
  });
}

function activarChatGanador() {
  localStorage.setItem(CHAT_GANADOR_KEY, '1');
  conectarChat();
  onMensaje(({ usuario, texto }) => {
    const ganador = evaluarMensaje(usuario, texto);
    if (ganador) {
      manejarGanadorChat(ganador);
    }
  });
  prepararRondaChat();
}

function desactivarChatGanador() {
  localStorage.setItem(CHAT_GANADOR_KEY, '0');
  desconectarChat();
  ocultarGanadorChat();
}

function duracionRondaGuardada() {
  const valor = Number(localStorage.getItem(TIMER_DURACION_KEY));
  return Number.isFinite(valor) ? valor : TIMER_DURACION_POR_DEFECTO;
}

onElegir(manejarEleccion);
onReiniciar(empezarPartida);
onToggleChatGanador((activado) => {
  if (activado) {
    activarChatGanador();
  } else {
    desactivarChatGanador();
  }
});
onCambiarDuracionRonda((segundos) => {
  localStorage.setItem(TIMER_DURACION_KEY, String(segundos));
  establecerDuracionRonda(segundos);
});

establecerEstadoToggleChat(chatGanadorActivo());
if (chatGanadorActivo()) {
  activarChatGanador();
}

establecerValorInputDuracion(duracionRondaGuardada());
establecerDuracionRonda(duracionRondaGuardada());

onCerrarBienvenida(() => {});
mostrarBienvenida();

iniciar();
