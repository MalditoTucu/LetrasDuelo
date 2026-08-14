import { supabase } from './supabase.js';

function traducirError(error, mensajePorDefecto) {
  const texto = `${error.message || ''} ${error.details || ''}`.toLowerCase();
  const esDePermisos =
    error.code === '42501' ||
    texto.includes('row-level security') ||
    texto.includes('permission denied') ||
    texto.includes('policy') ||
    texto.includes('rls');

  if (esDePermisos) {
    return 'Hace falta iniciar sesión para hacer esto.';
  }

  return mensajePorDefecto;
}

export async function traerLetras() {
  const { data, error } = await supabase
    .from('letras')
    .select('*')
    .order('creado_en', { ascending: true });

  if (error) {
    throw new Error(traducirError(error, 'No se pudieron cargar las letras. Intentá de nuevo en un momento.'));
  }

  return data;
}

export async function agregarLetra({ letra, artista, cancion, dificultad }) {
  const { error } = await supabase.from('letras').insert({ letra, artista, cancion, dificultad });

  if (error) {
    throw new Error(traducirError(error, 'No se pudo agregar la letra. Revisá los datos e intentá de nuevo.'));
  }
}

export async function borrarLetra(id) {
  const { error } = await supabase.from('letras').delete().eq('id', id);

  if (error) {
    throw new Error(traducirError(error, 'No se pudo borrar la letra. Intentá de nuevo.'));
  }
}
