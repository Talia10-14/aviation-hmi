# 🛫 AERO-DIAG — Aviation Diagnostic HMI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://www.w3.org/html/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

> Interface Homme-Machine (HMI) de diagnostic avionique temps réel pour la surveillance des systèmes critiques d'aéronef. Inspirée des systèmes ECAM (Electronic Centralised Aircraft Monitor) utilisés dans les cockpits modernes.

![AERO-DIAG Interface](screenshots/01_moteurs.png)

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Architecture](#-architecture)
- [Systèmes surveillés](#-systèmes-surveillés)
- [Développement](#-développement)
- [Tests](#-tests)
- [Contribution](#-contribution)
- [Licence](#-licence)

## ✨ Fonctionnalités

### Interface temps réel
- 🔄 **Simulation temps réel** des paramètres moteurs et systèmes
- 📊 **Gauges visuelles** (circulaires et barres) avec seuils CAUTION/WARNING
- 🚨 **Système d'alarmes ECAM** avec log horodaté et niveaux de criticité
- ⏸️ **Freeze/Resume** pour figer l'état actuel
- 📸 **Snapshot** pour capturer des états système
- 💾 **Export CFR** (Centralized Fault Report) au format JSON

### Systèmes intégrés
- ⚙️ **Moteurs** (CFM56-5B4) — N1, N2, EGT, FF, Oil Press, Vibrations
- 💧 **Hydraulique** — 3 circuits (Green/Blue/Yellow)
- ⚡ **Électrique** — AC/DC, Générateurs, Batterie
- 🌬️ **Pressurisation** — Altitude cabine, Delta P, Outflow valve
- 🎮 **Commandes de vol** — ELAC, SEC, FAC, surfaces
- ⛽ **Carburant** — Réservoirs, Flow, Température
- 🔧 **APU** — Auxiliary Power Unit (APS3200)

### Interface avionique authentique
- 🎨 **Design cockpit** sombre avec palette aviation standard
- 🟢 **Code couleur** : NORMAL (vert) / CAUTION (ambre) / WARNING (rouge)
- ⏱️ **Horloges UTC** et temps de vol
- 🔔 **Master Warning/Caution** avec badges de comptage
- 📝 **Session tracking** avec identifiant unique

### Responsivité & Accessibilité ✨ **NOUVEAU**
- 📱 **Design responsive complet** : du mobile (320px) au 4K (2560px+)
- 🖥️ **Breakpoints optimisés** : 8 points de rupture pour tous les écrans
- 📐 **Support orientation** : paysage et portrait optimisés
- 👆 **Tactile optimisé** : zones de 44px minimum (WCAG 2.1)
- ♿ **Accessibilité** : contraste élevé, mouvement réduit, forced colors
- 📦 **Container Queries** : composants auto-adaptatifs modernes
- 🔄 **Écrans pliables** : support dual-screen et notch/safe-area
- 🌐 **Écrans ultra-larges** : 21:9 et écrans verticaux supportés

> Consultez [RESPONSIVE-DESIGN.md](RESPONSIVE-DESIGN.md) pour la documentation détaillée


## 🛠 Technologies

- **HTML5** — Structure sémantique
- **CSS3** — Variables CSS, Grid, Flexbox, Animations
- **JavaScript (ES6+)** — Vanilla JS avec IIFE pattern
- **Font Awesome 6.5** — Iconographie
- **Google Fonts** — Inter & JetBrains Mono

### Standards respectés
- ✅ **EASA CS-25** insprirations (aviation civile)
- ✅ **WCAG 2.1** principes d'accessibilité
- ✅ **CSP** (Content Security Policy)
- ✅ **SRI** (Subresource Integrity) pour les CDN

## 📦 Installation

### Prérequis
- Un navigateur web moderne (Chrome 90+, Firefox 88+, Safari 14+)
- Un serveur HTTP local (optionnel mais recommandé)

### Installation simple

```bash
# Cloner le dépôt
git clone https://github.com/votre-username/aviation-hmi.git
cd aviation-hmi

# Ouvrir directement dans le navigateur
open index.html
# OU utiliser un serveur local
python3 -m http.server 8000
# Puis visiter http://localhost:8000
```

### Installation avec npm (recommandé)

```bash
# Installer les dépendances de dev
npm install

# Lancer le serveur de développement
npm run dev

# Build pour production
npm run build

# Lancer les tests
npm test
```

## 🚀 Utilisation

### Interface principale

1. **Navigation systèmes** (panneau gauche)
   - Cliquez sur un système pour afficher ses paramètres détaillés
   - Les icônes de statut indiquent l'état : ✓ Normal, ⚠ Caution, ❌ Warning

2. **Panneau de diagnostic** (centre)
   - Visualisation temps réel des paramètres
   - Gauges colorées selon les seuils
   - Actions disponibles : FREEZE, SNAPSHOT

3. **Log ECAM** (panneau droit)
   - Historique des alarmes avec horodatage
   - Compteurs WARNING/CAUTION
   - Les alarmes acquittées sont grisées

4. **Barre d'actions** (bas)
   - **MASTER WARN/CAUT** : Boutons principaux d'alerte
   - **ACK ALL** : Acquitter toutes les alarmes actives
   - **RESET** : Réinitialiser l'état système
   - **EXPORT CFR** : Télécharger le rapport JSON
   - **TEST MODE** : Déclencher des alarmes de test

### Raccourcis clavier

| Touche | Action |
|--------|--------|
| `F` | Freeze/Resume |
| `S` | Snapshot |
| `A` | Acknowledge all alarms |
| `R` | Reset system |
| `T` | Toggle test mode |
| `1-7` | Sélection rapide des systèmes |
| `Esc` | Dismiss active warnings |

## 🏗 Architecture

### Structure des fichiers

```
aviation-hmi/
├── index.html          # Structure HTML principale
├── style.css           # Design system & styles
├── app.js              # Logique applicative
├── package.json        # Dépendances npm
├── .gitignore          # Fichiers ignorés
├── README.md           # Documentation
├── LICENSE             # Licence MIT
├── screenshots/        # Captures d'écran
└── tests/              # Tests unitaires
    └── app.test.js
```

### État global

L'application utilise un objet d'état centralisé :

```javascript
const state = {
    activeSystem: 'engines',
    frozen: false,
    testMode: false,
    flightStartTime: Date.now(),
    alarms: [],
    warnCount: 0,
    cautCount: 0,
    masterStatus: 'normal',
    sensorData: { /* ... */ }
};
```

### Flux de données

```
Simulation ──> État ──> Mise à jour UI ──> Gestion alarmes
     ↑          │                              │
     └──────────┴──────────────────────────────┘
           Boucle temps réel (1000ms)
```

## 📊 Systèmes surveillés

### Moteurs (ENG1/ENG2)

| Paramètre | Unité | Seuil Caution | Seuil Warning | Max |
|-----------|-------|---------------|---------------|-----|
| N1 | % | 95 | 101 | 104 |
| EGT | °C | 750 | 900 | 950 |
| N2 | % | 97 | 102 | 105 |
| FF | kg/h | - | - | 3000 |
| Oil Press | PSI | 30/85 | 20/95 | 100 |
| Vib N1 | mils | 3.0 | 4.5 | 6.0 |

### Hydraulique

- **Green Circuit** : Pression, Quantité, Température
- **Blue Circuit** : Pression, Quantité, Température
- **Yellow Circuit** : Pression, Quantité, Température

### Électrique

- **AC Bus 1 & 2** : Tension (115V nominal)
- **DC Bus 1 & 2** : Tension (28V nominal)
- **Générateurs** : Charge (%)
- **Batterie** : Voltage, Température

## 🔧 Développement

### Configuration de l'environnement

```bash
# Installer les hooks Git
npm run prepare

# Linter le code
npm run lint

# Formatter le code
npm run format

# Vérifier le build
npm run check
```

### Variables d'environnement

Créez un fichier `.env.local` :

```env
DEBUG_MODE=true
UPDATE_INTERVAL=1000
ALARM_CHECK_INTERVAL=3000
```

### Personnalisation des seuils

Modifiez l'objet `THRESHOLDS` dans `app.js` :

```javascript
const THRESHOLDS = {
    n1: { caution: 95, warning: 101, max: 104 },
    // ...
};
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Couverture de code
npm run test:coverage

# Tests E2E
npm run test:e2e
```

### Exemple de test

```javascript
describe('Sensor Simulation', () => {
    it('should clamp values within bounds', () => {
        const value = jitter(100, 10, 0, 104);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(104);
    });
});
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de suivre ces étapes :

1. **Fork** le projet
2. **Créez** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Pushez** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

### Guidelines

- Respectez le style de code existant
- Ajoutez des tests pour les nouvelles fonctionnalités
- Mettez à jour la documentation si nécessaire
- Testez sur plusieurs navigateurs

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

**Votre Nom**
- GitHub: [@votre-username](https://github.com/votre-username)
- Email: votre.email@example.com

## 🙏 Remerciements

- Inspiré des systèmes ECAM d'Airbus
- Données moteur basées sur les CFM56-5B4
- Design inspiré des cockpits A320
- Communauté aviation pour les retours

## 📸 Screenshots

### Vue Moteurs
![Moteurs](screenshots/01_moteurs.png)

### Vue Hydraulique
![Hydraulique](screenshots/02_hydraulique.png)

### Gestion Alarmes
![Alarmes](screenshots/03_alarmes.png)

## 🗺 Roadmap

- [ ] Mode nuit/jour configurable
- [ ] Support multi-langues (FR/EN)
- [ ] Export PDF des rapports
- [ ] Historique des vols
- [ ] Connexion données réelles (WebSocket)
- [ ] Mode entraînement avec scénarios
- [x] **Responsive design mobile/tablette** ✅ **COMPLÉTÉ v2.8.0**
- [ ] PWA (Progressive Web App)
- [ ] Integration avec simulateurs de vol

## ⚠️ Avertissement

**Cette application est à des fins éducatives et de démonstration uniquement.** Elle ne doit en aucun cas être utilisée dans un environnement opérationnel réel ou pour prendre des décisions de vol. Pour une utilisation professionnelle, consultez des systèmes certifiés EASA/FAA.

---

**Made with ❤️ for aviation enthusiasts**
