# 🚁 Guide de la Simulation Réaliste

## 📖 Comment fonctionne la simulation ?

### Architecture du Système

L'application Aviation HMI intègre maintenant un **système de simulation réaliste** complet basé sur la physique d'un Airbus A320-214 avec moteurs CFM56-5B4.

```
┌─────────────────────────────────────────────┐
│         APPLICATION PRINCIPALE              │
│              (app.js)                       │
└──────────────┬──────────────────────────────┘
               │ importe
               ↓
┌─────────────────────────────────────────────┐
│       SIMULATION MANAGER                    │
│   (simulation/simulation-manager.js)        │
│                                             │
│  • Coordonne tous les modules               │
│  • Gère l'interface utilisateur             │
│  • Met à jour les données en temps réel     │
└──────┬──────────┬──────────────┬────────────┘
       │          │              │
       ↓          ↓              ↓
┌──────────┐ ┌────────────┐ ┌──────────────┐
│  FLIGHT  │ │   FAULT    │ │  FDR REPLAY  │
│  MODEL   │ │ INJECTION  │ │              │
└──────────┘ └────────────┘ └──────────────┘
```

### 1. **Flight Model** (Modèle de Vol Physique)

**Fichier** : `simulation/flight-model.js` (650 lignes)

**Ce qu'il fait** :
- Simule la **physique complète d'un A320-214**
- Calcule les paramètres en temps réel (60 fois par seconde)
- Utilise l'atmosphère ISA standard (température, densité air, Mach)

