import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

def send_welcome_email(to_email: str, name: str):
    if settings.smtp_user == "TUCORREO@gmail.com":
        logging.warning("SMTP not configured. Skipping welcome email.")
        return

    subject = "¡Bienvenido/a a EstacionU+!"

    html_content = """
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="background-color: #f8fafc; padding: 20px 10px;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; margin: 0 auto; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td align="center" style="background-color: #fdfbf7; padding: 40px 20px; border-bottom: 1px solid #f1f5f9;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #eff6ff; border: 2px solid #3b82f6; text-align: center; line-height: 50px; color: #3b82f6; font-size: 24px;">&#128100;</div>
                  </td>
                  <td width="30" align="center" valign="middle">
                    <div style="border-top: 2px dashed #bfdbfe; width: 20px;"></div>
                  </td>
                  <td align="center" valign="middle">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #ffffff; border: 2px solid #e2e8f0; text-align: center; line-height: 50px; color: #64748b; font-size: 24px;">&#128101;</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 20px 20px 20px; text-align: center;">
              <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">
                &#161;Bienvenido a <a href="https://estacionu.com" target="_blank" style="color: #3b82f6; text-decoration: none;">EstacionU</a>,<br>{name}!
              </h1>
              <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin: 0 0 30px 0; padding: 0 10px;">
                Nos emociona que te unas a nuestra comunidad. Estamos listos para acompa&#241;arte en tu crecimiento profesional y conectarte con los mejores mentores.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #3b82f6; border-radius: 10px;">
                    <a href="https://estacionu.com/login" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, sans-serif; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 10px;">
                      Empezar a explorar &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 20px 25px 20px;">
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  &#191;Necesitas ayuda? <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: bold;">Centro de Ayuda</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
        <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding: 15px;">
              <p style="color: #cbd5e1; font-size: 11px; margin: 0; text-align: center;">
                &copy; 2026 EstacionU+. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
    """.replace("{name}", name)

    msg = MIMEMultipart()
    msg['From'] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))

    try:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        logging.info(f"Welcome email successfully sent to {to_email}")
    except Exception as e:
        logging.error(f"Failed to send email to {to_email}: {e}")


def send_forgot_password_email(to_email: str, name: str, reset_link: str = "https://estacionu.com/login"):
    if settings.smtp_user == "TUCORREO@gmail.com":
        logging.warning("SMTP not configured. Skipping forgot password email.")
        return

    subject = "Recuperación de Contraseña - EstacionU+"

    html_content = """
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="background-color: #f8fafc; padding: 20px 10px;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; margin: 0 auto; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td align="center" style="background-color: #fdfbf7; padding: 40px 20px; border-bottom: 1px solid #f1f5f9;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #eff6ff; border: 2px solid #3b82f6; text-align: center; line-height: 50px; color: #3b82f6; font-size: 24px;">&#128100;</div>
                  </td>
                  <td width="30" align="center" valign="middle">
                    <div style="border-top: 2px dashed #bfdbfe; width: 20px;"></div>
                  </td>
                  <td align="center" valign="middle">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #ffffff; border: 2px solid #e2e8f0; text-align: center; line-height: 50px; color: #64748b; font-size: 24px;">&#128274;</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 20px 20px 20px; text-align: center;">
              <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">
                Recupera tu acceso,<br>{name}
              </h1>
              <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin: 0 0 30px 0; padding: 0 10px;">
                Hemos recibido una solicitud para restablecer la contrase&#241;a de tu cuenta en EstacionU+. Si no fuiste t&#250;, puedes ignorar este correo de forma segura.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #0f172a; border-radius: 10px;">
                    <a href="{reset_link}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, sans-serif; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 10px;">
                      Restablecer Contrase&#241;a &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 25px 0 0 0; padding: 0 10px;">
                Este enlace expira en 24 horas.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 20px 25px 20px;">
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  &#191;Necesitas ayuda? <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: bold;">Centro de Ayuda</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
        <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding: 15px;">
              <p style="color: #cbd5e1; font-size: 11px; margin: 0; text-align: center;">
                &copy; 2026 EstacionU+. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
    """.replace("{name}", name).replace("{reset_link}", reset_link)

    msg = MIMEMultipart()
    msg['From'] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))

    try:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        logging.info(f"Forgot password email successfully sent to {to_email}")
    except Exception as e:
        logging.error(f"Failed to send email to {to_email}: {e}")


