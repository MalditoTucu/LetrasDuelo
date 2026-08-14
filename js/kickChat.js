const PUSHER_APP_KEY = '32cbd69e4b950bf97679';
const PUSHER_CLUSTER = 'us2';
const CHATROOM_ID = 77170594;

let socket = null;
let mensajeCallback = null;
let debeReconectar = false;

function enviar(mensaje) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(mensaje));
  }
}

function manejarMensajeEntrante(evento) {
  let payload;
  try {
    payload = JSON.parse(evento.data);
  } catch {
    console.warn('[kickChat] mensaje no parseable', evento.data);
    return;
  }

  if (payload.event === 'pusher:connection_established') {
    console.info('[kickChat] conectado a Pusher, suscribiendo a chatrooms.' + CHATROOM_ID + '.v2');
    enviar({ event: 'pusher:subscribe', data: { channel: `chatrooms.${CHATROOM_ID}.v2` } });
    return;
  }

  if (payload.event === 'pusher_internal:subscription_succeeded') {
    console.info('[kickChat] suscripción confirmada, escuchando mensajes del chat');
    return;
  }

  if (payload.event === 'pusher:error') {
    console.warn('[kickChat] error de Pusher', payload.data);
    return;
  }

  if (payload.event === 'pusher:ping') {
    enviar({ event: 'pusher:pong', data: {} });
    return;
  }

  if (
    payload.event !== 'App\\Events\\ChatMessageEvent' &&
    payload.event !== 'App\\Events\\ChatMessageSentEvent'
  ) {
    return;
  }

  let data;
  try {
    data = JSON.parse(payload.data);
  } catch {
    console.warn('[kickChat] no se pudo parsear el mensaje de chat', payload.data);
    return;
  }

  const usuario = data?.sender?.username;
  const texto = data?.content;

  console.info(`[kickChat] mensaje recibido — ${usuario}: ${texto}`);

  if (usuario && texto && mensajeCallback) {
    mensajeCallback({ usuario, texto });
  }
}

export function conectar() {
  if (socket) {
    return;
  }

  console.info('[kickChat] conectando...');
  debeReconectar = true;
  socket = new WebSocket(
    `wss://ws-${PUSHER_CLUSTER}.pusher.com/app/${PUSHER_APP_KEY}?protocol=7&client=js&version=8.4.0&flash=false`
  );

  socket.addEventListener('message', manejarMensajeEntrante);

  socket.addEventListener('close', (evento) => {
    console.warn('[kickChat] conexión cerrada', evento.code, evento.reason);
    socket = null;
    if (debeReconectar) {
      setTimeout(conectar, 3000);
    }
  });

  socket.addEventListener('error', (evento) => {
    console.warn('[kickChat] error de socket', evento);
    socket?.close();
  });
}

export function desconectar() {
  console.info('[kickChat] desconectando');
  debeReconectar = false;
  if (socket) {
    socket.close();
    socket = null;
  }
}

export function onMensaje(callback) {
  mensajeCallback = callback;
}
