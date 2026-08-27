import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Cliente admin de Supabase (solo servidor, nunca exponer al cliente)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const resend = new Resend(process.env.RESEND_API_KEY);

function buildEmailHtml(confirmationUrl) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirmá tu cuenta — Polirubro Online</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 20px 20px 0 0; padding: 40px 40px 32px; text-align: center; border-bottom: 3px solid #FF9980;">
              <p style="margin:0 0 8px; font-size:13px; font-weight:700; letter-spacing:4px; text-transform:uppercase; color:#FF9980;">
                POLIRUBRO ONLINE
              </p>
              <h1 style="margin:0; font-size:32px; font-weight:900; color:#f8fafc; line-height:1.2;">
                Bienvenido/a a bordo
              </h1>
              <p style="margin:12px 0 0; font-size:16px; color:#94a3b8;">
                Tu cuenta esta a un clic de quedar lista.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#1e293b; padding: 40px;">
              <p style="margin:0 0 24px; font-size:16px; color:#cbd5e1; line-height:1.7;">
                Gracias por registrarte en <strong style="color:#f8fafc;">Polirubro Online.cba</strong>. 
                Para completar tu registro y poder acceder a todos nuestros productos, 
                necesitamos verificar tu direccion de correo electronico.
              </p>
              <div style="border-left: 3px solid #FF9980; padding-left: 16px; margin: 0 0 32px;">
                <p style="margin:0; font-size:14px; color:#94a3b8; line-height:1.6;">
                  Una vez confirmada tu cuenta vas a poder:<br/>
                  Ver el historial de tus pedidos<br/>
                  Guardar tus datos para comprar mas rapido<br/>
                  Acceder a promociones exclusivas
                </p>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="${confirmationUrl}" style="display:inline-block; background: linear-gradient(135deg, #FF9980, #ff7055); color:#0f172a; font-size:17px; font-weight:900; text-decoration:none; padding:18px 48px; border-radius:50px; letter-spacing:0.5px; box-shadow: 0 8px 24px rgba(255,153,128,0.35);">
                      Confirmar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px; font-size:13px; color:#64748b; text-align:center;">
                Si el boton no funciona, copia y pega este link en tu navegador:
              </p>
              <p style="margin:0; font-size:12px; color:#FF9980; word-break:break-all; text-align:center; background-color:#0f172a; padding:12px 16px; border-radius:8px;">
                ${confirmationUrl}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#1e293b; padding: 0 40px;">
              <div style="border-top: 1px solid #334155;"></div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#1e293b; border-radius: 0 0 20px 20px; padding: 24px 40px 32px; text-align:center;">
              <p style="margin:0 0 4px; font-size:14px; font-weight:700; color:#f8fafc;">
                Polirubro Online.cba
              </p>
              <p style="margin:0 0 16px; font-size:12px; color:#64748b;">
                Centro de operaciones - Cordoba Capital, Argentina
              </p>
              <p style="margin:0; font-size:11px; color:#475569; line-height:1.6;">
                Si no creaste esta cuenta, podes ignorar este email con total tranquilidad.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contrasena son requeridos.' },
        { status: 400 }
      );
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        redirectTo: process.env.NEXT_PUBLIC_SITE_URL,
      },
    });

    if (linkError) {
      if (linkError.message?.toLowerCase().includes('already registered') ||
          linkError.message?.toLowerCase().includes('already exists')) {
        return NextResponse.json(
          { error: 'Este correo ya tiene una cuenta registrada. Intenta iniciar sesion.' },
          { status: 409 }
        );
      }
      throw linkError;
    }

    const confirmationUrl = linkData?.properties?.action_link;

    if (!confirmationUrl) {
      throw new Error('No se pudo generar el link de confirmacion.');
    }

    const { error: emailError } = await resend.emails.send({
      from: 'Polirubro Online <onboarding@resend.dev>',
      to: [email],
      subject: 'Confirma tu cuenta en Polirubro Online',
      html: buildEmailHtml(confirmationUrl),
    });

    if (emailError) {
      await supabaseAdmin.auth.admin.deleteUser(linkData.user.id);
      throw emailError;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[/api/register] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Ocurrio un error. Intenta de nuevo mas tarde.' },
      { status: 500 }
    );
  }
}
