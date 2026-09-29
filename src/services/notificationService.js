// services/notificationService.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Función puente segura hacia el backend
const invokeNotification = async (type, payload) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      'send-notification',
      {
        body: { type, payload },
      }
    );

    if (error) throw error;
    console.log(
      `✅ Notificación '${type}' procesada correctamente por el servidor.`
    );
    return { success: true };
  } catch (err) {
    console.error(`❌ Error al procesar notificación '${type}':`, err.message);
    // No lanzamos error aquí para no bloquear la UI del usuario si falla el correo
    return { success: false, error: err.message };
  }
};

// Exportaciones simplificadas que coinciden con las plantillas de la Edge Function
export const notificarAdminNuevaNota = (payload) =>
  invokeNotification('new_note', payload);
export const notificarAdminEdicionAbonada = (nroTransaccion, clienteNombre) =>
  invokeNotification('edit_abonada', { nroTransaccion, clienteNombre });
export const notificarAdminNuevoVale = (
  vendedorNombre,
  montoVale,
  nroTransaccion,
  clienteNombre
) =>
  invokeNotification('new_vale', {
    vendedorNombre,
    montoVale,
    nroTransaccion,
    clienteNombre,
  });
export const notificarAdminNuevoUsuario = (usuarioNombre, usuarioEmail) =>
  invokeNotification('new_user', { usuarioNombre, usuarioEmail });

// Nuevas exportaciones para eventos de AdminModule
export const notificarAprobacionNota = (payload) =>
  invokeNotification('note_approved', payload);
export const notificarRechazoNota = (payload) =>
  invokeNotification('note_rejected', payload);
export const notificarLiquidacion = (payload) =>
  invokeNotification('settlement_processed', payload);
