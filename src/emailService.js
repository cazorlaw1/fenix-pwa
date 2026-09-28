import { createClient } from '@supabase/supabase-js';

// Inicializamos el cliente de Supabase con tus variables de entorno habituales
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const sendNotificationEmail = async ({ to, subject, htmlContent }) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        htmlContent,
      },
    });

    if (error) {
      console.error('Error devuelto por la función de Supabase:', error);
      return { success: false, error };
    }

    console.log('¡Correo enviado con éxito a través de Supabase!', data);
    return { success: true, data };
  } catch (err) {
    console.error('Excepción al invocar la función de correo:', err);
    return { success: false, error: err };
  }
};