def send_new_coffee_chat_email(to_email: str, mentor_name: str, student_name: str, date_str: str, time_str: str, tema: str, mensaje: str = ""):
    if settings.smtp_user == "TUCORREO@gmail.com":
        logging.warning("SMTP not configured. Skipping coffee chat email.")
        return

    subject = f"Nueva solicitud de Coffee Chat - {student_name}"

    tema_map = {
        "cv": "Revisi&#243;n de CV / Portfolio",
        "career": "Orientaci&#243;n de Carrera",
        "skills": "Desarrollo de Habilidades",
        "networking": "Networking Estrat&#233;gico",
        "industry": "Insight del Sector Industrial"
    }
    tema_display = tema_map.get(tema, tema)

    mensaje_row = ""
    if mensaje and mensaje.strip():
        mensaje_row = f"""
            <tr>
              <td style="padding: 10px 20px; border-top: 1px solid #f1f5f9;">
                <p style="margin:0;font-size:14px;color:#334155;">
                  &#128172; <strong>Mensaje:</strong> <em style="color:#475569;">{mensaje}</em>
                </p>
              </td>
            </tr>"""

    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="background-color:#f8fafc;padding:30px 10px;">
    <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background-color:#ffffff;border-radius:20px;margin:0 auto;overflow:hidden;border:1px solid #e2e8f0;">

      <tr>
        <td align="center" style="background-color:#fdfbf7;padding:36px 20px 28px 20px;border-bottom:1px solid #f1f5f9;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" valign="middle">
                <div style="width:56px;height:56px;border-radius:50%;background-color:#ffffff;border:2px solid #3b82f6;text-align:center;line-height:56px;font-size:26px;">&#128075;</div>
              </td>
              <td width="40" align="center" valign="middle">
                <div style="border-top:2px dashed #bfdbfe;width:30px;"></div>
              </td>
              <td align="center" valign="middle">
                <div style="width:56px;height:56px;border-radius:50%;background-color:#ffffff;border:2px solid #e2e8f0;text-align:center;line-height:56px;font-size:26px;">&#9749;</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:32px 28px 8px 28px;text-align:center;">
          <h1 style="color:#0f172a;font-size:26px;font-weight:700;margin:0 0 16px 0;">Hola, {mentor_name}</h1>
          <p style="font-size:15px;line-height:1.65;margin:0 0 28px 0;">
            <strong style="color:#3b82f6;">{student_name}</strong>
            <span style="color:#64748b;"> ha solicitado tener un Coffee Chat contigo. Revisa los detalles de la solicitud y decide si deseas aceptarla desde tu panel.</span>
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:0 28px 28px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;">
            <tr>
              <td style="padding:14px 20px;">
                <p style="margin:0;font-size:14px;color:#334155;">&#128197; <strong>Fecha:</strong> <span style="color:#3b82f6;">{date_str}</span></p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 20px;border-top:1px solid #f1f5f9;">
                <p style="margin:0;font-size:14px;color:#334155;">&#9200; <strong>Hora:</strong> {time_str}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 20px;border-top:1px solid #f1f5f9;">
                <p style="margin:0;font-size:14px;color:#334155;">&#128161; <strong>Tema:</strong> {tema_display}</p>
              </td>
            </tr>{mensaje_row}
          </table>
        </td>
      </tr>

      <tr>
        <td align="center" style="padding:0 28px 32px 28px;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="background-color:#3b82f6;border-radius:12px;">
                <a href="https://estacionu.com/sesiones" target="_blank"
                   style="display:inline-block;padding:15px 36px;font-family:-apple-system,sans-serif;font-size:15px;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;">
                  Gestionar Solicitud &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td align="center" style="padding:0 20px 24px 20px;">
          <p style="color:#94a3b8;font-size:13px;margin:0;">
            &#191;Necesitas ayuda? <a href="#" style="color:#3b82f6;text-decoration:none;font-weight:600;">Centro de Ayuda</a>
          </p>
        </td>
      </tr>

    </table>

    <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;">
      <tr>
        <td align="center" style="padding:16px;">
          <p style="color:#cbd5e1;font-size:11px;margin:0;">&copy; 2026 Estaci&#243;nU+. Todos los derechos reservados.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>"""

    msg = MIMEMultipart()
    msg['From'] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))

    try:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        logging.info(f"Coffee chat request email successfully sent to {to_email}")
    except Exception as e:
        logging.error(f"Failed to send email to {to_email}: {e}")

