import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="privacy-container">
      <div class="privacy-content">
        <h1>Datenschutzerklärung</h1>

        <section>
          <h2>1. Verantwortlicher</h2>
          <p>
            Verantwortlich für die Datenverarbeitung im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
          </p>
          <p class="contact-info">
            Eskapp<br>
            Dorfstrass 37 <br>
            76571 Gaggenau<br>
            E-Mail: eskapp.dev&#64;gmail.com<br>

          </p>
        </section>

        <section>
          <h2>2. Erhebung und Speicherung personenbezogener Daten</h2>
          <h3>2.1 Welche Daten wir verarbeiten</h3>
          <p>
            Bei der Nutzung unserer Anwendung verarbeiten wir folgende personenbezogene Daten:
          </p>
          <ul>
            <li><strong>Registrierungsdaten:</strong> Vorname, Nachname, E-Mail-Adresse, Telefonnummer (optional)</li>
            <li><strong>Vertragsdaten:</strong> Kundendaten, Vertragsinformationen, Zählerdaten im Rahmen Ihrer Beratertätigkeit</li>
            <li><strong>Nutzungsdaten:</strong> Login-Zeitpunkte, Paketinformationen</li>
            <li><strong>Zahlungsdaten:</strong> Bei Paket-Upgrades werden Zahlungsinformationen über PayPal verarbeitet</li>
          </ul>

          <h3>2.2 Zweck der Datenverarbeitung</h3>
          <p>Wir verarbeiten Ihre Daten ausschließlich zu folgenden Zwecken:</p>
          <ul>
            <li>Bereitstellung und Verwaltung Ihres Benutzerkontos</li>
            <li>Ermöglichung der Nutzung unserer Berater-Software</li>
            <li>Verwaltung von Verträgen, Kunden und Zählern im Rahmen Ihrer Tätigkeit</li>
            <li>Abwicklung von Paket-Upgrades und Zahlungen</li>
            <li>Technischer Support bei Problemen</li>
          </ul>
        </section>

        <section>
          <h2>3. Rechtsgrundlage der Verarbeitung</h2>
          <p>Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage von:</p>
          <ul>
            <li><strong>Art. 6 Abs. 1 lit. b DSGVO</strong> – zur Erfüllung des Vertrages über die Nutzung unserer Software</li>
            <li><strong>Art. 6 Abs. 1 lit. f DSGVO</strong> – zur Wahrung unserer berechtigten Interessen an der ordnungsgemäßen Funktionalität und Sicherheit der Anwendung</li>
          </ul>
        </section>

        <section>
          <h2>4. Weitergabe von Daten</h2>
          <h3>4.1 Keine Weitergabe an Dritte</h3>
          <p>
            <strong>Wir geben Ihre personenbezogenen Daten grundsätzlich nicht an Dritte weiter.</strong>
            Ihre Daten werden ausschließlich für die Bereitstellung unserer Dienstleistung verwendet.
          </p>

          <h3>4.2 Ausnahme: Zahlungsabwicklung</h3>
          <p>
            Für die Abwicklung von Zahlungen bei Paket-Upgrades nutzen wir PayPal.
            Dabei werden notwendige Zahlungsinformationen an PayPal übermittelt.
            Die Datenverarbeitung durch PayPal erfolgt gemäß deren Datenschutzbestimmungen.
          </p>

          <h3>4.3 Hosting und technische Dienstleister</h3>
          <p>
            Zur Bereitstellung unserer Anwendung nutzen wir externe Hosting-Dienstleister.
            Ihre Daten werden auf Servern in der EU gespeichert. Wir haben mit diesen
            Dienstleistern Auftragsverarbeitungsverträge (AVV) gemäß Art. 28 DSGVO geschlossen,
            die sicherstellen, dass Ihre Daten nur nach unseren Weisungen verarbeitet werden.
          </p>
          <p>
            <strong>Wichtig:</strong> Als Berater speichern Sie Kundendaten (Namen, Verträge, Zählerdaten)
            in unserem System. Diese Daten werden ebenfalls auf den Servern unseres Hosting-Anbieters
            gespeichert. Die Verantwortung für die Rechtmäßigkeit der Verarbeitung dieser Kundendaten
            liegt bei Ihnen als Berater. Sie müssen sicherstellen, dass Sie eine rechtliche Grundlage
            für die Speicherung der Kundendaten haben (z.B. Einwilligung oder Vertragserfüllung).
          </p>

          <h3>4.4 Master-Berater / Slave-Berater Beziehung</h3>
          <p>
            Wenn Sie als Berater einem Master-Berater zugeordnet sind, kann dieser
            von ihm erstellte Schulungsmaterialien mit Ihnen teilen. Dabei werden keine
            zusätzlichen personenbezogenen Daten übermittelt.
          </p>
        </section>

        <section>
          <h2>5. Ihre Rolle als Berater und Auftragsverarbeitung</h2>
          <h3>5.1 Berater als Verantwortlicher für Kundendaten</h3>
          <p>
            Wenn Sie als Berater unsere Software nutzen und Daten Ihrer Kunden
            (z.B. Namen, Adressen, Vertragsdaten, Zählerdaten) eingeben, sind Sie
            im Sinne der DSGVO der <strong>Verantwortliche</strong> für diese Kundendaten.
          </p>
          <p>
            <strong>Ihre Pflichten als Berater:</strong>
          </p>
          <ul>
            <li>Sie müssen eine rechtliche Grundlage für die Verarbeitung der Kundendaten haben</li>
            <li>Sie müssen Ihre Kunden über die Datenverarbeitung informieren (eigene Datenschutzerklärung)</li>
            <li>Sie müssen die Rechte Ihrer Kunden gewährleisten (Auskunft, Löschung, etc.)</li>
            <li>Sie sind verantwortlich für die Richtigkeit und Aktualität der eingegebenen Daten</li>
          </ul>

          <h3>5.2 Wir als Auftragsverarbeiter</h3>
          <p>
            Für die von Ihnen eingegebenen Kundendaten agieren wir als
            <strong>Auftragsverarbeiter</strong> gemäß Art. 28 DSGVO. Das bedeutet:
          </p>
          <ul>
            <li>Wir verarbeiten die Kundendaten nur nach Ihren Weisungen (durch Nutzung der Software)</li>
            <li>Wir nutzen die Kundendaten nicht für eigene Zwecke</li>
            <li>Wir geben die Kundendaten nicht an Dritte weiter</li>
            <li>Wir treffen technische und organisatorische Maßnahmen zum Schutz der Daten</li>
          </ul>
          <p>
            <strong>Hinweis:</strong> Wenn Sie als Berater Kundendaten in unserem System speichern,
            empfehlen wir dringend, mit Ihren Kunden einen Vertrag zur Auftragsverarbeitung
            abzuschließen oder eine entsprechende Einwilligung einzuholen.
          </p>
        </section>

        <section>
          <h2>6. Datensicherheit</h2>
          <p>
            Wir treffen technische und organisatorische Sicherheitsmaßnahmen,
            um Ihre Daten gegen zufällige oder vorsätzliche Manipulationen,
            Verlust, Zerstörung oder den Zugriff unberechtigter Personen zu schützen:
          </p>
          <ul>
            <li>Verschlüsselte Datenübertragung (HTTPS)</li>
            <li>Passwort-geschützte Benutzerkonten mit sicherer Hash-Speicherung</li>
            <li>Zugriffsbeschränkungen auf Benutzer- und Rollenebene</li>
            <li>Regelmäßige Sicherheitsüberprüfungen</li>
          </ul>
        </section>

        <section>
          <h2>7. Speicherdauer</h2>
          <p>
            Wir speichern Ihre personenbezogenen Daten nur so lange, wie dies für die
            Erfüllung der Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen
            dies vorschreiben.
          </p>
          <ul>
            <li><strong>Aktive Benutzerkonten:</strong> Daten werden gespeichert, solange Ihr Konto aktiv ist</li>
            <li><strong>Nach Kontolöschung:</strong> Ihre Daten werden gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen</li>
            <li><strong>Vertragsdaten:</strong> Werden gemäß handels- und steuerrechtlicher Vorgaben aufbewahrt (in der Regel 10 Jahre)</li>
          </ul>
        </section>

        <section>
          <h2>8. Ihre Rechte als Betroffener</h2>
          <p>Nach der DSGVO stehen Ihnen folgende Rechte zu:</p>

          <h3>8.1 Auskunftsrecht (Art. 15 DSGVO)</h3>
          <p>
            Sie haben das Recht, Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten zu verlangen.
          </p>

          <h3>8.2 Recht auf Berichtigung (Art. 16 DSGVO)</h3>
          <p>
            Sie haben das Recht, unverzüglich die Berichtigung unrichtiger oder Vervollständigung
            unvollständiger personenbezogener Daten zu verlangen.
          </p>

          <h3>8.3 Recht auf Löschung (Art. 17 DSGVO)</h3>
          <p>
            Sie haben das Recht, die Löschung Ihrer personenbezogenen Daten zu verlangen,
            sofern die Voraussetzungen des Art. 17 DSGVO erfüllt sind.
          </p>

          <h3>8.4 Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</h3>
          <p>
            Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
          </p>

          <h3>8.5 Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</h3>
          <p>
            Sie haben das Recht, Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten.
          </p>

          <h3>8.6 Widerspruchsrecht (Art. 21 DSGVO)</h3>
          <p>
            Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben,
            jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten Widerspruch einzulegen.
          </p>

          <h3>8.7 Beschwerderecht</h3>
          <p>
            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung
            Ihrer personenbezogenen Daten durch uns zu beschweren.
          </p>
        </section>

        <section>
          <h2>9. Cookies und lokale Speicherung</h2>
          <p>
            Unsere Anwendung verwendet lokale Speicherung (LocalStorage) für:
          </p>
          <ul>
            <li>Authentifizierungs-Tokens zur Aufrechterhaltung Ihrer Sitzung</li>
            <li>Benutzereinstellungen (z.B. Theme, Benachrichtigungspräferenzen)</li>
          </ul>
          <p>
            Diese Daten werden ausschließlich lokal in Ihrem Browser gespeichert und
            nicht an Dritte weitergegeben.
          </p>
        </section>

        <section>
          <h2>10. Keine automatisierte Entscheidungsfindung</h2>
          <p>
            Wir setzen keine automatisierte Entscheidungsfindung einschließlich Profiling
            gemäß Art. 22 DSGVO ein.
          </p>
        </section>

        <section>
          <h2>11. Änderungen dieser Datenschutzerklärung</h2>
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets
            den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer
            Leistungen in der Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch
            gilt dann die neue Datenschutzerklärung.
          </p>
        </section>

        <section>
          <h2>12. Kontakt bei Datenschutzfragen</h2>
          <p>
            Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte können Sie sich jederzeit an uns wenden:
          </p>
          <p class="contact-info">
            E-Mail: eskapp.dev&#64;gmail.com<br>
          </p>
        </section>

        <section class="last-updated">
          <p><strong>Stand:</strong> Januar 2026</p>
        </section>

        <div class="back-button">
          <a routerLink="/login" class="btn-primary">Zurück zur Anmeldung</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .privacy-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem 1rem;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .privacy-content {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 3rem;
      max-width: 900px;
      width: 100%;
      margin: 2rem auto;
    }

    h1 {
      color: #2d3748;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 2rem;
      text-align: center;
      border-bottom: 3px solid #667eea;
      padding-bottom: 1rem;
    }

    section {
      margin-bottom: 2.5rem;
    }

    h2 {
      color: #667eea;
      font-size: 1.75rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }

    h3 {
      color: #4a5568;
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }

    p {
      color: #4a5568;
      line-height: 1.8;
      margin-bottom: 1rem;
    }

    ul {
      color: #4a5568;
      line-height: 1.8;
      margin-left: 1.5rem;
      margin-bottom: 1rem;
    }

    li {
      margin-bottom: 0.5rem;
    }

    .contact-info {
      background: #f7fafc;
      border-left: 4px solid #667eea;
      padding: 1rem;
      margin: 1rem 0;
      font-family: monospace;
      color: #2d3748;
    }

    .last-updated {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid #e2e8f0;
      text-align: center;
    }

    .last-updated p {
      color: #718096;
      font-style: italic;
    }

    .back-button {
      margin-top: 2rem;
      text-align: center;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    strong {
      color: #2d3748;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .privacy-content {
        padding: 2rem 1.5rem;
        margin: 1rem;
      }

      h1 {
        font-size: 2rem;
      }

      h2 {
        font-size: 1.5rem;
      }

      h3 {
        font-size: 1.1rem;
      }
    }
  `]
})
export class PrivacyComponent {}
