# Theme System - CSS Variables

Diese Anwendung verwendet CSS Custom Properties (CSS Variables) für ein konsistentes Farbschema in der gesamten Anwendung.

## Wo werden die Farben definiert?

Alle Farben sind in `src/styles.scss` im `:root` Selektor definiert.

## Verfügbare CSS-Variablen

### Primary Colors (Hauptfarben)
```css
--primary-color: #667eea      /* Haupt-Primärfarbe (Lila/Blau) */
--primary-hover: #5568d3      /* Hover-Zustand der Primärfarbe */
--primary-light: rgba(102, 126, 234, 0.1)  /* Helle Version für Hintergründe */
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)  /* Primärfarben-Gradient */
```

### Accent Colors (Akzentfarben)
```css
--accent-purple: #764ba2      /* Lila-Akzent für Gradients */
```

### Success Colors (Erfolg-Farben)
```css
--success-bg: #e8f5e9        /* Hintergrundfarbe für Erfolg */
--success-color: #2e7d32     /* Textfarbe für Erfolg */
--success-green: #34d399     /* Grün für FAB und Aktionen */
```

### Danger/Error Colors (Fehler-Farben)
```css
--danger-bg: #ffebee         /* Hintergrundfarbe für Fehler/Gefahr */
--danger-color: #c62828      /* Textfarbe für Fehler/Gefahr */
--danger-hover: #ffcdd2      /* Hover-Zustand */
--danger-red: #e74c3c        /* Alternative Rot-Farbe */
```

### Warning Colors (Warnungs-Farben)
```css
--warning-bg: #fff3e0        /* Hintergrundfarbe für Warnungen */
--warning-color: #ef6c00     /* Textfarbe für Warnungen */
```

### Info Colors (Info-Farben)
```css
--info-bg: #e3f2fd           /* Hintergrundfarbe für Informationen */
--info-color: #1976d2        /* Textfarbe für Informationen */
```

### Neutral Colors (Neutrale Farben)
```css
--white: #ffffff             /* Weiß */
--bg-light: #f5f7fa          /* Heller Hintergrund (Body) */
--bg-gray: #f5f5f5           /* Grauer Hintergrund */
--bg-card: #fafafa           /* Karten-Hintergrund */
--bg-input: #f9fafb          /* Input-Feld Hintergrund */
--bg-table-header: #f8f9fa   /* Tabellen-Header Hintergrund */
```

### Text Colors (Textfarben)
```css
--text-primary: #333         /* Primäre Textfarbe (dunkel) */
--text-secondary: #555       /* Sekundäre Textfarbe (mittel) */
--text-tertiary: #666        /* Tertiäre Textfarbe */
--text-muted: #888           /* Gedämpfte Textfarbe */
--text-light: #999           /* Helle Textfarbe */
```

### Border Colors (Rahmenfarben)
```css
--border-light: #e0e0e0      /* Helle Rahmenfarbe */
--border-medium: #ddd        /* Mittlere Rahmenfarbe */
--border-dark: #ccc          /* Dunkle Rahmenfarbe */
--border-subtle: #f0f0f0     /* Sehr subtile Rahmenfarbe */
--border-gray-light: #e5e7eb /* Helle graue Rahmenfarbe (Modern) */
```

### Button Colors (Button-Farben)
```css
--btn-bg-light: #f0f0f0      /* Helle Button-Hintergrundfarbe */
--btn-bg-hover: #e0e0e0      /* Button Hover-Farbe */
```

### Shadows (Schatten)
```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1)         /* Kleiner Schatten */
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1)         /* Mittlerer Schatten */
--shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.08)       /* Großer Schatten */
--shadow-xl: 0 4px 10px rgba(0, 0, 0, 0.25)       /* Extra großer Schatten */
--shadow-primary: 0 6px 18px rgba(102, 126, 234, 0.4)  /* Primärfarben-Schatten */
```

### Special Colors (Spezielle Farben)
```css
--cyan: #2ec1e2              /* Cyan für besondere Aktionen */
--purple-light: #f3e5f5      /* Helles Lila */
--purple-dark: #7b1fa2       /* Dunkles Lila */
```

## Verwendung

### In SCSS/CSS Dateien
```scss
.my-button {
  background: var(--primary-color);
  color: var(--white);

  &:hover {
    background: var(--primary-hover);
  }
}

.success-message {
  background: var(--success-bg);
  color: var(--success-color);
  border: 1px solid var(--border-light);
}
```

### In Component Styles
```scss
.my-component {
  .header {
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-light);
  }

  .danger-zone {
    background: var(--danger-bg);
    color: var(--danger-color);
  }
}
```

## Vorteile

1. **Konsistenz**: Alle Farben sind zentral definiert und werden überall gleich verwendet
2. **Wartbarkeit**: Änderungen an einer Farbe wirken sich auf die gesamte Anwendung aus
3. **Lesbarkeit**: Semantische Namen machen den Code leichter verständlich
4. **Theme-Fähigkeit**: Einfaches Wechseln zwischen verschiedenen Themes möglich

## Farben ändern

Um eine Farbe global zu ändern, bearbeiten Sie einfach den Wert in `src/styles.scss`:

```scss
:root {
  /* Beispiel: Primärfarbe von Lila zu Blau ändern */
  --primary-color: #2196f3;    /* Neues Blau */
  --primary-hover: #1976d2;    /* Dunkleres Blau */
}
```

## Best Practices

1. **Verwenden Sie immer CSS-Variablen** statt hart codierter Hex-Werte
2. **Wählen Sie semantische Variablen**: Nutzen Sie `--success-color` statt direkte Farbwerte
3. **Keine neuen Farben ohne Grund**: Verwenden Sie vorhandene Variablen, bevor Sie neue erstellen
4. **Dokumentieren Sie neue Variablen**: Fügen Sie Kommentare hinzu, wenn Sie neue Variablen erstellen

## Beispiele

### Button mit Primärfarbe
```scss
.custom-button {
  background: var(--primary-color);
  color: var(--white);
  border: none;
  padding: 0.5rem 1rem;

  &:hover {
    background: var(--primary-hover);
  }
}
```

### Karte mit Schatten
```scss
.info-card {
  background: var(--white);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-lg);
  padding: 1rem;
}
```

### Status-Badges
```scss
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;

  &.success {
    background: var(--success-bg);
    color: var(--success-color);
  }

  &.danger {
    background: var(--danger-bg);
    color: var(--danger-color);
  }

  &.warning {
    background: var(--warning-bg);
    color: var(--warning-color);
  }
}
```
