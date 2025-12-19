#!/bin/bash

echo "🚀 Berater-App Schnellstart"
echo "============================"
echo ""

# Prüfe ob Docker installiert ist
if ! command -v docker &> /dev/null; then
    echo "❌ Docker ist nicht installiert. Bitte installieren Sie Docker Desktop."
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Prüfe ob Docker Compose installiert ist
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose ist nicht installiert."
    exit 1
fi

echo "✅ Docker ist installiert"
echo ""

# Erstelle .env wenn nicht vorhanden
if [ ! -f "backend/.env" ]; then
    echo "📝 Erstelle backend/.env..."
    cp backend/.env.example backend/.env
    echo "   ⚠️  Bitte JWT_SECRET in backend/.env ändern!"
fi

echo ""
echo "🐳 Starte Docker Container..."
docker-compose up -d

echo ""
echo "⏳ Warte auf Services (30 Sekunden)..."
sleep 30

echo ""
echo "✅ Berater-App erfolgreich gestartet!"
echo ""
echo "📱 Frontend:  http://localhost:4200"
echo "🔌 Backend:   http://localhost:3000"
echo "🗄️  MongoDB:   localhost:27017"
echo ""
echo "📖 Nächste Schritte:"
echo "   1. Admin-Benutzer erstellen (siehe README.md)"
echo "   2. Im Browser zu http://localhost:4200"
echo "   3. Mit erstellten Zugangsdaten anmelden"
echo ""
echo "🛑 Zum Stoppen: docker-compose down"
echo "📊 Logs anzeigen: docker-compose logs -f"
