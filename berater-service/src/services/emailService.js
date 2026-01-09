const nodemailer = require('nodemailer');

// Mehrsprachige E-Mail-Texte
const emailTranslations = {
  verification: {
    de: {
      subject: 'Bestätigen Sie Ihre E-Mail-Adresse',
      headerTitle: 'Willkommen bei Berater App!',
      greeting: (name) => `Hallo ${name},`,
      welcomeText: 'vielen Dank für Ihre Registrierung bei Berater App!',
      actionText: 'Um Ihre E-Mail-Adresse zu bestätigen und Ihr Konto zu aktivieren, klicken Sie bitte auf den folgenden Button:',
      buttonText: 'E-Mail-Adresse bestätigen',
      copyLinkText: 'Oder kopieren Sie diesen Link in Ihren Browser:',
      validityText: 'Dieser Link ist 24 Stunden gültig.',
      ignoreText: 'Wenn Sie sich nicht registriert haben, ignorieren Sie bitte diese E-Mail.',
      regards: 'Mit freundlichen Grüßen,',
      teamName: 'Ihr Berater App Team',
      footerText: 'Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht darauf.'
    },
    tr: {
      subject: 'E-posta adresinizi onaylayın',
      headerTitle: 'Danışman App\'e Hoş Geldiniz!',
      greeting: (name) => `Merhaba ${name},`,
      welcomeText: 'Danışman App\'e kaydolduğunuz için teşekkür ederiz!',
      actionText: 'E-posta adresinizi onaylamak ve hesabınızı etkinleştirmek için lütfen aşağıdaki düğmeye tıklayın:',
      buttonText: 'E-posta adresini onayla',
      copyLinkText: 'Veya bu linki tarayıcınıza kopyalayın:',
      validityText: 'Bu link 24 saat geçerlidir.',
      ignoreText: 'Eğer kayıt olmadıysanız, lütfen bu e-postayı dikkate almayın.',
      regards: 'Saygılarımızla,',
      teamName: 'Danışman App Ekibi',
      footerText: 'Bu otomatik olarak oluşturulmuş bir e-postadır. Lütfen yanıtlamayın.'
    }
  },
  passwordReset: {
    de: {
      subject: 'Passwort zurücksetzen',
      headerTitle: 'Passwort zurücksetzen',
      greeting: (name) => `Hallo ${name},`,
      requestText: 'Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.',
      actionText: 'Klicken Sie auf den folgenden Button, um ein neues Passwort festzulegen:',
      buttonText: 'Neues Passwort festlegen',
      copyLinkText: 'Oder kopieren Sie diesen Link in Ihren Browser:',
      validityText: 'Dieser Link ist nur 1 Stunde gültig.',
      ignoreText: 'Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie bitte diese E-Mail. Ihr Passwort bleibt unverändert.',
      regards: 'Mit freundlichen Grüßen,',
      teamName: 'Ihr Berater App Team'
    },
    tr: {
      subject: 'Şifre sıfırlama',
      headerTitle: 'Şifre Sıfırlama',
      greeting: (name) => `Merhaba ${name},`,
      requestText: 'Şifrenizi sıfırlamak için bir talep aldık.',
      actionText: 'Yeni bir şifre belirlemek için aşağıdaki düğmeye tıklayın:',
      buttonText: 'Yeni şifre belirle',
      copyLinkText: 'Veya bu linki tarayıcınıza kopyalayın:',
      validityText: 'Bu link yalnızca 1 saat geçerlidir.',
      ignoreText: 'Bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın. Şifreniz değişmeden kalacaktır.',
      regards: 'Saygılarımızla,',
      teamName: 'Danışman App Ekibi'
    }
  }
};

// Email-Transporter konfigurieren
const createTransporter = () => {
  // Prüfe ob Email-Konfiguration vorhanden ist
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('✓ Using SMTP server:', process.env.EMAIL_HOST);
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Für Development ohne SMTP: Console-Logger
    console.log('⚠ No SMTP configured - emails will be logged to console');
    return {
      sendMail: async (mailOptions) => {
        console.log('\n=== EMAIL SENT (Development Mode - No SMTP) ===');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('\n--- Link ---');
        // Extrahiere den Link aus der HTML
        const linkMatch = mailOptions.html.match(/href="([^"]+)"/);
        if (linkMatch) {
          console.log('URL:', linkMatch[1]);
        }
        console.log('=====================================\n');
        return { messageId: 'dev-' + Date.now() };
      }
    };
  }
};