def send_destacado_notification_email(admin_email: str, mentor_name: str, mentor_email: str):
    if settings.smtp_user == "TUCORREO@gmail.com":
        logging.warning("SMTP not configured. Skipping destacado notification email.")
        return

    subject = f"Nueva Solicitud de Mentor Destacado: {mentor_name}"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="background-color: #f8fafc; padding: 20px 10px;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; margin: 0 auto; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td align="center" style="background-color: #fdfbf7; padding: 40px 20px; border-bottom: 1px solid #f1f5f9;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #fef3c7; border: 2px solid #f59e0b; text-align: center; line-height: 50px; color: #f59e0b; font-size: 24px;">&#11088;</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 20px 20px 20px; text-align: center;">
              <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">
                Nueva Solicitud Recibida
              </h1>
              <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin: 0 0 30px 0; padding: 0 10px;">
                El mentor <strong>{mentor_name}</strong> ({mentor_email}) ha enviado una solicitud para convertirse en Mentor Destacado. Ingresa al panel de administración para revisar y aprobar su perfil.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #f59e0b; border-radius: 10px;">
                    <a href="https://estacionu.com/admin/dashboard" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, sans-serif; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 10px;">
                      Ir al Panel de Administración &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 20px 25px 20px;">
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  EstacionU+ Sistema de Notificaciones
                </p>
              </div>
            </td>
          </tr>
        </table>
        <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding: 15px;">
              <p style="color: #cbd5e1; font-size: 11px; margin: 0; text-align: center;">
                &copy; 2026 EstacionU+. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg['To'] = admin_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))

    try:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        logging.info(f"Destacado notification email successfully sent to {admin_email}")
    except Exception as e:
        logging.error(f"Failed to send email to {admin_email}: {e}")

