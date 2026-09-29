import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { type, payload } = await req.json()
    
    // Conexión con permisos totales (ignora RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    // Plantilla HTML base con Logo ApiFenix
    const logoUrl = 'https://hxlwrlzucnpdqofxjelg.supabase.co/storage/v1/object/public/assets/LOGOF.png';
    const wrapHtml = (content: string) => `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 3px solid #F59E0B;">
          <img src="${logoUrl}" alt="ApiFenix Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
        </div>
        <div style="padding: 30px 20px; line-height: 1.6; font-size: 16px; color: #1f2937;">
          ${content}
        </div>
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-weight: bold; color: #374151;">Sistema ApiFenix</p>
          <p style="margin: 5px 0 0 0;">Este es un mensaje automático. Por favor no responda a este correo.</p>
        </div>
      </div>
    `;

    // Función auxiliar para enviar correo real
    const sendEmail = async (to: string, subject: string, bodyContent: string) => {
      if (!to) return;
      await supabaseAdmin.functions.invoke('send-email', {
        body: { to, subject, htmlContent: wrapHtml(bodyContent) },
      });
    };

    // Buscar administradores una sola vez
    const { data: admins } = await supabaseAdmin.from('profiles').select('email, full_name').eq('role', 'administrador');

    // Lógica principal según el tipo de evento
    switch (type) {
      case 'new_note': {
        if (admins) {
          for (const admin of admins) {
            const body = `Hola <b>${admin.full_name}</b>. El vendedor <b>${payload.sellerName}</b> ha creado la Nota de Entrega N° <b>${payload.transactionNumber}</b> para el cliente <b>${payload.clientName}</b> por un monto total de <b>$${payload.totalUsd}</b>. Ingrese a la sección Aprobaciones de N.E. para revisar los detalles y procesar su aprobación.`;
            await sendEmail(admin.email, `Nueva Nota de Entrega N° ${payload.transactionNumber} Pendiente por Aprobar`, body);
          }
        }
        break;
      }

      case 'edit_abonada': {
        if (admins) {
          for (const admin of admins) {
            const body = `Hola <b>${admin.full_name}</b>. Se ha solicitado una modificación en la Nota de Entrega N° <b>${payload.nroTransaccion}</b> perteneciente al cliente <b>${payload.clienteNombre}</b>. Dado que esta orden ya posee abonos registrados, la edición ha sido derivada a su panel para revisión y reajuste exclusivo.`;
            await sendEmail(admin.email, `Solicitud de Edición en Nota de Entrega N° ${payload.nroTransaccion}`, body);
          }
        }
        break;
      }

      case 'new_vale': {
        if (admins) {
          for (const admin of admins) {
            const body = `Hola <b>${admin.full_name}</b>. El vendedor <b>${payload.vendedorNombre}</b> ha solicitado un vale por el monto de <b>$${payload.montoVale}</b> sobre la Nota de Entrega N° <b>${payload.nroTransaccion}</b> (Cliente: ${payload.clienteNombre}). Ingrese a la sección Vales y Adelantos para evaluar y aprobar o rechazar la solicitud.`;
            await sendEmail(admin.email, `Nueva Solicitud de Vale - N° Transacción ${payload.nroTransaccion}`, body);
          }
        }
        break;
      }

      case 'new_user': {
        if (admins) {
          for (const admin of admins) {
            const body = `Hola <b>${admin.full_name}</b>. El usuario <b>${payload.usuarioNombre}</b> (${payload.usuarioEmail}) ha creado una cuenta en la plataforma y se encuentra en estado Pendiente. Por favor ingrese al menú Usuarios -> Admitir para asignar su rol, porcentajes de comisión y sueldo fijo.`;
            await sendEmail(admin.email, `Nuevo Usuario Registrado en Espera de Asignación`, body);
          }
        }
        break;
      }

      case 'note_approved': {
        if (payload.vendedorEmail && payload.vendedorNombre) {
          const body = `Hola <b>${payload.vendedorNombre}</b>. Tu Nota de Entrega N° <b>${payload.nroTransaccion}</b> para el cliente <b>${payload.clienteNombre}</b> ha sido aprobada por el Administrador. Ya puedes descargar el documento en PDF y enviarlo a tu cliente desde tu Historial de N.E.`;
          await sendEmail(payload.vendedorEmail, `Nota de Entrega N° ${payload.nroTransaccion} Aprobada`, body);
        }
        break;
      }

      case 'note_rejected': {
        if (payload.vendedorEmail && payload.vendedorNombre) {
          const body = `Hola <b>${payload.vendedorNombre}</b>. Tu propuesta de Nota de Entrega N° <b>${payload.nroTransaccion}</b> para el cliente <b>${payload.clienteNombre}</b> ha sido rechazada por el Administrador. Motivo u observación: <i>${payload.observacion}</i>. Puedes editar la nota y enviarla nuevamente a aprobación.`;
          await sendEmail(payload.vendedorEmail, `Nota de Entrega N° ${payload.nroTransaccion} Rechazada`, body);
        }
        break;
      }

      case 'abono_registered': {
        // Notificar al Vendedor
        if (payload.vendedorEmail && payload.vendedorNombre) {
          const bodyVendedor = `Hola <b>${payload.vendedorNombre}</b>. Se ha registrado un abono de <b>$${payload.montoAbonado}</b> para la Nota de Entrega N° <b>${payload.nroTransaccion}</b> del cliente <b>${payload.clienteNombre}</b>. El saldo pendiente actual de la orden es de <b>$${payload.saldoPendiente}</b>.`;
          await sendEmail(payload.vendedorEmail, `Abono Registrado - Nota de Entrega N° ${payload.nroTransaccion}`, bodyVendedor);
        }
        // Notificar al Administrador
        if (admins) {
          for (const admin of admins) {
            const bodyAdmin = `Hola <b>${admin.full_name}</b>. Se ha registrado un nuevo abono de <b>$${payload.montoAbonado}</b> en la Nota de Entrega N° <b>${payload.nroTransaccion}</b> (Cliente: ${payload.clienteNombre}).`;
            await sendEmail(admin.email, `Nuevo Abono Registrado - N.E. N° ${payload.nroTransaccion}`, bodyAdmin);
          }
        }
        break;
      }

      case 'abono_approved': {
        if (payload.vendedorEmail && payload.vendedorNombre) {
          const body = `Hola <b>${payload.vendedorNombre}</b>. Tu notificación de abono por <b>$${payload.montoAbonado}</b> en la Nota de Entrega N° <b>${payload.nroTransaccion}</b> del cliente <b>${payload.clienteNombre}</b> ha sido <b>aprobada</b> por el Administrador. El saldo pendiente ha sido actualizado correctamente.`;
          await sendEmail(payload.vendedorEmail, `Abono Aprobado - Nota de Entrega N° ${payload.nroTransaccion}`, body);
        }
        break;
      }

      case 'vale_status_update': {
        if (payload.vendedorEmail && payload.vendedorNombre) {
          const body = `Hola <b>${payload.vendedorNombre}</b>. Tu solicitud de vale por <b>$${payload.montoVale}</b> asociada a la Nota de Entrega N° <b>${payload.nroTransaccion}</b> ha sido <b>${payload.estadoVale}</b> por el Administrador. Puedes verificar el estado actualizado en tu historial.`;
          await sendEmail(payload.vendedorEmail, `Actualización de Solicitud de Vale - N° Transacción ${payload.nroTransaccion}`, body);
        }
        break;
      }

      case 'order_closed': {
        // Notificar al Vendedor
        if (payload.vendedorEmail && payload.vendedorNombre) {
          const bodyVendedor = `Hola <b>${payload.vendedorNombre}</b>. La Nota de Entrega N° <b>${payload.nroTransaccion}</b> del cliente <b>${payload.clienteNombre}</b> ha sido pagada en su totalidad y su estado cambió a Cerrada. La comisión correspondiente ha sido computada para el cierre de ciclo quincenal en curso.`;
          await sendEmail(payload.vendedorEmail, `Orden Cerrada N° ${payload.nroTransaccion} - Comisión Entrante al Ciclo`, bodyVendedor);
        }
        // Notificar a Supervisor/Gerente (si existe en el payload)
        if (payload.supervisorEmail && payload.supervisorNombre) {
          const bodySup = `Hola <b>${payload.supervisorNombre}</b>. El vendedor <b>${payload.vendedorNombre}</b> asignado a tu estructura ha completado el cobro de la Nota de Entrega N° <b>${payload.nroTransaccion}</b> (Cliente: ${payload.clienteNombre}). La comisión jerárquica asignada a tu usuario ha sido sumada a tu acumulado del ciclo quincenal.`;
          await sendEmail(payload.supervisorEmail, `Orden Cerrada en tu Equipo - N° Transacción ${payload.nroTransaccion}`, bodySup);
        }
        break;
      }

      case 'settlement_processed': {
        if (payload.userEmail && payload.userName) {
          const body = `Hola <b>${payload.userName}</b>. Tu liquidación de comisiones correspondiente al ciclo quincenal ha sido procesada por la administración. Resumen de Pago: Total en Divisas ($): $${payload.montoDivisas}. Total en Bolívares (Ref. $): $${payload.montoBs}. Puedes consultar el desglose completo en el menú Ventas -> Historial de Ventas.`;
          await sendEmail(payload.userEmail, `Liquidación de Comisiones Procesada - Ciclo ${payload.fechaInicio} al ${payload.fechaFin}`, body);
        }
        break;
      }

      // ✅ NUEVO: Solicitud de Vale desde Vendedor
      case 'new_vale_request': {
        if (admins) {
          for (const admin of admins) {
            const body = `Hola <b>${admin.full_name}</b>. El vendedor <b>${payload.vendedorNombre}</b> ha solicitado un vale/adelanto por el monto de <b>$${payload.montoVale}</b> asociado a la Nota de Entrega N° <b>${payload.nroTransaccion}</b> (Cliente: ${payload.clienteNombre}). Ingrese a la sección <b>Vales y Adelantos</b> para evaluar y aprobar o rechazar la solicitud.`;
            await sendEmail(admin.email, `Nueva Solicitud de Vale - N° Transacción ${payload.nroTransaccion}`, body);
          }
        }
        break;
      }

      // ✅ NUEVO: Vale Aprobado (enviado al vendedor)
      case 'vale_approved': {
        if (payload.vendedorEmail && payload.vendedorNombre) {
          const body = `Hola <b>${payload.vendedorNombre}</b>. Tu solicitud de vale por <b>$${payload.montoVale}</b> asociada a la Nota de Entrega N° <b>${payload.nroTransaccion}</b> ha sido <b>APROBADA</b> por el Administrador. El monto ha sido registrado y se descontará de tu próxima liquidación de comisiones. Puedes verificar el estado actualizado en tu historial.`;
          await sendEmail(payload.vendedorEmail, `Vale Aprobado - N° Transacción ${payload.nroTransaccion}`, body);
        }
        break;
      }

      // ✅ NUEVO: Vale Rechazado (enviado al vendedor)
      case 'vale_rejected': {
        if (payload.vendedorEmail && payload.vendedorNombre) {
          const body = `Hola <b>${payload.vendedorNombre}</b>. Tu solicitud de vale por <b>$${payload.montoVale}</b> asociada a la Nota de Entrega N° <b>${payload.nroTransaccion}</b> ha sido <b>RECHAZADA</b> por el Administrador. Si deseas, puedes volver a solicitarlo o consultar con la administración el motivo del rechazo.`;
          await sendEmail(payload.vendedorEmail, `Vale Rechazado - N° Transacción ${payload.nroTransaccion}`, body);
        }
        break;
      }

      // ✅ NUEVO: Penalización Asignada (enviado al vendedor)
      case 'new_penalty': {
        if (payload.vendedorEmail && payload.vendedorNombre) {
          const body = `Hola <b>${payload.vendedorNombre}</b>. Se te ha asignado una <b>penalización/cargo por incumplimiento</b> por el monto de <b>$${payload.montoPenalizacion}</b> asociada a la Nota de Entrega N° <b>${payload.nroTransaccion}</b> (Cliente: ${payload.clienteNombre}). Motivo: <i>${payload.motivo || 'Sin especificar'}</i>. Este monto se descontará de tu próxima liquidación de comisiones. Puedes verificar el detalle en tu módulo de Comisiones.`;
          await sendEmail(payload.vendedorEmail, `Nueva Penalización Asignada - N° Transacción ${payload.nroTransaccion}`, body);
        }
        // También notificar al admin para registro
        if (admins) {
          for (const admin of admins) {
            const bodyAdmin = `Hola <b>${admin.full_name}</b>. Se ha registrado una penalización de <b>$${payload.montoPenalizacion}</b> al vendedor <b>${payload.vendedorNombre}</b> por la N.E. N° <b>${payload.nroTransaccion}</b>. Motivo: ${payload.motivo || 'Sin especificar'}.`;
            await sendEmail(admin.email, `Penalización Registrada - Vendedor ${payload.vendedorNombre}`, bodyAdmin);
          }
        }
        break;
      }

      default:
        throw new Error(`Tipo de notificación no soportado: ${type}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Error en send-notification:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})