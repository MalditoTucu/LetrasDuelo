import { supabase } from './supabase.js';
import { traerLetras, agregarLetra, borrarLetra } from './data.js';

const loginSection = document.getElementById('login-section');
const panelSection = document.getElementById('panel-section');
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const letraForm = document.getElementById('letra-form');
const inputLetra = document.getElementById('input-letra');
const inputArtista = document.getElementById('input-artista');
const inputCancion = document.getElementById('input-cancion');
const inputDificultad = document.getElementById('input-dificultad');
const formError = document.getElementById('form-error');
const formStatus = document.getElementById('form-status');

const listLoading = document.getElementById('list-loading');
const listEmpty = document.getElementById('list-empty');
const letrasTable = document.getElementById('letras-table');
const letrasTbody = document.getElementById('letras-tbody');

function showError(el, message) {
  el.textContent = message;
  el.hidden = false;
}

function hideError(el) {
  el.hidden = true;
  el.textContent = '';
}

function showStatus(el, message) {
  el.textContent = message;
  el.hidden = false;
}

function friendlyAuthMessage(error) {
  if (!error) return 'Ocurrió un error inesperado.';
  if (error.message?.includes('Invalid login credentials')) {
    return 'Email o contraseña incorrectos.';
  }
  return error.message || 'Ocurrió un error inesperado.';
}

function showPanel() {
  loginSection.hidden = true;
  panelSection.hidden = false;
  loadLetras();
}

function showLogin() {
  panelSection.hidden = true;
  loginSection.hidden = false;
}

async function checkSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    showError(loginError, friendlyAuthMessage(error));
    showLogin();
    return;
  }
  if (data.session) {
    showPanel();
  } else {
    showLogin();
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideError(loginError);
  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail.value.trim(),
    password: loginPassword.value,
  });
  if (error) {
    showError(loginError, friendlyAuthMessage(error));
    return;
  }
  loginForm.reset();
  showPanel();
});

logoutBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    showError(loginError, friendlyAuthMessage(error));
    return;
  }
  showLogin();
});

letraForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideError(formError);
  formStatus.hidden = true;

  const nuevaLetra = {
    letra: inputLetra.value.trim(),
    artista: inputArtista.value.trim(),
    cancion: inputCancion.value.trim(),
    dificultad: inputDificultad.value,
  };

  if (!nuevaLetra.letra || !nuevaLetra.artista || !nuevaLetra.cancion) {
    showError(formError, 'Completá letra, artista y canción antes de agregar.');
    return;
  }

  try {
    await agregarLetra(nuevaLetra);
  } catch (error) {
    showError(formError, error.message);
    return;
  }

  letraForm.reset();
  inputDificultad.value = 'media';
  showStatus(formStatus, 'Letra agregada correctamente.');
  loadLetras();
});

async function loadLetras() {
  listLoading.hidden = false;
  listEmpty.hidden = true;
  letrasTable.hidden = true;

  let filas;
  try {
    filas = [...(await traerLetras())].reverse();
  } catch (error) {
    listLoading.hidden = true;
    showError(formError, error.message);
    return;
  }

  listLoading.hidden = true;

  if (filas.length === 0) {
    listEmpty.hidden = false;
    return;
  }

  letrasTbody.innerHTML = '';
  for (const fila of filas) {
    letrasTbody.appendChild(crearFila(fila));
  }
  letrasTable.hidden = false;
}

function crearFila(fila) {
  const tr = document.createElement('tr');

  const tdLetra = document.createElement('td');
  tdLetra.textContent = fila.letra;
  tdLetra.className = 'col-letra';

  const tdArtista = document.createElement('td');
  tdArtista.textContent = fila.artista;

  const tdCancion = document.createElement('td');
  tdCancion.textContent = fila.cancion;

  const tdDificultad = document.createElement('td');
  tdDificultad.textContent = fila.dificultad;

  const tdBorrar = document.createElement('td');
  const borrarBtn = document.createElement('button');
  borrarBtn.type = 'button';
  borrarBtn.className = 'delete-btn';
  borrarBtn.textContent = 'Borrar';
  borrarBtn.addEventListener('click', () => eliminarLetra(fila.id, tr));
  tdBorrar.appendChild(borrarBtn);

  tr.append(tdLetra, tdArtista, tdCancion, tdDificultad, tdBorrar);
  return tr;
}

async function eliminarLetra(id, tr) {
  hideError(formError);
  try {
    await borrarLetra(id);
  } catch (error) {
    showError(formError, error.message);
    return;
  }
  tr.remove();
  if (!letrasTbody.children.length) {
    letrasTable.hidden = true;
    listEmpty.hidden = false;
  }
}

checkSession();
