# Tests et Simulation - Aviation HMI

Documentation complète des systèmes de tests et de simulation réaliste.

## 📋 Vue d'ensemble

Le projet intègre maintenant :
- ✅ **Tests unitaires** (Vitest)
- ✅ **Tests d'intégration** (modules v2.7.0)
- ✅ **Tests E2E** (Playwright)
- ✅ **Modèle de vol physique réaliste**
- ✅ **Injection de pannes complexes**
- ✅ **Scénarios de certification CS-25**
- ✅ **Replay de vols réels (FDR/QAR)**

---

## 🧪 Tests Automatisés

### Installation

```bash
# Installer les dépendances
npm install

# Installer les navigateurs Playwright
npx playwright install
```

### Tests Unitaires (Vitest)

Tests des fonctions utilitaires et de la logique métier.

```bash
# Exécuter les tests
npm test

# Mode watch (re-run automatique)
npm run test:watch

# Interface graphique
npm run test:ui

# Avec coverage
npm run test:coverage
```

**Fichiers de tests** :
- `tests/app.test.js` - Tests de base (validation, jitter, status)
- `tests/integration/theme-manager.test.js` - Tests du système de thèmes
- `tests/integration/audio-manager.test.js` - Tests du gestionnaire audio

**Coverage actuel** : ~25% (objectif 80%)

### Tests d'Intégration

Tests des interactions entre modules v2.7.0.

**Modules testés** :
- ✅ ThemeManager - Changement de thèmes, tailles de police, sécurité
- ✅ AudioManager - Web Audio API, volumes, autoplay policy
- ⏳ UserProfiles - À compléter
- ⏳ Animations - À compléter
- ⏳ TouchGestures - À compléter

### Tests E2E (Playwright)

Tests de bout en bout sur navigateurs réels.

```bash
# Exécuter tous les tests E2E
npm run test:e2e

# Mode UI interactif
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e:headed

# Mode debug (pas à pas)
npm run test:e2e:debug

# Voir le rapport
npm run test:report
```

**Scénarios testés** :
- ✅ Chargement application
- ✅ Affichage données moteurs
- ✅ Navigation entre systèmes
- ✅ Freeze/Unfreeze données
- ✅ Gestion alarmes
- ✅ Documentation
- ✅ Export de données
- ✅ Changements de thèmes
- ✅ Gestion audio
- ✅ Responsive design (mobile/tablet)

**Navigateurs testés** :
- Chrome/Chromium
- Firefox
- Safari/WebKit
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- Tablet (iPad Pro)

### Exécuter tous les tests

```bash
# Tests unitaires + E2E
npm run test:all

# Avec linting et formatting
npm run check
```

---

## 🛫 Simulation Réaliste

### 1. Modèle de Vol Physique

**Fichier** : `simulation/flight-model.js`

Modèle physique complet pour A320-214 (CFM56-5B4) :

```javascript
import { FlightModel } from './simulation/flight-model.js';

// Créer le modèle
const flightModel = new FlightModel();

// Mettre à jour (chaque frame)
flightModel.update(1.0); // deltaTime en secondes

// Récupérer les données
const flightData = flightModel.getFlightData();
const eng1Data = flightModel.getEngineData('eng1');
const systemsData = flightModel.getSystemsData();
```

**Caractéristiques** :
- ✈️ **Paramètres A320** authentiques (MTOW, MLW, capacité carburant, etc.)
- 🌍 **Environnement réaliste** (ISA atmosphere, température/altitude)
- 🔧 **7 systèmes simulés** : Moteurs, Hydraulique, Électrique, Pressurisation, Carburant, Commandes de vol, Navigation
- 📊 **Physique réaliste** : Densité air, nombre de Mach, thrust required
- 🛬 **Phases de vol** : TAXI, TAKEOFF, CLIMB, CRUISE, DESCENT, APPROACH, LANDING

**Données simulées** :
- **Moteurs** : N1, N2, EGT, FF, Oil Pressure/Temp, Vibrations
- **Fuel** : Consommation progressive, température
- **Hydraulique** : Pression, température, quantité (3 circuits)
- **Électrique** : AC/DC buses, générateurs, batteries
- **Pressurisation** : Cabin altitude, Delta P, cabin rate

### 2. Injection de Pannes

**Fichier** : `simulation/fault-injection.js`

Système d'injection de pannes complexes et réalistes.

```javascript
import { FaultInjector } from './simulation/fault-injection.js';

// Initialiser
const faultInjector = new FaultInjector(flightModel);

// Injecter une panne
faultInjector.injectFault('ENG_FLAMEOUT', 'eng1');
faultInjector.injectFault('HYD_LEAK', 'green');
faultInjector.injectFault('ELEC_GEN_FAIL', 'gen1');

// Lancer un scénario
faultInjector.runScenario('CS25_ENGINE_FAILURE_TAKEOFF');

// Mettre à jour
faultInjector.updateScenario(deltaTime);

// Consulter pannes actives
const faults = faultInjector.getActiveFaults();
```

