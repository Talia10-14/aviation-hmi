# 🚁 Simulation Réaliste — Guide Rapide

## 🎯 Accès Rapide

**Ouvrir le panneau** : Cliquer sur le bouton `🎚️ SIMULATION` en haut à droite du diagnostic.

---

## 📋 Fonctionnalités

### 1. Scénarios de Certification CS-25

Scénarios conformes aux exigences de certification EASA :

| Scénario | Description | Durée |
|----------|-------------|-------|
| **Panne moteur au décollage** | Extinction ENG1 à V1 | 180s |
| **Perte des 2 moteurs** | Arrêt complet en vol | 300s |
| **Décompression rapide** | Perte pressurisation → descente d'urgence | 120s |
| **Panne hydraulique multiple** | Perte GREEN + YELLOW | 240s |

**Scénarios opérationnels** :
- 🦅 Impact aviaire (bird strike)
- ⛽ Fuite carburant progressive
- ⚡ Urgence électrique (perte générateurs)
- ❄️ Givrage sévère

### 2. Pannes Individuelles

Injecter des pannes spécifiques :
- **ENG1/ENG2 Flameout** : Extinction moteur
- **HYD Green Leak** : Fuite circuit hydraulique vert
- **GEN1 Failure** : Panne générateur électrique
- **Press. Loss** : Perte pressurisation cabine

### 3. Replay FDR/QAR

Rejouer des vols réels depuis des données Flight Data Recorder :

**Formats supportés** :
- CSV (export standard FDR)
- JSON

**Contrôles** :
- ▶️ Play / ⏸️ Pause
- Vitesse : 0.1x à 10x
- Barre de progression interactive

---

## 🎮 Mode d'Emploi

### Lancer un Scénario CS-25

1. Ouvrir le panneau `SIMULATION`
2. Sélectionner un scénario dans la liste déroulante
3. Observer l'évolution des pannes en temps réel
4. Les alarmes ECAM apparaissent automatiquement
5. Cliquer sur "Effacer tout" pour revenir à la normale

### Injecter une Panne Manuelle

1. Ouvrir le panneau `SIMULATION`
2. Cliquer sur un bouton de panne (ex: "ENG1 Flameout")
3. La panne s'applique immédiatement
4. Le badge "Pannes Actives" affiche le compteur
5. Effacer avec "Effacer tout"

### Rejouer un Vol FDR

1. Ouvrir le panneau `SIMULATION`
2. Cliquer sur "Charger FDR"
3. Sélectionner un fichier CSV ou JSON
4. Les contrôles de lecture apparaissent
5. Cliquer sur ▶️ pour démarrer
6. Ajuster la vitesse avec le slider (0.1x - 10x)

---

## 📊 Exemple de Fichier FDR

### Format CSV
```csv
TIME,ALT_STD,IAS,MACH,ENG_1_N1,ENG_1_EGT,ENG_2_N1,ENG_2_EGT
0,37000,280,0.78,85.2,580,84.8,575
1,37010,281,0.78,85.5,582,85.1,577
2,37020,280,0.78,85.3,581,84.9,576
```

### Format JSON
```json
{
  "metadata": {
    "aircraft": "A320-214",
    "registration": "F-GKXA",
    "flight": "AF1234",
    "date": "2026-02-26",
    "duration": 7200
  },
  "data": [
    {
      "TIME": 0,
      "ALT_STD": 37000,
      "IAS": 280,
      "MACH": 0.78,
      "ENG_1_N1": 85.2,
      "ENG_1_EGT": 580,
      "ENG_2_N1": 84.8,
      "ENG_2_EGT": 575
    }
  ]
}
```

**Paramètres supportés** : Voir [TESTING-SIMULATION.md](TESTING-SIMULATION.md) section "Paramètres FDR"

---

## 🔧 Acteurs

### Pannes Actives

Le panneau affiche en temps réel :
- Nombre de pannes actives (badge rouge)
- Liste détaillée par système
- Niveau de sévérité (caution/warning/critical)

### Scénario en Cours

Une barre orange affiche :
- Nom du scénario actif
- Temps écoulé depuis le début
- Status (en cours / terminé)

---

## 🚨 Sécurité

⚠️ **Respect des standards aviation** :
- Tous les scénarios respectent les critères CS-25
- Les pannes correspondent à des cas réels documentés
- Le replay FDR utilise les paramètres ARINC 767 standard

---

## 💡 Astuces

- **Freeze** : Utilisez `F` ou le bouton FREEZE pour geler la simulation pendant l'analyse
- **Snapshot** : Capturez l'état avec `S` ou SNAPSHOT avant de lancer un scénario
- **Combinaisons** : Les pannes individuelles s'ajoutent aux scénarios actifs
- **Export** : Utilisez le bouton EXPORT pour sauvegarder les logs avec pannes

---

## 📚 Documentation Complète

Pour plus de détails techniques :
- [TESTING-SIMULATION.md](TESTING-SIMULATION.md) - Guide complet tests & simulation
- [simulation/flight-model.js](simulation/flight-model.js) - Modèle physique A320
- [simulation/fault-injection.js](simulation/fault-injection.js) - Catalogue de pannes
- [simulation/fdr-replay.js](simulation/fdr-replay.js) - Système de replay

---

## ❓ Questions Fréquentes

**Q: Puis-je combiner plusieurs pannes ?**  
R: Oui ! Les pannes individuelles s'accumulent. Utilisez "Effacer tout" pour reset.

**Q: Les scénarios redémarrent-ils automatiquement ?**  
R: Non, ils se terminent selon leur durée définie. Relancer manuellement si besoin.

**Q: Le mode FREEZE affecte-t-il la simulation ?**  
R: Oui, en mode freeze, le modèle de vol et les scénarios sont aussi gelés.

**Q: Puis-je créer mes propres scénarios ?**  
R: Oui, voir [simulation/fault-injection.js](simulation/fault-injection.js) pour ajouter des scénarios personnalisés.

**Q: D'où viennent les données FDR exemple ?**  
R: Utilisez `FlightDataReplay.generateSampleData(3600)` pour générer 1h de vol test.

---

**Version** : 2.8.0  
**Date** : 26 février 2026  
**Status** : ✅ Intégré et opérationnel
