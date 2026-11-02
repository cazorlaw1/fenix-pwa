import { createClient } from '@supabase/supabase-js';
import { globalShowLoader, globalHideLoader } from '../context/LoaderContext';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let activeRequests = 0;
let hideTimer = null; // Temporizador para asegurar que todas las consultas terminen de verdad

const customFetch = async (url, options) => {
  activeRequests++;

  // Si hay una petición entrante y había un cierre programado, lo cancelamos de inmediato
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  // Mostramos el loader de inmediato en la primera petición
  if (activeRequests === 1) {
    globalShowLoader("Cargando...");
  }

  try {
    const response = await fetch(url, options);
    return response;
  } finally {
    activeRequests--;

    // Si ya no quedan peticiones activas, esperamos un momento prudente antes de apagarlo
    if (activeRequests <= 0) {
      activeRequests = 0;
      
      if (hideTimer) clearTimeout(hideTimer);
      
      // Damos un respiro de 300ms por si viene otra consulta en cadena
      hideTimer = setTimeout(() => {
        globalHideLoader();
        hideTimer = null;
      }, 300);
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch,
  },
});