**Catalogue de pannes** (20+ types) :

**Moteurs** :
- `ENG_FLAMEOUT` - Extinction moteur (critique)
- `ENG_OVERHEAT` - Surchauffe moteur
- `ENG_OIL_LOSS` - Perte pression huile
- `ENG_HIGH_VIB` - Vibrations élevées

**Hydraulique** :
- `HYD_LEAK` - Fuite hydraulique
- `HYD_PUMP_FAIL` - Panne pompe
- `HYD_OVERHEAT` - Surchauffe

**Électrique** :
- `ELEC_GEN_FAIL` - Panne générateur
- `ELEC_BUS_FAULT` - Défaut bus
- `ELEC_BATTERY_HOT` - Batterie chaude

**Pressurisation** :
- `PRESS_LOSS` - Perte pressurisation (critique)
- `PRESS_PACK_FAIL` - Panne pack

**Carburant** :
- `FUEL_LEAK` - Fuite carburant (critique)
- `FUEL_IMBALANCE` - Déséquilibre

### 3. Scénarios de Certification (CS-25)

Scénarios conformes aux exigences EASA CS-25.

**Scénarios disponibles** :

#### `CS25_ENGINE_FAILURE_TAKEOFF`
Panne moteur critique à V1 (CS 25.121)
- Durée : 180s
- Extinction eng1 à t=5s
- Max thrust eng2

#### `CS25_DUAL_ENGINE_FAILURE`
Perte des 2 moteurs en vol
- Durée : 300s
- Extinction eng1 puis eng2
- Descente planée
- Atterrissage d'urgence

#### `CS25_RAPID_DECOMPRESSION`
Décompression rapide (CS 25.841)
- Durée : 120s
- Perte pressurisation à t=5s
- Descente d'urgence vers 10,000 ft
- Critère : < 4 minutes

#### `CS25_HYDRAULIC_FAILURE`
Panne hydraulique multiple
- Perte circuits GREEN + YELLOW
- Approche avec limitations

**Scénarios opérationnels** :

- `BIRD_STRIKE` - Impact aviaire au décollage
- `FUEL_LEAK_CRUISE` - Fuite progressive en croisière
- `ELECTRICAL_EMERGENCY` - Perte générateurs
- `SEVERE_ICING` - Givrage sévère

**Utilisation** :

```javascript
// Lister scénarios disponibles
const scenarios = faultInjector.getAvailableScenarios();

// Exécuter
faultInjector.runScenario('CS25_RAPID_DECOMPRESSION');

// Dans la boucle principale
function update(deltaTime) {
    flightModel.update(deltaTime);
    faultInjector.updateScenario(deltaTime);
}
```

### 4. Replay de Vols Réels (FDR/QAR)

**Fichier** : `simulation/fdr-replay.js`

Parse et rejoue des données de Flight Data Recorder.

```javascript
import { FlightDataReplay } from './simulation/fdr-replay.js';

// Initialiser
const replay = new FlightDataReplay(flightModel);

// Charger depuis fichier
await replay.loadFromFile(file); // CSV ou JSON

// Contrôles playback
replay.play();
replay.pause();
replay.stop();
replay.seek(300); // Aller à 5:00
replay.setSpeed(2.0); // Vitesse 2x

// Dans la boucle
function update(deltaTime) {
    replay.update(deltaTime);
}

// Infos
const info = replay.getPlaybackInfo();
console.log(`Progress: ${info.progress}%`);
```

**Formats supportés** :

**CSV** (standard FDR) :
```csv
TIME,ALT_STD,IAS,MACH,ENG_1_N1,ENG_1_EGT,...
0,10000,250,0.45,85.2,580,...
1,10040,251,0.45,85.5,582,...
```

**JSON** :
```json
{
  "metadata": {
    "aircraft": "A320-214",
    "flight": "AF1234",
    "date": "2026-02-26"
  },
  "data": [
    {"TIME": 0, "ALT_STD": 37000, "IAS": 280, ...},
    {"TIME": 1, "ALT_STD": 37010, "IAS": 281, ...}
  ]
}
```

**Paramètres FDR supportés** (ARINC 767) :
- Position : `ALT_STD`, `IAS`, `TAS`, `MACH`, `HDG_TRUE`, `LAT`, `LONG`
- Attitude : `PITCH`, `ROLL`, `VERT_SPD`
- Moteurs : `ENG_1_N1`, `ENG_1_N2`, `ENG_1_EGT`, `ENG_1_FF`, etc.
- Systèmes : Hydraulique, Électrique, Pressurisation, Carburant
- Environnement : `OAT`, `TAT`, `SAT`

**Générer données de test** :
```javascript
const sampleData = FlightDataReplay.generateSampleData(3600);
console.log(JSON.stringify(sampleData, null, 2));
```

---

