#!/bin/bash

# Aviation HMI - Quick Start Script
# Démarre un serveur web local pour tester l'application

echo "🚁 AVIATION HMI - Quick Start"
echo "================================"
echo ""

# Vérifier si Python est installé
if command -v python3 &> /dev/null; then
    PORT=8000
    echo "✅ Python 3 détecté"
    echo "🚀 Démarrage du serveur sur http://localhost:$PORT"
    echo ""
    echo "📌 Ouvrez votre navigateur à: http://localhost:$PORT"
    echo "📌 Pour arrêter: Ctrl+C"
    echo ""
    echo "================================"
    echo ""
    
    # Démarrer serveur Python
    python3 -m http.server $PORT
    
elif command -v python &> /dev/null; then
    PORT=8000
    echo "✅ Python 2 détecté"
    echo "🚀 Démarrage du serveur sur http://localhost:$PORT"
    echo ""
    echo "📌 Ouvrez votre navigateur à: http://localhost:$PORT"
    echo "📌 Pour arrêter: Ctrl+C"
    echo ""
    echo "================================"
    echo ""
    
    # Démarrer serveur Python 2
    python -m SimpleHTTPServer $PORT
    
elif command -v php &> /dev/null; then
    PORT=8000
    echo "✅ PHP détecté"
    echo "🚀 Démarrage du serveur sur http://localhost:$PORT"
    echo ""
    echo "📌 Ouvrez votre navigateur à: http://localhost:$PORT"
    echo "📌 Pour arrêter: Ctrl+C"
    echo ""
    echo "================================"
    echo ""
    
    # Démarrer serveur PHP
    php -S localhost:$PORT
    
else
    echo "❌ Erreur: Aucun serveur web disponible"
    echo ""
    echo "Veuillez installer l'un des suivants:"
    echo "  - Python 3:  sudo apt install python3"
    echo "  - Python 2:  sudo apt install python"
    echo "  - PHP:       sudo apt install php"
    echo ""
    echo "Ou utilisez un serveur web de votre choix."
    exit 1
fi