def send_destacado_confirmation_email(to_email: str, name: str):
    if settings.smtp_user == "TUCORREO@gmail.com":
        logging.warning("SMTP not configured. Skipping destacado confirmation email.")
        return

    subject = "¡Hemos recibido tu solicitud de Mentor Destacado!"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="background-color: #f8fafc; padding: 20px 10px;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; margin: 0 auto; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td align="center" style="background-color: #fdfbf7; padding: 40px 20px; border-bottom: 1px solid #f1f5f9;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #eff6ff; border: 2px solid #3b82f6; text-align: center; line-height: 50px; color: #3b82f6; font-size: 24px;">&#11088;</div>
                  </td>
                  <td width="30" align="center" valign="middle">
                    <div style="border-top: 2px dashed #bfdbfe; width: 20px;"></div>
                  </td>
                  <td align="center" valign="middle">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #ffffff; border: 2px solid #e2e8f0; text-align: center; line-height: 50px; color: #64748b; font-size: 24px;">&#128228;</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 20px 20px 20px; text-align: center;">
              <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">
                Solicitud Recibida,<br>{name}!
              </h1>
              <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin: 0 0 30px 0; padding: 0 10px;">
                Te confirmamos que hemos recibido exitosamente tu solicitud para ser <strong>Mentor Destacado</strong>. Nuestro equipo administrativo revisará tu perfil en las próximas 24 a 72 horas.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #3b82f6; border-radius: 10px;">
                    <a href="https://estacionu.com/login" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, sans-serif; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 10px;">
                      Ir a mi Panel &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 20px 25px 20px;">
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  EstacionU+ Sistema de Notificaciones
                </p>
              </div>
            </td>
          </tr>
        </table>
        <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding: 15px;">
              <p style="color: #cbd5e1; font-size: 11px; margin: 0; text-align: center;">
                &copy; 2026 EstacionU+. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
    """.replace("{name}", name)

    msg = MIMEMultipart()
    msg['From'] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))

    try:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        logging.info(f"Destacado confirmation email successfully sent to {to_email}")
    except Exception as e:
        logging.error(f"Failed to send email to {to_email}: {e}")

def send_destacado_approved_email(to_email: str, name: str):
    if settings.smtp_user == "TUCORREO@gmail.com":
        logging.warning("SMTP not configured. Skipping destacado approved email.")
        return

    subject = "¡Felicidades! Ahora eres Mentor Destacado"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="background-color: #f8fafc; padding: 20px 10px;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; margin: 0 auto; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td align="center" style="background-color: #fdfbf7; padding: 40px 20px; border-bottom: 1px solid #f1f5f9;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #d1fae5; border: 2px solid #10b981; text-align: center; line-height: 50px; color: #10b981; font-size: 24px;">&#10004;&#65039;</div>
                  </td>
                  <td width="30" align="center" valign="middle">
                    <div style="border-top: 2px dashed #a7f3d0; width: 20px;"></div>
                  </td>
                  <td align="center" valign="middle">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #ffffff; border: 2px solid #e2e8f0; text-align: center; line-height: 50px; color: #10b981; font-size: 24px;">&#11088;</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 20px 20px 20px; text-align: center;">
              <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">
                ¡Aprobado,<br>{name}!
              </h1>
              <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin: 0 0 30px 0; padding: 0 10px;">
                ¡Excelentes noticias! El equipo de EstacionU+ ha revisado y <strong>aprobado</strong> tu perfil. Ahora apareces oficialmente en la galería como <strong>Mentor Destacado</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #10b981; border-radius: 10px;">
                    <a href="https://estacionu.com/login" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, sans-serif; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 10px;">
                      Ir a mi Panel &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 25px 0 0 0; padding: 0 10px;">
                Prepárate para recibir nuevas solicitudes de estudiantes y egresados.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 20px 25px 20px;">
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  EstacionU+ Sistema de Notificaciones
                </p>
              </div>
            </td>
          </tr>
        </table>
        <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding: 15px;">
              <p style="color: #cbd5e1; font-size: 11px; margin: 0; text-align: center;">
                &copy; 2026 EstacionU+. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
    """.replace("{name}", name)

    msg = MIMEMultipart()
    msg['From'] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))

    try:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        logging.info(f"Destacado approved email successfully sent to {to_email}")
    except Exception as e:
        logging.error(f"Failed to send email to {to_email}: {e}")

