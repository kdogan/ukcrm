const nodemailer = require('nodemailer');

// Email-Transporter konfigurieren
const createTransporter = () => {
  // Für Entwicklung: Ethereal Email (Test-Account)
  // Für Produktion: Echten SMTP-Server verwenden
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Für Development: Console-Logger
    return {
      sendMail: async (mailOptions) => {
        console.log('\n=== EMAIL SENT (Development Mode) ===');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('HTML:', mailOptions.html);
        console.log('=====================================\n');
        return { messageId: 'dev-' + Date.now() };
      }
    };
  }
};

// E-Mail-Verifizierungs-E-Mail senden
exports.sendVerificationEmail = async (email, firstName, verificationToken) => {
  const transporter = createTransporter();

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@berater-app.com',
    to: email,
    subject: 'Bestätigen Sie Ihre E-Mail-Adresse',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Willkommen bei Berater App!</h1>
        </div>
        <div class="content">
          <p>Hallo ${firstName},</p>

          <p>vielen Dank für Ihre Registrierung bei Berater App!</p>

          <p>Um Ihre E-Mail-Adresse zu bestätigen und Ihr Konto zu aktivieren, klicken Sie bitte auf den folgenden Button:</p>

          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">E-Mail-Adresse bestätigen</a>
          </div>

          <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
          <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
            ${verificationUrl}
          </p>

          <p><strong>Wichtig:</strong> Dieser Link ist 24 Stunden gültig.</p>

          <p>Wenn Sie sich nicht registriert haben, ignorieren Sie bitte diese E-Mail.</p>

          <p>Mit freundlichen Grüßen,<br>
          Ihr Berater App Team</p>
        </div>
        <div class="footer">
          <p>Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht darauf.</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Passwort-Reset-E-Mail senden (für zukünftige Verwendung)
exports.sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const transporter = createTransporter();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@berater-app.com',
    to: email,
    subject: 'Passwort zurücksetzen',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Passwort zurücksetzen</h1>
        </div>
        <div class="content">
          <p>Hallo ${firstName},</p>

          <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>

          <p>Klicken Sie auf den folgenden Button, um ein neues Passwort festzulegen:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Neues Passwort festlegen</a>
          </div>

          <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
          <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>

          <div class="warning">
            <strong>Wichtig:</strong> Dieser Link ist nur 1 Stunde gültig.
          </div>

          <p>Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie bitte diese E-Mail. Ihr Passwort bleibt unverändert.</p>

          <p>Mit freundlichen Grüßen,<br>
          Ihr Berater App Team</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