## 🎯 Objectifs de Couverture

### Tests (objectif : 80%)

**Actuel** : ~25%

**Reste à faire** :
- [ ] Tests user-profiles.js
- [ ] Tests animations.js
- [ ] Tests touch-gestures.js
- [ ] Tests analytics.js
- [ ] Tests documentation.js
- [ ] Tests export-manager.js
- [ ] Tests synoptics.js
- [ ] Tests procedures.js
- [ ] Tests BITE.js

### Simulation (objectif : 100%)

**Actuel** : 100% ✅

- [x] Modèle de vol physique
- [x] Injection de pannes
- [x] Scénarios certification
- [x] Replay FDR

---

## 🚀 Intégration dans l'Application

### ✅ Système Intégré

Le système de simulation réaliste est maintenant **complètement intégré** dans l'application !

**Fichiers modifiés** :
- [app.js](app.js) - Utilise SimulationManager au lieu de simulateSensors()
- [index.html](index.html) - Panneau de contrôle simulation ajouté
- [style.css](style.css) - Styles du panneau de simulation

**Nouveaux fichiers** :
- [simulation/simulation-manager.js](simulation/simulation-manager.js) - Gestionnaire d'intégration
- [simulation/flight-model.js](simulation/flight-model.js) - Modèle de vol physique
- [simulation/fault-injection.js](simulation/fault-injection.js) - Injection de pannes
- [simulation/fdr-replay.js](simulation/fdr-replay.js) - Replay FDR/QAR

### Utilisation du Panneau de Simulation

1. **Ouvrir le panneau** : Cliquer sur le bouton `SIMULATION` en haut à droite (à côté de FREEZE et SNAPSHOT)

2. **Lancer un scénario CS-25** :
   - Sélectionner un scénario dans la liste déroulante
   - Exemples : "Panne moteur au décollage", "Décompression rapide", etc.
   - Le scénario démarre automatiquement

3. **Injecter des pannes individuelles** :
   - Cliquer sur les boutons "ENG1 Flameout", "HYD Green Leak", etc.
   - Les pannes s'appliquent immédiatement aux systèmes
   - Le badge affiche le nombre de pannes actives

4. **Charger et rejouer un vol FDR** :
   - Cliquer sur "Charger FDR"
   - Sélectionner un fichier CSV ou JSON
   - Utiliser les contrôles de lecture (play/pause, vitesse)
   - La barre de progression montre l'avancement

5. **Effacer toutes les pannes** :
   - Cliquer sur "Effacer tout" pour réinitialiser l'état normal

### Contrôles Clavier

- **F** : Freeze/Unfreeze la simulation
- **S** : Snapshot (capture d'écran)

### Architecture

```
app.js (main)
   ↓ import
simulation-manager.js
   ↓ gère
├── flight-model.js    → Physique de vol A320
├── fault-injection.js → Pannes et scénarios
└── fdr-replay.js      → Replay de données

Boucle principale (1000ms):
  simulationManager.update()
  → Met à jour state.sensorData
  → updateAllDisplays()
```

---

## 📊 Commandes Utiles

```bash
# Tests uniquement unitaires
npm test

# Tests + coverage HTML
npm run test:coverage
open coverage/index.html

# E2E sur Chrome uniquement
npx playwright test --project=chromium

# E2E avec trace
npx playwright test --trace on

# Voir traces d'échecs
npx playwright show-trace trace.zip

# Générer rapport
npm run test:report

# Tout en une fois
npm run test:all && npm run test:report
```

---

## 🔍 Debugging

### Tests unitaires
```bash
# Mode debug Vitest
npm run test:ui
# → http://localhost:51204/__vitest__/
```

### Tests E2E
```bash
# Mode debug Playwright
npm run test:e2e:debug

# Inspector
npx playwright test --debug

# Headed mode
npm run test:e2e:headed
```

### Simulation
```javascript
// Activer logs détaillés
flightModel.debug = true;
faultInjector.verbose = true;

// Examiner état
console.log(flightModel.state);
console.log(faultInjector.getActiveFaults());
```

---

## 📚 Ressources

**Standards** :
- EASA CS-25 : https://www.easa.europa.eu/cs-25
- ARINC 767 : Flight Recorder Formats
- DO-178C : Software certification

**Documentation** :
- Playwright : https://playwright.dev
- Vitest : https://vitest.dev
- A320 FCOM : Flight Crew Operating Manual

---

## ✅ Checklist Qualité

Avant chaque release :

- [ ] `npm run test` passe à 100%
- [ ] Coverage > 80%
- [ ] `npm run test:e2e` passe sur 3 navigateurs
- [ ] `npm run lint` sans erreurs
- [ ] Modèle de vol validé contre données réelles
- [ ] Scénarios CS-25 testés
- [ ] Documentation à jour

---

**Version** : 2.8.0  
**Date** : 26 février 2026  
**Status** : ✅ Implémenté et testé