// E-Mail-Verifizierungs-E-Mail senden
exports.sendVerificationEmail = async (email, firstName, verificationToken, language = 'de') => {
  const transporter = createTransporter();

  // Sprache validieren, Fallback auf Deutsch
  const lang = ['de', 'tr'].includes(language) ? language : 'de';
  const t = emailTranslations.verification[lang];

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@berater-app.com',
    to: email,
    subject: t.subject,
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
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
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
            background: #11998e;
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
          <h1>${t.headerTitle}</h1>
        </div>
        <div class="content">
          <p>${t.greeting(firstName)}</p>

          <p>${t.welcomeText}</p>

          <p>${t.actionText}</p>

          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">${t.buttonText}</a>
          </div>

          <p>${t.copyLinkText}</p>
          <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
            ${verificationUrl}
          </p>

          <p><strong>${lang === 'de' ? 'Wichtig:' : 'Önemli:'}</strong> ${t.validityText}</p>

          <p>${t.ignoreText}</p>

          <p>${t.regards}<br>
          ${t.teamName}</p>
        </div>
        <div class="footer">
          <p>${t.footerText}</p>
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

// Passwort-Reset-E-Mail senden
exports.sendPasswordResetEmail = async (email, firstName, resetToken, language = 'de') => {
  const transporter = createTransporter();

  // Sprache validieren, Fallback auf Deutsch
  const lang = ['de', 'tr'].includes(language) ? language : 'de';
  const t = emailTranslations.passwordReset[lang];

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@berater-app.com',
    to: email,
    subject: t.subject,
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
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
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
            background: #11998e;
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
          <h1>${t.headerTitle}</h1>
        </div>
        <div class="content">
          <p>${t.greeting(firstName)}</p>

          <p>${t.requestText}</p>

          <p>${t.actionText}</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">${t.buttonText}</a>
          </div>

          <p>${t.copyLinkText}</p>
          <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>

          <div class="warning">
            <strong>${lang === 'de' ? 'Wichtig:' : 'Önemli:'}</strong> ${t.validityText}
          </div>

          <p>${t.ignoreText}</p>

          <p>${t.regards}<br>
          ${t.teamName}</p>
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

// Paket-Ablauf-Erinnerungs-E-Mail senden
exports.sendPackageExpirationReminder = async (user, daysUntilExpiry) => {
  const transporter = createTransporter();

  const packageDisplayName = {
    basic: 'Basic',
    professional: 'Professional',
    enterprise: 'Enterprise'
  }[user.package] || user.package;

  const expirationDate = user.subscription?.endDate
    ? new Date(user.subscription.endDate).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : 'Unbekannt';

  const billingIntervalText = user.subscription?.billingInterval === 'yearly' ? 'jährlich' : 'monatlich';

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@berater-app.com',
    to: user.email,
    subject: `⚠️ Ihr ${packageDisplayName}-Paket läuft in ${daysUntilExpiry} Tagen ab`,
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
          .info-box {
            background: white;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            min-width: 150px;
            color: #667eea;
          }
          .info-value {
            flex: 1;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .urgent {
            background: #ffe0e0;
            border-left: 4px solid #ef4444;
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
          <h1>📦 Paket-Ablauf-Erinnerung</h1>
        </div>
        <div class="content">
          <p>Hallo ${user.firstName},</p>

          <div class="${daysUntilExpiry <= 7 ? 'warning urgent' : 'warning'}">
            <strong>Ihr ${packageDisplayName}-Paket läuft in ${daysUntilExpiry} Tagen ab!</strong>
          </div>

          <div class="info-box">
            <div class="info-row">
              <div class="info-label">Aktuelles Paket:</div>
              <div class="info-value">${packageDisplayName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Zahlungsintervall:</div>
              <div class="info-value">${billingIntervalText}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Ablaufdatum:</div>
              <div class="info-value">${expirationDate}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Verbleibende Tage:</div>
              <div class="info-value" style="color: ${daysUntilExpiry <= 7 ? '#ef4444' : '#f59e0b'}; font-weight: bold;">
                ${daysUntilExpiry} Tage
              </div>
            </div>
          </div>

          <p>⚠️ <strong>Hinweis:</strong> Nach Ablauf Ihres Pakets werden Sie automatisch auf das kostenlose Paket zurückgestuft. Bitte erneuern Sie Ihr Paket rechtzeitig, um eine Einschränkung Ihrer Funktionen zu vermeiden.</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/settings" class="button">Paket verwalten</a>
          </div>

          <p>Bei Fragen oder Unterstützung kontaktieren Sie uns gerne über den Support-Bereich.</p>

          <p>Mit freundlichen Grüßen,<br>
          Ihr Berater App Team</p>
        </div>
        <div class="footer">
          <p>Dies ist eine automatisch generierte E-Mail.</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Package expiration reminder email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending package expiration reminder email:', error);
    throw error;
  }
};

// Paket-Kauf-Bestätigung senden
exports.sendPackagePurchaseConfirmation = async (user, packageInfo, subscriptionDetails) => {
  const transporter = createTransporter();

  const packageDisplayName = packageInfo.displayName || packageInfo.name;
  const billingIntervalText = subscriptionDetails.billingInterval === 'yearly' ? 'Jährlich' : 'Monatlich';

  const startDate = new Date(subscriptionDetails.startDate).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const endDate = new Date(subscriptionDetails.endDate).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@berater-app.com',
    to: user.email,
    subject: `✅ Ihr ${packageDisplayName}-Paket wurde erfolgreich aktiviert`,
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
            background: linear-gradient(135deg, #34d399 0%, #059669 100%);
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
          .success-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .info-box {
            background: white;
            border: 2px solid #34d399;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            min-width: 180px;
            color: #059669;
          }
          .info-value {
            flex: 1;
          }
          .price-highlight {
            background: #ecfdf5;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
          }
          .price {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: #059669;
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
          <div class="success-icon">✅</div>
          <h1>Paket erfolgreich aktiviert!</h1>
        </div>
        <div class="content">
          <p>Hallo ${user.firstName},</p>

          <p>vielen Dank für Ihren Kauf! Ihr <strong>${packageDisplayName}</strong>-Paket wurde erfolgreich aktiviert.</p>

          <div class="info-box">
            <div class="info-row">
              <div class="info-label">Paket:</div>
              <div class="info-value"><strong>${packageDisplayName}</strong></div>
            </div>
            <div class="info-row">
              <div class="info-label">Zahlungsintervall:</div>
              <div class="info-value">${billingIntervalText}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Aktiviert am:</div>
              <div class="info-value">${startDate}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Gültig bis:</div>
              <div class="info-value">${endDate}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Max. Verträge:</div>
              <div class="info-value">${packageInfo.maxContracts === -1 ? 'Unbegrenzt' : packageInfo.maxContracts}</div>
            </div>
          </div>

          <div class="price-highlight">
            <div>Bezahlter Betrag</div>
            <div class="price">${subscriptionDetails.price.toFixed(2)} ${packageInfo.currency || 'EUR'}</div>
            ${subscriptionDetails.savings > 0 ? `<div style="color: #059669; margin-top: 5px;">Sie sparen ${subscriptionDetails.savings.toFixed(2)} ${packageInfo.currency || 'EUR'} pro Jahr!</div>` : ''}
          </div>

          <p><strong>Was Sie jetzt tun können:</strong></p>
          <ul>
            <li>Nutzen Sie alle Funktionen Ihres neuen Pakets</li>
            <li>Verwalten Sie Ihr Paket in den Einstellungen</li>
            <li>Bei Fragen kontaktieren Sie uns über den Support</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/settings" class="button">Zu den Einstellungen</a>
          </div>

          <p>Vielen Dank, dass Sie uns vertrauen!</p>

          <p>Mit freundlichen Grüßen,<br>
          Ihr Berater App Team</p>
        </div>
        <div class="footer">
          <p>Dies ist eine automatisch generierte Bestätigungs-E-Mail.</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Package purchase confirmation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending package purchase confirmation email:', error);
    throw error;
  }
};

// Paket-Downgrade-Benachrichtigung senden
exports.sendPackageDowngradeNotification = async (user, oldPackage) => {
  const transporter = createTransporter();

  const oldPackageDisplayName = {
    basic: 'Basic',
    professional: 'Professional',
    enterprise: 'Enterprise'
  }[oldPackage] || oldPackage;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@berater-app.com',
    to: user.email,
    subject: `⚠️ Ihr ${oldPackageDisplayName}-Paket ist abgelaufen`,
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
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
          .warning-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .info-box {
            background: white;
            border: 2px solid #ef4444;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            min-width: 180px;
            color: #ef4444;
          }
          .info-value {
            flex: 1;
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
          <div class="warning-icon">⚠️</div>
          <h1>Paket abgelaufen</h1>
        </div>
        <div class="content">
          <p>Hallo ${user.firstName},</p>

          <p>Ihr <strong>${oldPackageDisplayName}</strong>-Paket ist abgelaufen und wurde auf das <strong>Kostenlose Paket</strong> zurückgestuft.</p>

          <div class="info-box">
            <div class="info-row">
              <div class="info-label">Vorheriges Paket:</div>
              <div class="info-value">${oldPackageDisplayName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Aktuelles Paket:</div>
              <div class="info-value">Kostenlos</div>
            </div>
          </div>

          <p><strong>Was bedeutet das für Sie?</strong></p>
          <ul>
            <li>Ihre bestehenden Daten bleiben erhalten</li>
            <li>Es gelten nun die Limits des kostenlosen Pakets</li>
            <li>Einige Funktionen sind möglicherweise eingeschränkt</li>
          </ul>

          <p>Um wieder alle Funktionen nutzen zu können, können Sie jederzeit ein neues Paket erwerben.</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/settings" class="button">Paket erneuern</a>
          </div>

          <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>

          <p>Mit freundlichen Grüßen,<br>
          Ihr Berater App Team</p>
        </div>
        <div class="footer">
          <p>Dies ist eine automatisch generierte E-Mail.</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Package downgrade notification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending package downgrade notification email:', error);
    throw error;
  }
};

// Vertragsablauf-Erinnerungs-E-Mail senden
exports.sendContractExpirationReminder = async (berater, contract, daysUntilExpiry) => {
  const transporter = createTransporter();

  const customerName = contract.customerId
    ? `${contract.customerId.firstName} ${contract.customerId.lastName}`
    : 'Unbekannt';

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@berater-app.com',
    to: berater.email,
    subject: `Erinnerung: Vertrag ${contract.contractNumber} läuft in ${daysUntilExpiry} Tagen ab`,
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
          .info-box {
            background: white;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            min-width: 150px;
            color: #667eea;
          }
          .info-value {
            flex: 1;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .urgent {
            background: #ffe0e0;
            border-left: 4px solid #ef4444;
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
          <h1>⏰ Vertragsablauf-Erinnerung</h1>
        </div>
        <div class="content">
          <p>Hallo ${berater.firstName},</p>

          <p>dies ist eine automatische Erinnerung:</p>

          <div class="${daysUntilExpiry <= 30 ? 'warning urgent' : 'warning'}">
            <strong>Der folgende Vertrag läuft in ${daysUntilExpiry} Tagen ab!</strong>
          </div>

          <div class="info-box">
            <div class="info-row">
              <div class="info-label">Vertragsnummer:</div>
              <div class="info-value">${contract.contractNumber}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Kunde:</div>
              <div class="info-value">${customerName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Ablaufdatum:</div>
              <div class="info-value">${new Date(contract.endDate).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Verbleibende Tage:</div>
              <div class="info-value" style="color: ${daysUntilExpiry <= 30 ? '#ef4444' : '#f59e0b'}; font-weight: bold;">
                ${daysUntilExpiry} Tage
              </div>
            </div>
          </div>

          <p><strong>Nächste Schritte:</strong></p>
          <ul>
            <li>Kontaktieren Sie den Kunden bezüglich Vertragsverlängerung</li>
            <li>Prüfen Sie aktuelle Konditionen und Angebote</li>
            <li>Bereiten Sie ggf. die Kündigung vor</li>
            <li>Dokumentieren Sie alle Aktivitäten</li>
          </ul>

          <p style="margin-top: 30px;">
            Diese Erinnerung wurde automatisch erstellt. Ein entsprechendes TODO wurde in Ihrem System angelegt.
          </p>

          <p>Mit freundlichen Grüßen,<br>
          Ihr Berater App Team</p>
        </div>
        <div class="footer">
          <p>Dies ist eine automatisch generierte E-Mail. Sie können diese Erinnerungen in den Einstellungen deaktivieren.</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Contract expiration reminder email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending contract expiration reminder email:', error);
    throw error;
  }
};
