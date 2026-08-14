let respuestaOriginal = '';
let respuestaNormalizada = '';
let yaHayGanador = false;

function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function resetearRonda(respuestaCorrecta) {
  respuestaOriginal = respuestaCorrecta || '';
  respuestaNormalizada = normalizar(respuestaOriginal);
  yaHayGanador = false;
}

export function evaluarMensaje(usuario, texto) {
  if (yaHayGanador || !respuestaNormalizada) {
    return null;
  }

  const textoNormalizado = normalizar(texto || '');
  if (!textoNormalizado.includes(respuestaNormalizada)) {
    return null;
  }

  yaHayGanador = true;
  return { usuario, texto, respuesta: respuestaOriginal };
}