**Systèmes simulés** :
1. **Moteurs (2x CFM56-5B4)** :
   - N1, N2 (vitesse rotation des compresseurs)
   - EGT (température gaz d'échappement)
   - Fuel Flow (débit carburant)
   - Pression huile, température, vibrations

2. **Hydraulique (3 circuits)** :
   - GREEN, BLUE, YELLOW
   - Pression, quantité, température

3. **Électrique** :
   - AC Bus 1 & 2, DC Bus 1 & 2
   - Générateurs (charge)
   - Batteries (voltage, température)

4. **Pressurisation** :
   - Altitude cabine
   - Delta P (différence de pression)
   - Cabin rate (vitesse montée/descente)
   - Outflow valve position

5. **Carburant** :
   - Réservoirs (Inner L/R, Center)
   - Consommation réaliste
   - Température carburant

6. **Commandes de vol** :
   - ELAC, SEC, FAC (ordinateurs)
   - Ailerons, gouvernes de profondeur, gouverne de direction
   - Slats, flaps

**Phases de vol** :
- TAXI → TAKEOFF → CLIMB → CRUISE → DESCENT → APPROACH → LANDING

**Exemple de calcul** :
```javascript
// Thrust requis = fonction (masse, altitude, phase de vol)
// N1 moteur = fonction (thrust demand, température, altitude)
// EGT = fonction (N1, altitude, température extérieure)
// Fuel Flow = fonction (N1, densité air, température)
```

### 2. **Fault Injection** (Injection de Pannes)

**Fichier** : `simulation/fault-injection.js` (650 lignes)

**Ce qu'il fait** :
- Injecte des **pannes réalistes** dans les systèmes
- Exécute des **scénarios de certification** (CS-25)
- Gère la **progression temporelle** des événements

**15 types de pannes** :
- `ENG_FLAMEOUT` : Extinction moteur
- `ENG_OVERHEAT` : Surchauffe moteur
- `ENG_OIL_LOSS` : Perte pression huile
- `HYD_LEAK` : Fuite hydraulique
- `ELEC_GEN_FAIL` : Panne générateur
- `PRESS_LOSS` : Décompression
- `FUEL_LEAK` : Fuite carburant
- Et 8 autres...

**9 scénarios prédéfinis** :

| Scénario | Description | Durée |
|----------|-------------|-------|
| **CS25_ENGINE_FAILURE_TAKEOFF** | Panne moteur à V1 | 180s |
| **CS25_DUAL_ENGINE_FAILURE** | Perte des 2 moteurs | 300s |
| **CS25_RAPID_DECOMPRESSION** | Décompression rapide | 120s |
| **CS25_HYDRAULIC_FAILURE** | Pannes hydrauliques multiples | 240s |
| **BIRD_STRIKE** | Impact aviaire | 90s |
| **FUEL_LEAK_CRUISE** | Fuite carburant progressive | 600s |
| **ELECTRICAL_EMERGENCY** | Urgence électrique | 180s |
| **SEVERE_ICING** | Givrage sévère | 300s |

**Comment un scénario fonctionne** :
```javascript
// Scénario = Timeline d'actions
[
  { time: 5, action: 'injectFault', params: { type: 'ENG_FLAMEOUT', target: 'eng1' }},
  { time: 10, action: 'setAlarm', params: { code: 'ENG1-FAIL' }},
  { time: 30, action: 'updateParameter', params: { system: 'hydraulics', param: 'greenPress', value: 0 }}
]
```

### 3. **FDR Replay** (Rejeu de Données de Vol)

**Fichier** : `simulation/fdr-replay.js` (450 lignes)

**Ce qu'il fait** :
- Charge des **données de vol réelles** (CSV ou JSON)
- Rejoue le vol avec **contrôles de lecture** (play/pause/speed)
- **Interpole** les données pour 60 FPS fluide

**Formats supportés** :

**CSV** :
```csv
TIME,ALT_STD,IAS,MACH,ENG_1_N1,ENG_1_EGT,ENG_2_N1,ENG_2_EGT
0,37000,280,0.78,85.2,580,84.8,575
1,37010,281,0.78,85.5,582,85.1,577
```

**JSON** :
```json
{
  "metadata": {
    "aircraft": "A320-214",
    "flight": "AF1234"
  },
  "data": [
    {"TIME": 0, "ALT_STD": 37000, "IAS": 280, ...}
  ]
}
```

**60+ paramètres ARINC 767** :
- Position : ALT_STD, IAS, TAS, MACH, HDG
- Moteurs : ENG_1_N1, ENG_1_N2, ENG_1_EGT, ENG_1_FF
- Systèmes : HYD_*_PRESS, ELEC_*_V, PRESS_CAB_ALT
- Environnement : OAT, TAT, SAT

### 4. **Boucle de Mise à Jour**

**Fréquence** : 1000ms (1 seconde)

```javascript
setInterval(() => {
    if (!state.frozen) {  // Si simulation non gelée
        // 1. Mettre à jour le modèle physique
        simulationManager.update(deltaTime);
        
        // 2. Récupérer les nouvelles données
        state.sensorData = simulationManager.getSensorData();
        
        // 3. Mettre à jour l'affichage
        updateAllDisplays();
        
        // 4. Afficher pannes/scénarios actifs
        simulationManager.updateScenarioDisplay();
        simulationManager.updateFaultDisplay();
    }
}, 1000);
```

---

## 🎮 Utilisation du Panneau de Simulation

### Ouvrir le Panneau

1. Cliquer sur le bouton **`🎚️ SIMULATION`** en haut à droite
2. Le panneau s'affiche avec 4 sections

### Section 1: Scénarios CS-25

**Liste déroulante avec 9 scénarios**

**Comment l'utiliser** :
1. Sélectionner un scénario (ex: "Panne moteur au décollage")
2. Le scénario démarre automatiquement
3. Observer les alarmes ECAM qui apparaissent
4. Les systèmes se dégradent selon le scénario
5. Une barre orange affiche le scénario en cours + temps écoulé

**Exemple** : Scénario "Décompression rapide"
```
t=0s   : Vol normal à 37,000 ft
t=5s   : PRESS LOSS injectée
t=5s   : Alarme "CABIN ALTITUDE HIGH" apparaît
t=6s   : Cabin altitude monte rapidement (8,000→12,000 ft)
t=10s  : Delta P chute (7.8→2.0 PSI)
t=30s  : Descente d'urgence vers 10,000 ft
t=120s : Fin du scénario
```

### Section 2: Pannes Individuelles

**6 boutons de pannes** :
- 🔥 **ENG1 Flameout** : Éteint moteur gauche
- 🔥 **ENG2 Flameout** : Éteint moteur droit
- 💧 **HYD Green Leak** : Fuite circuit vert
- ⚡ **GEN1 Failure** : Panne générateur 1
- 💨 **Press. Loss** : Décompression cabine
- 🧹 **Effacer tout** : Reset toutes les pannes

**Comment l'utiliser** :
1. Cliquer sur un bouton de panne
2. La panne s'applique immédiatement
3. Observer les paramètres affectés
4. Les pannes s'accumulent (combiner plusieurs pannes)

### Section 3: Replay FDR

**Rejeu de vols réels**

**Comment l'utiliser** :
1. Cliquer sur **"Charger FDR"**
2. Sélectionner un fichier CSV ou JSON
3. Les contrôles de lecture apparaissent :
   - ▶️ **Play** : Démarrer/reprendre
   - ⏸️ **Pause** : Mettre en pause
   - **Slider vitesse** : 0.1x à 10x (défaut 1x)
   - **Progress bar** : Position dans le vol
   - **Time display** : 00:12:30 / 01:45:00

4. Cliquer sur Play
5. Les données s'affichent en temps réel
6. Ajuster la vitesse pour analyser des phases précises

**Générer un fichier test** :
```javascript
// Dans la console du navigateur
const data = FlightDataReplay.generateSampleData(3600); // 1 heure
console.log(JSON.stringify(data, null, 2)); // Copier/coller
```

### Section 4: Pannes Actives

**Affichage en temps réel**

- **Badge rouge** : Nombre de pannes actives
- **Liste détaillée** :
  - Type de panne
  - Système affecté
  - Niveau de sévérité (🟡 Caution / 🔴 Warning / ⚫ Critical)

---

## ❓ Questions Fréquentes

### Q1: La simulation ralentit-elle l'application ?
**R**: Non. Le modèle physique tourne à 60 Hz mais l'affichage est mis à jour toutes les secondes (1Hz). Optimisé pour les performances.

### Q2: Puis-je combiner plusieurs pannes ?
**R**: Oui ! Les pannes individuelles s'ajoutent. Exemple : Injecter "ENG1 Flameout" puis "HYD Green Leak".

### Q3: Comment arrêter un scénario ?
**R**: Cliquer sur "Effacer tout" ou sélectionner "" (vide) dans la liste déroulante des scénarios.

### Q4: Le mode FREEZE affecte-t-il la simulation ?
**R**: Oui. En mode FREEZE (touche F), le modèle de vol et les scénarios sont gelés. Aucune donnée n'évolue.

### Q5: Puis-je créer mes propres scénarios ?
**R**: Oui ! Éditer [simulation/fault-injection.js](simulation/fault-injection.js) et ajouter un nouveau scénario dans `this.scenarios`.

### Q6: D'où viennent les paramètres A320 ?
**R**: Sources officielles :
- CFM56-5B4 Engine Manual
- A320 FCOM (Flight Crew Operating Manual)
- EASA CS-25 (Certification standards)
- ISA Atmosphere Model (ICAO)

### Q7: Comment exporter une session avec pannes ?
**R**: Utiliser le bouton **EXPORT CFR** en bas de l'écran. Le rapport inclut toutes les alarmes et pannes actives.

---

## 🔧 Pour les Développeurs

### Ajouter une nouvelle panne

**Fichier** : `simulation/fault-injection.js`

```javascript
// 1. Ajouter dans this.faultCatalog
this.faultCatalog.set('FUEL_PUMP_FAIL', {
    name: 'CENTER FUEL PUMP FAILURE',
    severity: 'caution',
    systems: ['fuel'],
    effects: {
        'fuel.centerPumpPressure': 0,
        'fuel.centerPumpStatus': 'FAULT'
    },
    alarmCode: 'FUEL-PUMP-CTR'
});

// 2. Utiliser
faultInjector.injectFault('FUEL_PUMP_FAIL', 'center');
```

### Ajouter un nouveau scénario

```javascript
// Dans fault-injection.js, this.scenarios.set()
this.scenarios.set('MY_CUSTOM_SCENARIO', {
    name: 'Mon Scénario Personnalisé',
    description: 'Description du scénario',
    duration: 180, // secondes
    timeline: [
        { time: 0, action: 'injectFault', params: { type: 'ENG_FLAMEOUT', target: 'eng2' }},
        { time: 30, action: 'injectFault', params: { type: 'HYD_LEAK', target: 'yellow' }},
        { time: 60, action: 'clearFault', params: { type: 'HYD_LEAK', target: 'yellow' }}
    ]
});
```

### Accéder à la simulation depuis la console

```javascript
// Récupérer le gestionnaire
const sim = window.simulationManager;

// Injecter une panne
sim.injectFault('ENG_FLAMEOUT', 'eng1');

// Lancer un scénario
sim.runScenario('CS25_ENGINE_FAILURE_TAKEOFF');

// Obtenir les données de vol
const data = sim.getFlightInfo();
console.log(data);

// Effacer toutes les pannes
sim.clearAllFaults();
```

---

## 📚 Documentation Complète

- [TESTING-SIMULATION.md](TESTING-SIMULATION.md) - Guide tests & simulation
- [README-SIMULATION.md](README-SIMULATION.md) - Guide utilisateur rapide
- [simulation/flight-model.js](simulation/flight-model.js) - Code modèle physique
- [simulation/fault-injection.js](simulation/fault-injection.js) - Code injection pannes
- [simulation/fdr-replay.js](simulation/fdr-replay.js) - Code replay FDR

---

**Version** : 2.8.0  
**Date** : 26 février 2026  
**Status** : ✅ Intégré et opérationnel