def send_destacado_rejected_email(to_email: str, name: str, notas_admin: str = None):
    if settings.smtp_user == "TUCORREO@gmail.com":
        logging.warning("SMTP not configured. Skipping destacado rejected email.")
        return

    subject = "Actualización sobre tu solicitud de Mentor Destacado"

    notas_html = ""
    if notas_admin and notas_admin.strip():
        notas_html = f"""
        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; text-align: left; margin-top: 20px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: bold;">Nota del equipo:</p>
          <p style="margin: 5px 0 0 0; color: #7f1d1d; font-size: 14px; font-style: italic;">"{notas_admin}"</p>
        </div>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="background-color: #f8fafc; padding: 20px 10px;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; margin: 0 auto; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td align="center" style="background-color: #fdfbf7; padding: 40px 20px; border-bottom: 1px solid #f1f5f9;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" valign="middle">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #fee2e2; border: 2px solid #ef4444; text-align: center; line-height: 50px; color: #ef4444; font-size: 24px;">&#10060;</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 20px 20px 20px; text-align: center;">
              <h1 style="color: #0f172a; font-size: 24px; font-weight: bold; margin: 0 0 10px 0;">
                Hola {name},
              </h1>
              <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin: 0 0 20px 0; padding: 0 10px;">
                Gracias por tu interés en formar parte de los Mentores Destacados de EstacionU+. Tras revisar detalladamente tu perfil, lamentamos informarte que en esta ocasión <strong>no hemos podido aprobar tu solicitud.</strong>
              </p>
              {notas_html}
              <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin: 25px 0 30px 0; padding: 0 10px;">
                Te invitamos a mejorar tu perfil y experiencia. Estaremos encantados de recibir una nueva solicitud en el futuro cuando tu perfil cumpla con todos los requisitos o recomendaciones.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: #3b82f6; border-radius: 10px;">
                    <a href="https://estacionu.com/login" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, sans-serif; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 10px;">
                      Ir a mi Panel &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 20px 25px 20px;">
              <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                  EstacionU+ Sistema de Notificaciones
                </p>
              </div>
            </td>
          </tr>
        </table>
        <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding: 15px;">
              <p style="color: #cbd5e1; font-size: 11px; margin: 0; text-align: center;">
                &copy; 2026 EstacionU+. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))

    try:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        logging.info(f"Destacado rejected email successfully sent to {to_email}")
    except Exception as e:
        logging.error(f"Failed to send email to {to_email}: {e}")


def send_reminder_email(to_email: str, name: str, other_name: str, date_str: str, time_str: str, tema: str, is_mentor: bool = False):
    if settings.smtp_user == "TUCORREO@gmail.com":
        logging.warning("SMTP not configured. Skipping reminder email.")
        return

    role_label = "tu estudiante" if is_mentor else "tu mentor"
    subject = f"⏰ Recordatorio: Tu Coffee Chat es pronto - {date_str}"

    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="background-color:#f8fafc;padding:30px 10px;">
    <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background-color:#ffffff;border-radius:20px;margin:0 auto;overflow:hidden;border:1px solid #e2e8f0;">

      <tr>
        <td align="center" style="background-color:#fdfbf7;padding:36px 20px 28px 20px;border-bottom:1px solid #f1f5f9;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" valign="middle">
                <div style="width:56px;height:56px;border-radius:50%;background-color:#fef3c7;border:2px solid #f59e0b;text-align:center;line-height:56px;font-size:26px;">&#9200;</div>
              </td>
              <td width="40" align="center" valign="middle">
                <div style="border-top:2px dashed #fde68a;width:30px;"></div>
              </td>
              <td align="center" valign="middle">
                <div style="width:56px;height:56px;border-radius:50%;background-color:#ffffff;border:2px solid #e2e8f0;text-align:center;line-height:56px;font-size:26px;">&#9749;</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:32px 28px 8px 28px;text-align:center;">
          <h1 style="color:#0f172a;font-size:26px;font-weight:700;margin:0 0 16px 0;">&#161;Tu Coffee Chat es pronto!</h1>
          <p style="font-size:15px;line-height:1.65;margin:0 0 28px 0;">
            <span style="color:#64748b;">Hola </span>
            <strong style="color:#0f172a;">{name}</strong><span style="color:#64748b;">,
            te recordamos que tienes un Coffee Chat programado con </span>
            <strong style="color:#3b82f6;">{other_name}</strong>
            <span style="color:#64748b;">. &#161;Prep&#225;rate para una gran sesi&#243;n!</span>
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:0 28px 28px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;">
            <tr>
              <td style="padding:14px 20px;">
                <p style="margin:0;font-size:14px;color:#334155;">&#128197; <strong>Fecha:</strong> <span style="color:#3b82f6;">{date_str}</span></p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 20px;border-top:1px solid #f1f5f9;">
                <p style="margin:0;font-size:14px;color:#334155;">&#9200; <strong>Hora:</strong> {time_str}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 20px;border-top:1px solid #f1f5f9;">
                <p style="margin:0;font-size:14px;color:#334155;">&#128161; <strong>Tema:</strong> {tema}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td align="center" style="padding:0 28px 32px 28px;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="background-color:#f59e0b;border-radius:12px;">
                <a href="https://estacionu.com/sesiones" target="_blank"
                   style="display:inline-block;padding:15px 36px;font-family:-apple-system,sans-serif;font-size:15px;color:#ffffff;text-decoration:none;font-weight:700;border-radius:12px;">
                  Ver mis Sesiones &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td align="center" style="padding:0 20px 24px 20px;">
          <p style="color:#94a3b8;font-size:13px;margin:0;">
            &#191;Necesitas ayuda? <a href="#" style="color:#3b82f6;text-decoration:none;font-weight:600;">Centro de Ayuda</a>
          </p>
        </td>
      </tr>

    </table>

    <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;">
      <tr>
        <td align="center" style="padding:16px;">
          <p style="color:#cbd5e1;font-size:11px;margin:0;">&copy; 2026 Estaci&#243;nU+. Todos los derechos reservados.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>"""

    msg = MIMEMultipart()
    msg['From'] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))

    try:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        logging.info(f"Reminder email successfully sent to {to_email}")
    except Exception as e:
        logging.error(f"Failed to send reminder email to {to_email}: {e}")
