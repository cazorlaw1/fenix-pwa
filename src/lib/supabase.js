import { createClient } from '@supabase/supabase-js';
import { globalShowLoader, globalHideLoader } from '../context/LoaderContext';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Contador para manejar múltiples peticiones simultáneas de forma fluida
let activeRequests = 0;

const customFetch = async (url, options) => {
  activeRequests++;
  if (activeRequests === 1) {
    globalShowLoader("Cargando...");
  }

  try {
    const response = await fetch(url, options);
    return response;
  } finally {
    activeRequests--;
    if (activeRequests <= 0) {
      activeRequests = 0;
      globalHideLoader();
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch,
  },
});