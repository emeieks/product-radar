@echo off
title ProductRadar Backend
color 0A
echo.
echo  ╔══════════════════════════════════════╗
echo  ║     ProductRadar Backend v1.0        ║
echo  ║     Demarrage en cours...            ║
echo  ╚══════════════════════════════════════╝
echo.
echo  Verification des dependances...
pip install flask flask-cors pytrends requests beautifulsoup4 --quiet
echo.
echo  Lancement du serveur...
echo  Acces : http://localhost:5000
echo.
python server.py
echo.
echo  Serveur arrete. Appuie sur une touche pour fermer.
pause > nul
